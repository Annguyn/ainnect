package com.ainnect.service;

import com.ainnect.dto.messaging.MessagingDtos;
import com.ainnect.dto.notification.NotificationResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendMessageToConversation(Long conversationId, MessagingDtos.WebSocketMessage message) {
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, message);
    }

    public void sendMessageToUser(String username, MessagingDtos.WebSocketMessage message) {
        messagingTemplate.convertAndSendToUser(username, "/queue/messages", message);
    }

    public void sendTypingIndicator(Long conversationId, MessagingDtos.TypingRequest typingRequest) {
        MessagingDtos.WebSocketMessage message = MessagingDtos.WebSocketMessage.builder()
                .type("TYPING")
                .data(typingRequest)
                .conversationId(conversationId)
                .senderId(typingRequest.getUserId())
                .timestamp(java.time.LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId + "/typing", message);
    }

    public void sendReadReceipt(Long conversationId, MessagingDtos.MarkAsReadRequest readRequest) {
        MessagingDtos.WebSocketMessage message = MessagingDtos.WebSocketMessage.builder()
                .type("MESSAGE_READ")
                .data(readRequest)
                .conversationId(conversationId)
                .senderId(readRequest.getUserId())
                .timestamp(java.time.LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId + "/read", message);
    }

    public void sendErrorToUser(String username, String errorMessage) {
        MessagingDtos.WebSocketMessage errorMessageObj = MessagingDtos.WebSocketMessage.builder()
                .type("ERROR")
                .data(errorMessage)
                .timestamp(java.time.LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSendToUser(username, "/queue/errors", errorMessageObj);
    }

    public void notifyConversationUpdate(Long conversationId, String updateType, Object data) {
        MessagingDtos.WebSocketMessage message = MessagingDtos.WebSocketMessage.builder()
                .type(updateType)
                .data(data)
                .conversationId(conversationId)
                .timestamp(java.time.LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId + "/updates", message);
    }

    public void sendNotificationToUser(String username, NotificationResponse notification) {
        MessagingDtos.WebSocketMessage ws = MessagingDtos.WebSocketMessage.builder()
                .type("NOTIFICATION_NEW")
                .data(notification)
                .timestamp(java.time.LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", ws);
    }

    public void sendNotificationUnreadCount(String username, Long unreadCount) {
        MessagingDtos.WebSocketMessage ws = MessagingDtos.WebSocketMessage.builder()
                .type("NOTIFICATION_UNREAD_COUNT")
                .data(java.util.Map.of("unreadCount", unreadCount))
                .timestamp(java.time.LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", ws);
    }
}
