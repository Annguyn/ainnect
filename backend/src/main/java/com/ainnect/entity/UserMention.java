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
@Table(name = "user_mentions")
public class UserMention {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mentioner_id", nullable = false, columnDefinition = "BIGINT")
	private User mentioner;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mentioned_id", nullable = false, columnDefinition = "BIGINT")
	private User mentioned;

	@Column(name = "target_type", length = 50, nullable = false)
	private String targetType; // POST, COMMENT

	@Column(name = "target_id", nullable = false)
	private Long targetId;

	@Column(name = "created_at", nullable = false, updatable = false)
	@org.hibernate.annotations.CreationTimestamp
	private LocalDateTime createdAt;
}
