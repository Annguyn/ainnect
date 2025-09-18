import { Skill, SocialLink, Achievement } from '../types';

// Utility functions for profile operations
export const getSkillsByCategory = (skills: Skill[]) => {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
};

export const getProficiencyLabel = (level: number): string => {
  const labels = {
    1: 'Beginner',
    2: 'Novice', 
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert'
  };
  return labels[level as keyof typeof labels] || 'Unknown';
};

export const getSocialIconName = (platform: SocialLink['platform']): string => {
  const icons = {
    linkedin: 'LinkedIn',
    github: 'GitHub',
    twitter: 'Twitter',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
    other: 'Link'
  };
  return icons[platform] || 'Link';
};

export const formatProfileCompleteness = (user: any): number => {
  const fields = [
    user.firstName,
    user.lastName,
    user.bio,
    user.position,
    user.company,
    user.location,
    user.avatar,
    user.skills?.length > 0,
    user.socialLinks?.length > 0,
    user.phoneNumber,
    user.website
  ];
  
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
};

export const generateAchievements = (user: any): Achievement[] => {
  const achievements: Achievement[] = [];
  
  if (user.skills?.length >= 5) {
    achievements.push({
      id: 'skill-master',
      title: 'Skill Master',
      description: 'Added 5 or more skills to profile',
      icon: '🎯',
      earnedAt: new Date(),
      category: 'skill'
    });
  }
  
  if (formatProfileCompleteness(user) >= 80) {
    achievements.push({
      id: 'profile-complete',
      title: 'Profile Complete',
      description: 'Completed 80% of profile information',
      icon: '✅',
      earnedAt: new Date(),
      category: 'milestone'
    });
  }
  
  return achievements;
};

export const validateSocialUrl = (platform: string, url: string): boolean => {
  const patterns = {
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
    github: /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
    twitter: /^https?:\/\/(www\.)?twitter\.com\/[\w-]+\/?$/,
    facebook: /^https?:\/\/(www\.)?facebook\.com\/[\w.-]+\/?$/,
    instagram: /^https?:\/\/(www\.)?instagram\.com\/[\w.-]+\/?$/,
    youtube: /^https?:\/\/(www\.)?youtube\.com\/(channel\/|c\/|user\/)?[\w-]+\/?$/,
  };
  
  const pattern = patterns[platform as keyof typeof patterns];
  return pattern ? pattern.test(url) : true; // Allow any URL for 'other'
};