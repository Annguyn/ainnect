package com.ainnect.entity;

import com.ainnect.common.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "recipient_id", nullable = false, columnDefinition = "BIGINT")
	private User recipient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "actor_id", columnDefinition = "BIGINT")
	private User actor;

	@Enumerated(EnumType.STRING)
	@Column(name = "type", nullable = false)
	private NotificationType type;

	@Column(name = "target_type", length = 50)
	private String targetType;

	@Column(name = "target_id")
	private Long targetId;

	@Column(name = "message", length = 500)
	private String message;

	@Column(name = "is_read", nullable = false)
	private Boolean isRead = false;

	@Column(name = "created_at", nullable = false, updatable = false)
	@org.hibernate.annotations.CreationTimestamp
	private LocalDateTime createdAt;

	@Column(name = "read_at")
	private LocalDateTime readAt;
}
