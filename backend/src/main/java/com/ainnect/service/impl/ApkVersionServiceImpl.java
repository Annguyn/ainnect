package com.ainnect.service.impl;

import com.ainnect.dto.apkversion.ApkVersionDtos;
import com.ainnect.entity.ApkVersion;
import com.ainnect.entity.User;
import com.ainnect.repository.ApkVersionRepository;
import com.ainnect.repository.UserRepository;
import com.ainnect.service.ApkVersionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class ApkVersionServiceImpl implements ApkVersionService {
    
    @Autowired
    private ApkVersionRepository apkVersionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    @Transactional
    public ApkVersionDtos.Response createVersion(ApkVersionDtos.CreateRequest request, Long adminId) {
        if (apkVersionRepository.findByVersionName(request.getVersionName()).isPresent()) {
            throw new IllegalArgumentException("Version name already exists: " + request.getVersionName());
        }
        
        if (apkVersionRepository.findByVersionCode(request.getVersionCode()).isPresent()) {
            throw new IllegalArgumentException("Version code already exists: " + request.getVersionCode());
        }
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        
        ApkVersion version = ApkVersion.builder()
                .versionName(request.getVersionName())
                .versionCode(request.getVersionCode())
                .apkUrl(request.getApkUrl())
                .description(request.getDescription())
                .fileSize(request.getFileSize())
                .fileName(request.getFileName())
                .isActive(request.getIsActive() != null ? request.getIsActive() : false)
                .createdBy(admin)
                .build();
        
        if (version.getIsActive()) {
            apkVersionRepository.findAll().forEach(v -> {
                if (v.getIsActive()) {
                    v.setIsActive(false);
                    apkVersionRepository.save(v);
                }
            });
        }
        
        ApkVersion saved = apkVersionRepository.save(version);
        log.info("APK version created: {} by admin: {}", saved.getVersionName(), admin.getUsername());
        
        return toResponse(saved);
    }
    
    @Override
    @Transactional
    public ApkVersionDtos.Response updateVersion(Long versionId, ApkVersionDtos.UpdateRequest request, Long adminId) {
        ApkVersion version = apkVersionRepository.findById(versionId)
                .orElseThrow(() -> new IllegalArgumentException("APK version not found"));
        
        if (request.getVersionName() != null && !request.getVersionName().equals(version.getVersionName())) {
            if (apkVersionRepository.findByVersionName(request.getVersionName()).isPresent()) {
                throw new IllegalArgumentException("Version name already exists: " + request.getVersionName());
            }
            version.setVersionName(request.getVersionName());
        }
        
        if (request.getApkUrl() != null) {
            version.setApkUrl(request.getApkUrl());
        }
        
        if (request.getDescription() != null) {
            version.setDescription(request.getDescription());
        }
        
        if (request.getIsActive() != null) {
            if (request.getIsActive() && !version.getIsActive()) {
                apkVersionRepository.findAll().forEach(v -> {
                    if (v.getIsActive()) {
                        v.setIsActive(false);
                        apkVersionRepository.save(v);
                    }
                });
            }
            version.setIsActive(request.getIsActive());
        }
        
        ApkVersion updated = apkVersionRepository.save(version);
        log.info("APK version updated: {} by admin: {}", updated.getVersionName(), adminId);
        
        return toResponse(updated);
    }
    
    @Override
    @Transactional
    public void deleteVersion(Long versionId, Long adminId) {
        ApkVersion version = apkVersionRepository.findById(versionId)
                .orElseThrow(() -> new IllegalArgumentException("APK version not found"));
        
        if (version.getIsActive()) {
            throw new IllegalArgumentException("Cannot delete active version. Please set another version as active first.");
        }
        
        apkVersionRepository.delete(version);
        log.info("APK version deleted: {} by admin: {}", version.getVersionName(), adminId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ApkVersionDtos.Response getVersionById(Long versionId) {
        ApkVersion version = apkVersionRepository.findById(versionId)
                .orElseThrow(() -> new IllegalArgumentException("APK version not found"));
        
        return toResponse(version);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ApkVersionDtos.Response getActiveVersion() {
        ApkVersion version = apkVersionRepository.findActiveVersion()
                .orElseThrow(() -> new IllegalArgumentException("No active APK version found"));
        
        return toResponse(version);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ApkVersionDtos.Response> getAllVersions(Pageable pageable) {
        return apkVersionRepository.findAll(pageable)
                .map(this::toResponse);
    }
    
    @Override
    @Transactional
    public void setActiveVersion(Long versionId, Long adminId) {
        ApkVersion version = apkVersionRepository.findById(versionId)
                .orElseThrow(() -> new IllegalArgumentException("APK version not found"));
        
        apkVersionRepository.findAll().forEach(v -> {
            if (v.getIsActive()) {
                v.setIsActive(false);
                apkVersionRepository.save(v);
            }
        });
        
        version.setIsActive(true);
        apkVersionRepository.save(version);
        log.info("APK version set as active: {} by admin: {}", version.getVersionName(), adminId);
    }
    
    private ApkVersionDtos.Response toResponse(ApkVersion version) {
        return ApkVersionDtos.Response.builder()
                .id(version.getId())
                .versionName(version.getVersionName())
                .versionCode(version.getVersionCode())
                .apkUrl(version.getApkUrl())
                .description(version.getDescription())
                .fileSize(version.getFileSize())
                .fileName(version.getFileName())
                .releaseDate(version.getReleaseDate())
                .isActive(version.getIsActive())
                .createdById(version.getCreatedBy() != null ? version.getCreatedBy().getId() : null)
                .createdByUsername(version.getCreatedBy() != null ? version.getCreatedBy().getUsername() : null)
                .createdAt(version.getCreatedAt())
                .updatedAt(version.getUpdatedAt())
                .build();
    }
}

