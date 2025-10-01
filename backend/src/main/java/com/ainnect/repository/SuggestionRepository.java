package com.ainnect.repository;

import com.ainnect.common.enums.SuggestionType;
import com.ainnect.entity.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
    
    @Query("SELECT s FROM Suggestion s WHERE s.type = :type AND s.deletedAt IS NULL ORDER BY s.usageCount DESC, s.name ASC")
    List<Suggestion> findByTypeAndDeletedAtIsNullOrderByUsageCountDescNameAsc(@Param("type") SuggestionType type);
    
    @Query("SELECT s FROM Suggestion s WHERE s.type = :type AND s.deletedAt IS NULL AND LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY s.usageCount DESC, s.name ASC")
    List<Suggestion> findByTypeAndNameContainingIgnoreCaseAndDeletedAtIsNullOrderByUsageCountDescNameAsc(
            @Param("type") SuggestionType type, @Param("query") String query);
    
    @Query("SELECT s FROM Suggestion s WHERE s.type = :type AND s.category = :category AND s.deletedAt IS NULL ORDER BY s.usageCount DESC, s.name ASC")
    List<Suggestion> findByTypeAndCategoryAndDeletedAtIsNullOrderByUsageCountDescNameAsc(
            @Param("type") SuggestionType type, @Param("category") String category);
    
    @Query("SELECT s FROM Suggestion s WHERE s.type = :type AND s.category = :category AND s.deletedAt IS NULL AND LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY s.usageCount DESC, s.name ASC")
    List<Suggestion> findByTypeAndCategoryAndNameContainingIgnoreCaseAndDeletedAtIsNullOrderByUsageCountDescNameAsc(
            @Param("type") SuggestionType type, @Param("category") String category, @Param("query") String query);
    
    @Query("SELECT DISTINCT s.category FROM Suggestion s WHERE s.type = :type AND s.deletedAt IS NULL AND s.category IS NOT NULL ORDER BY s.category")
    List<String> findDistinctCategoriesByType(@Param("type") SuggestionType type);
    
    @Query("SELECT s FROM Suggestion s WHERE s.type = :type AND s.name = :name AND s.deletedAt IS NULL")
    Suggestion findByTypeAndNameAndDeletedAtIsNull(@Param("type") SuggestionType type, @Param("name") String name);
}
