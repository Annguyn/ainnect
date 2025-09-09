package com.ainnect.controller;

import com.ainnect.dto.device.UserDeviceDtos;
import com.ainnect.entity.User;
import com.ainnect.entity.UserDevice;
import com.ainnect.service.UserDeviceService;
import com.ainnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class UserDeviceController {
	private final UserDeviceService userDeviceService;
	private final UserService userService;

	@PostMapping
	public ResponseEntity<UserDeviceDtos.Response> register(@Validated @RequestBody UserDeviceDtos.RegisterRequest req) {
		User user = userService.findById(req.getUserId()).orElseThrow();
		UserDevice ud = UserDevice.builder()
				.user(user)
				.deviceId(req.getDeviceId())
				.deviceInfo(req.getDeviceInfo())
				.build();
		UserDevice saved = userDeviceService.register(ud);
		return ResponseEntity.ok(UserDeviceDtos.Response.builder()
				.id(saved.getId())
				.userId(saved.getUser().getId())
				.deviceId(saved.getDeviceId())
				.deviceInfo(saved.getDeviceInfo())
				.build());
	}
}
