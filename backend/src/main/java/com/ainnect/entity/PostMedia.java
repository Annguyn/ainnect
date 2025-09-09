package com.ainnect.entity;

import com.ainnect.common.enums.MediaType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "post_media")
public class PostMedia {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "post_id", nullable = false)
	private Post post;

	@Column(name = "media_url", length = 500, nullable = false)
	private String mediaUrl;

	@Enumerated(EnumType.STRING)
	@Column(name = "media_type", nullable = false)
	private MediaType mediaType;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
