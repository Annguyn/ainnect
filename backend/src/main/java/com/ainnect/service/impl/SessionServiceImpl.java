package com.ainnect.service.impl;

import com.ainnect.entity.Session;
import com.ainnect.repository.SessionRepository;
import com.ainnect.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {
	private final SessionRepository sessionRepository;

	@Override
	public Session create(Session session) {
		return sessionRepository.save(session);
	}
}
