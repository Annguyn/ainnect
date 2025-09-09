package com.ainnect.service.impl;

import com.ainnect.entity.UserDevice;
import com.ainnect.repository.UserDeviceRepository;
import com.ainnect.service.UserDeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDeviceServiceImpl implements UserDeviceService {
	private final UserDeviceRepository userDeviceRepository;

	@Override
	public UserDevice register(UserDevice device) {
		return userDeviceRepository.save(device);
	}
}
