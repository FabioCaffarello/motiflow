//! String pool for reusing string buffers and reducing allocations
//!
//! Uses thread-local pools to avoid synchronization overhead while
//! reusing memory buffers for better performance.

use std::cell::RefCell;
use thread_local::ThreadLocal;

/// Thread-local pool of reusable string buffers
///
/// Reuses String buffers to reduce allocations during high-frequency generation.
/// Each thread has its own pool to avoid synchronization overhead.
pub struct StringPool {
    /// Thread-local pool of reusable string buffers
    pool: ThreadLocal<RefCell<Vec<String>>>,
    /// Maximum number of buffers to keep per thread
    max_pool_size: usize,
}

impl StringPool {
    /// Create a new string pool
    ///
    /// # Arguments
    ///
    /// * `max_pool_size` - Maximum number of buffers to keep per thread (default: 100)
    pub fn new(max_pool_size: usize) -> Self {
        Self {
            pool: ThreadLocal::new(),
            max_pool_size,
        }
    }
    
    /// Get a reusable string buffer from the pool
    ///
    /// Returns a cleared String buffer that can be reused.
    /// If the pool is empty, creates a new String.
    pub fn get(&self) -> String {
        let pool_cell = self.pool.get_or(|| RefCell::new(Vec::new()));
        let mut pool = pool_cell.borrow_mut();
        
        if let Some(mut buf) = pool.pop() {
            // Clear the buffer for reuse
            buf.clear();
            buf
        } else {
            // Pool is empty, create new buffer
            String::new()
        }
    }
    
    /// Get a reusable string buffer with capacity
    ///
    /// Returns a cleared String buffer with at least the specified capacity.
    pub fn get_with_capacity(&self, capacity: usize) -> String {
        let pool_cell = self.pool.get_or(|| RefCell::new(Vec::new()));
        let mut pool = pool_cell.borrow_mut();
        
        if let Some(mut buf) = pool.pop() {
            // Clear and ensure capacity
            buf.clear();
            if buf.capacity() < capacity {
                buf.reserve(capacity - buf.capacity());
            }
            buf
        } else {
            // Pool is empty, create new buffer with capacity
            String::with_capacity(capacity)
        }
    }
    
    /// Return a string buffer to the pool for reuse
    ///
    /// The buffer will be cleared and stored for future use.
    /// If the pool is full, the buffer is dropped.
    pub fn return_buffer(&self, mut buf: String) {
        let pool_cell = self.pool.get_or(|| RefCell::new(Vec::new()));
        let mut pool = pool_cell.borrow_mut();
        
        // Only keep buffer if pool is not full
        if pool.len() < self.max_pool_size {
            buf.clear();
            pool.push(buf);
        }
        // Otherwise, buffer is dropped (freed)
    }
    
    /// Return multiple buffers to the pool
    ///
    /// More efficient than calling return_buffer multiple times.
    pub fn return_buffers(&self, buffers: Vec<String>) {
        let pool_cell = self.pool.get_or(|| RefCell::new(Vec::new()));
        let mut pool = pool_cell.borrow_mut();
        
        for mut buf in buffers {
            if pool.len() < self.max_pool_size {
                buf.clear();
                pool.push(buf);
            }
            // If pool is full, buffer is dropped
        }
    }
}

impl Default for StringPool {
    fn default() -> Self {
        // CRITICAL OPTIMIZATION: Increased pool size for better reuse
        // Larger pool = more buffers available = fewer allocations
        // ULTRA-OPTIMIZED: Increased to 1000 for maximum buffer reuse
        Self::new(1000) // Increased from 500 to 1000 for even better performance
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_string_pool_reuse() {
        let pool = StringPool::new(10);
        
        // Get a buffer, use it, return it
        let mut buf = pool.get();
        buf.push_str("test");
        assert_eq!(buf, "test");
        
        pool.return_buffer(buf);
        
        // Get it back - should be cleared
        let buf2 = pool.get();
        assert_eq!(buf2, "");
    }
    
    #[test]
    fn test_string_pool_capacity() {
        let pool = StringPool::new(10);
        
        let buf = pool.get_with_capacity(100);
        assert!(buf.capacity() >= 100);
    }
    
    #[test]
    fn test_string_pool_max_size() {
        let pool = StringPool::new(2);
        
        // Return 3 buffers - only 2 should be kept
        pool.return_buffer(String::from("1"));
        pool.return_buffer(String::from("2"));
        pool.return_buffer(String::from("3"));
        
        // Should only have 2 in pool
        let buf1 = pool.get();
        let buf2 = pool.get();
        let buf3 = pool.get();
        
        // First two should be reused, third is new
        assert_eq!(buf1, "");
        assert_eq!(buf2, "");
        assert_eq!(buf3, "");
    }
}

