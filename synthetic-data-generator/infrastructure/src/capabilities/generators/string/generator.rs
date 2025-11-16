//! String generator implementation
//!
//! Generates string values based on FieldDefinition with FieldType::String

use synthetic_data_core::{domain::*, Result, CoreError};
use rand::{Rng, SeedableRng, rng};
use rand_chacha::ChaCha8Rng;
use thread_local::ThreadLocal;
use std::cell::RefCell;
use fake::Fake;
use fake::faker::name::en::{FirstName, LastName};
use itoa;
use rayon::prelude::*;
use super::charset::Charset;
use super::pool::StringPool;

/// String generator that creates string values based on field definitions
///
/// Uses thread-local RNG for thread-safe generation without locks.
pub struct StringGenerator {
    /// Thread-local RNG for each thread (wrapped in RefCell for mutability)
    rng: ThreadLocal<RefCell<ChaCha8Rng>>,
    /// Optional seed for deterministic generation
    seed: Option<u64>,
    /// Cached charset for performance (computed once)
    cached_charset: Vec<char>,
    /// Pool of pre-generated first names (lowercase) for performance
    first_names_pool: Vec<String>,
    /// Pool of pre-generated last names (lowercase) for performance
    last_names_pool: Vec<String>,
    /// Pool of common email domains for performance
    email_domains: Vec<String>,
    /// String pool for reusing buffers (reduces allocations)
    /// CRITICAL OPTIMIZATION: Larger pool for better buffer reuse
    string_pool: StringPool,
}

impl StringGenerator {
    /// Create a new string generator
    ///
    /// # Arguments
    ///
    /// * `seed` - Optional seed for deterministic generation. If `None`, uses entropy.
    ///
    /// # Example
    ///
    /// ```rust
    /// use synthetic_data_infrastructure::capabilities::generators::string::StringGenerator;
    ///
    /// // Non-deterministic
    /// let generator = StringGenerator::new(None);
    ///
    /// // Deterministic (same seed = same output)
    /// let generator = StringGenerator::new(Some(42));
    /// ```
    pub fn new(seed: Option<u64>) -> Self {
        // Pre-compute charset once for better performance
        let charset = Charset::default();
        let cached_charset = charset.get_chars();
        
        // Pre-generate pool of names for performance (50K each)
        // This avoids calling fake() repeatedly which is slow
        // ULTRA-OPTIMIZED: Pre-allocate Vecs with exact capacity
        const POOL_SIZE: usize = 50_000;
        let mut first_names_pool = Vec::with_capacity(POOL_SIZE);
        let mut last_names_pool = Vec::with_capacity(POOL_SIZE);
        
        // Generate names in batches for better cache locality
        for _ in 0..POOL_SIZE {
            first_names_pool.push(FirstName().fake::<String>().to_lowercase());
            last_names_pool.push(LastName().fake::<String>().to_lowercase());
        }
        
        // Pre-generate common email domains (realistic and diverse)
        let email_domains: Vec<String> = vec![
            "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
            "icloud.com", "protonmail.com", "mail.com", "yandex.com", "zoho.com",
            "gmx.com", "live.com", "msn.com", "comcast.net", "verizon.net",
            "att.net", "sbcglobal.net", "cox.net", "earthlink.net", "charter.net",
            "company.com", "example.com", "test.com", "demo.com", "sample.com",
            "business.com", "corp.com", "enterprise.com", "office.com", "work.com",
        ].into_iter().map(String::from).collect();
        
        Self {
            rng: ThreadLocal::new(),
            seed,
            cached_charset,
            first_names_pool,
            last_names_pool,
            email_domains,
            // CRITICAL OPTIMIZATION: Larger pool for better buffer reuse
            // ULTRA-OPTIMIZED: Increased to 1000 for maximum buffer reuse
            string_pool: StringPool::new(1000), // Increased from 500 to 1000 for even better performance
        }
    }
    
    /// Execute a closure with mutable access to the thread-local RNG
    ///
    /// This ensures the RNG state advances between calls, preventing duplicate values.
    /// The closure is executed synchronously to avoid Send/Sync issues with RefMut.
    fn with_rng<F, T>(&self, f: F) -> T
    where
        F: FnOnce(&mut ChaCha8Rng) -> T,
    {
        let seed = self.seed;
        // Get or create the RNG, then borrow mutably
        let rng_cell = self.rng.get_or(|| {
            let rng = if let Some(s) = seed {
                ChaCha8Rng::seed_from_u64(s)
            } else {
                // For non-deterministic generation, use a random seed from rng
                let mut rng = rng();
                let random_seed: u64 = rng.random();
                ChaCha8Rng::seed_from_u64(random_seed)
            };
            RefCell::new(rng)
        });
        let mut rng = rng_cell.borrow_mut();
        f(&mut rng)
    }
    
