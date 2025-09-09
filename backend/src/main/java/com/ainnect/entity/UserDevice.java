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
@Table(name = "user_devices")
public class UserDevice {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "device_id", length = 100, nullable = false)
	private String deviceId;

	@Column(name = "device_info", length = 255)
	private String deviceInfo;

	@Column(name = "last_ip", length = 45)
	private String lastIp;

	@Column(name = "last_login_at")
	private LocalDateTime lastLoginAt;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
