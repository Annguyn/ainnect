package com.ainnect.dto.user;

import com.ainnect.common.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

public class UserDtos {

	@Getter
	@Setter
	public static class CreateRequest {
		@NotBlank
		@Size(max = 50)
		private String username;

		@NotBlank
		@Email
		@Size(max = 255)
		private String email;

		@Size(max = 20)
		private String phone;

		@NotBlank
		@Size(min = 6, max = 255)
		private String password;

		@NotBlank
		@Size(max = 100)
		private String displayName;

		@Size(max = 500)
		private String avatarUrl;

		@Size(max = 500)
		private String coverUrl;

		@Size(max = 500)
		private String bio;

		private Gender gender;

		private LocalDate birthday;

		@Size(max = 255)
		private String location;
	}

	@Getter
	@Setter
	public static class UpdateRequest {
		@Size(max = 100, message = "Tên hiển thị không được quá 100 ký tự")
		private String displayName;

		@Size(max = 20, message = "Số điện thoại không được quá 20 ký tự")
		private String phone;

		@Size(max = 500, message = "URL avatar không được quá 500 ký tự")
		// NOTE: Khuyến nghị sử dụng POST /api/users/upload-avatar thay vì gửi URL
		private String avatarUrl;

		@Size(max = 500, message = "URL cover không được quá 500 ký tự")
		// NOTE: Khuyến nghị sử dụng POST /api/users/upload-cover thay vì gửi URL
		private String coverUrl;

		@Size(max = 500, message = "Bio không được quá 500 ký tự")
		private String bio;

		private Gender gender;
		private LocalDate birthday;

		@Size(max = 255, message = "Địa chỉ không được quá 255 ký tự")
		private String location;
	}

	@Getter
	@Setter
	public static class ChangePasswordRequest {
		@NotBlank(message = "Mật khẩu cũ không được để trống")
		private String oldPassword;

		@NotBlank(message = "Mật khẩu mới không được để trống")
		@Size(min = 6, max = 255, message = "Mật khẩu mới phải từ 6-255 ký tự")
		private String newPassword;

		@NotBlank(message = "Xác nhận mật khẩu không được để trống")
		private String confirmPassword;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	public static class Response {
		private Long id;
		private String username;
		private String email;
		private String phone;
		private String displayName;
		private String avatarUrl;
		private String coverUrl;
		private String bio;
		private Gender gender;
		private LocalDate birthday;
		private String location;
		private Boolean isActive;
	}
}
