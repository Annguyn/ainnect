package com.ainnect.controller;

import com.ainnect.common.ApiResponse;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.messaging.MessagingDtos;
import com.ainnect.entity.User;
import com.ainnect.service.MessageService;
import com.ainnect.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/messaging")
@RequiredArgsConstructor
public class MessagingController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @PostMapping("/conversations")
    public ResponseEntity<ApiResponse<MessagingDtos.ConversationResponse>> createConversation(
            @Valid @RequestBody MessagingDtos.CreateConversationRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            MessagingDtos.ConversationResponse response = messageService.createConversation(request, userId);
            ApiResponse<MessagingDtos.ConversationResponse> apiResponse = new ApiResponse<>(
                    "SUCCESS", "Conversation created successfully", response);
            return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
        } catch (Exception e) {
            ApiResponse<MessagingDtos.ConversationResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<MessagingDtos.ConversationListResponse>> getUserConversations(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            Pageable pageable = Pageable.ofSize(size).withPage(page);
            MessagingDtos.ConversationListResponse response = messageService.getUserConversations(userId, pageable);
            ApiResponse<MessagingDtos.ConversationListResponse> apiResponse = new ApiResponse<>(
                    "SUCCESS", "Conversations retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<MessagingDtos.ConversationListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ApiResponse<MessagingDtos.ConversationResponse>> getConversation(
            @PathVariable("conversationId") Long conversationId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            MessagingDtos.ConversationResponse response = messageService.getConversationById(conversationId, userId);
            ApiResponse<MessagingDtos.ConversationResponse> apiResponse = new ApiResponse<>(
                    "SUCCESS", "Conversation retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<MessagingDtos.ConversationResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ApiResponse<MessagingDtos.MessageListResponse>> getConversationMessages(
            @PathVariable("conversationId") Long conversationId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            Pageable pageable = Pageable.ofSize(size).withPage(page);
            MessagingDtos.MessageListResponse response = messageService.getConversationMessages(conversationId, userId, pageable);
            ApiResponse<MessagingDtos.MessageListResponse> apiResponse = new ApiResponse<>(
                    "SUCCESS", "Messages retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<MessagingDtos.MessageListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @PostMapping("/conversations/{conversationId}/members")
    public ResponseEntity<ApiResponse<Void>> addMembers(
            @PathVariable("conversationId") Long conversationId,
            @Valid @RequestBody MessagingDtos.AddMemberRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            request.setConversationId(conversationId);
            messageService.addMembers(request, userId);
            ApiResponse<Void> apiResponse = new ApiResponse<>("SUCCESS", "Members added successfully", null);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable("conversationId") Long conversationId,
            @Valid @RequestBody MessagingDtos.MarkAsReadRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            request.setConversationId(conversationId);
            request.setUserId(userId);
            messageService.markAsRead(request, userId);
            ApiResponse<Void> apiResponse = new ApiResponse<>("SUCCESS", "Message marked as read", null);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/conversations/{conversationId}/members")
    public ResponseEntity<ApiResponse<MessagingDtos.ConversationMemberListResponse>> getConversationMembers(
            @PathVariable("conversationId") Long conversationId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            Pageable pageable = Pageable.ofSize(size).withPage(page);
            MessagingDtos.ConversationMemberListResponse response = messageService.getConversationMembers(conversationId, userId, pageable);
            ApiResponse<MessagingDtos.ConversationMemberListResponse> apiResponse = new ApiResponse<>(
                    "SUCCESS", "Conversation members retrieved successfully", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse<MessagingDtos.ConversationMemberListResponse> apiResponse = new ApiResponse<>("ERROR", e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @MessageMapping("/conversations/{conversationId}/send")
    public void sendMessage(@DestinationVariable Long conversationId, 
                           @Payload MessagingDtos.SendMessageRequest request,
                           Principal principal) {
        try {
            Long senderId = getUserIdFromPrincipal(principal);
            request.setConversationId(conversationId);
            
            MessagingDtos.MessageResponse messageResponse = messageService.sendMessage(request, senderId);
            
            MessagingDtos.WebSocketMessage wsMessage = MessagingDtos.WebSocketMessage.builder()
                    .type("NEW_MESSAGE")
                    .data(messageResponse)
                    .conversationId(conversationId)
                    .senderId(senderId)
                    .timestamp(messageResponse.getCreatedAt())
                    .build();
            
            messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, wsMessage);
            
            messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/messages", wsMessage);
            
        } catch (Exception e) {
            MessagingDtos.WebSocketMessage errorMessage = MessagingDtos.WebSocketMessage.builder()
                    .type("ERROR")
                    .data("Failed to send message: " + e.getMessage())
                    .conversationId(conversationId)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
            messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/errors", errorMessage);
        }
    }

    @MessageMapping("/conversations/{conversationId}/typing")
    public void handleTyping(@DestinationVariable Long conversationId,
                           @Payload MessagingDtos.TypingRequest request,
                           Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            
            MessagingDtos.WebSocketMessage typingMessage = MessagingDtos.WebSocketMessage.builder()
                    .type("TYPING")
                    .data(request)
                    .conversationId(conversationId)
                    .senderId(userId)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
            
            messagingTemplate.convertAndSend("/topic/conversations/" + conversationId + "/typing", typingMessage);
            
        } catch (Exception e) {
        }
    }

    @MessageMapping("/conversations/{conversationId}/read")
    public void markMessageAsRead(@DestinationVariable Long conversationId,
                                 @Payload MessagingDtos.MarkAsReadRequest request,
                                 Principal principal) {
        try {
            Long userId = getUserIdFromPrincipal(principal);
            request.setConversationId(conversationId);
            request.setUserId(userId);
            
            messageService.markAsRead(request, userId);
            
        } catch (Exception e) {
        }
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Invalid token");
    }

    private Long getUserIdFromPrincipal(Principal principal) {
        if (principal instanceof Authentication) {
            Authentication auth = (Authentication) principal;
            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            return user.getId();
        }
        throw new RuntimeException("Invalid principal");
    }
}
