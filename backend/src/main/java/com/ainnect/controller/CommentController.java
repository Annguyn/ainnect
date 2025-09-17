package com.ainnect.controller;

import com.ainnect.dto.comment.CommentDtos;
import com.ainnect.entity.Comment;
import com.ainnect.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
	private final CommentService commentService;

	@GetMapping("/by-post/{postId}")
	public ResponseEntity<Page<Comment>> listByPost(@PathVariable Long postId, Pageable pageable) {
		return ResponseEntity.ok(commentService.listByPost(postId, pageable));
	}

	@GetMapping("/{commentId}/replies")
	public ResponseEntity<Page<Comment>> listReplies(@PathVariable Long commentId, Pageable pageable) {
		return ResponseEntity.ok(commentService.listReplies(commentId, pageable));
	}

	@PostMapping("/{commentId}/replies")
	public ResponseEntity<Long> replyToComment(@PathVariable Long commentId,
			@Valid @RequestBody CommentDtos.ReplyRequest request) {
		return new ResponseEntity<>(commentService.replyToComment(commentId, request), HttpStatus.CREATED);
	}

	@PostMapping("/{commentId}/reactions")
	public ResponseEntity<Void> react(@PathVariable Long commentId,
			@Valid @RequestBody CommentDtos.ReactionRequest request) {
		commentService.reactToComment(commentId, request);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{commentId}/reactions")
	public ResponseEntity<Void> unreact(@PathVariable Long commentId, @RequestParam Long userId) {
		commentService.unreactToComment(commentId, userId);
		return ResponseEntity.noContent().build();
	}
}


