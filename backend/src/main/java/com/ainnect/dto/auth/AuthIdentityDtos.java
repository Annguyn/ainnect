package com.ainnect.dto.auth;

import com.ainnect.common.enums.AuthProvider;
import jakarta.validation.constraints.*;
import lombok.*;

public class AuthIdentityDtos {
	
	@Getter
	@Setter
	public static class LoginRequest {
		@NotBlank(message = "Username hoặc email không được để trống")
		private String usernameOrEmail;

		@NotBlank(message = "Mật khẩu không được để trống")
		private String password;
	}

	@Getter
	@Setter
	public static class RegisterRequest {
		@NotBlank(message = "Username không được để trống")
		@Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
		private String username;

		@NotBlank(message = "Email không được để trống")
		@Email(message = "Email không hợp lệ")
		@Size(max = 255)
		private String email;

		@Size(max = 20, message = "Số điện thoại không được quá 20 ký tự")
		private String phone;

		@NotBlank(message = "Mật khẩu không được để trống")
		@Size(min = 8, max = 255, message = "Mật khẩu phải từ 8-255 ký tự")
		@Pattern(
			regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
			message = "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 chữ số"
		)
		private String password;

		@NotBlank(message = "Tên hiển thị không được để trống")
		@Size(max = 65, message = "Tên hiển thị không được quá 65 ký tự")
		private String displayName;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class AuthResponse {
		private String accessToken;
		private String refreshToken;
		private String tokenType;
		private Long expiresIn;
		private UserInfo userInfo;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class UserInfo {
		private Long id;
		private String username;
		private String email;
		private String displayName;
		private String avatarUrl;
		private Boolean isActive;
	}

	@Getter
	public static class CreateRequest {
		@NotNull
		private Long userId;

		@NotNull
		private AuthProvider provider;

		@NotBlank
		@Size(max = 255)
		private String providerUid;

		private String metaJson;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class Response {
		private Long id;
		private Long userId;
		private AuthProvider provider;
		private String providerUid;
		private String metaJson;
	}
}
