package com.ainnect.repository;

import com.ainnect.entity.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {
	List<MessageAttachment> findByMessage_Id(Long messageId);
	List<MessageAttachment> findByMessageId(Long messageId);
}

