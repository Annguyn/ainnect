// Enhanced User interface with additional professional features
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  position?: string;
  company?: string;
  location?: string;
  website?: string;
  phoneNumber?: string;
  interests?: string[];
  skills?: Skill[];
  socialLinks?: SocialLink[];
  achievements?: Achievement[];
  experience?: Experience[];
  education?: Education[];
  languages?: Language[];
  isVerified?: boolean;
  profileViews?: number;
  connectionCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// New skill interface with proficiency levels
export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'other';
  proficiency: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  endorsements?: number;
  verified?: boolean;
}

// Social media links
export interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'other';
  url: string;
  username?: string;
  isPublic: boolean;
}

// Achievement system
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'career' | 'skill' | 'community' | 'milestone';
}

// Professional experience
export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  location?: string;
  isCurrentPosition: boolean;
}

// Education background
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  description?: string;
}

// Language proficiency
export interface Language {
  language: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  position?: string;
  company?: string;
  location?: string;
  website?: string;
  phoneNumber?: string;
  interests?: string[];
  skills?: Skill[];
  socialLinks?: SocialLink[];
  coverImage?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Enhanced Authentication types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => string | null;
}
