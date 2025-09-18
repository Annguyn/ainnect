import React, { useState, useCallback } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  TextField,
  Divider,
  Chip,
  Tab,
  Tabs,
  Card,
  CardContent,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Backdrop,
  CircularProgress,
  Fade,
  Slide,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import '../styles/profileAnimations.css';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { TransitionGroup } from 'react-transition-group';
import { User, Skill, SocialLink } from '../types';
import { useProfile } from '../hooks/useProfile';
import { 
  SkillCard, 
  SocialLinkCard, 
  AchievementBadge, 
  ProfileStats 
} from '../components/ProfileComponents';
import ErrorBoundary from '../components/ErrorBoundary';
import { ProfileSkeleton, LoadingOverlay } from '../components/LoadingStates';
import {
  formatProfileCompleteness,
  generateAchievements,
  getSkillsByCategory,
  validateSocialUrl
} from '../utils/profileUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Fade in={value === index} timeout={500}>
          <Box sx={{ py: 3 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
};

const Profile: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  // Enhanced mock user data
  const initialUserData: User = {
    id: '123',
    email: 'user@example.com',
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    avatar: 'https://i.pravatar.cc/300',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop',
    bio: 'Chuyên gia phát triển phần mềm với hơn 5 năm kinh nghiệm trong lĩnh vực AI và Machine Learning. Đam mê tạo ra những sản phẩm công nghệ có tác động tích cực đến cộng đồng.',
    position: 'Senior AI Engineer',
    company: 'AINnect',
    location: 'Đà Nẵng, Việt Nam',
    website: 'https://example.com',
    phoneNumber: '0123456789',
    interests: ['Artificial Intelligence', 'Machine Learning', 'Web Development', 'Cloud Computing'],
    skills: [
      { id: '1', name: 'React', category: 'technical', proficiency: 5, endorsements: 12, verified: true },
      { id: '2', name: 'TypeScript', category: 'technical', proficiency: 4, endorsements: 8 },
      { id: '3', name: 'Python', category: 'technical', proficiency: 5, endorsements: 15, verified: true },
      { id: '4', name: 'Leadership', category: 'soft', proficiency: 4, endorsements: 6 },
    ],
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/example', username: 'example', isPublic: true },
      { platform: 'github', url: 'https://github.com/example', username: 'example', isPublic: true },
    ],
    isVerified: true,
    profileViews: 1250,
    connectionCount: 342,
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date(),
  };

  const {
    userData,
    isLoading,
    error,
    updateProfile,
    addSkill,
    removeSkill,
    addSocialLink,
    removeSocialLink,
  } = useProfile(initialUserData);

  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    bio: userData.bio,
    position: userData.position,
    company: userData.company,
    location: userData.location,
    website: userData.website,
    phoneNumber: userData.phoneNumber,
  });

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'technical' as const,
    proficiency: 3 as const,
  });

  const [newSocialLink, setNewSocialLink] = useState({
    platform: 'linkedin' as const,
    url: '',
    username: '',
    isPublic: true,
  });

  const [newInterest, setNewInterest] = useState('');

  // Derived data
  const completeness = formatProfileCompleteness(userData);
  const achievements = generateAchievements(userData);
  const skillsByCategory = getSkillsByCategory(userData.skills || []);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleEditToggle = useCallback(() => {
    if (editMode) {
      updateProfile(formData);
    } else {
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
        position: userData.position,
        company: userData.company,
        location: userData.location,
        website: userData.website,
        phoneNumber: userData.phoneNumber,
      });
    }
    setEditMode(!editMode);
  }, [editMode, formData, updateProfile, userData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAddSkill = useCallback(() => {
    if (newSkill.name.trim()) {
      addSkill(newSkill);
      setNewSkill({ name: '', category: 'technical', proficiency: 3 });
      setSkillDialogOpen(false);
    }
  }, [newSkill, addSkill]);

  const handleAddSocialLink = useCallback(() => {
    if (newSocialLink.url.trim() && validateSocialUrl(newSocialLink.platform, newSocialLink.url)) {
      addSocialLink(newSocialLink);
      setNewSocialLink({ platform: 'linkedin', url: '', username: '', isPublic: true });
      setSocialDialogOpen(false);
    }
  }, [newSocialLink, addSocialLink]);

  const handleAddInterest = useCallback(() => {
    if (newInterest.trim()) {
      const interests = [...(userData.interests || []), newInterest.trim()];
      updateProfile({ interests });
      setNewInterest('');
    }
  }, [newInterest, userData.interests, updateProfile]);

  const handleRemoveInterest = useCallback((index: number) => {
    const interests = userData.interests?.filter((_, i) => i !== index) || [];
    updateProfile({ interests });
  }, [userData.interests, updateProfile]);

  // Show loading skeleton on initial load
  if (isLoading && !userData.id) {
    return <ProfileSkeleton />;
  }

  return (
    <ErrorBoundary>
      <LoadingOverlay isVisible={isLoading} message="Updating profile..." />

      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* Enhanced Profile Header with Cover Image */}
          <Paper 
            elevation={0}
            sx={{ 
              mb: 4, 
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative',
            }}
          >
            {/* Cover Image */}
            <Box
              sx={{
                height: 200,
                backgroundImage: `url(${userData.coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
                }
              }}
            />
            
            {/* Profile Info Overlay */}
            <Box sx={{ p: 4, position: 'relative', color: 'white' }}>
              <Grid container spacing={3} alignItems="flex-end">
                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      src={userData.avatar}
                      alt={`${userData.firstName} ${userData.lastName}`}
                      className="profile-avatar"
                      sx={{
                        width: isMobile ? 100 : 120,
                        height: isMobile ? 100 : 120,
                        border: '4px solid white',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        marginTop: -8,
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: -8,
                        bottom: 8,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                      size="small"
                      aria-label="Change profile picture"
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 9, md: 10 }}>
                  <Box className="profile-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                        <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold' }}>
                          {userData.firstName} {userData.lastName}
                        </Typography>
                        {userData.isVerified && (
                          <StarIcon className="verified-badge" sx={{ color: '#FFD700', fontSize: isMobile ? 24 : 28 }} />
                        )}
                      </Box>
                      
                      <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ opacity: 0.9, mb: 1 }}>
                        {userData.position} {userData.company && `tại ${userData.company}`}
                      </Typography>
                      
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? 1 : 2,
                        mb: 2,
                        flexWrap: isMobile ? 'wrap' : 'nowrap'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationIcon fontSize="small" />
                          <Typography variant="body2">{userData.location}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ViewIcon fontSize="small" />
                          <Typography variant="body2">{userData.profileViews} views</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleIcon fontSize="small" />
                          <Typography variant="body2">{userData.connectionCount} connections</Typography>
                        </Box>
                      </Box>

                      {/* Achievements */}
                      {achievements.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          {achievements.map((achievement, index) => (
                            <Box
                              key={achievement.id}
                              className="achievement-badge"
                              sx={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <AchievementBadge achievement={achievement} />
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                    
                    <Button
                      variant="contained"
                      startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                      onClick={handleEditToggle}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                      aria-label={editMode ? 'Save profile changes' : 'Edit profile'}
                    >
                      {editMode ? 'Lưu' : 'Chỉnh sửa'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Enhanced Tabs */}
          <Box sx={{ width: '100%' }}>
            <Paper elevation={1} sx={{ borderRadius: 2 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : false}
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    minWidth: isMobile ? 120 : 'auto',
                  }
                }}
                aria-label="Profile navigation tabs"
              >
                <Tab label="Thông tin" id="tab-0" aria-controls="tabpanel-0" />
                <Tab label="Kỹ năng" id="tab-1" aria-controls="tabpanel-1" />
                <Tab label="Mạng xã hội" id="tab-2" aria-controls="tabpanel-2" />
                <Tab label="Thống kê" id="tab-3" aria-controls="tabpanel-3" />
              </Tabs>
            </Paper>

            {/* Information Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Thông tin cá nhân
                    </Typography>
                    
                    {editMode ? (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Tên"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Họ"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            label="Giới thiệu"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            variant="outlined"
                            multiline
                            rows={4}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Vị trí"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Công ty"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <List>
                        <ListItem>
                          <ListItemIcon><EmailIcon /></ListItemIcon>
                          <ListItemText primary="Email" secondary={userData.email} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><PhoneIcon /></ListItemIcon>
                          <ListItemText primary="Điện thoại" secondary={userData.phoneNumber} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><WorkIcon /></ListItemIcon>
                          <ListItemText primary="Công việc" secondary={`${userData.position} tại ${userData.company}`} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LocationIcon /></ListItemIcon>
                          <ListItemText primary="Địa điểm" secondary={userData.location} />
                        </ListItem>
                      </List>
                    )}
                  </Paper>

                  {/* Interests Section */}
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Sở thích</Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => setNewInterest('')}
                        size="small"
                      >
                        Thêm
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <TransitionGroup component={null}>
                        {userData.interests?.map((interest, index) => (
                          <Slide key={interest} direction="right" in timeout={300}>
                            <Chip
                              label={interest}
                              onDelete={() => handleRemoveInterest(index)}
                              variant="outlined"
                              sx={{ 
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'scale(1.05)' }
                              }}
                            />
                          </Slide>
                        ))}
                      </TransitionGroup>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        label="Sở thích mới"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        size="small"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                      />
                      <Button onClick={handleAddInterest} variant="contained" size="small">
                        Thêm
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <ProfileStats 
                    stats={{
                      profileViews: userData.profileViews,
                      connectionCount: userData.connectionCount,
                      completeness,
                    }}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Skills Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Kỹ năng chuyên môn
                </Typography>
                <Fab
                  color="primary"
                  size="medium"
                  onClick={() => setSkillDialogOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <AddIcon />
                </Fab>
              </Box>

              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <Box key={category} sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
                    {category === 'technical' ? 'Kỹ thuật' : 
                     category === 'soft' ? 'Kỹ năng mềm' : 
                     category === 'language' ? 'Ngôn ngữ' : 'Khác'}
                  </Typography>
                  <Grid container spacing={2}>
                    {skills.map((skill) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={skill.id}>
                        <SkillCard 
                          skill={skill} 
                          onRemove={removeSkill}
                          showActions={editMode}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </TabPanel>

            {/* Social Links Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Mạng xã hội
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setSocialDialogOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Thêm liên kết
                </Button>
              </Box>

              <Grid container spacing={3}>
                {userData.socialLinks?.map((socialLink, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <SocialLinkCard 
                      socialLink={socialLink}
                      onRemove={removeSocialLink}
                      showActions={editMode}
                    />
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Statistics Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                Thống kê chi tiết
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Hoạt động profile
                      </Typography>
                      <Box sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Lượt xem profile: {userData.profileViews}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Số kết nối: {userData.connectionCount}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Độ hoàn thiện: {completeness}%
                        </Typography>
                        <Typography variant="body2">
                          Ngày tham gia: {userData.createdAt.toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </Box>
      </Container>

      {/* Add Skill Dialog */}
      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm kỹ năng mới</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên kỹ năng"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as any })}
            >
              <MenuItem value="technical">Kỹ thuật</MenuItem>
              <MenuItem value="soft">Kỹ năng mềm</MenuItem>
              <MenuItem value="language">Ngôn ngữ</MenuItem>
              <MenuItem value="other">Khác</MenuItem>
            </Select>
          </FormControl>
          <Typography gutterBottom>Mức độ thành thạo</Typography>
          <Select
            fullWidth
            value={newSkill.proficiency}
            onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value as any })}
          >
            <MenuItem value={1}>Beginner</MenuItem>
            <MenuItem value={2}>Novice</MenuItem>
            <MenuItem value={3}>Intermediate</MenuItem>
            <MenuItem value={4}>Advanced</MenuItem>
            <MenuItem value={5}>Expert</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleAddSkill} variant="contained">Thêm</Button>
        </DialogActions>
      </Dialog>

      {/* Add Social Link Dialog */}
      <Dialog open={socialDialogOpen} onClose={() => setSocialDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm liên kết mạng xã hội</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Platform</InputLabel>
            <Select
              value={newSocialLink.platform}
              onChange={(e) => setNewSocialLink({ ...newSocialLink, platform: e.target.value as any })}
            >
              <MenuItem value="linkedin">LinkedIn</MenuItem>
              <MenuItem value="github">GitHub</MenuItem>
              <MenuItem value="twitter">Twitter</MenuItem>
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="instagram">Instagram</MenuItem>
              <MenuItem value="youtube">YouTube</MenuItem>
              <MenuItem value="other">Khác</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="URL"
            value={newSocialLink.url}
            onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Username (tùy chọn)"
            value={newSocialLink.username}
            onChange={(e) => setNewSocialLink({ ...newSocialLink, username: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSocialDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleAddSocialLink} variant="contained">Thêm</Button>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  );
};

export default Profile;