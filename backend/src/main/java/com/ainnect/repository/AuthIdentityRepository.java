package com.ainnect.repository;

import com.ainnect.common.enums.AuthProvider;
import com.ainnect.entity.AuthIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthIdentityRepository extends JpaRepository<AuthIdentity, Long> {
	Optional<AuthIdentity> findByProviderAndProviderUid(AuthProvider provider, String providerUid);
}
