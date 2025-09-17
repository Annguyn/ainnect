package com.ainnect.entity;

import com.ainnect.common.enums.PostVisibility;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "posts")
public class Post {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", columnDefinition = "BIGINT")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "author_id", nullable = false)
	private User author;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "group_id")
	private Community group;

	@Column(name = "content", columnDefinition = "TEXT")
	private String content;

	@Enumerated(EnumType.STRING)
	@Column(name = "visibility", nullable = false)
	private PostVisibility visibility = PostVisibility.public_;

	@Column(name = "comment_count", nullable = false)
	private Integer commentCount = 0;

	@Column(name = "reaction_count", nullable = false)
	private Integer reactionCount = 0;

	@Column(name = "share_count", nullable = false)
	private Integer shareCount = 0;

	@Column(name = "created_at", nullable = false, updatable = false)
	@org.hibernate.annotations.CreationTimestamp
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	@org.hibernate.annotations.UpdateTimestamp
	private LocalDateTime updatedAt;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;
}

