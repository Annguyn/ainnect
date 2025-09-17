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
	
	// Lấy danh sách report theo status
	Page<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);
	
	// Lấy danh sách report của một user
	Page<Report> findByReporterOrderByCreatedAtDesc(User reporter, Pageable pageable);
	
	// Lấy danh sách report theo target
	List<Report> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, Long targetId);
	
	// Kiểm tra user đã report target này chưa
	boolean existsByReporterAndTargetTypeAndTargetId(User reporter, String targetType, Long targetId);
	
	// Lấy danh sách report theo reason
	Page<Report> findByReasonOrderByCreatedAtDesc(ReportReason reason, Pageable pageable);
	
	// Đếm số report cho một target
	long countByTargetTypeAndTargetId(String targetType, Long targetId);
	
	// Đếm số report theo status
	long countByStatus(ReportStatus status);
	
	// Lấy danh sách report trong khoảng thời gian
	@Query("SELECT r FROM Report r WHERE r.createdAt BETWEEN :startDate AND :endDate ORDER BY r.createdAt DESC")
	List<Report> findReportsBetweenDates(@Param("startDate") LocalDateTime startDate, 
	                                     @Param("endDate") LocalDateTime endDate);
	
	// Lấy danh sách report chưa xử lý quá lâu
	@Query("SELECT r FROM Report r WHERE r.status = 'PENDING' AND r.createdAt < :cutoffDate ORDER BY r.createdAt ASC")
	List<Report> findOldPendingReports(@Param("cutoffDate") LocalDateTime cutoffDate);
	
	// Thống kê report theo reason
	@Query("SELECT r.reason, COUNT(r) FROM Report r GROUP BY r.reason")
	List<Object[]> getReportStatsByReason();
}
