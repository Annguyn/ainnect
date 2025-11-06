package com.ainnect.entity;

import com.ainnect.common.enums.Privacy;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "communities")
public class Community {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id", nullable = false)
	private User owner;

	@Column(name = "name", length = 120, nullable = false)
	private String name;

	@Column(name = "description", length = 500)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "privacy", nullable = false)
	@Builder.Default
	private Privacy privacy = Privacy.public_;

	@Column(name = "avatar_url", length = 500)
	private String avatarUrl;

	@Column(name = "cover_url", length = 500)
	private String coverUrl;

	@Column(name = "requires_approval", nullable = false)
	@Builder.Default
	private Boolean requiresApproval = false;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;
}

