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
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/messaging")
@RequiredArgsConstructor
public class MessagingController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final com.ainnect.service.FileStorageService fileStorageService;

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

    @PostMapping("/conversations/{conversationId}/messages/upload")
    public ResponseEntity<ApiResponse<MessagingDtos.MessageResponse>> uploadAndSendMessage(
            @PathVariable("conversationId") Long conversationId,
            @RequestPart("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            String url = fileStorageService.storeFile(file, "general");

            String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
            com.ainnect.common.enums.MessageType msgType = com.ainnect.common.enums.MessageType.text;
            if (contentType.startsWith("image/")) msgType = com.ainnect.common.enums.MessageType.image;
            else if (contentType.startsWith("video/")) msgType = com.ainnect.common.enums.MessageType.video;
            else msgType = com.ainnect.common.enums.MessageType.file;

            MessagingDtos.SendMessageRequest req = MessagingDtos.SendMessageRequest.builder()
                    .conversationId(conversationId)
                    .content(file.getOriginalFilename())
                    .messageType(msgType)
                    .attachmentUrls(java.util.List.of(url))
                    .build();

            MessagingDtos.MessageResponse created = messageService.sendMessage(req, userId);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "File message sent", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("ERROR", e.getMessage(), null));
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

    @PostMapping("/messages/{messageId}/reactions")
    public ResponseEntity<ApiResponse<Void>> reactMessage(
            @PathVariable("messageId") Long messageId,
            @RequestParam("type") String type,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            messageService.reactToMessage(messageId, type, userId);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Reaction updated", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("ERROR", e.getMessage(), null));
        }
    }

    @DeleteMapping("/messages/{messageId}/reactions")
    public ResponseEntity<ApiResponse<Void>> removeReaction(
            @PathVariable("messageId") Long messageId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            messageService.removeReactionFromMessage(messageId, userId);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Reaction removed", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("ERROR", e.getMessage(), null));
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
                           Principal principal,
                           Message<?> message) {
        try {
            Authentication auth = resolveAuthentication(principal, message);
            if (auth == null) {
                sendErrorToSession(message, conversationId, "Invalid principal");
                return;
            }
            Long senderId = getUserIdFromAuthentication(auth);
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
            messagingTemplate.convertAndSendToUser(auth.getName(), "/queue/messages", wsMessage);
            
        } catch (Exception e) {
            sendErrorToSession(message, conversationId, e.getMessage());
        }
    }

    @MessageMapping("/conversations/{conversationId}/typing")
    public void handleTyping(@DestinationVariable Long conversationId,
                           @Payload MessagingDtos.TypingRequest request,
                           Principal principal,
                           Message<?> message) {
        try {
            Authentication auth = resolveAuthentication(principal, message);
            if (auth == null) {
                sendErrorToSession(message, conversationId, "Invalid principal");
                return;
            }
            Long userId = getUserIdFromAuthentication(auth);
            
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
                                 Principal principal,
                                 Message<?> message) {
        try {
            Authentication auth = resolveAuthentication(principal, message);
            if (auth == null) {
                sendErrorToSession(message, conversationId, "Invalid principal");
                return;
            }
            Long userId = getUserIdFromAuthentication(auth);
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

    private Authentication resolveAuthentication(Principal principal, Message<?> message) {
        if (principal instanceof Authentication) {
            return (Authentication) principal;
        }
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (accessor.getUser() instanceof Authentication) {
            return (Authentication) accessor.getUser();
        }
        if (accessor.getSessionAttributes() != null) {
            Object principalName = accessor.getSessionAttributes().get("principalName");
            if (principalName instanceof String pn && !pn.isBlank()) {
                try {
                    User user = userService.findByUsername(pn)
                            .orElseThrow(() -> new RuntimeException("User not found: " + pn));
                    org.springframework.security.core.userdetails.User ud = new org.springframework.security.core.userdetails.User(
                            user.getUsername(), "", java.util.Collections.emptyList());
                    return new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            ud, null, ud.getAuthorities());
                } catch (Exception ignored) { }
            }
        }
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);
                if (username != null && jwtUtil.validateToken(token, username)) {
                    User user = userService.findByUsername(username)
                            .orElseThrow(() -> new RuntimeException("User not found: " + username));
                    org.springframework.security.core.userdetails.User ud = new org.springframework.security.core.userdetails.User(
                            user.getUsername(), "", java.util.Collections.emptyList());
                    return new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            ud, null, ud.getAuthorities());
                }
            } catch (Exception ignored) { }
        }
        return null;
    }

    private Long getUserIdFromAuthentication(Authentication auth) {
        String username = auth.getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getId();
    }

    private void sendErrorToSession(Message<?> message, Long conversationId, String detail) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        MessagingDtos.WebSocketMessage errorMessage = MessagingDtos.WebSocketMessage.builder()
                .type("ERROR")
                .data("Failed to send message: " + detail)
                .conversationId(conversationId)
                .timestamp(java.time.LocalDateTime.now())
                .build();
        if (accessor.getUser() != null) {
            messagingTemplate.convertAndSendToUser(accessor.getUser().getName(), "/queue/errors", errorMessage);
        } else {
            messagingTemplate.convertAndSend("/queue/errors-user" + accessor.getSessionId(), errorMessage);
        }
    }
}
