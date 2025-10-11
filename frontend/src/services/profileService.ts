import { apiClient } from './apiClient';
import { debugLogger } from '../utils/debugLogger';

// Profile Management Types
export interface Education {
  id: number;
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: number;
  companyName: string;
  position: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Interest {
  id: number;
  name: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  locationName: string;
  locationType: 'current' | 'hometown' | 'work' | 'education' | 'other';
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialStats {
  userId: number;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  postsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

export interface PostsData {
  posts: any[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CompleteProfile {
  userId: number;
  username: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  location?: string | null;
  website?: string | null;
  joinedAt: string;
  canSendFriendRequest: boolean;
  friendshipStatus?: string | null;
  socialStats: SocialStats;
  educations: Education[];
  workExperiences: WorkExperience[];
  interests: Interest[];
  locations: Location[];
  posts: PostsData;
  private: boolean;
  following: boolean;
  blocked: boolean;
  friend: boolean;
  verified: boolean;
  followedBy: boolean;
  blockedBy: boolean;
}


// Request Types
export interface UpdateProfileRequest {
  displayName?: string;
  phone?: string;
  bio?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthday?: string;
  location?: string;
  avatar?: File;
}

export interface CreateEducationRequest {
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  image?: File;
}

export interface UpdateEducationRequest {
  schoolName?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
  image?: File;
}

export interface CreateWorkExperienceRequest {
  companyName: string;
  position: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  image?: File;
}

export interface UpdateWorkExperienceRequest {
  companyName?: string;
  position?: string;
  location?: string | null;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
  image?: File;
}

export interface UpdateInterestRequest {
  name?: string;
  category?: string;
  description?: string | null;
  image?: File;
}

export interface UpdateLocationRequest {
  locationName?: string;
  locationType?: 'current' | 'hometown' | 'work' | 'education' | 'other';
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  image?: File;
  isCurrent?: boolean;
}

export interface CreateInterestRequest {
  name: string;
  category: string;
  description?: string | null;
  image?: File;
}

export interface CreateLocationRequest {
  locationName: string;
  locationType: 'current' | 'hometown' | 'work' | 'education' | 'other';
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  image?: File;
  isCurrent: boolean;
}

class ProfileService {
  private baseUrl = '/api/profiles';

  // Profile Management
  async updateProfile(data: UpdateProfileRequest): Promise<any> {
    const endpoint = '/api/users/profile';
    debugLogger.logApiCall('PUT', endpoint, data);
    try {
      const formData = new FormData();
      
      if (data.displayName) {
        formData.append('displayName', data.displayName);
      }
      
      if (data.phone) {
        formData.append('phone', data.phone);
      }
      
      if (data.bio) {
        formData.append('bio', data.bio);
      }
      
      if (data.gender) {
        formData.append('gender', data.gender);
      }
      
      if (data.birthday) {
        formData.append('birthday', data.birthday);
      }
      
      if (data.location) {
        formData.append('location', data.location);
      }
      
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await apiClient.put(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('PUT', endpoint, response);
      
      debugLogger.log('ProfileService', `👤 Update Profile API Success`, {
        endpoint,
        displayName: data.displayName,
        hasAvatar: !!data.avatar
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Update Profile API Error`, {
        endpoint,
        data,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async uploadAvatar(avatar: File): Promise<any> {
    const endpoint = '/api/users/upload-avatar';
    debugLogger.logApiCall('POST', endpoint, { avatar: avatar.name });
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);

      const response = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('POST', endpoint, response);
      
      debugLogger.log('ProfileService', `📸 Upload Avatar API Success`, {
        endpoint,
        avatarName: avatar.name,
        avatarSize: avatar.size
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Upload Avatar API Error`, {
        endpoint,
        avatarName: avatar.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async createEducation(data: CreateEducationRequest): Promise<Education> {
    const endpoint = `${this.baseUrl}/education`;
    debugLogger.logApiCall('POST', endpoint, data);
    try {
      const formData = new FormData();
      formData.append('schoolName', data.schoolName);
      formData.append('degree', data.degree);
      formData.append('fieldOfStudy', data.fieldOfStudy);
      formData.append('startDate', data.startDate);
      formData.append('isCurrent', data.isCurrent.toString());
      
      if (data.endDate) {
        formData.append('endDate', data.endDate);
      }
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiClient.post<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: Education;
      }>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('POST', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      const educationData = response.data;
      
      debugLogger.log('ProfileService', `🎓 Create Education API Success`, {
        endpoint,
        educationId: educationData.id,
        schoolName: educationData.schoolName,
        degree: educationData.degree,
        fieldOfStudy: educationData.fieldOfStudy,
        isCurrent: educationData.isCurrent,
        hasImage: !!data.image
      });
      
      return educationData;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Create Education API Error`, {
        endpoint,
        data,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getEducations(): Promise<Education[]> {
    const endpoint = `${this.baseUrl}/education`;
    debugLogger.logApiCall('GET', endpoint);
    try {
      const response = await apiClient.get<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: Education[];
      }>(endpoint);
      debugLogger.logApiResponse('GET', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      const educationsData = response.data;
      
      debugLogger.log('ProfileService', `🎓 Get Educations API Success`, {
        endpoint,
        count: educationsData.length,
        educations: educationsData.map(e => ({
          id: e.id,
          schoolName: e.schoolName,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          isCurrent: e.isCurrent
        }))
      });
      
      return educationsData;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Get Educations API Error`, {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async updateEducation(id: number, data: UpdateEducationRequest): Promise<Education> {
    const endpoint = `${this.baseUrl}/education/${id}`;
    debugLogger.logApiCall('PUT', endpoint, data);
    try {
      const formData = new FormData();
      
      if (data.schoolName) {
        formData.append('schoolName', data.schoolName);
      }
      
      if (data.degree) {
        formData.append('degree', data.degree);
      }
      
      if (data.fieldOfStudy) {
        formData.append('fieldOfStudy', data.fieldOfStudy);
      }
      
      if (data.startDate) {
        formData.append('startDate', data.startDate);
      }
      
      if (data.endDate !== undefined) {
        formData.append('endDate', data.endDate || '');
      }
      
      if (data.isCurrent !== undefined) {
        formData.append('isCurrent', data.isCurrent.toString());
      }
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiClient.put<Education>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('PUT', endpoint, response);
      
      debugLogger.log('ProfileService', `🎓 Update Education API Success`, {
        endpoint,
        educationId: id,
        schoolName: response.schoolName,
        degree: response.degree,
        fieldOfStudy: response.fieldOfStudy,
        hasImage: !!data.image
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Update Education API Error`, {
        endpoint,
        educationId: id,
        data,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async deleteEducation(id: number): Promise<void> {
    const endpoint = `${this.baseUrl}/education/${id}`;
    debugLogger.logApiCall('DELETE', endpoint, { educationId: id });
    try {
      const response = await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, response);
      
      debugLogger.log('ProfileService', `🗑️ Delete Education API Success`, {
        endpoint,
        educationId: id
      });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Delete Education API Error`, {
        endpoint,
        educationId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Work Experience Management
  async createWorkExperience(data: CreateWorkExperienceRequest): Promise<WorkExperience> {
    const endpoint = `${this.baseUrl}/work-experience`;
    debugLogger.logApiCall('POST', endpoint, data);
    try {
      const formData = new FormData();
      formData.append('companyName', data.companyName);
      formData.append('position', data.position);
      formData.append('startDate', data.startDate);
      formData.append('isCurrent', data.isCurrent.toString());
      
      if (data.location) {
        formData.append('location', data.location);
      }
      
      if (data.endDate) {
        formData.append('endDate', data.endDate);
      }
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiClient.post<WorkExperience>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('POST', endpoint, response);
      
      debugLogger.log('ProfileService', `💼 Create Work Experience API Success`, {
        endpoint,
        workExperienceId: response.id,
        companyName: response.companyName,
        position: response.position,
        isCurrent: response.isCurrent,
        hasImage: !!data.image
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Create Work Experience API Error`, {
        endpoint,
        data,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getWorkExperiences(): Promise<WorkExperience[]> {
    const endpoint = `${this.baseUrl}/work-experience`;
    debugLogger.logApiCall('GET', endpoint);
    try {
      const response = await apiClient.get<{ result: string; message: string; data: WorkExperience[] }>(endpoint);
      debugLogger.logApiResponse('GET', endpoint, response);
      
      const workExperiences = response.data || [];
      
      debugLogger.log('ProfileService', `💼 Get Work Experiences API Success`, {
        endpoint,
        count: workExperiences.length,
        workExperiences: workExperiences.map(w => ({
          id: w.id,
          companyName: w.companyName,
          position: w.position,
          isCurrent: w.isCurrent
        }))
      });
      
      return workExperiences;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Get Work Experiences API Error`, {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async updateWorkExperience(id: number, data: UpdateWorkExperienceRequest): Promise<WorkExperience> {
    const endpoint = `${this.baseUrl}/work-experience/${id}`;
    debugLogger.logApiCall('PUT', endpoint, data);
    try {
      const formData = new FormData();
      
      if (data.companyName) {
        formData.append('companyName', data.companyName);
      }
      
      if (data.position) {
        formData.append('position', data.position);
      }
      
      if (data.location) {
        formData.append('location', data.location);
      }
      
      if (data.startDate) {
        formData.append('startDate', data.startDate);
      }
      
      if (data.endDate !== undefined) {
        formData.append('endDate', data.endDate || '');
      }
      
      if (data.isCurrent !== undefined) {
        formData.append('isCurrent', data.isCurrent.toString());
      }
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiClient.put<WorkExperience>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('PUT', endpoint, response);
      
      debugLogger.log('ProfileService', `💼 Update Work Experience API Success`, {
        endpoint,
        workExperienceId: id,
        companyName: response.companyName,
        position: response.position,
        hasImage: !!data.image
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Update Work Experience API Error`, {
        endpoint,
        workExperienceId: id,
        data,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async deleteWorkExperience(id: number): Promise<void> {
    const endpoint = `${this.baseUrl}/work-experience/${id}`;
    debugLogger.logApiCall('DELETE', endpoint, { workExperienceId: id });
    try {
      const response = await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, response);
      
      debugLogger.log('ProfileService', `🗑️ Delete Work Experience API Success`, {
        endpoint,
        workExperienceId: id
      });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Delete Work Experience API Error`, {
        endpoint,
        workExperienceId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Interests Management
  async createInterest(data: CreateInterestRequest): Promise<Interest> {
    const endpoint = `${this.baseUrl}/interest`;
    debugLogger.logApiCall('POST', endpoint, data);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category);
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiClient.post<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: Interest;
      }>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('POST', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      const interestData = response.data;
      
      debugLogger.log('ProfileService', `🎯 Create Interest API Success`, {
        endpoint,
        interestId: interestData.id,
        name: interestData.name,
        category: interestData.category,
        hasImage: !!data.image
      });
      
      return interestData;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Create Interest API Error`, {
        endpoint,
        data,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getInterests(): Promise<Interest[]> {
    const endpoint = `${this.baseUrl}/interest`;
    debugLogger.logApiCall('GET', endpoint);
    try {
      const response = await apiClient.get<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: Interest[];
      }>(endpoint);
      debugLogger.logApiResponse('GET', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      const interestsData = response.data;
      
      debugLogger.log('ProfileService', `🎯 Get Interests API Success`, {
        endpoint,
        count: interestsData.length,
        interests: interestsData.map(i => ({
          id: i.id,
          name: i.name,
          category: i.category
        }))
      });
      
      return interestsData;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Get Interests API Error`, {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async updateInterest(id: number, data: UpdateInterestRequest): Promise<Interest> {
    const endpoint = `${this.baseUrl}/interest/${id}`;
    debugLogger.logApiCall('PUT', endpoint, data);
    try {
      const formData = new FormData();
      
      if (data.name) {
        formData.append('name', data.name);
      }
      
      if (data.category) {
        formData.append('category', data.category);
      }
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiClient.put<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: Interest;
      }>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('PUT', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      const interestData = response.data;
      
      debugLogger.log('ProfileService', `🎯 Update Interest API Success`, {
        endpoint,
        interestId: id,
        name: interestData.name,
        category: interestData.category,
        hasImage: !!data.image
      });
      
      return interestData;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Update Interest API Error`, {
        endpoint,
        interestId: id,
        data,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async deleteInterest(id: number): Promise<void> {
    const endpoint = `${this.baseUrl}/interest/${id}`;
    debugLogger.logApiCall('DELETE', endpoint, { interestId: id });
    try {
      const response = await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, response);
      
      debugLogger.log('ProfileService', `🗑️ Delete Interest API Success`, {
        endpoint,
        interestId: id
      });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Delete Interest API Error`, {
        endpoint,
        interestId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Locations Management
  async createLocation(data: CreateLocationRequest): Promise<Location> {
    const endpoint = `${this.baseUrl}/location`;
    debugLogger.logApiCall('POST', endpoint, data);
    try {
      const formData = new FormData();
      formData.append('locationName', data.locationName);
      formData.append('locationType', data.locationType);
      formData.append('isCurrent', data.isCurrent.toString());
      
      if (data.address) {
        formData.append('address', data.address);
      }
      
      if (data.latitude !== undefined && data.latitude !== null) {
        formData.append('latitude', data.latitude.toString());
      }
      
      if (data.longitude !== undefined && data.longitude !== null) {
        formData.append('longitude', data.longitude.toString());
      }
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiClient.post<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: Location;
      }>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('POST', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      const locationData = response.data;
      
      debugLogger.log('ProfileService', `📍 Create Location API Success`, {
        endpoint,
        locationId: locationData.id,
        locationName: locationData.locationName,
        locationType: locationData.locationType,
        isCurrent: locationData.isCurrent,
        hasImage: !!data.image
      });
      
      return locationData;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Create Location API Error`, {
        endpoint,
        data,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getLocations(): Promise<Location[]> {
    const endpoint = `${this.baseUrl}/location`;
    debugLogger.logApiCall('GET', endpoint);
    try {
      const response = await apiClient.get<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: Location[];
      }>(endpoint);
      debugLogger.logApiResponse('GET', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      const locationsData = response.data;
      
      debugLogger.log('ProfileService', `📍 Get Locations API Success`, {
        endpoint,
        count: locationsData.length,
        locations: locationsData.map(l => ({
          id: l.id,
          locationName: l.locationName,
          locationType: l.locationType,
          isCurrent: l.isCurrent
        }))
      });
      
      return locationsData;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Get Locations API Error`, {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async updateLocation(id: number, data: UpdateLocationRequest): Promise<Location> {
    const endpoint = `${this.baseUrl}/location/${id}`;
    debugLogger.logApiCall('PUT', endpoint, data);
    try {
      const formData = new FormData();
      
      if (data.locationName) {
        formData.append('locationName', data.locationName);
      }
      
      if (data.locationType) {
        formData.append('locationType', data.locationType);
      }
      
      if (data.address) {
        formData.append('address', data.address);
      }
      
      if (data.latitude !== undefined && data.latitude !== null) {
        formData.append('latitude', data.latitude.toString());
      }
      
      if (data.longitude !== undefined && data.longitude !== null) {
        formData.append('longitude', data.longitude.toString());
      }
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.isCurrent !== undefined) {
        formData.append('isCurrent', data.isCurrent.toString());
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiClient.put<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: Location;
      }>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('PUT', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      const locationData = response.data;
      
      debugLogger.log('ProfileService', `📍 Update Location API Success`, {
        endpoint,
        locationId: id,
        locationName: locationData.locationName,
        locationType: locationData.locationType,
        hasImage: !!data.image
      });
      
      return locationData;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Update Location API Error`, {
        endpoint,
        locationId: id,
        data,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async deleteLocation(id: number): Promise<void> {
    const endpoint = `${this.baseUrl}/location/${id}`;
    debugLogger.logApiCall('DELETE', endpoint, { locationId: id });
    try {
      const response = await apiClient.delete(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, response);
      
      debugLogger.log('ProfileService', `🗑️ Delete Location API Success`, {
        endpoint,
        locationId: id
      });
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Delete Location API Error`, {
        endpoint,
        locationId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Complete Profile
  async getCompleteProfile(userId?: number): Promise<CompleteProfile> {
    const endpoint = userId ? `${this.baseUrl}/${userId}?page=0&size=10` : `${this.baseUrl}/complete`;
    debugLogger.logApiCall('GET', endpoint);
    try {
      const response = await apiClient.get<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: CompleteProfile;
      }>(endpoint);
      debugLogger.logApiResponse('GET', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      const profileData = response.data;
      
      debugLogger.log('ProfileService', `🔍 Get Complete Profile API Success`, {
        endpoint,
        userId: profileData.userId,
        username: profileData.username,
        displayName: profileData.displayName,
        educationCount: profileData.educations.length,
        workExperienceCount: profileData.workExperiences.length,
        interestsCount: profileData.interests.length,
        locationsCount: profileData.locations.length
      });
      
      return profileData;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('ProfileService', `❌ Get Complete Profile API Error`, {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }


}

// Export service instance
export const profileService = new ProfileService();

// Export convenience functions
export const updateProfile = (data: UpdateProfileRequest) => profileService.updateProfile(data);
export const uploadAvatar = (avatar: File) => profileService.uploadAvatar(avatar);

export const createEducation = (data: CreateEducationRequest) => profileService.createEducation(data);
export const getEducations = () => profileService.getEducations();
export const updateEducation = (id: number, data: UpdateEducationRequest) => profileService.updateEducation(id, data);
export const deleteEducation = (id: number) => profileService.deleteEducation(id);

export const createWorkExperience = (data: CreateWorkExperienceRequest) => profileService.createWorkExperience(data);
export const getWorkExperiences = () => profileService.getWorkExperiences();
export const updateWorkExperience = (id: number, data: UpdateWorkExperienceRequest) => profileService.updateWorkExperience(id, data);
export const deleteWorkExperience = (id: number) => profileService.deleteWorkExperience(id);

export const createInterest = (data: CreateInterestRequest) => profileService.createInterest(data);
export const getInterests = () => profileService.getInterests();
export const updateInterest = (id: number, data: UpdateInterestRequest) => profileService.updateInterest(id, data);
export const deleteInterest = (id: number) => profileService.deleteInterest(id);

export const createLocation = (data: CreateLocationRequest) => profileService.createLocation(data);
export const getLocations = () => profileService.getLocations();
export const updateLocation = (id: number, data: UpdateLocationRequest) => profileService.updateLocation(id, data);
export const deleteLocation = (id: number) => profileService.deleteLocation(id);

export const getCompleteProfile = () => profileService.getCompleteProfile();
