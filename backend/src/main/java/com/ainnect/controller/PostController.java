package com.ainnect.controller;

import com.ainnect.common.enums.PostVisibility;
import com.ainnect.config.JwtUtil;
import com.ainnect.dto.comment.CommentDtos;
import com.ainnect.dto.post.PostDtos;
import com.ainnect.dto.reaction.ReactionDtos;
import com.ainnect.service.PostService;
import com.ainnect.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
	private final PostService postService;
	private final JwtUtil jwtUtil;
	private final FileStorageService fileStorageService;

	@PostMapping(consumes = "multipart/form-data")
	public ResponseEntity<PostDtos.Response> create(
			@RequestParam("content") String content,
			@RequestParam(value = "groupId", required = false) Long groupId,
			@RequestParam(value = "visibility", defaultValue = "public_") String visibility,
			@RequestParam(value = "mediaFiles", required = false) MultipartFile[] mediaFiles,
			@RequestHeader("Authorization") String authHeader) {
		try {
			Long authorId = extractUserIdFromToken(authHeader);
			
			PostDtos.CreateRequest request = PostDtos.CreateRequest.builder()
				.content(content)
				.groupId(groupId)
				.visibility(PostVisibility.valueOf(visibility))
				.build();
			
			if (mediaFiles != null && mediaFiles.length > 0) {
				List<String> mediaUrls = java.util.Arrays.stream(mediaFiles)
					.parallel()
					.filter(f -> f != null && !f.isEmpty())
					.map(f -> fileStorageService.storeFile(f, "posts"))
					.toList();
				request.setMediaUrls(mediaUrls);
			}
			
			PostDtos.Response response = postService.create(request, authorId);
			return new ResponseEntity<>(response, HttpStatus.CREATED);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@PostMapping(value = "/with-media", consumes = "multipart/form-data")
	public ResponseEntity<PostDtos.Response> createWithMedia(
			@RequestParam("content") String content,
			@RequestParam(value = "groupId", required = false) Long groupId,
			@RequestParam(value = "visibility", defaultValue = "public_") String visibility,
			@RequestParam(value = "mediaFiles", required = false) MultipartFile[] mediaFiles,
			@RequestHeader("Authorization") String authHeader) {
		try {
			Long authorId = extractUserIdFromToken(authHeader);
			
			PostDtos.CreateRequest request = PostDtos.CreateRequest.builder()
				.content(content)
				.groupId(groupId)
				.visibility(PostVisibility.valueOf(visibility))
				.build();
			if (mediaFiles != null && mediaFiles.length > 0) {
				List<String> mediaUrls = java.util.Arrays.stream(mediaFiles)
					.parallel()
					.filter(f -> f != null && !f.isEmpty())
					.map(f -> fileStorageService.storeFile(f, "posts"))
					.toList();
				request.setMediaUrls(mediaUrls);
			}
			
			PostDtos.Response response = postService.create(request, authorId);
			return new ResponseEntity<>(response, HttpStatus.CREATED);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@PutMapping(value = "/{postId}", consumes = "multipart/form-data")
	public ResponseEntity<PostDtos.Response> update(
			@PathVariable("postId") Long postId,
			@RequestParam("content") String content,
			@RequestParam(value = "visibility", defaultValue = "public_") String visibility,
			@RequestParam(value = "mediaFiles", required = false) MultipartFile[] mediaFiles,
			@RequestHeader("Authorization") String authHeader) {
		try {
			extractUserIdFromToken(authHeader);
			
			PostDtos.UpdateRequest request = new PostDtos.UpdateRequest();
			request.setContent(content);
			request.setVisibility(PostVisibility.valueOf(visibility));
			
			if (mediaFiles != null && mediaFiles.length > 0) {
				List<String> mediaUrls = java.util.Arrays.stream(mediaFiles)
					.parallel()
					.filter(f -> f != null && !f.isEmpty())
					.map(f -> fileStorageService.storeFile(f, "posts"))
					.toList();
				request.setMediaUrls(mediaUrls);
			}
			
			PostDtos.Response response = postService.update(postId, request);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@PutMapping(value = "/{postId}/with-media", consumes = "multipart/form-data")
	public ResponseEntity<PostDtos.Response> updateWithMedia(
			@PathVariable("postId") Long postId,
			@RequestParam("content") String content,
			@RequestParam(value = "visibility", defaultValue = "public_") String visibility,
			@RequestParam(value = "mediaFiles", required = false) MultipartFile[] mediaFiles,
			@RequestHeader("Authorization") String authHeader) {
		try {
			extractUserIdFromToken(authHeader);
			
			PostDtos.UpdateRequest request = new PostDtos.UpdateRequest();
			request.setContent(content);
			request.setVisibility(PostVisibility.valueOf(visibility));
			
			if (mediaFiles != null && mediaFiles.length > 0) {
				List<String> mediaUrls = java.util.Arrays.stream(mediaFiles)
					.parallel()
					.filter(f -> f != null && !f.isEmpty())
					.map(f -> fileStorageService.storeFile(f, "posts"))
					.toList();
				request.setMediaUrls(mediaUrls);
			}
			
			PostDtos.Response response = postService.update(postId, request);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	@DeleteMapping("/{postId}")
	public ResponseEntity<Void> delete(@PathVariable("postId") Long postId) {
		postService.delete(postId);
		return ResponseEntity.noContent().build();
	}

    @GetMapping("/{postId}")
    public ResponseEntity<PostDtos.Response> get(@PathVariable("postId") Long postId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            Long currentUserId = extractUserIdFromToken(authHeader);
            return ResponseEntity.ok(postService.getByIdForUser(postId, currentUserId));
        }
        return ResponseEntity.ok(postService.getById(postId));
    }

	@GetMapping("/feed")
	public ResponseEntity<Page<PostDtos.Response>> getFeed(Pageable pageable) {
		return ResponseEntity.ok(postService.getFeed(pageable));
	}

	@GetMapping("/feed/user")
	public ResponseEntity<Page<PostDtos.Response>> getFeedForUser(Pageable pageable,
			@RequestHeader("Authorization") String authHeader) {
		Long currentUserId = extractUserIdFromToken(authHeader);
		return ResponseEntity.ok(postService.getFeedForUser(currentUserId, pageable));
	}

	@GetMapping
	public ResponseEntity<Page<PostDtos.Response>> listByAuthor(
			@RequestParam(value = "authorId", required = false) Long authorId,
			Pageable pageable,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {
		if (authorId != null) {
			if (authHeader != null && authHeader.startsWith("Bearer ")) {
				Long currentUserId = extractUserIdFromToken(authHeader);
				return ResponseEntity.ok(postService.listByAuthorForUser(authorId, currentUserId, pageable));
			}
			return ResponseEntity.ok(postService.listByAuthor(authorId, pageable));
		} else {
			if (authHeader != null && authHeader.startsWith("Bearer ")) {
				Long currentUserId = extractUserIdFromToken(authHeader);
				return ResponseEntity.ok(postService.getFeedForUser(currentUserId, pageable));
			}
			return ResponseEntity.ok(postService.getFeed(pageable));
		}
	}

	@GetMapping("/author/{authorId}")
	public ResponseEntity<Page<PostDtos.Response>> listByAuthorForUser(@PathVariable("authorId") Long authorId, 
			Pageable pageable, @RequestHeader("Authorization") String authHeader) {
		Long currentUserId = extractUserIdFromToken(authHeader);
		return ResponseEntity.ok(postService.listByAuthorForUser(authorId, currentUserId, pageable));
	}

	@PostMapping("/{postId}/comments")
	public ResponseEntity<Long> addComment(@PathVariable("postId") Long postId,
			@Valid @RequestBody PostDtos.CommentCreateRequest request,
			@RequestHeader("Authorization") String authHeader) {
		Long authorId = extractUserIdFromToken(authHeader);
		return new ResponseEntity<>(postService.addComment(postId, request, authorId), HttpStatus.CREATED);
	}

	@GetMapping("/{postId}/comments")
	public ResponseEntity<CommentDtos.PaginatedResponse> listComments(@PathVariable("postId") Long postId,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "10") int size) {
		return ResponseEntity.ok(postService.listCommentsWithPagination(postId, page, size));
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

	@GetMapping("/{postId}/reactions")
	public ResponseEntity<Page<ReactionDtos.ReactionResponse>> getReactions(@PathVariable("postId") Long postId, 
			Pageable pageable) {
		return ResponseEntity.ok(postService.getPostReactions(postId, pageable));
	}

	@PostMapping("/{postId}/shares")
	public ResponseEntity<Long> share(@PathVariable("postId") Long postId, 
			@Valid @RequestBody PostDtos.ShareRequest request,
			@RequestHeader("Authorization") String authHeader) {
		Long userId = extractUserIdFromToken(authHeader);
		return new ResponseEntity<>(postService.sharePost(postId, request, userId), HttpStatus.CREATED);
	}

	@PostMapping(value = "/groups/{groupId}", consumes = "multipart/form-data")
	public ResponseEntity<PostDtos.Response> createGroupPost(@PathVariable("groupId") Long groupId,
			@RequestParam("content") String content,
			@RequestParam(value = "visibility", required = false) String visibility,
			@RequestParam(value = "mediaFiles", required = false) MultipartFile[] mediaFiles,
			@RequestHeader("Authorization") String authHeader) {
		Long userId = extractUserIdFromToken(authHeader);
		
		PostDtos.CreateRequest request = PostDtos.CreateRequest.builder()
			.content(content)
			.visibility(visibility != null ? PostVisibility.valueOf(visibility) : PostVisibility.public_)
			.mediaUrls(mediaFiles != null ? java.util.Arrays.stream(mediaFiles).map(f -> f.getOriginalFilename()).collect(java.util.stream.Collectors.toList()) : null)
			.build();
			
		return new ResponseEntity<>(postService.createGroupPost(groupId, request, userId), HttpStatus.CREATED);
	}

	@GetMapping("/groups/{groupId}")
	public ResponseEntity<Page<PostDtos.Response>> getGroupPosts(@PathVariable("groupId") Long groupId,
			Pageable pageable,
			@RequestHeader("Authorization") String authHeader) {
		Long userId = extractUserIdFromToken(authHeader);
		return ResponseEntity.ok(postService.getGroupPosts(groupId, userId, pageable));
	}

	private Long extractUserIdFromToken(String authHeader) {
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);
			return jwtUtil.extractUserId(token);
		}
		throw new RuntimeException("Token không hợp lệ");
	}
}


