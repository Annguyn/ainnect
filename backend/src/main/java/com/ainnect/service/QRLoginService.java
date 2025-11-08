package com.ainnect.service;

import com.ainnect.dto.qrlogin.QRLoginDtos;

public interface QRLoginService {
    
    QRLoginDtos.QRCodeResponse generateQRCode();
    
    QRLoginDtos.QRSessionInfo getSessionInfo(String sessionId, Long userId);
    
    void confirmLogin(String sessionId, Long userId);
    
    QRLoginDtos.QRLoginStatusResponse checkLoginStatus(String sessionId);
    
    void expireOldSessions();
}

