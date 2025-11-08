import { apiClient } from './apiClient';
import { debugLogger } from '../utils/debugLogger';

export type QRLoginStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

export interface QRSession {
  sessionId: string;
  qrCodeData: string;
  qrCodeImage: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface QRLoginStatusResponse {
  status: QRLoginStatus;
  token: string | null;
  user: {
    userId: number;
    username: string;
    fullName: string;
    avatarUrl: string;
    email: string;
  } | null;
}

class QRLoginService {
  private baseUrl = '/api/qr-login';

  async generateQRCode(): Promise<QRSession> {
    const endpoint = `${this.baseUrl}/generate`;
    debugLogger.logApiCall('POST', endpoint);
    
    try {
      const response = await apiClient.post<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: QRSession;
      }>(endpoint, {});
      
      debugLogger.logApiResponse('POST', endpoint, response);
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      debugLogger.log('QRLoginService', 'QR code generated successfully', {
        sessionId: response.data.sessionId,
        expiresInSeconds: response.data.expiresInSeconds
      });
      
      return response.data;
    } catch (error) {
      debugLogger.logApiResponse('POST', endpoint, null, error);
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  async checkStatus(sessionId: string): Promise<QRLoginStatusResponse> {
    const endpoint = `${this.baseUrl}/status/${sessionId}`;
    debugLogger.logApiCall('GET', endpoint);
    
    try {
      const response = await apiClient.get<{
        result: 'SUCCESS' | 'ERROR';
        message: string;
        data: QRLoginStatusResponse;
      }>(endpoint);
      
      // Only log non-pending status to reduce noise
      if (response.data.status !== 'PENDING') {
        debugLogger.logApiResponse('GET', endpoint, response);
        debugLogger.log('QRLoginService', `QR login status: ${response.data.status}`, {
          sessionId,
          status: response.data.status,
          hasToken: !!response.data.token,
          hasUser: !!response.data.user
        });
      }
      
      if (response.result === 'ERROR') {
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      debugLogger.logApiResponse('GET', endpoint, null, error);
      console.error('Failed to check QR login status:', error);
      throw error;
    }
  }
}

export const qrLoginService = new QRLoginService();

