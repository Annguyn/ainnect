package com.ainnect.service;

import com.ainnect.common.enums.AuthProvider;
import com.ainnect.entity.AuthIdentity;

import java.util.Optional;

public interface AuthIdentityService {
	AuthIdentity create(AuthIdentity authIdentity);
	Optional<AuthIdentity> findByProviderAndUid(AuthProvider provider, String providerUid);
}
