package com.ainnect.service.impl;

import com.ainnect.common.enums.QRCodeStatus;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.qrlogin.QRLoginDtos;
import com.ainnect.entity.QRLoginSession;
import com.ainnect.entity.User;
import com.ainnect.repository.QRLoginSessionRepository;
import com.ainnect.repository.UserRepository;
import com.ainnect.service.QRLoginService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@Slf4j
public class QRLoginServiceImpl implements QRLoginService {
    
    @Autowired
    private QRLoginSessionRepository qrLoginSessionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private static final int QR_CODE_SIZE = 300;
    private static final int QR_EXPIRY_MINUTES = 10;
    
    @Override
    @Transactional
    public QRLoginDtos.QRCodeResponse generateQRCode() {
        String sessionId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(QR_EXPIRY_MINUTES);
        
        QRLoginSession session = QRLoginSession.builder()
                .sessionId(sessionId)
                .status(QRCodeStatus.PENDING)
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();
        
        qrLoginSessionRepository.save(session);
        
        String qrCodeData = sessionId;
        String qrCodeImage = generateQRCodeImage(qrCodeData);
        
        int expiresInSeconds = (int) Duration.between(now, expiresAt).getSeconds();
        
        return QRLoginDtos.QRCodeResponse.builder()
                .sessionId(sessionId)
                .qrCodeData(qrCodeData)
                .qrCodeImage(qrCodeImage)
                .expiresAt(expiresAt)
                .expiresInSeconds(expiresInSeconds)
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public QRLoginDtos.QRSessionInfo getSessionInfo(String sessionId, Long userId) {
        QRLoginSession session = qrLoginSessionRepository.findActiveSessionBySessionId(sessionId, LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("QR code không tồn tại hoặc đã hết hạn"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        
        QRLoginDtos.UserInfo userInfo = QRLoginDtos.UserInfo.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .email(user.getEmail())
                .build();
        
        return QRLoginDtos.QRSessionInfo.builder()
                .sessionId(session.getSessionId())
                .status(session.getStatus())
                .user(userInfo)
                .expiresAt(session.getExpiresAt())
                .build();
    }
    
    @Override
    @Transactional
    public void confirmLogin(String sessionId, Long userId) {
        QRLoginSession session = qrLoginSessionRepository.findActiveSessionBySessionId(sessionId, LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("QR code không tồn tại hoặc đã hết hạn"));
        
        if (session.getStatus() != QRCodeStatus.PENDING && session.getStatus() != QRCodeStatus.SCANNED) {
            throw new IllegalArgumentException("QR code không thể xác nhận");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());
        
        session.setUser(user);
        session.setStatus(QRCodeStatus.CONFIRMED);
        session.setConfirmedAt(LocalDateTime.now());
        session.setToken(token);
        
        qrLoginSessionRepository.save(session);
        
        log.info("QR login confirmed for user: {} with sessionId: {}", user.getUsername(), sessionId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public QRLoginDtos.QRLoginStatusResponse checkLoginStatus(String sessionId) {
        QRLoginSession session = qrLoginSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session không tồn tại"));
        
        if (session.getExpiresAt().isBefore(LocalDateTime.now()) && session.getStatus() == QRCodeStatus.PENDING) {
            return QRLoginDtos.QRLoginStatusResponse.builder()
                    .status(QRCodeStatus.EXPIRED)
                    .token(null)
                    .user(null)
                    .build();
        }
        
        if (session.getStatus() == QRCodeStatus.CONFIRMED && session.getUser() != null) {
            User user = session.getUser();
            QRLoginDtos.UserInfo userInfo = QRLoginDtos.UserInfo.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getDisplayName())
                    .avatarUrl(user.getAvatarUrl())
                    .email(user.getEmail())
                    .build();
            
            return QRLoginDtos.QRLoginStatusResponse.builder()
                    .status(session.getStatus())
                    .token(session.getToken())
                    .user(userInfo)
                    .build();
        }
        
        return QRLoginDtos.QRLoginStatusResponse.builder()
                .status(session.getStatus())
                .token(null)
                .user(null)
                .build();
    }
    
    @Override
    @Transactional
    @Scheduled(fixedRate = 60000)
    public void expireOldSessions() {
        qrLoginSessionRepository.expireOldSessions(QRCodeStatus.EXPIRED, LocalDateTime.now());
    }
    
    private String generateQRCodeImage(String data) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, QR_CODE_SIZE, QR_CODE_SIZE);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            byte[] imageBytes = outputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
            
        } catch (WriterException | IOException e) {
            log.error("Error generating QR code: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo mã QR");
        }
    }
}

