package com.ainnect.repository;

import com.ainnect.entity.Interest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterestRepository extends JpaRepository<Interest, Long> {
    
    @Query("SELECT i FROM Interest i WHERE i.user.id = :userId AND i.deletedAt IS NULL ORDER BY i.createdAt DESC")
    List<Interest> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT i.name FROM Interest i WHERE i.deletedAt IS NULL AND LOWER(i.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY i.name")
    List<String> findDistinctNamesContainingIgnoreCase(@Param("query") String query);
    
    @Query("SELECT DISTINCT i.category FROM Interest i WHERE i.deletedAt IS NULL AND i.category IS NOT NULL ORDER BY i.category")
    List<String> findDistinctCategories();
    
    @Query("SELECT COUNT(i) FROM Interest i WHERE i.name = :name AND i.deletedAt IS NULL")
    Long countByName(@Param("name") String name);
}