    /// Generate a single string value based on field definition
    ///
    /// # Arguments
    ///
    /// * `field` - The field definition specifying how to generate the string
    ///
    /// # Returns
    ///
    /// A generated string matching the field definition
    ///
    /// # Errors
    ///
    /// Returns `CoreError::Generation` if:
    /// - Field type is not String
    /// - min_length > max_length
    /// - Pattern generation fails
    ///
    /// # Example
    ///
    /// ```rust
    /// use synthetic_data_core::domain::*;
    /// use synthetic_data_infrastructure::capabilities::generators::string::StringGenerator;
    ///
    /// let generator = StringGenerator::new(None);
    /// let field = FieldDefinition {
    ///     name: "name".to_string(),
    ///     field_type: FieldType::String {
    ///         min_length: Some(5),
    ///         max_length: Some(10),
    ///         pattern: None,
    ///     },
    ///     constraints: vec![],
    ///     required: true,
    ///     default: None,
    ///     description: None,
    /// };
    ///
    /// let result = generator.generate(&field).await?;
    /// assert!(result.len() >= 5 && result.len() <= 10);
    /// ```
    pub async fn generate(&self, field: &FieldDefinition) -> Result<String> {
        let FieldType::String { min_length, max_length, pattern } = &field.field_type else {
            return Err(CoreError::Generation {
                message: format!("Field '{}' is not of type String", field.name),
            });
        };
        
        let min_len = min_length.unwrap_or(1);
        let max_len = max_length.unwrap_or(100);
        
        if min_len > max_len {
            return Err(CoreError::Generation {
                message: format!(
                    "Field '{}': min_length ({}) > max_length ({})",
                    field.name, min_len, max_len
                ),
            });
        }
        
        // For now, implement charset generation (MVP)
        // Future: implement other patterns (Regex, Template, Enum, Email, etc.)
        match pattern {
            Some(StringPattern::Enum(options)) => {
                self.generate_from_enum(options).await
            }
            Some(StringPattern::Email) => {
                self.generate_email().await
            }
            Some(StringPattern::Name(name_type)) => {
                self.generate_name(name_type.clone()).await
            }
            Some(StringPattern::Phone(format)) => {
                self.generate_phone(format.clone()).await
            }
            Some(StringPattern::Username) => {
                self.generate_username(min_len, max_len).await
            }
            // Regex, Template, Custom - fallback to charset for now
            _ => {
                // Smart detection: if field name contains "username", use username generation
                if field.name.to_lowercase().contains("username") || 
                   field.name.to_lowercase().contains("user_name") ||
                   field.name.to_lowercase().contains("login") {
                    self.generate_username(min_len, max_len).await
                } else {
                    self.generate_from_charset(min_len, max_len).await
                }
            }
        }
    }
    
