import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { profileService } from '../services/profileService'

export const useProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [socialStats, setSocialStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async (userId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      // Mock API call - replace with actual API
      console.log('Loading profile for user:', userId)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock profile data
      const mockProfile = {
        id: userId,
        username: 'johndoe',
        displayName: 'John Doe',
        avatarUrl: 'https://via.placeholder.com/150',
        bio: 'Software developer and tech enthusiast',
        location: 'Ho Chi Minh City, Vietnam',
        website: 'https://johndoe.com',
        isPrivate: false,
        isVerified: true,
        isOnline: true,
        createdAt: new Date().toISOString()
      }
      
      setProfile(mockProfile)
    } catch (err) {
      setError('Không thể tải thông tin hồ sơ')
      console.error('Load profile error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (userId: number, data: any) => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Updating profile for user:', userId, data)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state
      setProfile((prev: any) => ({ ...prev, ...data }))
    } catch (err) {
      setError('Không thể cập nhật hồ sơ')
      console.error('Update profile error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadSocialStats = useCallback(async (userId: number) => {
    try {
      console.log('Loading social stats for user:', userId)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock social stats
      const mockStats = {
        followers: 1250,
        following: 340,
        friends: 89,
        posts: 156,
        likes: 5420,
        comments: 1230,
        shares: 890
      }
      
      setSocialStats(mockStats)
    } catch (err) {
      console.error('Load social stats error:', err)
    }
  }, [])

  const loadUserPosts = useCallback(async (userId: number, filters: any = {}) => {
    try {
      console.log('Loading posts for user:', userId, filters)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock posts data
      return {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
      }
    } catch (err) {
      console.error('Load user posts error:', err)
      throw err
    }
  }, [])

  const loadFollowers = useCallback(async (userId: number, filters: any = {}) => {
    try {
      console.log('Loading followers for user:', userId, filters)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Mock followers data
      return {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
      }
    } catch (err) {
      console.error('Load followers error:', err)
      throw err
    }
  }, [])

  const loadFollowing = useCallback(async (userId: number, filters: any = {}) => {
    try {
      console.log('Loading following for user:', userId, filters)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Mock following data
      return {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
      }
    } catch (err) {
      console.error('Load following error:', err)
      throw err
    }
  }, [])

  const loadFriends = useCallback(async (userId: number, filters: any = {}) => {
    try {
      console.log('Loading friends for user:', userId, filters)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Mock friends data
      return {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
      }
    } catch (err) {
      console.error('Load friends error:', err)
      throw err
    }
  }, [])

  const uploadAvatar = useCallback(async (userId: number, file: File) => {
    try {
      console.log('Uploading avatar for user:', userId, file)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock avatar URL
      const avatarUrl = URL.createObjectURL(file)
      setProfile((prev: any) => ({ ...prev, avatarUrl }))
      
      return { avatarUrl }
    } catch (err) {
      console.error('Upload avatar error:', err)
      throw err
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Mock data for additional sections
  const [educations, setEducations] = useState<any[]>([])
  const [workExperiences, setWorkExperiences] = useState<any[]>([])
  const [interests, setInterests] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])

  const loadCompleteProfile = useCallback(async (userId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      // Load profile data
      await loadProfile(userId)
      
      // Load education data from API
      try {
        const educationData = await profileService.getEducations()
        console.log('Education data loaded:', educationData)
        setEducations(educationData)
      } catch (err) {
        console.error('Failed to load educations:', err)
        setEducations([])
      }
      
      // Load work experience data from API
      try {
        const workData = await profileService.getWorkExperiences()
        console.log('Work experience data loaded:', workData)
        setWorkExperiences(workData)
      } catch (err) {
        console.error('Failed to load work experiences:', err)
        setWorkExperiences([])
      }
      
      // Load interests data from API
      try {
        const interestsData = await profileService.getInterests()
        console.log('Interests data loaded:', interestsData)
        setInterests(interestsData)
      } catch (err) {
        console.error('Failed to load interests:', err)
        setInterests([])
      }
      
      // Load locations data from API
      try {
        const locationsData = await profileService.getLocations()
        console.log('Locations data loaded:', locationsData)
        setLocations(locationsData)
      } catch (err) {
        console.error('Failed to load locations:', err)
        setLocations([])
      }
    } catch (err) {
      setError('Không thể tải thông tin hồ sơ')
      console.error('Load complete profile error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [loadProfile])

  const createEducation = useCallback(async (data: any) => {
    try {
      console.log('Creating education:', data)
      const newEducation = await profileService.createEducation(data)
      setEducations(prev => [...prev, newEducation])
      return newEducation
    } catch (err) {
      console.error('Failed to create education:', err)
      throw err
    }
  }, [])

  const updateEducation = useCallback(async (id: number, data: any) => {
    try {
      console.log('Updating education:', id, data)
      const updatedEducation = await profileService.updateEducation(id, data)
      setEducations(prev => prev.map(edu => edu.id === id ? updatedEducation : edu))
      return updatedEducation
    } catch (err) {
      console.error('Failed to update education:', err)
      throw err
    }
  }, [])

  const deleteEducation = useCallback(async (id: number) => {
    try {
      console.log('Deleting education:', id)
      await profileService.deleteEducation(id)
      setEducations(prev => prev.filter(edu => edu.id !== id))
    } catch (err) {
      console.error('Failed to delete education:', err)
      throw err
    }
  }, [])

  const createWorkExperience = useCallback(async (data: any) => {
    try {
      console.log('Creating work experience:', data)
      const newWorkExperience = await profileService.createWorkExperience(data)
      setWorkExperiences(prev => [...prev, newWorkExperience])
      return newWorkExperience
    } catch (err) {
      console.error('Failed to create work experience:', err)
      throw err
    }
  }, [])

  const updateWorkExperience = useCallback(async (id: number, data: any) => {
    try {
      console.log('Updating work experience:', id, data)
      const updatedWorkExperience = await profileService.updateWorkExperience(id, data)
      setWorkExperiences(prev => prev.map(exp => exp.id === id ? updatedWorkExperience : exp))
      return updatedWorkExperience
    } catch (err) {
      console.error('Failed to update work experience:', err)
      throw err
    }
  }, [])

  const deleteWorkExperience = useCallback(async (id: number) => {
    try {
      console.log('Deleting work experience:', id)
      await profileService.deleteWorkExperience(id)
      setWorkExperiences(prev => prev.filter(exp => exp.id !== id))
    } catch (err) {
      console.error('Failed to delete work experience:', err)
      throw err
    }
  }, [])

  const createInterest = useCallback(async (data: any) => {
    try {
      console.log('Creating interest:', data)
      const newInterest = await profileService.createInterest(data)
      setInterests(prev => [...prev, newInterest])
      return newInterest
    } catch (err) {
      console.error('Failed to create interest:', err)
      throw err
    }
  }, [])

  const updateInterest = useCallback(async (id: number, data: any) => {
    try {
      console.log('Updating interest:', id, data)
      const updatedInterest = await profileService.updateInterest(id, data)
      setInterests(prev => prev.map(interest => interest.id === id ? updatedInterest : interest))
      return updatedInterest
    } catch (err) {
      console.error('Failed to update interest:', err)
      throw err
    }
  }, [])

  const deleteInterest = useCallback(async (id: number) => {
    try {
      console.log('Deleting interest:', id)
      await profileService.deleteInterest(id)
      setInterests(prev => prev.filter(interest => interest.id !== id))
    } catch (err) {
      console.error('Failed to delete interest:', err)
      throw err
    }
  }, [])

  const createLocation = useCallback(async (data: any) => {
    try {
      console.log('Creating location:', data)
      const newLocation = await profileService.createLocation(data)
      setLocations(prev => [...prev, newLocation])
      return newLocation
    } catch (err) {
      console.error('Failed to create location:', err)
      throw err
    }
  }, [])

  const updateLocation = useCallback(async (id: number, data: any) => {
    try {
      console.log('Updating location:', id, data)
      const updatedLocation = await profileService.updateLocation(id, data)
      setLocations(prev => prev.map(location => location.id === id ? updatedLocation : location))
      return updatedLocation
    } catch (err) {
      console.error('Failed to update location:', err)
      throw err
    }
  }, [])

  const deleteLocation = useCallback(async (id: number) => {
    try {
      console.log('Deleting location:', id)
      await profileService.deleteLocation(id)
      setLocations(prev => prev.filter(location => location.id !== id))
    } catch (err) {
      console.error('Failed to delete location:', err)
      throw err
    }
  }, [])

  const getSuggestions = useCallback(async (query: string) => {
    console.log('Getting suggestions for:', query)
    return []
  }, [])

  const getSuggestionCategories = useCallback(async () => {
    console.log('Getting suggestion categories')
    return []
  }, [])

  return {
    // State
    profile,
    socialStats,
    isLoading,
    error,
    educations,
    workExperiences,
    interests,
    locations,

    // Actions
    loadProfile,
    updateProfile,
    loadSocialStats,
    loadUserPosts,
    loadFollowers,
    loadFollowing,
    loadFriends,
    uploadAvatar,
    clearError,
    loadCompleteProfile,
    createEducation,
    updateEducation,
    deleteEducation,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    createInterest,
    updateInterest,
    deleteInterest,
    createLocation,
    updateLocation,
    deleteLocation,
    getSuggestions,
    getSuggestionCategories
  }
}