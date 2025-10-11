import { apiClient } from './apiClient';
import {
  AuthResponse,
  User,
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    apiClient.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    apiClient.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async logout(): Promise<string> {
    const response = await apiClient.post<string>('/api/auth/logout');
    apiClient.clearTokens();
    return response;
  },

  async validateToken(): Promise<boolean> {
    return await apiClient.get<boolean>('/api/auth/validate');
  },

  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>('/api/auth/me');
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>(`/api/auth/refresh?refreshToken=${refreshToken}`);
  },
};

export const userService = {
  async getProfile(): Promise<User> {
    return await apiClient.get<User>('/api/users/profile');
  },

  async getUserById(id: number): Promise<User> {
    return await apiClient.get<User>(`/api/users/${id}`);
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return await apiClient.put<User>('/api/users/profile', data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<string> {
    return await apiClient.put<string>('/api/users/change-password', data);
  },

  async deactivateAccount(): Promise<string> {
    return await apiClient.put<string>('/api/users/deactivate');
  },

  async activateAccount(): Promise<string> {
    return await apiClient.put<string>('/api/users/activate');
  },

  async checkUsernameExists(username: string): Promise<boolean> {
    return await apiClient.get<boolean>(`/api/users/check-username/${encodeURIComponent(username)}`);
  },

  async checkEmailExists(email: string): Promise<boolean> {
    return await apiClient.get<boolean>(`/api/users/check-email/${encodeURIComponent(email)}`);
  },
};

export const {
  register,
  login,
  logout,
  validateToken,
  getCurrentUser,
  refreshToken,
} = authService;

export const {
  getProfile,
  getUserById,
  updateProfile,
  changePassword,
  deactivateAccount,
  activateAccount,
  checkUsernameExists,
  checkEmailExists,
} = userService;
