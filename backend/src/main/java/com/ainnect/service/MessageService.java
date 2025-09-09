package com.ainnect.service;

import com.ainnect.entity.Message;

import java.util.List;

public interface MessageService {
	Message send(Long conversationId, Long senderId, String content, com.ainnect.common.enums.MessageType type);
	List<Message> listByConversation(Long conversationId);
}
