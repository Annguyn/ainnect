package com.ainnect.repository;

import com.ainnect.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
    
    @Query("SELECT e FROM Education e WHERE e.user.id = :userId AND e.deletedAt IS NULL ORDER BY e.startDate DESC")
    List<Education> findByUserIdAndDeletedAtIsNullOrderByStartDateDesc(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT e.schoolName FROM Education e WHERE e.deletedAt IS NULL AND LOWER(e.schoolName) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY e.schoolName")
    List<String> findDistinctSchoolNamesContainingIgnoreCase(@Param("query") String query);
    
    @Query("SELECT COUNT(e) FROM Education e WHERE e.schoolName = :schoolName AND e.deletedAt IS NULL")
    Long countBySchoolName(@Param("schoolName") String schoolName);
    
    @Query("SELECT e FROM Education e WHERE e.schoolName = :schoolName AND e.deletedAt IS NULL AND e.imageUrl IS NOT NULL ORDER BY e.createdAt DESC")
    List<Education> findBySchoolNameWithImage(@Param("schoolName") String schoolName);
}
