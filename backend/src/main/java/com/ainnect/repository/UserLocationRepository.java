package com.ainnect.repository;

import com.ainnect.entity.UserLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserLocationRepository extends JpaRepository<UserLocation, Long> {
    
    @Query("SELECT l FROM UserLocation l WHERE l.user.id = :userId AND l.deletedAt IS NULL ORDER BY l.isCurrent DESC, l.createdAt DESC")
    List<UserLocation> findByUserIdAndDeletedAtIsNullOrderByIsCurrentDescCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT l.locationName FROM UserLocation l WHERE l.deletedAt IS NULL AND LOWER(l.locationName) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY l.locationName")
    List<String> findDistinctLocationNamesContainingIgnoreCase(@Param("query") String query);
    
    @Query("SELECT COUNT(l) FROM UserLocation l WHERE l.locationName = :locationName AND l.deletedAt IS NULL")
    Long countByLocationName(@Param("locationName") String locationName);
    
    @Query("SELECT l FROM UserLocation l WHERE l.locationName = :locationName AND l.deletedAt IS NULL AND l.imageUrl IS NOT NULL ORDER BY l.createdAt DESC")
    List<UserLocation> findByLocationNameWithImage(@Param("locationName") String locationName);
}
