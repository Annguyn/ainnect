import { apiClient } from './apiClient';
import { debugLogger } from '../utils/debugLogger';

export interface SchoolSuggestion {
  schoolName: string;
  count: number;
  imageUrl?: string | null;
}

export interface CompanySuggestion {
  companyName: string;
  count: number;
  imageUrl?: string | null;
}

export interface InterestSuggestion {
  name: string;
  count: number;
  imageUrl?: string | null;
}

export interface LocationSuggestion {
  locationName: string;
  count: number;
  imageUrl?: string | null;
}

export interface InterestCategorySuggestion {
  category: string;
}

interface SuggestionResponse<T> {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: {
    suggestions: T[];
    total: number;
  };
}

class SuggestionService {
  private baseUrl = '/api/suggestions';

  async getSchoolSuggestions(query: string, limit: number = 10): Promise<SchoolSuggestion[]> {
    const endpoint = `${this.baseUrl}/schools`;
    debugLogger.logApiCall('GET', endpoint, { query, limit });
    
    try {
      const response = await apiClient.get<SuggestionResponse<SchoolSuggestion>>(endpoint, {
        params: { q: query, limit }
      });
      
      debugLogger.logApiResponse('GET', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      return response.data.suggestions;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      console.error('Failed to get school suggestions:', error);
      return [];
    }
  }

  async getCompanySuggestions(query: string, limit: number = 10): Promise<CompanySuggestion[]> {
    const endpoint = `${this.baseUrl}/companies`;
    debugLogger.logApiCall('GET', endpoint, { query, limit });
    
    try {
      const response = await apiClient.get<SuggestionResponse<CompanySuggestion>>(endpoint, {
        params: { q: query, limit }
      });
      
      debugLogger.logApiResponse('GET', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      return response.data.suggestions;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      console.error('Failed to get company suggestions:', error);
      return [];
    }
  }

  async getInterestSuggestions(query: string, limit: number = 10): Promise<InterestSuggestion[]> {
    const endpoint = `${this.baseUrl}/interests`;
    debugLogger.logApiCall('GET', endpoint, { query, limit });
    
    try {
      const response = await apiClient.get<SuggestionResponse<InterestSuggestion>>(endpoint, {
        params: { q: query, limit }
      });
      
      debugLogger.logApiResponse('GET', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      return response.data.suggestions;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      console.error('Failed to get interest suggestions:', error);
      return [];
    }
  }

  async getLocationSuggestions(query: string, limit: number = 10): Promise<LocationSuggestion[]> {
    const endpoint = `${this.baseUrl}/locations`;
    debugLogger.logApiCall('GET', endpoint, { query, limit });
    
    try {
      const response = await apiClient.get<SuggestionResponse<LocationSuggestion>>(endpoint, {
        params: { q: query, limit }
      });
      
      debugLogger.logApiResponse('GET', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      return response.data.suggestions;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      console.error('Failed to get location suggestions:', error);
      return [];
    }
  }

  async getInterestCategories(): Promise<InterestCategorySuggestion[]> {
    const endpoint = `${this.baseUrl}/interest-categories`;
    debugLogger.logApiCall('GET', endpoint);
    
    try {
      const response = await apiClient.get<SuggestionResponse<InterestCategorySuggestion>>(endpoint);
      
      debugLogger.logApiResponse('GET', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      return response.data.suggestions;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      console.error('Failed to get interest categories:', error);
      return [];
    }
  }
}

export const suggestionService = new SuggestionService();

export const getSchoolSuggestions = (query: string, limit?: number) => 
  suggestionService.getSchoolSuggestions(query, limit);
export const getCompanySuggestions = (query: string, limit?: number) => 
  suggestionService.getCompanySuggestions(query, limit);
export const getInterestSuggestions = (query: string, limit?: number) => 
  suggestionService.getInterestSuggestions(query, limit);
export const getLocationSuggestions = (query: string, limit?: number) => 
  suggestionService.getLocationSuggestions(query, limit);
export const getInterestCategories = () => 
  suggestionService.getInterestCategories();
