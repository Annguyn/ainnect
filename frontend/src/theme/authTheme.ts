import { createTheme } from '@mui/material/styles';

// ainnect brand colors - pink, purple, blue, light blue
export const brandColors = {
  primary: {
    main: '#E91E63', // Pink
    light: '#F48FB1',
    dark: '#AD1457',
  },
  secondary: {
    main: '#9C27B0', // Purple
    light: '#CE93D8',
    dark: '#6A1B9A',
  },
  tertiary: {
    main: '#2196F3', // Blue
    light: '#90CAF9',
    dark: '#1565C0',
  },
  quaternary: {
    main: '#03DAC6', // Light Blue/Cyan
    light: '#80E6D6',
    dark: '#018786',
  },
};

export const authTheme = createTheme({
  palette: {
    mode: 'light',
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontFamily: '"Poppins", "Inter", "Roboto", sans-serif',
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: '"Poppins", "Inter", "Roboto", sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: '"Poppins", "Inter", "Roboto", sans-serif',
      fontWeight: 700,
      fontSize: '1.25rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.secondary.main} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${brandColors.primary.dark} 0%, ${brandColors.secondary.dark} 100%)`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.3s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f1f5f9',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&.Mui-checked': {
            color: brandColors.primary.main,
          },
        },
      },
    },
  },
});

// Gradient utilities for the auth pages
export const gradients = {
  primary: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.secondary.main} 100%)`,
  secondary: `linear-gradient(135deg, ${brandColors.tertiary.main} 0%, ${brandColors.quaternary.main} 100%)`,
  background: `linear-gradient(135deg, ${brandColors.primary.light} 0%, ${brandColors.secondary.light} 50%, ${brandColors.tertiary.light} 100%)`,
  overlay: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(156, 39, 176, 0.1) 50%, rgba(33, 150, 243, 0.1) 100%)',
};