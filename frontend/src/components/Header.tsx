import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Badge,
  Tooltip,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  AccountCircle as AccountCircleIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  VideoCall as VideoCallIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="static" 
      elevation={1}
      sx={{ 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        minHeight: '70px !important',
        px: { xs: 2, md: 4 }
      }}>
        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              gap: 1.5,
              padding: '8px 16px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
              }}
            >
              <img
                src="/favicon.ico"
                alt="ainnect Logo"
                style={{ height: '28px', width: 'auto' }}
              />
            </Box>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontFamily: '"Nunito", "Poppins", "Inter", sans-serif',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                fontSize: '1.4rem',
                textTransform: 'lowercase',
                background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 50%, #2196F3 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #E91E63, #9C27B0, #2196F3)',
                  borderRadius: '1px',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover::after': {
                  opacity: 1
                }
              }}
            >
              ainnect
            </Typography>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, mx: 4, maxWidth: 500 }}>
          <SearchBar />
        </Box>

        {/* Navigation Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Trang chủ" arrow>
            <IconButton 
              sx={{ 
                color: '#6b7280',
                borderRadius: '8px',
                width: 40,
                height: 40,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  color: '#3b82f6'
                }
              }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Bạn bè" arrow>
            <IconButton 
              sx={{ 
                color: '#6b7280',
                borderRadius: '8px',
                width: 40,
                height: 40,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  color: '#3b82f6'
                }
              }}
            >
              <PeopleIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Video call" arrow>
            <IconButton 
              sx={{ 
                color: '#6b7280',
                borderRadius: '8px',
                width: 40,
                height: 40,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  color: '#3b82f6'
                }
              }}
            >
              <VideoCallIcon />
            </IconButton>
          </Tooltip>

          {/* Authentication & User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {/* Combined Auth Button */}
            <Button
              startIcon={<LoginIcon />}
              onClick={() => navigate('/auth')}
              sx={{
                background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 50%, #2196F3 100%)',
                color: 'white',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: { xs: 1.5, sm: 2 },
                py: 0.75,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #C2185B 0%, #7B1FA2 50%, #1976D2 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)'
                },
                '& .MuiButton-startIcon': {
                  marginRight: { xs: 0.5, sm: 1 }
                }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Đăng nhập / Đăng ký
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                Đăng nhập
              </Box>
            </Button>

            {/* Divider */}
            <Box sx={{ width: 1, height: 24, backgroundColor: '#e5e7eb', mx: 1 }} />

            <Tooltip title="Tin nhắn" arrow>
              <IconButton
                sx={{
                  color: '#6b7280',
                  borderRadius: '8px',
                  width: 40,
                  height: 40,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                    color: '#3b82f6'
                  }
                }}
              >
                <Badge
                  badgeContent={3}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '0.75rem'
                    }
                  }}
                >
                  <MessageIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Thông báo" arrow>
              <IconButton
                sx={{
                  color: '#6b7280',
                  borderRadius: '8px',
                  width: 40,
                  height: 40,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                    color: '#3b82f6'
                  }
                }}
              >
                <Badge
                  badgeContent={7}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '0.75rem'
                    }
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Hồ sơ" arrow>
              <IconButton
                sx={{
                  ml: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
                onClick={() => navigate('/profile')}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: '#3b82f6',
                    color: 'white'
                  }}
                >
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
