package com.ainnect.repository;

import com.ainnect.entity.ApkVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApkVersionRepository extends JpaRepository<ApkVersion, Long> {
    
    Optional<ApkVersion> findByVersionName(String versionName);
    
    Optional<ApkVersion> findByVersionCode(Integer versionCode);
    
    @Query("SELECT a FROM ApkVersion a WHERE a.isActive = true ORDER BY a.versionCode DESC")
    Optional<ApkVersion> findActiveVersion();
    
    @Query("SELECT a FROM ApkVersion a ORDER BY a.versionCode DESC, a.releaseDate DESC")
    java.util.List<ApkVersion> findAllOrderByVersionCodeDesc();
    
    @Query("SELECT a FROM ApkVersion a WHERE a.versionCode > :currentVersionCode ORDER BY a.versionCode ASC")
    java.util.List<ApkVersion> findNewerVersions(@Param("currentVersionCode") Integer currentVersionCode);
}

