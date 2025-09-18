import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Rating,
  Badge,
} from '@mui/material';
import {
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Link as LinkIcon,
  Verified as VerifiedIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Skill, SocialLink, Achievement } from '../types';
import { getProficiencyLabel, getSocialIconName } from '../utils/profileUtils';

// Skill Card Component
interface SkillCardProps {
  skill: Skill;
  onRemove?: (skillId: string) => void;
  showActions?: boolean;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onRemove, showActions = false }) => {
  const getSocialIcon = (platform: string) => {
    const icons = {
      linkedin: <LinkedInIcon />,
      github: <GitHubIcon />,
      twitter: <TwitterIcon />,
      facebook: <FacebookIcon />,
      instagram: <InstagramIcon />,
      youtube: <YouTubeIcon />,
      other: <LinkIcon />
    };
    return icons[platform as keyof typeof icons] || <LinkIcon />;
  };

  return (
    <Card 
      sx={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {skill.name}
          </Typography>
          {showActions && onRemove && (
            <IconButton 
              size="small" 
              onClick={() => onRemove(skill.id)}
              sx={{ color: 'white', opacity: 0.7 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
          {skill.verified && (
            <Tooltip title="Verified Skill">
              <VerifiedIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
            </Tooltip>
          )}
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {getProficiencyLabel(skill.proficiency)}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={skill.proficiency * 20} 
            sx={{ 
              mt: 0.5, 
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4CAF50'
              }
            }}
          />
        </Box>
        
        <Chip 
          label={skill.category} 
          size="small" 
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            color: 'white',
            fontSize: '0.7rem'
          }} 
        />
        
        {skill.endorsements && skill.endorsements > 0 && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
            {skill.endorsements} endorsements
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Social Link Component
interface SocialLinkCardProps {
  socialLink: SocialLink;
  onRemove?: (platform: string) => void;
  showActions?: boolean;
}

export const SocialLinkCard: React.FC<SocialLinkCardProps> = ({ 
  socialLink, 
  onRemove, 
  showActions = false 
}) => {
  const getSocialIcon = (platform: string) => {
    const iconProps = { sx: { fontSize: 24, color: '#667eea' } };
    const icons = {
      linkedin: <LinkedInIcon {...iconProps} />,
      github: <GitHubIcon {...iconProps} />,
      twitter: <TwitterIcon {...iconProps} />,
      facebook: <FacebookIcon {...iconProps} />,
      instagram: <InstagramIcon {...iconProps} />,
      youtube: <YouTubeIcon {...iconProps} />,
      other: <LinkIcon {...iconProps} />
    };
    return icons[platform as keyof typeof icons] || <LinkIcon {...iconProps} />;
  };

  return (
    <Card 
      sx={{ 
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
      }}
      onClick={() => window.open(socialLink.url, '_blank')}
    >
      <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getSocialIcon(socialLink.platform)}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {getSocialIconName(socialLink.platform)}
            </Typography>
            {socialLink.username && (
              <Typography variant="caption" color="text.secondary">
                @{socialLink.username}
              </Typography>
            )}
          </Box>
        </Box>
        
        {showActions && onRemove && (
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(socialLink.platform);
            }}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </CardContent>
    </Card>
  );
};

// Achievement Badge Component
interface AchievementBadgeProps {
  achievement: Achievement;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  return (
    <Tooltip 
      title={
        <Box>
          <Typography variant="subtitle2">{achievement.title}</Typography>
          <Typography variant="caption">{achievement.description}</Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Earned: {achievement.earnedAt.toLocaleDateString('vi-VN')}
          </Typography>
        </Box>
      }
    >
      <Badge
        badgeContent={achievement.icon}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '1.2rem',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }
        }}
      >
        <Box sx={{ width: 40, height: 40 }} />
      </Badge>
    </Tooltip>
  );
};

// Profile Stats Component
interface ProfileStatsProps {
  stats: {
    profileViews?: number;
    connectionCount?: number;
    completeness: number;
  };
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  return (
    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Profile Statistics
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {stats.profileViews || 0}
            </Typography>
            <Typography variant="caption">Profile Views</Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {stats.connectionCount || 0}
            </Typography>
            <Typography variant="caption">Connections</Typography>
          </Box>
        </Box>
        
        <Box>
          <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
            Profile Completeness: {stats.completeness}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={stats.completeness} 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4CAF50'
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};