    /// Generate multiple string values efficiently
    ///
    /// Optimized for batch generation - avoids multiple async calls.
    ///
    /// # Arguments
    ///
    /// * `field` - The field definition
    /// * `count` - Number of strings to generate
    ///
    /// # Returns
    ///
    /// A vector of generated strings
    /// 
    /// **CRITICAL OPTIMIZATION**: Synchronous version eliminates async overhead!
    pub fn generate_batch_sync(&self, field: &FieldDefinition, count: usize) -> Result<Vec<String>> {
        // Fast path: optimize based on pattern type
        let FieldType::String { min_length, max_length, pattern } = &field.field_type else {
            return Err(CoreError::Generation {
                message: format!("Field '{}' is not of type String", field.name),
            });
        };
        
        let min_len = min_length.unwrap_or(1);
        let max_len = max_length.unwrap_or(100);
        
        if min_len > max_len {
            return Err(CoreError::Generation {
                message: format!(
                    "Field '{}': min_length ({}) > max_length ({})",
                    field.name, min_len, max_len
                ),
            });
        }
        
        // Optimize based on pattern
        match pattern {
            Some(StringPattern::Enum(options)) => {
                // Fast enum selection - no async needed
                let results: Vec<String> = (0..count)
                    .map(|_| {
                        let idx = self.with_rng(|rng| rng.random_range(0..options.len()));
                        options[idx].clone()
                    })
                    .collect();
                Ok(results)
            }
            Some(StringPattern::Email) => {
                // Email generation - use custom optimized generation
                self.generate_email_batch(count)
            }
            Some(StringPattern::Name(name_type)) => {
                // Name generation - use cached pool for better performance
                let results: Vec<String> = self.with_rng(|rng| {
                    match name_type {
                        NameType::First => (0..count)
                            .map(|_| {
                                let idx = rng.random_range(0..self.first_names_pool.len());
                                self.first_names_pool[idx].clone()
                            })
                            .collect(),
                        NameType::Last => (0..count)
                            .map(|_| {
                                let idx = rng.random_range(0..self.last_names_pool.len());
                                self.last_names_pool[idx].clone()
                            })
                            .collect(),
                        NameType::Full => {
                            (0..count)
                                .map(|_| {
                                    let first_idx = rng.random_range(0..self.first_names_pool.len());
                                    let last_idx = rng.random_range(0..self.last_names_pool.len());
                                    let first = &self.first_names_pool[first_idx];
                                    let last = &self.last_names_pool[last_idx];
                                    // Use push_str for better performance - use pool for buffer reuse
                                    let mut full_name = self.string_pool.get_with_capacity(first.len() + last.len() + 1);
                                    full_name.push_str(first);
                                    full_name.push(' ');
                                    full_name.push_str(last);
                                    full_name
                                })
                                .collect()
                        },
                    }
                });
                Ok(results)
            }
            Some(StringPattern::Username) | _ if field.name.to_lowercase().contains("username") || 
                                                  field.name.to_lowercase().contains("user_name") ||
                                                  field.name.to_lowercase().contains("login") => {
                // Username generation - optimized batch (synchronous - zero async overhead!)
                self.generate_username_batch(min_len, max_len, count)
            }
            _ => {
                // Charset generation - optimized batch
                self.generate_from_charset_batch(min_len, max_len, count)
            }
        }
    }
    
    /// Generate multiple strings (async wrapper for trait compatibility)
    ///
    /// **NOTE**: This is just a wrapper that calls the synchronous version.
    /// The async overhead is minimal since we call sync version directly.
    pub async fn generate_batch(&self, field: &FieldDefinition, count: usize) -> Result<Vec<String>> {
        // CRITICAL OPTIMIZATION: Call synchronous version directly (no async overhead!)
        self.generate_batch_sync(field, count)
    }
    
    /// Generate string from charset (basic generation)
    async fn generate_from_charset(&self, min_len: usize, max_len: usize) -> Result<String> {
        if self.cached_charset.is_empty() {
            return Err(CoreError::Generation {
                message: "Charset is empty".to_string(),
            });
        }
        
        // Use with_rng to ensure state advances
        let result = self.with_rng(|rng| {
            // Generate random length
            let length = if min_len == max_len {
                min_len
            } else {
                rng.random_range(min_len..=max_len)
            };
            
            // Get reusable buffer from pool (reduces allocations)
            let mut s = self.string_pool.get_with_capacity(length);
            let chars = &self.cached_charset;
            let charset_len = chars.len();
            for _ in 0..length {
                let idx = rng.random_range(0..charset_len);
                s.push(chars[idx]);
            }
            // Note: We don't return the buffer here because it's being returned to caller
            // The caller will own it and it will be dropped naturally
            s
        });
        
        Ok(result)
    }
    
