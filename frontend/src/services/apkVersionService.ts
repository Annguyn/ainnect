import { apiClient } from './apiClient';

export interface ApkVersion {
  id: number;
  versionName: string;
  versionCode: number;
  apkUrl: string;
  description: string;
  fileSize: number;
  fileName: string;
  releaseDate: string;
  isActive: boolean;
  createdById: number;
  createdByUsername: string;
  createdAt: string;
  updatedAt?: string | null;
}

interface ApiResponse<T> {
  result: string;
  message: string;
  data: T;
}

export interface CreateApkVersionRequest {
  versionName: string;
  versionCode: number;
  apkUrl: string;
  description: string;
  fileSize: number;
  fileName: string;
  isActive?: boolean;
}

export interface UpdateApkVersionRequest {
  versionName?: string;
  apkUrl?: string;
  description?: string;
  isActive?: boolean;
}

export interface ApkVersionsResponse {
  content: ApkVersion[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

class ApkVersionService {
  private baseUrl = '/api/apk-versions';
  private adminBaseUrl = '/api/admin/apk-versions';

  // Public endpoints
  async getActiveVersion(): Promise<ApkVersion> {
    const response = await apiClient.get<ApiResponse<ApkVersion>>(`${this.baseUrl}/active`);
    return response.data;
  }

  // Admin endpoints
  async createVersion(data: CreateApkVersionRequest): Promise<ApkVersion> {
    const response = await apiClient.post<ApiResponse<ApkVersion>>(this.adminBaseUrl, data);
    return response.data;
  }

  async updateVersion(versionId: number, data: UpdateApkVersionRequest): Promise<ApkVersion> {
    const response = await apiClient.put<ApiResponse<ApkVersion>>(`${this.adminBaseUrl}/${versionId}`, data);
    return response.data;
  }

  async deleteVersion(versionId: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${this.adminBaseUrl}/${versionId}`);
  }

  async getVersionById(versionId: number): Promise<ApkVersion> {
    const response = await apiClient.get<ApiResponse<ApkVersion>>(`${this.adminBaseUrl}/${versionId}`);
    return response.data;
  }

  async getActiveVersionAdmin(): Promise<ApkVersion> {
    const response = await apiClient.get<ApiResponse<ApkVersion>>(`${this.adminBaseUrl}/active`);
    return response.data;
  }

  async getAllVersions(page = 0, size = 20): Promise<ApkVersionsResponse> {
    const response = await apiClient.get<ApiResponse<ApkVersionsResponse>>(this.adminBaseUrl, {
      params: { page, size }
    });
    return response.data;
  }

  async setActiveVersion(versionId: number): Promise<ApkVersion> {
    const response = await apiClient.put<ApiResponse<ApkVersion>>(`${this.adminBaseUrl}/${versionId}/activate`);
    return response.data;
  }
}

export const apkVersionService = new ApkVersionService();
