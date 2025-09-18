import React, { useState } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Box 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch,
  placeholder = "Tìm kiếm trên ainnect..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '24px',
            backgroundColor: '#f9fafb',
            border: isFocused ? '2px solid #3b82f6' : '1px solid #e5e7eb',
            boxShadow: isFocused 
              ? '0 0 0 3px rgba(59, 130, 246, 0.1)' 
              : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#f3f4f6',
              borderColor: '#d1d5db'
            },
            '& fieldset': {
              border: 'none',
            },
            '& input': {
              color: '#374151',
              fontSize: '16px',
              fontWeight: 400,
              '&::placeholder': {
                color: '#9ca3af',
                opacity: 1,
                fontWeight: 400
              }
            }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon 
                sx={{ 
                  color: '#9ca3af',
                  fontSize: '20px',
                  transition: 'color 0.2s ease'
                }} 
              />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton 
                onClick={handleSearch} 
                edge="end"
                sx={{
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  width: 32,
                  height: 32,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#e5e7eb',
                    color: '#3b82f6'
                  }
                }}
              >
                <SearchIcon sx={{ fontSize: '18px' }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default SearchBar;
