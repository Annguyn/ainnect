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
		private String bio;

		private Gender gender;

		private LocalDate birthday;

		@Size(max = 255)
		private String location;
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
		private String bio;
		private Gender gender;
		private LocalDate birthday;
		private String location;
		private Boolean isActive;
	}
}
