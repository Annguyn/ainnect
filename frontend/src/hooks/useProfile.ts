import { useState, useCallback } from 'react';
import { User, ProfileUpdateData, Skill, SocialLink } from '../types';

// Custom hook for profile management
export const useProfile = (initialUser: User) => {
  const [userData, setUserData] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(async (data: ProfileUpdateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserData(prev => ({
        ...prev,
        ...data,
        updatedAt: new Date(),
      }));
      
      return { success: true };
    } catch (err) {
      setError('Failed to update profile');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSkill = useCallback((skill: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
      ...skill,
      id: Date.now().toString(),
    };
    
    setUserData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill],
    }));
  }, []);

  const removeSkill = useCallback((skillId: string) => {
    setUserData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill.id !== skillId) || [],
    }));
  }, []);

  const addSocialLink = useCallback((socialLink: SocialLink) => {
    setUserData(prev => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), socialLink],
    }));
  }, []);

  const removeSocialLink = useCallback((platform: string) => {
    setUserData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks?.filter(link => link.platform !== platform) || [],
    }));
  }, []);

  return {
    userData,
    isLoading,
    error,
    updateProfile,
    addSkill,
    removeSkill,
    addSocialLink,
    removeSocialLink,
  };
};