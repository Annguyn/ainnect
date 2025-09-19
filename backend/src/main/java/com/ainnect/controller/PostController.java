package com.ainnect.controller;

import com.ainnect.config.JwtUtil;
import com.ainnect.dto.post.PostDtos;
import com.ainnect.entity.Comment;
import com.ainnect.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
	private final PostService postService;
	private final JwtUtil jwtUtil;

	@PostMapping
	public ResponseEntity<PostDtos.Response> create(@Valid @RequestBody PostDtos.CreateRequest request,
			@RequestHeader("Authorization") String authHeader) {
		Long authorId = extractUserIdFromToken(authHeader);
		return new ResponseEntity<>(postService.create(request, authorId), HttpStatus.CREATED);
	}

	@PutMapping("/{postId}")
	public ResponseEntity<PostDtos.Response> update(@PathVariable("postId") Long postId,
			@Valid @RequestBody PostDtos.UpdateRequest request) {
		return ResponseEntity.ok(postService.update(postId, request));
	}

	@DeleteMapping("/{postId}")
	public ResponseEntity<Void> delete(@PathVariable("postId") Long postId) {
		postService.delete(postId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{postId}")
	public ResponseEntity<PostDtos.Response> get(@PathVariable("postId") Long postId) {
		return ResponseEntity.ok(postService.getById(postId));
	}

	@GetMapping("/feed")
	public ResponseEntity<Page<PostDtos.Response>> getFeed(Pageable pageable) {
		return ResponseEntity.ok(postService.getFeed(pageable));
	}

	@GetMapping
	public ResponseEntity<Page<PostDtos.Response>> listByAuthor(@RequestParam(value = "authorId", required = false) Long authorId, Pageable pageable) {
		if (authorId != null) {
			return ResponseEntity.ok(postService.listByAuthor(authorId, pageable));
		} else {
			return ResponseEntity.ok(postService.getFeed(pageable));
		}
	}

	@PostMapping("/{postId}/comments")
	public ResponseEntity<Long> addComment(@PathVariable("postId") Long postId,
			@Valid @RequestBody PostDtos.CommentCreateRequest request,
			@RequestHeader("Authorization") String authHeader) {
		Long authorId = extractUserIdFromToken(authHeader);
		return new ResponseEntity<>(postService.addComment(postId, request, authorId), HttpStatus.CREATED);
	}

	@GetMapping("/{postId}/comments")
	public ResponseEntity<Page<Comment>> listComments(@PathVariable("postId") Long postId, Pageable pageable) {
		return ResponseEntity.ok(postService.listComments(postId, pageable));
	}

	@PostMapping("/{postId}/reactions")
	public ResponseEntity<Void> react(@PathVariable("postId") Long postId, 
			@Valid @RequestBody PostDtos.ReactionRequest request,
			@RequestHeader("Authorization") String authHeader) {
		Long userId = extractUserIdFromToken(authHeader);
		postService.reactToPost(postId, request, userId);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{postId}/reactions")
	public ResponseEntity<Void> unreact(@PathVariable("postId") Long postId,
			@RequestHeader("Authorization") String authHeader) {
		Long userId = extractUserIdFromToken(authHeader);
		postService.unreactToPost(postId, userId);
		return ResponseEntity.noContent().build();
	}

	// Share
	@PostMapping("/{postId}/shares")
	public ResponseEntity<Long> share(@PathVariable("postId") Long postId, 
			@Valid @RequestBody PostDtos.ShareRequest request,
			@RequestHeader("Authorization") String authHeader) {
		Long userId = extractUserIdFromToken(authHeader);
		return new ResponseEntity<>(postService.sharePost(postId, request, userId), HttpStatus.CREATED);
	}

	private Long extractUserIdFromToken(String authHeader) {
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);
			return jwtUtil.extractUserId(token);
		}
		throw new RuntimeException("Token không hợp lệ");
	}
}


