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
@Table(name = "message_attachments")
public class MessageAttachment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "message_id", nullable = false)
	private Message message;

	@Column(name = "url", length = 500, nullable = false)
	private String url;

	@Column(name = "file_name", length = 255)
	private String fileName;

	@Column(name = "file_size")
	private Long fileSize;

	@Column(name = "mime_type", length = 100)
	private String mimeType;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
