import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Badge,
  Avatar,
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Bookmark as BookmarkIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface SidebarItem {
  icon: React.ReactNode;
  text: string;
  badge?: number;
  onClick?: () => void;
}

const mainMenuItems: SidebarItem[] = [
  { icon: <HomeIcon />, text: 'Trang chủ' },
  { icon: <PeopleIcon />, text: 'Bạn bè', badge: 3 },
  { icon: <MessageIcon />, text: 'Tin nhắn', badge: 5 },
  { icon: <GroupIcon />, text: 'Nhóm' },
  { icon: <NotificationsIcon />, text: 'Thông báo', badge: 12 },
  { icon: <BookmarkIcon />, text: 'Đã lưu' },
  { icon: <TrendingUpIcon />, text: 'Xu hướng' }
];

const settingsItems: SidebarItem[] = [
  { icon: <SettingsIcon />, text: 'Cài đặt' }
];

const mockGroups = [
  { id: '1', name: 'React Developers Vietnam', avatar: '/api/placeholder/32/32', members: 1250 },
  { id: '2', name: 'AI & Machine Learning', avatar: '/api/placeholder/32/32', members: 890 },
  { id: '3', name: 'Web Development', avatar: '/api/placeholder/32/32', members: 2100 },
  { id: '4', name: 'Startup Vietnam', avatar: '/api/placeholder/32/32', members: 756 }
];

const mockFriends = [
  { id: '1', name: 'Nguyễn Văn A', avatar: '/api/placeholder/32/32', isOnline: true },
  { id: '2', name: 'Trần Thị B', avatar: '/api/placeholder/32/32', isOnline: false },
  { id: '3', name: 'Lê Văn C', avatar: '/api/placeholder/32/32', isOnline: true },
  { id: '4', name: 'Phạm Thị D', avatar: '/api/placeholder/32/32', isOnline: false },
  { id: '5', name: 'Hoàng Văn E', avatar: '/api/placeholder/32/32', isOnline: true }
];

const Sidebar: React.FC = () => {
  return (
    <Box 
      sx={{ 
        width: 280, 
        height: '100vh', 
        overflowY: 'auto', 
        p: 2,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb'
      }}
    >
      {/* Main Menu */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}
      >
        <List sx={{ p: 1 }}>
          {mainMenuItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                sx={{ 
                  borderRadius: '8px',
                  mx: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.badge ? (
                    <Badge 
                      badgeContent={item.badge} 
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#ef4444',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }
                      }}
                    >
                      <Box sx={{ color: '#6b7280' }}>{item.icon}</Box>
                    </Badge>
                  ) : (
                    <Box sx={{ color: '#6b7280' }}>{item.icon}</Box>
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: '#2c3e50'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Groups Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08), 0 1px 6px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3, pb: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 1,
              fontWeight: 700,
              color: '#2c3e50',
              fontSize: '1.1rem'
            }}
          >
            Nhóm của bạn
          </Typography>
        </Box>
        <List dense sx={{ px: 1, pb: 1 }}>
          {mockGroups.map((group) => (
            <ListItem key={group.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                sx={{ 
                  borderRadius: '12px', 
                  mx: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.2)',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Avatar 
                    src={group.avatar} 
                    sx={{ 
                      width: 36, 
                      height: 36,
                      background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                      boxShadow: '0 3px 10px rgba(46, 204, 113, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.9)'
                    }}
                  >
                    {group.name.charAt(0)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={group.name}
                  secondary={`${group.members.toLocaleString()} thành viên`}
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#2c3e50'
                  }}
                  secondaryTypographyProps={{ 
                    fontSize: '0.75rem',
                    color: '#7f8c8d',
                    fontWeight: 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Friends Online Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08), 0 1px 6px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3, pb: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 1,
              fontWeight: 700,
              color: '#2c3e50',
              fontSize: '1.1rem'
            }}
          >
            Bạn bè
          </Typography>
        </Box>
        <List dense sx={{ px: 1, pb: 1 }}>
          {mockFriends.map((friend) => (
            <ListItem key={friend.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                sx={{ 
                  borderRadius: '12px', 
                  mx: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      src={friend.avatar} 
                      sx={{ 
                        width: 36, 
                        height: 36,
                        background: 'linear-gradient(135deg, #3498db, #2980b9)',
                        boxShadow: '0 3px 10px rgba(52, 152, 219, 0.3)',
                        border: '2px solid rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      {friend.name.charAt(0)}
                    </Avatar>
                    {friend.isOnline && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                          border: '3px solid white',
                          boxShadow: '0 2px 6px rgba(46, 204, 113, 0.4)'
                        }}
                      />
                    )}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={friend.name}
                  secondary={friend.isOnline ? 'Đang hoạt động' : 'Offline'}
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#2c3e50'
                  }}
                  secondaryTypographyProps={{ 
                    fontSize: '0.75rem',
                    color: friend.isOnline ? '#2ecc71' : '#7f8c8d',
                    fontWeight: 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Settings */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08), 0 1px 6px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}
      >
        <List sx={{ p: 1 }}>
          {settingsItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton 
                sx={{ 
                  borderRadius: '12px',
                  mx: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(155, 89, 182, 0.2)',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{ color: '#9b59b6' }}>{item.icon}</Box>
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: '#2c3e50'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Sidebar;