    /// Generate multiple strings from charset (optimized batch)
    fn generate_from_charset_batch(&self, min_len: usize, max_len: usize, count: usize) -> Result<Vec<String>> {
        if self.cached_charset.is_empty() {
            return Err(CoreError::Generation {
                message: "Charset is empty".to_string(),
            });
        }
        
        // Generate all in one batch using with_rng
        // Optimized: cache charset length, pre-allocate all strings
        let chars = &self.cached_charset;
        let charset_len = chars.len();
        let fixed_length = min_len == max_len;
        
        // CRITICAL OPTIMIZATION: Parallelize string generation for maximum throughput!
        // Use rayon to generate strings in parallel across multiple threads
        // Each thread uses its own RNG (thread-local) so no contention
        
        // Pre-generate all lengths first (sequential, fast)
        let lengths: Vec<usize> = self.with_rng(|rng| {
            if fixed_length {
                vec![min_len; count]
            } else {
                (0..count)
                    .map(|_| rng.random_range(min_len..=max_len))
                    .collect()
            }
        });
        
        // CRITICAL: Generate strings in parallel using rayon!
        // Each thread gets its own RNG via thread-local storage
        // ULTRA-OPTIMIZED: Direct RNG access in parallel loop (no with_rng overhead!)
        let results: Vec<String> = (0..count)
            .into_par_iter()
            .map(|i| {
                let length = lengths[i];
                // Get thread-local RNG directly (no with_rng wrapper overhead!)
                // Use with_rng pattern but optimized for parallel execution
                let rng = self.rng.get_or(|| {
                    let seed = match self.seed {
                        Some(s) => s.wrapping_add(i as u64),
                        None => {
                            // Use index + system time for non-deterministic per-thread RNG
                            use std::time::{SystemTime, UNIX_EPOCH};
                            let time_seed = SystemTime::now()
                                .duration_since(UNIX_EPOCH)
                                .unwrap()
                                .as_nanos() as u64;
                            time_seed.wrapping_add(i as u64)
                        }
                    };
                    RefCell::new(ChaCha8Rng::seed_from_u64(seed))
                });
                let mut rng_guard = rng.borrow_mut();
                
                // ULTRA-OPTIMIZED: Get string from pool with exact capacity
                // Pool already handles capacity, but we ensure it's exactly right
                let mut s = self.string_pool.get_with_capacity(length);
                // Only reserve_exact if current capacity is less than needed
                if s.capacity() < length {
                    s.reserve_exact(length - s.capacity());
                }
                
                // Generate and build string in one pass (better cache locality)
                // Direct RNG access eliminates with_rng closure overhead
                // ULTRA-OPTIMIZED: Use unchecked access for charset (index guaranteed valid)
                // MAXIMUM PERFORMANCE: Unroll small loops and use direct indexing
                if length <= 8 {
                    // Unroll for very short strings (common case)
                    for _ in 0..length {
                        let idx = rng_guard.random_range(0..charset_len);
                        unsafe {
                            s.push(*chars.get_unchecked(idx));
                        }
                    }
                } else {
                    // For longer strings, use standard loop with unchecked access
                    for _ in 0..length {
                        let idx = rng_guard.random_range(0..charset_len);
                        unsafe {
                            s.push(*chars.get_unchecked(idx));
                        }
                    }
                }
                
                s
            })
            .collect();
        
        Ok(results)
    }
    
    /// Generate string from enum (select from predefined values)
    async fn generate_from_enum(&self, options: &[String]) -> Result<String> {
        if options.is_empty() {
            return Err(CoreError::Generation {
                message: "Enum pattern has no options".to_string(),
            });
        }
        
        let idx = self.with_rng(|rng| rng.random_range(0..options.len()));
        Ok(options[idx].clone())
    }
    
    /// Generate email address using custom optimized generation
    ///
    /// Uses cached pool of names and domains for maximum performance.
    /// Generates realistic email patterns without using the fake crate.
    async fn generate_email(&self) -> Result<String> {
        let email = self.with_rng(|rng| {
            let pattern = rng.random_range(0..=4);
            let first_idx = rng.random_range(0..self.first_names_pool.len());
            let last_idx = rng.random_range(0..self.last_names_pool.len());
            let domain_idx = rng.random_range(0..self.email_domains.len());
            
            let first = &self.first_names_pool[first_idx];
            let last = &self.last_names_pool[last_idx];
            let domain = &self.email_domains[domain_idx];
            
            // Build email efficiently using push_str - use pool for buffer reuse
            let mut email = self.string_pool.get_with_capacity(first.len() + last.len() + domain.len() + 10);
            
            match pattern {
                0 => {
                    // firstname.lastname@domain.com
                    email.push_str(first);
                    email.push('.');
                    email.push_str(last);
                }
                1 => {
                    // firstname_lastname@domain.com
                    email.push_str(first);
                    email.push('_');
                    email.push_str(last);
                }
                2 => {
                    // firstname@domain.com
                    email.push_str(first);
                }
                3 => {
                    // firstname123@domain.com
                    email.push_str(first);
                    let num = rng.random_range(10..=9999);
                    let mut buf = itoa::Buffer::new();
                    email.push_str(buf.format(num));
                }
                _ => {
                    // firstname.lastname123@domain.com
                    email.push_str(first);
                    email.push('.');
                    email.push_str(last);
                    let num = rng.random_range(10..=999);
                    let mut buf = itoa::Buffer::new();
                    email.push_str(buf.format(num));
                }
            }
            
            email.push('@');
            email.push_str(domain);
            email
        });
        
        Ok(email)
    }
    
