//! Character set definitions for string generation

/// Character set types for string generation
#[derive(Debug, Clone)]
pub enum Charset {
    /// Alphanumeric characters (a-z, A-Z, 0-9)
    Alphanumeric,
    /// Alphabetic characters only (a-z, A-Z)
    Alpha,
    /// Numeric characters only (0-9)
    Numeric,
    /// All ASCII printable characters (0x20-0x7E)
    Ascii,
    /// Custom character set
    Custom(Vec<char>),
}

impl Charset {
    /// Get the characters for this charset
    pub fn get_chars(&self) -> Vec<char> {
        match self {
            Charset::Alphanumeric => {
                (b'a'..=b'z')
                    .chain(b'A'..=b'Z')
                    .chain(b'0'..=b'9')
                    .map(|b| b as char)
                    .collect()
            }
            Charset::Alpha => {
                (b'a'..=b'z')
                    .chain(b'A'..=b'Z')
                    .map(|b| b as char)
                    .collect()
            }
            Charset::Numeric => {
                (b'0'..=b'9').map(|b| b as char).collect()
            }
            Charset::Ascii => {
                (0x20..=0x7E)
                    .filter_map(char::from_u32)
                    .collect()
            }
            Charset::Custom(chars) => chars.clone(),
        }
    }
    
    /// Get the default charset (alphanumeric)
    #[allow(clippy::should_implement_trait)]
    pub fn default() -> Self {
        Charset::Alphanumeric
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_alphanumeric_charset() {
        let charset = Charset::Alphanumeric;
        let chars = charset.get_chars();
        
        assert!(chars.contains(&'a'));
        assert!(chars.contains(&'Z'));
        assert!(chars.contains(&'5'));
        assert!(!chars.contains(&'!'));
        assert_eq!(chars.len(), 26 + 26 + 10); // 62 chars
    }
    
    #[test]
    fn test_alpha_charset() {
        let charset = Charset::Alpha;
        let chars = charset.get_chars();
        
        assert!(chars.contains(&'a'));
        assert!(chars.contains(&'Z'));
        assert!(!chars.contains(&'5'));
        assert_eq!(chars.len(), 26 + 26); // 52 chars
    }
    
    #[test]
    fn test_numeric_charset() {
        let charset = Charset::Numeric;
        let chars = charset.get_chars();
        
        assert!(chars.contains(&'0'));
        assert!(chars.contains(&'9'));
        assert!(!chars.contains(&'a'));
        assert_eq!(chars.len(), 10);
    }
    
    #[test]
    fn test_custom_charset() {
        let charset = Charset::Custom(vec!['a', 'b', 'c']);
        let chars = charset.get_chars();
        
        assert_eq!(chars, vec!['a', 'b', 'c']);
    }
}

