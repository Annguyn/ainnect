package com.ainnect.controller;

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

	@PostMapping
	public ResponseEntity<PostDtos.Response> create(@Valid @RequestBody PostDtos.CreateRequest request) {
		return new ResponseEntity<>(postService.create(request), HttpStatus.CREATED);
	}

	@PutMapping("/{postId}")
	public ResponseEntity<PostDtos.Response> update(@PathVariable Long postId,
			@Valid @RequestBody PostDtos.UpdateRequest request) {
		return ResponseEntity.ok(postService.update(postId, request));
	}

	@DeleteMapping("/{postId}")
	public ResponseEntity<Void> delete(@PathVariable Long postId) {
		postService.delete(postId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{postId}")
	public ResponseEntity<PostDtos.Response> get(@PathVariable Long postId) {
		return ResponseEntity.ok(postService.getById(postId));
	}

	@GetMapping
	public ResponseEntity<Page<PostDtos.Response>> listByAuthor(@RequestParam Long authorId, Pageable pageable) {
		return ResponseEntity.ok(postService.listByAuthor(authorId, pageable));
	}

	// Comments
	@PostMapping("/{postId}/comments")
	public ResponseEntity<Long> addComment(@PathVariable Long postId,
			@Valid @RequestBody PostDtos.CommentCreateRequest request) {
		return new ResponseEntity<>(postService.addComment(postId, request), HttpStatus.CREATED);
	}

	@GetMapping("/{postId}/comments")
	public ResponseEntity<Page<Comment>> listComments(@PathVariable Long postId, Pageable pageable) {
		return ResponseEntity.ok(postService.listComments(postId, pageable));
	}

	// Reactions
	@PostMapping("/{postId}/reactions")
	public ResponseEntity<Void> react(@PathVariable Long postId, @Valid @RequestBody PostDtos.ReactionRequest request) {
		postService.reactToPost(postId, request);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{postId}/reactions")
	public ResponseEntity<Void> unreact(@PathVariable Long postId, @RequestParam Long userId) {
		postService.unreactToPost(postId, userId);
		return ResponseEntity.noContent().build();
	}

	// Share
	@PostMapping("/{postId}/shares")
	public ResponseEntity<Long> share(@PathVariable Long postId, @Valid @RequestBody PostDtos.ShareRequest request) {
		return new ResponseEntity<>(postService.sharePost(postId, request), HttpStatus.CREATED);
	}
}


