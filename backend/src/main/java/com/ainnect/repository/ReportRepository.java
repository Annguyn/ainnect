package com.ainnect.repository;

import com.ainnect.entity.Report;
import com.ainnect.entity.User;
import com.ainnect.common.enums.ReportStatus;
import com.ainnect.common.enums.ReportReason;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
	
	Page<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);
	
	Page<Report> findByReporterOrderByCreatedAtDesc(User reporter, Pageable pageable);
	
	List<Report> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, Long targetId);
	
	boolean existsByReporterAndTargetTypeAndTargetId(User reporter, String targetType, Long targetId);
	
	Page<Report> findByReasonOrderByCreatedAtDesc(ReportReason reason, Pageable pageable);
	
	long countByTargetTypeAndTargetId(String targetType, Long targetId);
	
	long countByStatus(ReportStatus status);
	
	@Query("SELECT r FROM Report r WHERE r.createdAt BETWEEN :startDate AND :endDate ORDER BY r.createdAt DESC")
	List<Report> findReportsBetweenDates(@Param("startDate") LocalDateTime startDate, 
	                                     @Param("endDate") LocalDateTime endDate);
	
	@Query("SELECT r FROM Report r WHERE r.status = 'PENDING' AND r.createdAt < :cutoffDate ORDER BY r.createdAt ASC")
	List<Report> findOldPendingReports(@Param("cutoffDate") LocalDateTime cutoffDate);
	
	@Query("SELECT r.reason, COUNT(r) FROM Report r GROUP BY r.reason")
	List<Object[]> getReportStatsByReason();
	
	List<Report> findByReporterIdOrderByCreatedAtDesc(Long reporterId);
	
	List<Report> findAllByOrderByCreatedAtDesc();
}
