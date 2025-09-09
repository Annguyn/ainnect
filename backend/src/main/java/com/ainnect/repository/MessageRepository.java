package com.ainnect.repository;

import com.ainnect.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
	List<Message> findByConversation_Id(Long conversationId);
}
