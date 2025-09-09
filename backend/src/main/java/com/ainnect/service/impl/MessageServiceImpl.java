package com.ainnect.service.impl;

import com.ainnect.common.enums.MessageType;
import com.ainnect.entity.*;
import com.ainnect.repository.ConversationRepository;
import com.ainnect.repository.MessageRepository;
import com.ainnect.repository.UserRepository;
import com.ainnect.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {
	private final MessageRepository messageRepository;
	private final ConversationRepository conversationRepository;
	private final UserRepository userRepository;

	@Override
	public Message send(Long conversationId, Long senderId, String content, MessageType type) {
		Conversation conv = conversationRepository.findById(conversationId).orElseThrow();
		User sender = userRepository.findById(senderId).orElseThrow();
		Message msg = new Message();
		msg.setConversation(conv);
		msg.setSender(sender);
		msg.setContent(content);
		msg.setMessageType(type);
		msg.setCreatedAt(LocalDateTime.now());
		return messageRepository.save(msg);
	}

	@Override
	public List<Message> listByConversation(Long conversationId) {
		return messageRepository.findByConversation_Id(conversationId);
	}
}
