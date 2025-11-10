import { apiClient } from './apiClient';
import { fileService } from './fileService';
import { debugLogger } from '../utils/debugLogger';

// User Profile Response Interface
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  gender?: string | null;
  birthday?: string | null;
  location?: string | null;
  isActive: boolean;
}

// Update Profile Request Interface
export interface UpdateProfileRequest {
  displayName?: string;
  phone?: string;
  bio?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthday?: string | null;
  location?: string | null;
  avatar?: File;
  cover?: File;
}

// Change Password Request Interface
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Upload Avatar Response Interface
export interface UploadAvatarResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: string | null;
}

class UserService {
  private baseUrl = '/api/users';

  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    const endpoint = `${this.baseUrl}/profile`;
    debugLogger.logApiCall('GET', endpoint);
    try {
      const response = await apiClient.get<UserProfile>(endpoint);
      debugLogger.logApiResponse('GET', endpoint, response);
      
      debugLogger.log('UserService', `👤 Get Profile API Success`, {
        endpoint,
        userId: response.id,
        username: response.username,
        displayName: response.displayName,
        email: response.email,
        phone: response.phone,
        bio: response.bio?.substring(0, 50) + '...',
        gender: response.gender,
        birthday: response.birthday,
        location: response.location,
        avatarUrl: response.avatarUrl,
        isActive: response.isActive,
        // createdAt: response.createdAt || 'N/A' // Not available in UserProfile interface
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('UserService', `❌ Get Profile API Error`, {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: number): Promise<UserProfile> {
    const endpoint = `${this.baseUrl}/${id}`;
    debugLogger.logApiCall('GET', endpoint, { userId: id });
    try {
      const response = await apiClient.get<UserProfile>(endpoint);
      debugLogger.logApiResponse('GET', endpoint, response);
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  // Update profile with form data
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const endpoint = `${this.baseUrl}/profile`;
    debugLogger.logApiCall('PUT', endpoint, data);
    try {
      const formData = new FormData();
      
      if (data.displayName) formData.append('displayName', data.displayName);
      if (data.phone) formData.append('phone', data.phone);
      if (data.bio) formData.append('bio', data.bio);
      if (data.gender) formData.append('gender', data.gender);
      if (data.birthday) formData.append('birthday', data.birthday);
      if (data.location) formData.append('location', data.location);
      if (data.avatar) formData.append('avatar', data.avatar);
      if (data.cover) formData.append('cover', data.cover);

      const response = await apiClient.put<UserProfile>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      debugLogger.logApiResponse('PUT', endpoint, response);
      debugLogger.log('UserService', 'Profile updated successfully', {
        updatedFields: Object.keys(data)
      });
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      throw error;
    }
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<string> {
    const endpoint = `${this.baseUrl}/change-password`;
    debugLogger.logApiCall('PUT', endpoint, { hasCurrentPassword: !!data.currentPassword, hasNewPassword: !!data.newPassword });
    try {
      const response = await apiClient.put<string>(endpoint, data);
      debugLogger.logApiResponse('PUT', endpoint, response);
      debugLogger.log('UserService', 'Password changed successfully');
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      throw error;
    }
  }

  // Upload avatar using file service
  async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
    const endpoint = `${this.baseUrl}/upload-avatar`;
    const formData = new FormData();
    formData.append('avatar', file);
    
    debugLogger.logApiCall('POST', endpoint, { 
      fileName: file.name, 
      fileSize: file.size,
      fileType: file.type 
    });
    
    try {
      const response = await apiClient.post<UploadAvatarResponse>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      debugLogger.logApiResponse('POST', endpoint, response);
      debugLogger.log('UserService', 'Avatar uploaded successfully', {
        newAvatarUrl: response.data
      });
      return response;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      throw error;
    }
  }

  // Upload avatar using general file service (alternative method)
  async uploadAvatarViaFileService(file: File): Promise<UploadAvatarResponse> {
    debugLogger.log('UserService', 'Uploading avatar via file service', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    try {
      // Upload file using file service
      const fileResponse = await fileService.uploadAvatar(file);
      
      if (fileResponse.result === 'SUCCESS' && fileResponse.data) {
        // Return the file response directly since avatar URL is already in the response
        return {
          result: 'SUCCESS',
          message: 'Avatar uploaded successfully',
          data: fileResponse.data
        };
      } else {
        throw new Error(fileResponse.message || 'Failed to upload avatar');
      }
    } catch (error) {
      debugLogger.log('UserService', 'Failed to upload avatar via file service', error);
      throw error;
    }
  }

  // Deactivate account
  async deactivateAccount(): Promise<string> {
    const endpoint = `${this.baseUrl}/deactivate`;
    debugLogger.logApiCall('PUT', endpoint);
    try {
      const response = await apiClient.put<string>(endpoint);
      debugLogger.logApiResponse('PUT', endpoint, response);
      debugLogger.log('UserService', 'Account deactivated successfully');
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      throw error;
    }
  }

  // Activate account
  async activateAccount(): Promise<string> {
    const endpoint = `${this.baseUrl}/activate`;
    debugLogger.logApiCall('PUT', endpoint);
    try {
      const response = await apiClient.put<string>(endpoint);
      debugLogger.logApiResponse('PUT', endpoint, response);
      debugLogger.log('UserService', 'Account activated successfully');
      return response;
    } catch (error) {
      debugLogger.logApiResponse('PUT', endpoint, null, error);
      throw error;
    }
  }

  // Check username availability
  async checkUsernameAvailability(username: string): Promise<boolean> {
    const endpoint = `${this.baseUrl}/check-username/${username}`;
    debugLogger.logApiCall('GET', endpoint, { username });
    try {
      const response = await apiClient.get<boolean>(endpoint);
      debugLogger.logApiResponse('GET', endpoint, response);
      debugLogger.log('UserService', 'Username availability checked', {
        username,
        isAvailable: !response // API returns true if exists, we want availability
      });
      return !response; // API returns true if username exists, we return availability
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }

  // Check email availability
  async checkEmailAvailability(email: string): Promise<boolean> {
    const endpoint = `${this.baseUrl}/check-email/${email}`;
    debugLogger.logApiCall('GET', endpoint, { email });
    try {
      const response = await apiClient.get<boolean>(endpoint);
      debugLogger.logApiResponse('GET', endpoint, response);
      debugLogger.log('UserService', 'Email availability checked', {
        email,
        isAvailable: !response // API returns true if exists, we want availability
      });
      return !response; // API returns true if email exists, we return availability
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      throw error;
    }
  }
}

// Export service instance and legacy functions for backward compatibility
export const userService = new UserService();

// Legacy exports for backward compatibility
export const getProfile = () => userService.getProfile();
export const getUserById = (id: string) => userService.getUserById(parseInt(id));
export const updateProfile = (data: any) => userService.updateProfile(data);
export const changePassword = (data: ChangePasswordRequest) => userService.changePassword(data);
export const deactivateAccount = () => userService.deactivateAccount();
export const activateAccount = () => userService.activateAccount();
export const checkUsernameExists = (username: string) => userService.checkUsernameAvailability(username).then(available => !available);
export const checkEmailExists = (email: string) => userService.checkEmailAvailability(email).then(available => !available);