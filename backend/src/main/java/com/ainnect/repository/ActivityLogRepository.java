package com.ainnect.repository;

import com.ainnect.common.enums.ActivityAction;
import com.ainnect.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    @EntityGraph(attributePaths = {"user"})
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @EntityGraph(attributePaths = {"user"})
    Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @EntityGraph(attributePaths = {"user"})
    Page<ActivityLog> findByActionOrderByCreatedAtDesc(ActivityAction action, Pageable pageable);
    
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT al FROM ActivityLog al WHERE al.createdAt BETWEEN :startDate AND :endDate ORDER BY al.createdAt DESC")
    Page<ActivityLog> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate, 
                                      Pageable pageable);
    
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT al FROM ActivityLog al WHERE " +
           "(:userId IS NULL OR al.user.id = :userId) AND " +
           "(:action IS NULL OR al.action = :action) AND " +
           "(:entityType IS NULL OR al.entityType = :entityType) AND " +
           "al.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY al.createdAt DESC")
    Page<ActivityLog> findByFilters(@Param("userId") Long userId,
                                    @Param("action") ActivityAction action,
                                    @Param("entityType") String entityType,
                                    @Param("startDate") LocalDateTime startDate,
                                    @Param("endDate") LocalDateTime endDate,
                                    Pageable pageable);
    
    @Query("SELECT COUNT(al) FROM ActivityLog al WHERE al.createdAt >= :since")
    Long countSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT al.action, COUNT(al) FROM ActivityLog al " +
           "WHERE al.createdAt >= :since " +
           "GROUP BY al.action " +
           "ORDER BY COUNT(al) DESC")
    List<Object[]> getActionStatistics(@Param("since") LocalDateTime since);
}


