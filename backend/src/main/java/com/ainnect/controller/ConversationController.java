package com.ainnect.controller;

import com.ainnect.common.enums.ConversationMemberRole;
import com.ainnect.dto.messaging.ConversationDtos;
import com.ainnect.entity.Conversation;
import com.ainnect.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {
	private final ConversationService conversationService;

	@PostMapping
	public ResponseEntity<ConversationDtos.ConversationResponse> create(@Validated @RequestBody ConversationDtos.CreateRequest req) {
		Conversation c = conversationService.create(req.getCreatedBy(), req.getTitle(), req.getType(), req.getMemberIds());
		return ResponseEntity.ok(ConversationDtos.ConversationResponse.builder()
				.id(c.getId())
				.type(c.getType())
				.title(c.getTitle())
				.build());
	}

	@PostMapping("/{id}/members")
	public ResponseEntity<Void> addMember(@PathVariable Long id, @Validated @RequestBody ConversationDtos.AddMemberRequest req) {
		conversationService.addMember(id, req.getUserId(), req.getRole() == null ? ConversationMemberRole.member : req.getRole());
		return ResponseEntity.noContent().build();
	}
}
