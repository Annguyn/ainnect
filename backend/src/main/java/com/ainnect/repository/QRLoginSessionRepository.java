package com.ainnect.repository;

import com.ainnect.common.enums.QRCodeStatus;
import com.ainnect.entity.QRLoginSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface QRLoginSessionRepository extends JpaRepository<QRLoginSession, Long> {
    
    Optional<QRLoginSession> findBySessionId(String sessionId);
    
    @Query("SELECT q FROM QRLoginSession q WHERE q.sessionId = :sessionId AND q.expiresAt > :now")
    Optional<QRLoginSession> findActiveSessionBySessionId(@Param("sessionId") String sessionId, @Param("now") LocalDateTime now);
    
    @Modifying
    @Query("UPDATE QRLoginSession q SET q.status = :status WHERE q.expiresAt < :now AND q.status = 'PENDING'")
    void expireOldSessions(@Param("status") QRCodeStatus status, @Param("now") LocalDateTime now);
}

