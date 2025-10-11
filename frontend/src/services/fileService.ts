import { apiClient } from './apiClient';
import { debugLogger } from '../utils/debugLogger';

// File Upload Response Interface
export interface FileUploadResponse {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: string | null; // File URL
}

// File Upload Request Interface
export interface FileUploadRequest {
  file: File;
  category?: string; // Optional, default: "general"
}

class FileService {
  private baseUrl = '/api/files';

  // Upload general file
  async uploadFile(file: File, category: string = 'general'): Promise<FileUploadResponse> {
    const endpoint = `${this.baseUrl}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    debugLogger.logApiCall('POST', endpoint, { 
      fileName: file.name, 
      fileSize: file.size,
      fileType: file.type,
      category
    });
    
    try {
      const response = await apiClient.post<FileUploadResponse>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      debugLogger.logApiResponse('POST', endpoint, response);
      debugLogger.log('FileService', `📁 Upload File API Success`, {
        endpoint,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        category,
        fileUrl: response.data,
        result: response.result,
        message: response.message
      });
      return response;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      debugLogger.log('FileService', `❌ Upload File API Error`, {
        endpoint,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        category,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Get file URL (for viewing/downloading)
  getFileUrl(category: string, fileName: string): string {
    const endpoint = `${this.baseUrl}/${category}/${fileName}`;
    debugLogger.log('FileService', 'Generated file URL', { category, fileName, url: endpoint });
    return endpoint;
  }

  // View/Download file
  async getFile(category: string, fileName: string): Promise<Blob> {
    const endpoint = `${this.baseUrl}/${category}/${fileName}`;
    debugLogger.logApiCall('GET', endpoint, { category, fileName });
    
    try {
      const response = await apiClient.get(endpoint, {
        responseType: 'blob'
      }) as Blob;
      debugLogger.logApiResponse('GET', endpoint, { fileSize: response.size });
      debugLogger.log('FileService', `📥 Download File API Success`, {
        endpoint,
        category,
        fileName,
        fileSize: response.size,
        fileType: response.type
      });
      return response;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      debugLogger.log('FileService', `❌ Download File API Error`, {
        endpoint,
        category,
        fileName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Delete file
  async deleteFile(category: string, fileName: string): Promise<FileUploadResponse> {
    const endpoint = `${this.baseUrl}/${category}/${fileName}`;
    debugLogger.logApiCall('DELETE', endpoint, { category, fileName });
    
    try {
      const response = await apiClient.delete<FileUploadResponse>(endpoint);
      debugLogger.logApiResponse('DELETE', endpoint, response);
      debugLogger.log('FileService', `🗑️ Delete File API Success`, {
        endpoint,
        category,
        fileName,
        result: response.result,
        message: response.message
      });
      return response;
    } catch (error) {
      debugLogger.logApiResponse('DELETE', endpoint, null, error);
      debugLogger.log('FileService', `❌ Delete File API Error`, {
        endpoint,
        category,
        fileName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Upload avatar (convenience method)
  async uploadAvatar(file: File): Promise<FileUploadResponse> {
    return this.uploadFile(file, 'avatars');
  }

  // Upload post image (convenience method)
  async uploadPostImage(file: File): Promise<FileUploadResponse> {
    return this.uploadFile(file, 'posts');
  }

  // Upload general file (convenience method)
  async uploadGeneralFile(file: File): Promise<FileUploadResponse> {
    return this.uploadFile(file, 'general');
  }
}

// Export service instance
export const fileService = new FileService();

// Export convenience functions
export const uploadFile = (file: File, category?: string) => fileService.uploadFile(file, category);
export const getFileUrl = (category: string, fileName: string) => fileService.getFileUrl(category, fileName);
export const getFile = (category: string, fileName: string) => fileService.getFile(category, fileName);
export const deleteFile = (category: string, fileName: string) => fileService.deleteFile(category, fileName);
export const uploadAvatar = (file: File) => fileService.uploadAvatar(file);
export const uploadPostImage = (file: File) => fileService.uploadPostImage(file);
export const uploadGeneralFile = (file: File) => fileService.uploadGeneralFile(file);