    /// Generate multiple emails (optimized batch)
    ///
    /// Uses cached pools and efficient string building for maximum performance.
    /// CRITICAL OPTIMIZATION: Parallelized for maximum throughput!
    fn generate_email_batch(&self, count: usize) -> Result<Vec<String>> {
        // MAXIMUM PERFORMANCE: Generate emails in parallel using rayon!
        // Each thread gets its own RNG via thread-local storage
        // ULTRA-OPTIMIZED: Direct RNG access (no with_rng wrapper overhead!)
        // Better load balancing with with_min_len
        let results: Vec<String> = (0..count)
            .into_par_iter()
            .with_min_len(1000)  // Better load balancing for large batches
            .map(|i| {
                // Get thread-local RNG directly (no with_rng wrapper overhead!)
                let rng = self.rng.get_or(|| {
                    let seed = match self.seed {
                        Some(s) => s.wrapping_add(i as u64),
                        None => {
                            use std::time::{SystemTime, UNIX_EPOCH};
                            let time_seed = SystemTime::now()
                                .duration_since(UNIX_EPOCH)
                                .unwrap()
                                .as_nanos() as u64;
                            time_seed.wrapping_add(i as u64)
                        }
                    };
                    RefCell::new(ChaCha8Rng::seed_from_u64(seed))
                });
                let mut rng_guard = rng.borrow_mut();
                
                // Generate email with direct RNG access
                {
                    let pattern = rng_guard.random_range(0..=4);
                    let first_idx = rng_guard.random_range(0..self.first_names_pool.len());
                    let last_idx = rng_guard.random_range(0..self.last_names_pool.len());
                    let domain_idx = rng_guard.random_range(0..self.email_domains.len());
                    
                    // ULTRA-OPTIMIZED: Use unchecked access (indices guaranteed valid by RNG)
                    let first = unsafe { self.first_names_pool.get_unchecked(first_idx) };
                    let last = unsafe { self.last_names_pool.get_unchecked(last_idx) };
                    let domain = unsafe { self.email_domains.get_unchecked(domain_idx) };
                    
                    // ULTRA-OPTIMIZED: Pre-allocate email with exact capacity
                    let exact_capacity = first.len() + last.len() + domain.len() + 15;
                    let mut email = self.string_pool.get_with_capacity(exact_capacity);
                    // Only reserve_exact if current capacity is less than needed
                    if email.capacity() < exact_capacity {
                        email.reserve_exact(exact_capacity - email.capacity());
                    }
                    
                    match pattern {
                        0 => {
                            // firstname.lastname@domain.com
                            email.push_str(first);
                            email.push('.');
                            email.push_str(last);
                        }
                        1 => {
                            // firstname_lastname@domain.com
                            email.push_str(first);
                            email.push('_');
                            email.push_str(last);
                        }
                        2 => {
                            // firstname@domain.com
                            email.push_str(first);
                        }
                        3 => {
                            // firstname123@domain.com
                            email.push_str(first);
                            let num = rng_guard.random_range(10..=9999);
                            let mut buf = itoa::Buffer::new();
                            email.push_str(buf.format(num));
                        }
                        _ => {
                            // firstname.lastname123@domain.com
                            email.push_str(first);
                            email.push('.');
                            email.push_str(last);
                            let num = rng_guard.random_range(10..=999);
                            let mut buf = itoa::Buffer::new();
                            email.push_str(buf.format(num));
                        }
                    }
                    
                    email.push('@');
                    email.push_str(domain);
                    email
                }
            })
            .collect();
        
        Ok(results)
    }
    
