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

	@Column(name = "file_url", length = 500, nullable = false)
	private String fileUrl;

	@Column(name = "file_name", length = 255)
	private String fileName;

	@Column(name = "file_size")
	private Long fileSize;

	@Column(name = "file_type", length = 100)
	private String fileType;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}

