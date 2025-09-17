package com.ainnect.repository;

import com.ainnect.entity.Notification;
import com.ainnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
	
	// Lấy thông báo theo người nhận
	Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);
	
	// Lấy thông báo chưa đọc
	List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);
	
	// Đếm thông báo chưa đọc
	long countByRecipientAndIsReadFalse(User recipient);
	
	// Đánh dấu tất cả thông báo là đã đọc
	@Modifying
	@Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.recipient = :recipient AND n.isRead = false")
	void markAllAsReadByRecipient(@Param("recipient") User recipient);
	
	// Xóa thông báo cũ (có thể dùng để cleanup)
	@Modifying
	@Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
	void deleteOldNotifications(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}