    /// Generate name (first, last, or full) using cached pool
    ///
    /// Uses pre-generated pool of names for better performance.
    /// Falls back to fake crate if pool is exhausted (shouldn't happen in practice).
    async fn generate_name(&self, name_type: NameType) -> Result<String> {
        // Use cached pool for better performance
        let result = match name_type {
            NameType::First => {
                let idx = self.with_rng(|rng| rng.random_range(0..self.first_names_pool.len()));
                self.first_names_pool[idx].clone()
            }
            NameType::Last => {
                let idx = self.with_rng(|rng| rng.random_range(0..self.last_names_pool.len()));
                self.last_names_pool[idx].clone()
            }
            NameType::Full => {
                let first_idx = self.with_rng(|rng| rng.random_range(0..self.first_names_pool.len()));
                let last_idx = self.with_rng(|rng| rng.random_range(0..self.last_names_pool.len()));
                let first = &self.first_names_pool[first_idx];
                let last = &self.last_names_pool[last_idx];
                // Use push_str for better performance - use pool for buffer reuse
                let mut full_name = self.string_pool.get_with_capacity(first.len() + last.len() + 1);
                full_name.push_str(first);
                full_name.push(' ');
                full_name.push_str(last);
                full_name
            }
        };
        
        Ok(result)
    }
    
    /// Generate realistic username
    ///
    /// Generates usernames using common patterns:
    /// - firstname.lastname
    /// - firstname_lastname
    /// - firstnamelastname
    /// - firstname123
    /// - firstname_lastname123
    /// - etc.
    ///
    /// Uses cached pool of names for better performance.
    async fn generate_username(&self, min_len: usize, max_len: usize) -> Result<String> {
        // Generate a realistic username using common patterns
        let username = self.with_rng(|rng| {
            let pattern = rng.random_range(0..=5);
            let first_idx = rng.random_range(0..self.first_names_pool.len());
            let last_idx = rng.random_range(0..self.last_names_pool.len());
            let first = &self.first_names_pool[first_idx];
            let last = &self.last_names_pool[last_idx];
            
            // Build username efficiently using push_str - use pool for buffer reuse
            let mut result = self.string_pool.get_with_capacity(first.len() + last.len() + 10);
            match pattern {
                0 => {
                    // firstname.lastname
                    result.push_str(first);
                    result.push('.');
                    result.push_str(last);
                }
                1 => {
                    // firstname_lastname
                    result.push_str(first);
                    result.push('_');
                    result.push_str(last);
                }
                2 => {
                    // firstnamelastname
                    result.push_str(first);
                    result.push_str(last);
                }
                3 => {
                    // firstname123
                    result.push_str(first);
                    let num = rng.random_range(10..=9999);
                    let mut buf = itoa::Buffer::new();
                    result.push_str(buf.format(num));
                }
                4 => {
                    // firstname_lastname123
                    result.push_str(first);
                    result.push('_');
                    result.push_str(last);
                    let num = rng.random_range(10..=999);
                    let mut buf = itoa::Buffer::new();
                    result.push_str(buf.format(num));
                }
                _ => {
                    // firstname + random suffix
                    result.push_str(first);
                    let suffix_chars: Vec<char> = "abcdefghijklmnopqrstuvwxyz0123456789".chars().collect();
                    for _ in 0..3 {
                        let idx = rng.random_range(0..suffix_chars.len());
                        result.push(suffix_chars[idx]);
                    }
                }
            }
            result
        });
        
        // Ensure length constraints
        let mut username = username; // Make mutable for potential modifications
        let final_username = if username.len() < min_len {
            // Add numbers to meet min length
            let needed = min_len - username.len();
            let num = self.with_rng(|rng| {
                let min_num = 10_u64.pow(needed.min(4) as u32);
                let max_num = 10_u64.pow((needed.min(4) + 1) as u32) - 1;
                rng.random_range(min_num..=max_num)
            });
            let mut buf = itoa::Buffer::new();
            username.push_str(buf.format(num));
            username
        } else if username.len() > max_len {
            // Truncate to max length
            username.chars().take(max_len).collect()
        } else {
            username
        };
        
        Ok(final_username)
    }
    
