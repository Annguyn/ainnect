import { authService as apiAuthService, userService } from './api';
import { AuthState, User, LoginRequest, RegisterRequest } from '../types';
import { debugLogger } from '../utils/debugLogger';

class AuthService {
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
  };

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      this.setState({
        ...this.state,
        accessToken,
        refreshToken,
        isLoading: true,
      });

      try {
        const isValid = await apiAuthService.validateToken();
        if (isValid) {
          const user = await apiAuthService.getCurrentUser();
          this.setState({
            ...this.state,
            isAuthenticated: true,
            user,
            isLoading: false,
            error: null,
          });
        } else {
          this.clearAuth();
        }
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  private setState(newState: AuthState) {
    this.state = newState;
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    listener(this.state); // Call immediately with current state
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): AuthState {
    return this.state;
  }

  async login(credentials: LoginRequest): Promise<void> {
    debugLogger.log('AuthService', `🔐 Login API Call`, {
      usernameOrEmail: credentials.usernameOrEmail,
      hasPassword: !!credentials.password
    });

    this.setState({
      ...this.state,
      isLoading: true,
      error: null,
    });

    try {
      const response = await apiAuthService.login(credentials);
      
      debugLogger.log('AuthService', `✅ Login API Success`, {
        userId: response.userInfo?.id,
        username: response.userInfo?.username,
        displayName: response.userInfo?.displayName,
        hasAccessToken: !!response.accessToken,
        hasRefreshToken: !!response.refreshToken,
        tokenLength: response.accessToken?.length
      });
      
      this.setState({
        ...this.state,
        isAuthenticated: true,
        user: response.userInfo,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      debugLogger.log('AuthService', `❌ Login API Error`, {
        usernameOrEmail: credentials.usernameOrEmail,
        error: error.message || 'Login failed',
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      this.setState({
        ...this.state,
        isLoading: false,
        error: error.message || 'Login failed',
      });
      throw error;
    }
  }

  async loginWithToken(token: string): Promise<void> {
    debugLogger.log('AuthService', `🔐 Login with Token (QR)`, {
      hasToken: !!token,
      tokenLength: token?.length
    });

    this.setState({
      ...this.state,
      isLoading: true,
      error: null,
    });

    try {
      // Store the token
      localStorage.setItem('accessToken', token);
      
      // Get user info using the token
      const userInfo = await apiAuthService.getCurrentUser();
      
      debugLogger.log('AuthService', `✅ QR Login Success`, {
        userId: userInfo?.id,
        username: userInfo?.username,
        displayName: userInfo?.displayName
      });
      
      this.setState({
        ...this.state,
        isAuthenticated: true,
        user: userInfo,
        accessToken: token,
        refreshToken: null, // QR login might not provide refresh token
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      debugLogger.log('AuthService', `❌ QR Login Error`, {
        error: error.message || 'QR login failed',
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      // Clear the token if login failed
      localStorage.removeItem('accessToken');

      this.setState({
        ...this.state,
        isLoading: false,
        error: error.message || 'QR login failed',
      });
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<void> {
    this.setState({
      ...this.state,
      isLoading: true,
      error: null,
    });

    try {
      const response = await apiAuthService.register(userData);
      
      this.setState({
        ...this.state,
        isAuthenticated: true,
        user: response.userInfo,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message || error?.message || 'Đăng ký thất bại';
      this.setState({
        ...this.state,
        isLoading: false,
        error: apiMessage,
      });
      throw new Error(apiMessage);
    }
  }

  async logout(): Promise<void> {
    this.setState({
      ...this.state,
      isLoading: true,
    });

    try {
      await apiAuthService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  private clearAuth() {
    this.setState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    });
  }

  async updateProfile(profileData: any): Promise<User> {
    this.setState({
      ...this.state,
      isLoading: true,
      error: null,
    });

    try {
      const updatedUser = await userService.updateProfile(profileData);
      
      this.setState({
        ...this.state,
        user: updatedUser,
        isLoading: false,
        error: null,
      });

      return updatedUser;
    } catch (error: any) {
      this.setState({
        ...this.state,
        isLoading: false,
        error: error.message || 'Profile update failed',
      });
      throw error;
    }
  }

  clearError() {
    this.setState({
      ...this.state,
      error: null,
    });
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  getCurrentUser(): User | null {
    return this.state.user;
  }

  getAccessToken(): string | null {
    return this.state.accessToken;
  }
}

export const authService = new AuthService();
