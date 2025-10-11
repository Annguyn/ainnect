import { apiClient } from './apiClient';
import { debugLogger } from '../utils/debugLogger';

// Suggestion Types
export interface Suggestion {
  id: number;
  name: string;
  category?: string;
  description?: string | null;
  imageUrl?: string | null;
  usageCount?: number;
  type: 'school' | 'company' | 'interest' | 'location';
}

export interface SuggestionCategory {
  id: number;
  name: string;
  description?: string | null;
  type: 'school' | 'company' | 'interest' | 'location';
}

export interface SuggestionResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: Suggestion[];
}

export interface SuggestionCategoryResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: SuggestionCategory[];
}

// Request Types
export interface SuggestionSearchParams {
  type: 'school' | 'company' | 'interest' | 'location';
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

class SuggestionService {
  private baseUrl = '/api/profile/suggestions';

  // Get suggestions with filtering
  async getSuggestions(params: SuggestionSearchParams): Promise<Suggestion[]> {
    const endpoint = this.baseUrl;
    const queryParams = new URLSearchParams();
    
    queryParams.append('type', params.type);
    if (params.query) queryParams.append('query', params.query);
    if (params.category) queryParams.append('category', params.category);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const fullUrl = `${endpoint}?${queryParams.toString()}`;
    
    debugLogger.logApiCall('GET', fullUrl, params);
    try {
      const response = await apiClient.get<Suggestion[]>(fullUrl);
      debugLogger.logApiResponse('GET', fullUrl, response);
      
      debugLogger.log('SuggestionService', `💡 Get Suggestions API Success`, {
        endpoint: fullUrl,
        type: params.type,
        query: params.query,
        category: params.category,
        count: response.length,
        suggestions: response.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          usageCount: s.usageCount
        }))
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', fullUrl, null, error);
      debugLogger.log('SuggestionService', `❌ Get Suggestions API Error`, {
        endpoint: fullUrl,
        params,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Get suggestion categories
  async getSuggestionCategories(type: 'school' | 'company' | 'interest' | 'location'): Promise<SuggestionCategory[]> {
    const endpoint = `${this.baseUrl}/categories`;
    const queryParams = new URLSearchParams();
    queryParams.append('type', type);
    
    const fullUrl = `${endpoint}?${queryParams.toString()}`;
    
    debugLogger.logApiCall('GET', fullUrl, { type });
    try {
      const response = await apiClient.get<SuggestionCategory[]>(fullUrl);
      debugLogger.logApiResponse('GET', fullUrl, response);
      
      debugLogger.log('SuggestionService', `📂 Get Suggestion Categories API Success`, {
        endpoint: fullUrl,
        type,
        count: response.length,
        categories: response.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description
        }))
      });
      
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', fullUrl, null, error);
      debugLogger.log('SuggestionService', `❌ Get Suggestion Categories API Error`, {
        endpoint: fullUrl,
        type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Search schools
  async searchSchools(query: string, limit: number = 10): Promise<Suggestion[]> {
    return this.getSuggestions({
      type: 'school',
      query,
      limit
    });
  }

  // Search companies
  async searchCompanies(query: string, category?: string, limit: number = 10): Promise<Suggestion[]> {
    return this.getSuggestions({
      type: 'company',
      query,
      category,
      limit
    });
  }

  // Search interests
  async searchInterests(query: string, category?: string, limit: number = 10): Promise<Suggestion[]> {
    return this.getSuggestions({
      type: 'interest',
      query,
      category,
      limit
    });
  }

  // Search locations
  async searchLocations(query: string, limit: number = 10): Promise<Suggestion[]> {
    return this.getSuggestions({
      type: 'location',
      query,
      limit
    });
  }

  // Get popular suggestions (most used)
  async getPopularSuggestions(type: 'school' | 'company' | 'interest' | 'location', limit: number = 20): Promise<Suggestion[]> {
    return this.getSuggestions({
      type,
      limit
    });
  }

  // Get school categories
  async getSchoolCategories(): Promise<SuggestionCategory[]> {
    return this.getSuggestionCategories('school');
  }

  // Get company categories
  async getCompanyCategories(): Promise<SuggestionCategory[]> {
    return this.getSuggestionCategories('company');
  }

  // Get interest categories
  async getInterestCategories(): Promise<SuggestionCategory[]> {
    return this.getSuggestionCategories('interest');
  }

  // Get location categories
  async getLocationCategories(): Promise<SuggestionCategory[]> {
    return this.getSuggestionCategories('location');
  }
}

// Export service instance
export const suggestionService = new SuggestionService();

// Export convenience functions
export const getSuggestions = (params: SuggestionSearchParams) => suggestionService.getSuggestions(params);
export const getSuggestionCategories = (type: 'school' | 'company' | 'interest' | 'location') => suggestionService.getSuggestionCategories(type);
export const searchSchools = (query: string, limit?: number) => suggestionService.searchSchools(query, limit);
export const searchCompanies = (query: string, category?: string, limit?: number) => suggestionService.searchCompanies(query, category, limit);
export const searchInterests = (query: string, category?: string, limit?: number) => suggestionService.searchInterests(query, category, limit);
export const searchLocations = (query: string, limit?: number) => suggestionService.searchLocations(query, limit);
export const getPopularSuggestions = (type: 'school' | 'company' | 'interest' | 'location', limit?: number) => suggestionService.getPopularSuggestions(type, limit);
export const getSchoolCategories = () => suggestionService.getSchoolCategories();
export const getCompanyCategories = () => suggestionService.getCompanyCategories();
export const getInterestCategories = () => suggestionService.getInterestCategories();
export const getLocationCategories = () => suggestionService.getLocationCategories();