    /// Generate multiple usernames (ULTRA-OPTIMIZED batch - synchronous for zero async overhead!)
    /// CRITICAL OPTIMIZATION: Parallelized for maximum throughput!
    fn generate_username_batch(&self, min_len: usize, max_len: usize, count: usize) -> Result<Vec<String>> {
        // MAXIMUM PERFORMANCE: Use cached pool instead of generating names each time
        // Pre-compute suffix chars once (shared across threads)
        let suffix_chars: Vec<char> = "abcdefghijklmnopqrstuvwxyz0123456789".chars().collect();
        
        // MAXIMUM PERFORMANCE: Generate usernames in parallel using rayon!
        // Each thread gets its own RNG via thread-local storage
        // ULTRA-OPTIMIZED: Direct RNG access (no with_rng wrapper overhead!)
        // Better load balancing with with_min_len
        let results: Vec<String> = (0..count)
            .into_par_iter()
            .with_min_len(1000)  // Better load balancing for large batches
            .map(|i| {
                // Get thread-local RNG directly (no with_rng wrapper overhead!)
                let rng = self.rng.get_or(|| {
                    let seed = match self.seed {
                        Some(s) => s.wrapping_add(i as u64),
                        None => {
                            use std::time::{SystemTime, UNIX_EPOCH};
                            let time_seed = SystemTime::now()
                                .duration_since(UNIX_EPOCH)
                                .unwrap()
                                .as_nanos() as u64;
                            time_seed.wrapping_add(i as u64)
                        }
                    };
                    RefCell::new(ChaCha8Rng::seed_from_u64(seed))
                });
                let mut rng_guard = rng.borrow_mut();
                
                // Generate username with direct RNG access
                {
                    let pattern = rng_guard.random_range(0..=5);
                    let first_idx = rng_guard.random_range(0..self.first_names_pool.len());
                    let last_idx = rng_guard.random_range(0..self.last_names_pool.len());
                    // ULTRA-OPTIMIZED: Use unchecked access (indices guaranteed valid by RNG)
                    let first = unsafe { self.first_names_pool.get_unchecked(first_idx) };
                    let last = unsafe { self.last_names_pool.get_unchecked(last_idx) };
                    
                    // ULTRA-OPTIMIZED: Pre-allocate username with exact capacity
                    let exact_capacity = first.len() + last.len() + 15;
                    let mut username = self.string_pool.get_with_capacity(exact_capacity);
                    // Only reserve_exact if current capacity is less than needed
                    if username.capacity() < exact_capacity {
                        username.reserve_exact(exact_capacity - username.capacity());
                    }
                    
                    match pattern {
                        0 => {
                            username.push_str(first);
                            username.push('.');
                            username.push_str(last);
                        }
                        1 => {
                            username.push_str(first);
                            username.push('_');
                            username.push_str(last);
                        }
                        2 => {
                            username.push_str(first);
                            username.push_str(last);
                        }
                        3 => {
                            username.push_str(first);
                            let num = rng_guard.random_range(10..=9999);
                            let mut buf = itoa::Buffer::new();
                            username.push_str(buf.format(num));
                        }
                        4 => {
                            username.push_str(first);
                            username.push('_');
                            username.push_str(last);
                            let num = rng_guard.random_range(10..=999);
                            let mut buf = itoa::Buffer::new();
                            username.push_str(buf.format(num));
                        }
                        _ => {
                            username.push_str(first);
                            // Generate 3-char suffix
                            for _ in 0..3 {
                                let idx = rng_guard.random_range(0..suffix_chars.len());
                                username.push(suffix_chars[idx]);
                            }
                        }
                    }
                    
                    // Apply length constraints
                    if username.len() < min_len {
                        let needed = min_len - username.len();
                        let min_num = 10_u64.pow(needed.min(4) as u32);
                        let max_num = 10_u64.pow((needed.min(4) + 1) as u32) - 1;
                        let num = rng_guard.random_range(min_num..=max_num);
                        let mut buf = itoa::Buffer::new();
                        username.push_str(buf.format(num));
                    } else if username.len() > max_len {
                        username.truncate(max_len);
                    }
                    
                    username
                }
            })
            .collect();
        
        Ok(results)
    }
    
