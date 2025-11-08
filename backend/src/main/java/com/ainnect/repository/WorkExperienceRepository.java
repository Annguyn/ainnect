package com.ainnect.repository;

import com.ainnect.entity.WorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {
    
    @Query("SELECT w FROM WorkExperience w WHERE w.user.id = :userId AND w.deletedAt IS NULL ORDER BY w.startDate DESC")
    List<WorkExperience> findByUserIdAndDeletedAtIsNullOrderByStartDateDesc(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT w.companyName FROM WorkExperience w WHERE w.deletedAt IS NULL AND LOWER(w.companyName) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY w.companyName")
    List<String> findDistinctCompanyNamesContainingIgnoreCase(@Param("query") String query);
    
    @Query("SELECT COUNT(w) FROM WorkExperience w WHERE w.companyName = :companyName AND w.deletedAt IS NULL")
    Long countByCompanyName(@Param("companyName") String companyName);
    
    @Query("SELECT w FROM WorkExperience w WHERE w.companyName = :companyName AND w.deletedAt IS NULL AND w.imageUrl IS NOT NULL ORDER BY w.createdAt DESC")
    List<WorkExperience> findByCompanyNameWithImage(@Param("companyName") String companyName);
}
