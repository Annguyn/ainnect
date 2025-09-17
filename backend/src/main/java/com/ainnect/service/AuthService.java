package com.ainnect.service;

import com.ainnect.dto.auth.AuthIdentityDtos;

public interface AuthService {
    

    AuthIdentityDtos.AuthResponse register(AuthIdentityDtos.RegisterRequest request);
    

    AuthIdentityDtos.AuthResponse login(AuthIdentityDtos.LoginRequest request);
    

    AuthIdentityDtos.AuthResponse refreshToken(String refreshToken);
    

    void logout(String token);
    

    boolean validateToken(String token);

    AuthIdentityDtos.UserInfo getUserInfoFromToken(String token);
}



