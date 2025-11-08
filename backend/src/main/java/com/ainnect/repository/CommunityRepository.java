package com.ainnect.repository;

import com.ainnect.entity.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    
    @EntityGraph(attributePaths = {"owner"})
    Optional<Community> findById(Long id);
    
    @EntityGraph(attributePaths = {"owner"})
    Page<Community> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    Page<Community> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    Page<Community> findByOwnerId(Long ownerId, Pageable pageable);
    
    @EntityGraph(attributePaths = {"owner"})
    @Query("SELECT c FROM Community c WHERE c.deletedAt IS NULL ORDER BY c.createdAt DESC")
    Page<Community> findAllActiveCommunities(Pageable pageable);
    
    @Query("SELECT COUNT(c) FROM Community c WHERE c.deletedAt IS NULL")
    Long countActiveCommunities();
    
    @Query("SELECT COUNT(c) FROM Community c WHERE c.createdAt >= :since AND c.deletedAt IS NULL")
    Long countNewCommunitiesSince(@Param("since") LocalDateTime since);
    
    @EntityGraph(attributePaths = {"owner"})
    @Query("SELECT c FROM Community c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "c.deletedAt IS NULL " +
           "ORDER BY c.createdAt DESC")
    Page<Community> searchCommunities(@Param("keyword") String keyword, Pageable pageable);
}
