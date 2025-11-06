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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.ainnect.common.enums.NotificationType;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Query("SELECT n FROM Notification n " +
           "LEFT JOIN FETCH n.recipient r " +
           "LEFT JOIN FETCH n.actor a " +
           "WHERE n.recipient = :recipient " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipientOrderByCreatedAtDesc(@Param("recipient") User recipient, Pageable pageable);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient = :recipient AND n.isRead = false")
    Long countUnreadByRecipient(@Param("recipient") User recipient);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient = :recipient")
    Long countByRecipient(@Param("recipient") User recipient);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient = :recipient AND DATE(n.createdAt) = CURRENT_DATE")
    Long countTodayByRecipient(@Param("recipient") User recipient);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipient = :recipient AND n.isRead = false")
    int markAllAsReadByRecipient(@Param("recipient") User recipient, @Param("readAt") LocalDateTime readAt);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id AND n.recipient = :recipient")
    int markAsReadByIdAndRecipient(@Param("id") Long id, @Param("recipient") User recipient, @Param("readAt") LocalDateTime readAt);
    
    @Query("SELECT n FROM Notification n " +
           "WHERE n.recipient = :recipient " +
           "AND n.actor = :actor " +
           "AND n.type = :type " +
           "AND n.targetType = :targetType " +
           "AND n.targetId = :targetId " +
           "AND n.isRead = false")
    Optional<Notification> findDuplicateNotification(
        @Param("recipient") User recipient,
        @Param("actor") User actor,
        @Param("type") NotificationType type,
        @Param("targetType") String targetType,
        @Param("targetId") Long targetId
    );
    
    @Query("SELECT n FROM Notification n " +
           "WHERE n.recipient = :recipient " +
           "AND n.type = :type " +
           "AND n.targetType = :targetType " +
           "AND n.targetId = :targetId")
    List<Notification> findByRecipientAndTypeAndTarget(
        @Param("recipient") User recipient,
        @Param("type") NotificationType type,
        @Param("targetType") String targetType,
        @Param("targetId") Long targetId
    );
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient = :recipient AND n.createdAt < :cutoffDate")
    int deleteOldNotifications(@Param("recipient") User recipient, @Param("cutoffDate") LocalDateTime cutoffDate);
}