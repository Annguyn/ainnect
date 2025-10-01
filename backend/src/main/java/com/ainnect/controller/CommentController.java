package com.ainnect.controller;

import com.ainnect.config.JwtUtil;
import com.ainnect.dto.comment.CommentDtos;
import com.ainnect.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
	private final CommentService commentService;
	private final JwtUtil jwtUtil;

	@GetMapping("/by-post/{postId}")
	public ResponseEntity<CommentDtos.PaginatedResponse> listByPost(@PathVariable("postId") Long postId, 
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "4") int size) {
		return ResponseEntity.ok(commentService.listByPostWithPagination(postId, page, size));
	}

	@GetMapping("/{commentId}/replies")
	public ResponseEntity<CommentDtos.PaginatedResponse> listReplies(@PathVariable("commentId") Long commentId,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "5") int size) {
		return ResponseEntity.ok(commentService.listRepliesWithPagination(commentId, page, size));
	}

	@PostMapping("/{commentId}/replies")
	public ResponseEntity<Long> replyToComment(@PathVariable("commentId") Long commentId,
			@Valid @RequestBody CommentDtos.ReplyRequest request,
			@RequestHeader("Authorization") String authHeader) {
		Long authorId = extractUserIdFromToken(authHeader);
		return new ResponseEntity<>(commentService.replyToComment(commentId, request, authorId), HttpStatus.CREATED);
	}

	@PostMapping("/{commentId}/reactions")
	public ResponseEntity<Void> react(@PathVariable("commentId") Long commentId,
			@Valid @RequestBody CommentDtos.ReactionRequest request,
			@RequestHeader("Authorization") String authHeader) {
		Long userId = extractUserIdFromToken(authHeader);
		commentService.reactToComment(commentId, request, userId);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{commentId}/reactions")
	public ResponseEntity<Void> unreact(@PathVariable("commentId") Long commentId,
			@RequestHeader("Authorization") String authHeader) {
		Long userId = extractUserIdFromToken(authHeader);
		commentService.unreactToComment(commentId, userId);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{commentId}")
	public ResponseEntity<Void> deleteComment(@PathVariable("commentId") Long commentId,
			@RequestHeader("Authorization") String authHeader) {
		Long userId = extractUserIdFromToken(authHeader);
		commentService.deleteComment(commentId, userId);
		return ResponseEntity.noContent().build();
	}

	private Long extractUserIdFromToken(String authHeader) {
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);
			return jwtUtil.extractUserId(token);
		}
		throw new RuntimeException("Token không hợp lệ");
	}
}


