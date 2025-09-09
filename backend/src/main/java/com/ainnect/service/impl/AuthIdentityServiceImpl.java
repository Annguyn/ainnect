package com.ainnect.service.impl;

import com.ainnect.common.enums.AuthProvider;
import com.ainnect.entity.AuthIdentity;
import com.ainnect.repository.AuthIdentityRepository;
import com.ainnect.service.AuthIdentityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthIdentityServiceImpl implements AuthIdentityService {
	private final AuthIdentityRepository authIdentityRepository;

	@Override
	public AuthIdentity create(AuthIdentity authIdentity) {
		return authIdentityRepository.save(authIdentity);
	}

	@Override
	public Optional<AuthIdentity> findByProviderAndUid(AuthProvider provider, String providerUid) {
		return authIdentityRepository.findByProviderAndProviderUid(provider, providerUid);
	}
}
