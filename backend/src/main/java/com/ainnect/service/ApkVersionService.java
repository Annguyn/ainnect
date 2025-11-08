package com.ainnect.service;

import com.ainnect.dto.apkversion.ApkVersionDtos;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ApkVersionService {
    
    ApkVersionDtos.Response createVersion(ApkVersionDtos.CreateRequest request, Long adminId);
    
    ApkVersionDtos.Response updateVersion(Long versionId, ApkVersionDtos.UpdateRequest request, Long adminId);
    
    void deleteVersion(Long versionId, Long adminId);
    
    ApkVersionDtos.Response getVersionById(Long versionId);
    
    ApkVersionDtos.Response getActiveVersion();
    
    Page<ApkVersionDtos.Response> getAllVersions(Pageable pageable);
    
    void setActiveVersion(Long versionId, Long adminId);
}

