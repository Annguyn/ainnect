package com.ainnect.controller;

import com.ainnect.dto.messaging.MessageDtos;
import com.ainnect.entity.Message;
import com.ainnect.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
	private final MessageService messageService;

	@PostMapping
	public ResponseEntity<MessageDtos.MessageResponse> send(@Validated @RequestBody MessageDtos.SendRequest req) {
		Message m = messageService.send(req.getConversationId(), req.getSenderId(), req.getContent(), req.getMessageType());
		return ResponseEntity.ok(MessageDtos.MessageResponse.builder()
				.id(m.getId())
				.conversationId(m.getConversation().getId())
				.senderId(m.getSender().getId())
				.content(m.getContent())
				.messageType(m.getMessageType())
				.build());
	}

	@GetMapping
	public ResponseEntity<List<MessageDtos.MessageResponse>> list(@RequestParam Long conversationId) {
		List<MessageDtos.MessageResponse> res = messageService.listByConversation(conversationId).stream()
				.map(m -> MessageDtos.MessageResponse.builder()
						.id(m.getId())
						.conversationId(m.getConversation().getId())
						.senderId(m.getSender().getId())
						.content(m.getContent())
						.messageType(m.getMessageType())
						.build())
				.collect(Collectors.toList());
		return ResponseEntity.ok(res);
	}
}
