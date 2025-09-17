package com.ainnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_blocks")
public class UserBlock {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "blocker_id", nullable = false, columnDefinition = "BIGINT")
	private User blocker;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "blocked_id", nullable = false, columnDefinition = "BIGINT")
	private User blocked;

	@Column(name = "reason", length = 255)
	private String reason;

	@Column(name = "created_at", nullable = false, updatable = false)
	@org.hibernate.annotations.CreationTimestamp
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	@org.hibernate.annotations.UpdateTimestamp
	private LocalDateTime updatedAt;
}