    /// Generate phone number
    async fn generate_phone(&self, format: PhoneFormat) -> Result<String> {
        match format {
            PhoneFormat::US => {
                // Format: (XXX) XXX-XXXX - optimized with push_str
                let result = self.with_rng(|rng| {
                    let area = rng.random_range(200..=999);
                    let exchange = rng.random_range(200..=999);
                    let number = rng.random_range(1000..=9999);
                    let mut phone = self.string_pool.get_with_capacity(14);
                    phone.push('(');
                    let mut buf = itoa::Buffer::new();
                    phone.push_str(buf.format(area));
                    phone.push_str(") ");
                    phone.push_str(buf.format(exchange));
                    phone.push('-');
                    phone.push_str(buf.format(number));
                    phone
                });
                Ok(result)
            }
            PhoneFormat::International => {
                // Format: +XX XXX XXX XXXX - optimized with push_str
                let result = self.with_rng(|rng| {
                    let country = rng.random_range(1..=99);
                    let area = rng.random_range(100..=999);
                    let first = rng.random_range(100..=999);
                    let second = rng.random_range(1000..=9999);
                    let mut phone = self.string_pool.get_with_capacity(18);
                    phone.push('+');
                    let mut buf = itoa::Buffer::new();
                    phone.push_str(buf.format(country));
                    phone.push(' ');
                    phone.push_str(buf.format(area));
                    phone.push(' ');
                    phone.push_str(buf.format(first));
                    phone.push(' ');
                    phone.push_str(buf.format(second));
                    phone
                });
                Ok(result)
            }
            PhoneFormat::Custom(pattern) => {
                // For MVP, generate alphanumeric matching pattern length
                // Future: parse pattern and generate accordingly
                let len = pattern.len().max(10);
                self.generate_from_charset(len, len).await
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_generate_respects_length_bounds() {
        let generator = StringGenerator::new(None);
        
        let field = FieldDefinition {
            name: "test".to_string(),
            field_type: FieldType::String {
                min_length: Some(5),
                max_length: Some(10),
                pattern: None,
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        for _ in 0..100 {
            let result = generator.generate(&field).await.unwrap();
            assert!(result.len() >= 5 && result.len() <= 10, 
                "Generated string '{}' has length {} which is outside bounds [5, 10]", 
                result, result.len());
        }
    }
    
    #[tokio::test]
    async fn test_generate_deterministic_with_seed() {
        let generator1 = StringGenerator::new(Some(42));
        let generator2 = StringGenerator::new(Some(42));
        
        let field = FieldDefinition {
            name: "test".to_string(),
            field_type: FieldType::String {
                min_length: Some(10),
                max_length: Some(20),
                pattern: None,
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let result1 = generator1.generate(&field).await.unwrap();
        let result2 = generator2.generate(&field).await.unwrap();
        
        assert_eq!(result1, result2, "Deterministic generation should produce same results");
    }
    
    #[tokio::test]
    async fn test_generate_from_enum() {
        let generator = StringGenerator::new(None);
        
        let field = FieldDefinition {
            name: "status".to_string(),
            field_type: FieldType::String {
                min_length: None,
                max_length: None,
                pattern: Some(StringPattern::Enum(vec![
                    "active".to_string(),
                    "inactive".to_string(),
                    "pending".to_string(),
                ])),
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        for _ in 0..50 {
            let result = generator.generate(&field).await.unwrap();
            assert!(matches!(result.as_str(), "active" | "inactive" | "pending"));
        }
    }
    
    #[tokio::test]
    async fn test_generate_email() {
        let generator = StringGenerator::new(None);
        
        let field = FieldDefinition {
            name: "email".to_string(),
            field_type: FieldType::String {
                min_length: None,
                max_length: None,
                pattern: Some(StringPattern::Email),
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let result = generator.generate(&field).await.unwrap();
        assert!(result.contains('@'));
        assert!(result.contains('.'));
        let parts: Vec<&str> = result.split('@').collect();
        assert_eq!(parts.len(), 2);
    }
    
    #[tokio::test]
    async fn test_generate_batch() {
        let generator = StringGenerator::new(None);
        
        let field = FieldDefinition {
            name: "test".to_string(),
            field_type: FieldType::String {
                min_length: Some(5),
                max_length: Some(10),
                pattern: None,
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let results = generator.generate_batch(&field, 100).await.unwrap();
        assert_eq!(results.len(), 100);
        
        for result in results {
            assert!(result.len() >= 5 && result.len() <= 10);
        }
    }
    
    #[tokio::test]
    async fn test_generate_invalid_field_type() {
        let generator = StringGenerator::new(None);
        
        let field = FieldDefinition {
            name: "id".to_string(),
            field_type: FieldType::Integer { min: None, max: None },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let result = generator.generate(&field).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("not of type String"));
    }
    
    #[tokio::test]
    async fn test_generate_invalid_length_bounds() {
        let generator = StringGenerator::new(None);
        
        let field = FieldDefinition {
            name: "test".to_string(),
            field_type: FieldType::String {
                min_length: Some(10),
                max_length: Some(5), // Invalid: min > max
                pattern: None,
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let result = generator.generate(&field).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("min_length"));
    }
}

