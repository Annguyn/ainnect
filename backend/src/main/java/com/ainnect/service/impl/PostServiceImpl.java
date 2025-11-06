package com.ainnect.service.impl;

import com.ainnect.common.enums.MediaType;
import com.ainnect.common.enums.NotificationType;
import com.ainnect.common.enums.ReactionTargetType;
import com.ainnect.common.enums.ReactionType;
import com.ainnect.dto.comment.CommentDtos;
import com.ainnect.dto.post.PostDtos;
import com.ainnect.dto.reaction.ReactionDtos;
import com.ainnect.entity.*;
import com.ainnect.repository.*;
import com.ainnect.service.FileStorageService;
import com.ainnect.service.PostService;
import com.ainnect.service.NotificationIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@lombok.extern.slf4j.Slf4j
public class PostServiceImpl implements PostService {
	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final CommentRepository commentRepository;
	private final ReactionRepository reactionRepository;
	private final ShareRepository shareRepository;
    private final PostMediaRepository postMediaRepository;
    private final UserBlockRepository userBlockRepository;
	private final CommunityRepository communityRepository;
	private final GroupMemberRepository groupMemberRepository;
	private final FileStorageService fileStorageService;
    
	@org.springframework.beans.factory.annotation.Value("${app.file.base-url:http://localhost:8080}")
	private String baseUrl;

	private final NotificationIntegrationService notificationIntegrationService;

	@Override
	public PostDtos.Response create(PostDtos.CreateRequest request, Long authorId) {
		User author = userRepository.findById(authorId)
				.orElseThrow(() -> new IllegalArgumentException("Author not found"));
		Post post = Post.builder()
				.author(author)
				.content(request.getContent())
				.visibility(request.getVisibility())
				.commentCount(0)
				.reactionCount(0)
				.shareCount(0)
				.build();
		if (request.getGroupId() != null) {
			Community group = communityRepository.findById(request.getGroupId())
					.orElseThrow(() -> new IllegalArgumentException("Group not found"));
			
			if (group.getDeletedAt() != null) {
				throw new IllegalArgumentException("Group has been deleted");
			}
			
			if (!groupMemberRepository.existsByGroupIdAndUserId(request.getGroupId(), authorId)) {
				throw new IllegalArgumentException("You must be a member of the group to post");
			}
			
			post.setGroup(group);
		}
		Post saved = postRepository.save(post);
		
		// Handle media uploads
		if (request.getMediaUrls() != null && !request.getMediaUrls().isEmpty()) {
			List<PostMedia> mediaList = new ArrayList<>();
			for (String mediaUrl : request.getMediaUrls()) {
				MediaType mediaType = determineMediaType(mediaUrl);
				PostMedia media = PostMedia.builder()
						.post(saved)
						.mediaUrl(mediaUrl)
						.mediaType(mediaType)
						.build();
				mediaList.add(postMediaRepository.save(media));
			}
			saved.setMedia(mediaList);
		}
		
		return toResponse(saved);
	}

	@Override
	public PostDtos.Response update(Long postId, PostDtos.UpdateRequest request) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new IllegalArgumentException("Post not found"));
		post.setContent(request.getContent());
		post.setVisibility(request.getVisibility());
		
		// Handle media updates - remove existing media and add new ones
		if (request.getMediaUrls() != null) {
			// Delete existing media files from file system and database
			List<PostMedia> existingMedia = postMediaRepository.findByPost_Id(postId);
			for (PostMedia media : existingMedia) {
				try {
					// Delete file from file system
					String mediaUrl = media.getMediaUrl();
					if (mediaUrl != null && mediaUrl.contains("/api/files/")) {
						String filePath = mediaUrl.substring(mediaUrl.indexOf("/api/files/") + 11); // Remove "/api/files/" prefix
						fileStorageService.deleteFile(filePath);
					}
				} catch (Exception e) {
					// Log error but continue with deletion
					System.err.println("Error deleting old media file: " + e.getMessage());
				}
			}
			postMediaRepository.deleteAll(existingMedia);
			
			// Add new media
			if (!request.getMediaUrls().isEmpty()) {
				List<PostMedia> mediaList = new ArrayList<>();
				for (String mediaUrl : request.getMediaUrls()) {
					MediaType mediaType = determineMediaType(mediaUrl);
					PostMedia media = PostMedia.builder()
							.post(post)
							.mediaUrl(mediaUrl)
							.mediaType(mediaType)
							.build();
					mediaList.add(postMediaRepository.save(media));
				}
				post.setMedia(mediaList);
			}
		}
		
		Post saved = postRepository.save(post);
		return toResponse(saved);
	}

	@Override
	public void delete(Long postId) {
		// Check if post exists
		if (!postRepository.existsById(postId)) {
			throw new IllegalArgumentException("Post not found");
		}
		
		// Delete associated media files from file system
		List<PostMedia> mediaList = postMediaRepository.findByPost_Id(postId);
		for (PostMedia media : mediaList) {
			try {
				// Extract file path from media URL (remove base URL part)
				String mediaUrl = media.getMediaUrl();
				if (mediaUrl != null && mediaUrl.contains("/api/files/")) {
					String filePath = mediaUrl.substring(mediaUrl.indexOf("/api/files/") + 11); // Remove "/api/files/" prefix
					fileStorageService.deleteFile(filePath);
				}
			} catch (Exception e) {
				// Log error but continue with deletion
				System.err.println("Error deleting media file: " + e.getMessage());
			}
		}
		
		// Delete the post (this will cascade delete the media records due to foreign key constraints)
		postRepository.deleteById(postId);
	}

	@Override
	@Transactional(readOnly = true)
	public PostDtos.Response getById(Long postId) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new IllegalArgumentException("Post not found"));
		return toResponse(post);
	}

	@Override
	@Transactional(readOnly = true)
	public PostDtos.Response getByIdForUser(Long postId, Long currentUserId) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new IllegalArgumentException("Post not found"));

		Long authorId = post.getAuthor() != null ? post.getAuthor().getId() : null;
		if (authorId != null && currentUserId != null && !currentUserId.equals(authorId)) {
			boolean blockedByCurrent = userBlockRepository.existsByBlockerIdAndBlockedId(currentUserId, authorId);
			boolean blocksCurrent = userBlockRepository.existsByBlockerIdAndBlockedId(authorId, currentUserId);
			if (blockedByCurrent || blocksCurrent) {
				throw new IllegalArgumentException("You cannot view this post");
			}
		}

		return toResponse(post, currentUserId);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<PostDtos.Response> getFeed(Pageable pageable) {
		Page<Post> posts = postRepository.findAllActivePosts(pageable);
		return posts.map(this::toResponse);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<PostDtos.Response> listByAuthor(Long authorId, Pageable pageable) {
		Page<Post> posts = postRepository.findByAuthor_IdAndDeletedAtIsNull(authorId, pageable);
		return posts.map(this::toResponse);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<PostDtos.Response> getFeedForUser(Long currentUserId, Pageable pageable) {
		Page<Post> posts = postRepository.findVisiblePostsForUser(currentUserId, pageable);
		return posts.map(post -> toResponse(post, currentUserId));
	}

	@Override
	@Transactional(readOnly = true)
	public Page<PostDtos.Response> listByAuthorForUser(Long authorId, Long currentUserId, Pageable pageable) {
		Page<Post> posts = postRepository.findVisiblePostsByAuthor(authorId, currentUserId, pageable);
		return posts.map(post -> toResponse(post, currentUserId));
	}

	@Override
	public Long addComment(Long postId, PostDtos.CommentCreateRequest request, Long authorId) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new IllegalArgumentException("Post not found"));
		User author = userRepository.findById(authorId)
				.orElseThrow(() -> new IllegalArgumentException("Author not found"));
		Comment parent = null;
		if (request.getParentId() != null) {
			parent = commentRepository.findById(request.getParentId())
					.orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));
		}
		Comment comment = Comment.builder()
				.post(post)
				.author(author)
				.parent(parent)
				.content(request.getContent())
				.reactionCount(0)
				.build();
		Comment saved = commentRepository.save(comment);
		post.setCommentCount(post.getCommentCount() + 1);
		postRepository.save(post);

		// Notify post owner about new comment
		try {
			if (post.getAuthor() != null) {
				notificationIntegrationService.handlePostComment(post.getId(), author.getId(), post.getAuthor().getId());
			}
		} catch (Exception ignored) {}
		return saved.getId();
	}

	@Override
	@Transactional(readOnly = true)
	public Page<CommentDtos.Response> listComments(Long postId, Pageable pageable) {
		List<Comment> comments = commentRepository.findByPost_Id(postId);
		int start = (int) pageable.getOffset();
		int end = Math.min(start + pageable.getPageSize(), comments.size());
		List<CommentDtos.Response> responseList = comments.subList(start, end).stream()
				.map(this::toCommentResponse)
				.toList();
		return new PageImpl<>(responseList, pageable, comments.size());
	}

	@Override
	@Transactional(readOnly = true)
	public CommentDtos.PaginatedResponse listCommentsWithPagination(Long postId, int page, int size) {
		List<Comment> allComments = commentRepository.findByPost_Id(postId);
		long totalElements = allComments.size();
		int totalPages = (int) Math.ceil((double) totalElements / size);
		
		int start = page * size;
		int end = Math.min(start + size, allComments.size());
		
		List<CommentDtos.Response> comments = allComments.subList(start, end).stream()
				.map(this::toCommentResponse)
				.toList();
		
		return CommentDtos.PaginatedResponse.builder()
				.comments(comments)
				.currentPage(page)
				.pageSize(size)
				.totalElements(totalElements)
				.totalPages(totalPages)
				.hasNext(page < totalPages - 1)
				.hasPrevious(page > 0)
				.build();
	}

	@Override
	@Transactional
	public void reactToPost(Long postId, PostDtos.ReactionRequest request, Long userId) {
		try {
			Post post = postRepository.findById(postId)
					.orElseThrow(() -> new IllegalArgumentException("Post not found"));
			User user = userRepository.findById(userId)
					.orElseThrow(() -> new IllegalArgumentException("User not found"));

			// Check for existing reactions and clean up duplicates if any
			List<Reaction> existingReactions = reactionRepository.findAllByTargetTypeAndTargetIdAndUser_Id(
					ReactionTargetType.post, postId, userId);

			if (!existingReactions.isEmpty()) {
				// Keep the most recent reaction and delete duplicates
				Reaction mostRecent = existingReactions.get(0);

				// Delete duplicate reactions if any exist
				if (existingReactions.size() > 1) {
					for (int i = 1; i < existingReactions.size(); i++) {
						reactionRepository.delete(existingReactions.get(i));
						// Adjust reaction count for each duplicate removed
						post.setReactionCount(Math.max(0, post.getReactionCount() - 1));
					}
				}

				if (mostRecent.getType() == request.getType()) {
					// Same reaction type - do nothing (idempotent)
					postRepository.save(post); // Save any count adjustments
					return;
				} else {
					// Different reaction type - update existing reaction
					mostRecent.setType(request.getType());
					reactionRepository.save(mostRecent);
					postRepository.save(post); // Save any count adjustments
					return;
				}
			}

			// Create new reaction
			Reaction reaction = Reaction.builder()
					.targetType(ReactionTargetType.post)
					.targetId(post.getId())
					.user(user)
					.type(request.getType())
					.build();
			reactionRepository.save(reaction);

			// Update reaction count
			post.setReactionCount(post.getReactionCount() + 1);
			postRepository.save(post);

			// Notify post owner about like/reaction
			try {
				if (post.getAuthor() != null) {
					notificationIntegrationService.handlePostLike(
                        post.getId(),
                        user.getId(),
                        post.getAuthor().getId(),
                        NotificationType.LIKE // Pass the correct enum value
                    );
				}
			} catch (Exception ex) {
				log.warn("Failed to create/dispatch notification for post {} reaction by {}: {}", postId, userId, ex.toString());
			}
		} catch (Exception ex) {
			log.error("reactToPost failed for postId={}, userId={}", postId, userId, ex);
			throw ex;
		}
	}

	@Override
	@Transactional
	public void unreactToPost(Long postId, Long userId) {
		// Get all reactions from this user to this post (in case there are duplicates)
		List<Reaction> existingReactions = reactionRepository.findAllByTargetTypeAndTargetIdAndUser_Id(
				ReactionTargetType.post, postId, userId);
		
		if (!existingReactions.isEmpty()) {
			// Delete all reactions from this user to this post
			reactionRepository.deleteAll(existingReactions);
			
			// Update reaction count - subtract the number of reactions deleted
			postRepository.findById(postId).ifPresent(post -> {
				post.setReactionCount(Math.max(0, post.getReactionCount() - existingReactions.size()));
				postRepository.save(post);
			});
		}
	}

	@Override
	@Transactional(readOnly = true)
	public Page<ReactionDtos.ReactionResponse> getPostReactions(Long postId, Pageable pageable) {
		Page<Reaction> reactions = reactionRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(
				ReactionTargetType.post, postId, pageable);
		
		return reactions.map(reaction -> {
			try {
				return ReactionDtos.ReactionResponse.builder()
						.id(reaction.getId())
						.type(reaction.getType())
						.userId(reaction.getUser().getId())
						.username(reaction.getUser().getUsername())
						.displayName(reaction.getUser().getDisplayName())
						.avatarUrl(buildFileUrl(reaction.getUser().getAvatarUrl()))
						.createdAt(reaction.getCreatedAt())
						.build();
			} catch (Exception e) {
				return ReactionDtos.ReactionResponse.builder()
						.id(reaction.getId())
						.type(reaction.getType())
						.userId(null)
						.username("Unknown")
						.displayName("Unknown User")
						.avatarUrl(null)
						.createdAt(reaction.getCreatedAt())
						.build();
			}
		});
	}

	@Override
	public Long sharePost(Long postId, PostDtos.ShareRequest request, Long userId) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new IllegalArgumentException("Post not found"));
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		Share share = Share.builder()
				.post(post)
				.byUser(user)
				.comment(request.getComment())
				.build();
		Share saved = shareRepository.save(share);
		post.setShareCount(post.getShareCount() + 1);
		postRepository.save(post);
		return saved.getId();
	}

	private PostDtos.Response toResponse(Post post) {
		return toResponse(post, null);
	}
	
	private PostDtos.Response toResponse(Post post, Long currentUserId) {
		Long authorId = null;
		String authorUsername = null;
		String authorDisplayName = null;
		String authorAvatarUrl = null;
		Long groupId = null;
		
		try {
			if (post.getAuthor() != null) {
				authorId = post.getAuthor().getId();
				authorUsername = post.getAuthor().getUsername();
				authorDisplayName = post.getAuthor().getDisplayName();
				authorAvatarUrl = post.getAuthor().getAvatarUrl();
			}
		} catch (Exception e) {
			// Handle lazy loading exception - author not loaded
			authorId = null;
			authorUsername = null;
			authorDisplayName = null;
			authorAvatarUrl = null;
		}
		
		try {
			groupId = post.getGroup() != null ? post.getGroup().getId() : null;
		} catch (Exception e) {
			// Handle lazy loading exception - group not loaded
			groupId = null;
		}
		
		// Get reaction summary
		ReactionDtos.ReactionSummary reactionSummary = getReactionSummary(post.getId(), currentUserId);
		
		// Get media
		List<PostDtos.MediaResponse> mediaResponses = new ArrayList<>();
		try {
			if (post.getMedia() != null) {
				mediaResponses = post.getMedia().stream()
				.map(media -> PostDtos.MediaResponse.builder()
					.id(media.getId())
					.mediaUrl(buildFileUrl(media.getMediaUrl()))
					.mediaType(media.getMediaType())
					.createdAt(media.getCreatedAt())
					.build())
						.toList();
			}
		} catch (Exception e) {
			// Handle lazy loading exception - media not loaded
			mediaResponses = new ArrayList<>();
		}
		
		return PostDtos.Response.builder()
				.id(post.getId())
				.authorId(authorId)
				.authorUsername(authorUsername)
				.authorDisplayName(authorDisplayName)
				.authorAvatarUrl(buildFileUrl(authorAvatarUrl))
				.groupId(groupId)
				.content(post.getContent())
				.visibility(post.getVisibility())
				.commentCount(post.getCommentCount())
				.reactionCount(post.getReactionCount())
				.shareCount(post.getShareCount())
				.reactions(reactionSummary)
				.media(mediaResponses)
				.createdAt(post.getCreatedAt())
				.updatedAt(post.getUpdatedAt())
				.build();
	}

	private CommentDtos.Response toCommentResponse(Comment comment) {
		Long postId = null;
		Long authorId = null;
		String authorUsername = null;
		String authorDisplayName = null;
		String authorAvatarUrl = null;
		Long parentId = null;

		try {
			postId = comment.getPost() != null ? comment.getPost().getId() : null;
		} catch (Exception e) {
			postId = null;
		}

		try {
			if (comment.getAuthor() != null) {
				authorId = comment.getAuthor().getId();
				authorUsername = comment.getAuthor().getUsername();
				authorDisplayName = comment.getAuthor().getDisplayName();
				authorAvatarUrl = comment.getAuthor().getAvatarUrl();
			}
		} catch (Exception e) {
			authorId = null;
			authorUsername = null;
			authorDisplayName = null;
			authorAvatarUrl = null;
		}

		try {
			parentId = comment.getParent() != null ? comment.getParent().getId() : null;
		} catch (Exception e) {
			parentId = null;
		}

		return CommentDtos.Response.builder()
				.id(comment.getId())
				.postId(postId)
				.authorId(authorId)
				.authorUsername(authorUsername)
				.authorDisplayName(authorDisplayName)
				.authorAvatarUrl(buildFileUrl(authorAvatarUrl))
				.parentId(parentId)
				.content(comment.getContent())
				.reactionCount(comment.getReactionCount())
				.createdAt(comment.getCreatedAt())
				.updatedAt(comment.getUpdatedAt())
				.build();
	}

	private ReactionDtos.ReactionSummary getReactionSummary(Long postId, Long currentUserId) {
		// Get all reactions for this post
		List<Reaction> reactions = reactionRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(
				ReactionTargetType.post, postId);
		
		// Count reactions by type
		Map<ReactionType, Integer> reactionCounts = new HashMap<>();
		List<ReactionDtos.ReactionResponse> recentReactions = new ArrayList<>();
		Boolean currentUserReacted = false;
		ReactionType currentUserReactionType = null;
		
		for (Reaction reaction : reactions) {
			// Count by type
			reactionCounts.put(reaction.getType(), 
					reactionCounts.getOrDefault(reaction.getType(), 0) + 1);
			
			// Check current user reaction
			if (currentUserId != null && reaction.getUser().getId().equals(currentUserId)) {
				currentUserReacted = true;
				currentUserReactionType = reaction.getType();
			}
			
			// Add to recent reactions (limit to first 10)
			if (recentReactions.size() < 10) {
				try {
					ReactionDtos.ReactionResponse reactionResponse = ReactionDtos.ReactionResponse.builder()
							.id(reaction.getId())
							.type(reaction.getType())
							.userId(reaction.getUser().getId())
							.username(reaction.getUser().getUsername())
								.displayName(reaction.getUser().getDisplayName())
								.avatarUrl(buildFileUrl(reaction.getUser().getAvatarUrl()))
							.createdAt(reaction.getCreatedAt())
							.build();
					recentReactions.add(reactionResponse);
				} catch (Exception e) {
					// Handle lazy loading exception
				}
			}
		}
		
		// Convert counts to DTO
		List<ReactionDtos.ReactionTypeCount> reactionTypeCounts = reactionCounts.entrySet().stream()
				.map(entry -> ReactionDtos.ReactionTypeCount.builder()
						.type(entry.getKey())
						.count(entry.getValue())
						.build())
				.toList();
		
		return ReactionDtos.ReactionSummary.builder()
				.totalCount(reactions.size())
				.reactionCounts(reactionTypeCounts)
				.recentReactions(recentReactions)
				.currentUserReacted(currentUserReacted)
				.currentUserReactionType(currentUserReactionType)
				.build();
	}

	@Override
	public PostDtos.Response createGroupPost(Long groupId, PostDtos.CreateRequest request, Long authorId) {
		Community group = communityRepository.findById(groupId)
				.orElseThrow(() -> new IllegalArgumentException("Group not found"));
		
		if (group.getDeletedAt() != null) {
			throw new IllegalArgumentException("Group has been deleted");
		}
		
		if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, authorId)) {
			throw new IllegalArgumentException("You must be a member of the group to post");
		}
		
		User author = userRepository.findById(authorId)
				.orElseThrow(() -> new IllegalArgumentException("Author not found"));
		
		Post post = Post.builder()
				.author(author)
				.group(group)
				.content(request.getContent())
				.visibility(com.ainnect.common.enums.PostVisibility.group)
				.commentCount(0)
				.reactionCount(0)
				.shareCount(0)
				.build();
		
		Post saved = postRepository.save(post);
		
		if (request.getMediaUrls() != null && !request.getMediaUrls().isEmpty()) {
			List<PostMedia> mediaList = new ArrayList<>();
			for (String mediaUrl : request.getMediaUrls()) {
				MediaType mediaType = determineMediaType(mediaUrl);
				PostMedia media = PostMedia.builder()
						.post(saved)
						.mediaUrl(mediaUrl)
						.mediaType(mediaType)
						.build();
				mediaList.add(postMediaRepository.save(media));
			}
			saved.setMedia(mediaList);
		}
		
		return toResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<PostDtos.Response> getGroupPosts(Long groupId, Long currentUserId, Pageable pageable) {
		Community group = communityRepository.findById(groupId)
				.orElseThrow(() -> new IllegalArgumentException("Group not found"));
		
		if (group.getDeletedAt() != null) {
			throw new IllegalArgumentException("Group has been deleted");
		}
		
		if (currentUserId == null || !groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUserId)) {
			throw new IllegalArgumentException("You must be a member of the group to view posts");
		}
		
		List<Post> posts = postRepository.findByGroup_Id(groupId);
		List<Post> filteredPosts = posts.stream()
				.filter(p -> p.getDeletedAt() == null)
				.sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
				.toList();
		
		int start = (int) pageable.getOffset();
		int end = Math.min((start + pageable.getPageSize()), filteredPosts.size());
		List<Post> pageContent = filteredPosts.subList(start, end);
		
		List<PostDtos.Response> responses = pageContent.stream()
				.map(this::toResponse)
				.toList();
		
		return new PageImpl<>(responses, pageable, filteredPosts.size());
	}

	private MediaType determineMediaType(String mediaUrl) {
		if (mediaUrl == null || mediaUrl.isEmpty()) {
			return MediaType.file;
		}
		
		String lowerUrl = mediaUrl.toLowerCase();
		if (lowerUrl.contains(".jpg") || lowerUrl.contains(".jpeg") || 
			lowerUrl.contains(".png") || lowerUrl.contains(".gif") || 
			lowerUrl.contains(".webp") || lowerUrl.contains(".bmp")) {
			return MediaType.image;
		} else if (lowerUrl.contains(".mp4") || lowerUrl.contains(".avi") || 
				   lowerUrl.contains(".mov") || lowerUrl.contains(".wmv") || 
				   lowerUrl.contains(".flv") || lowerUrl.contains(".webm")) {
			return MediaType.video;
		} else {
			return MediaType.file;
		}
	}

	// Build full file URL using configured baseUrl. Handles cases where stored
	// mediaUrl may already be a full URL, a path starting with '/api/files/',
	// or just a filename.
	private String buildFileUrl(String fileName) {
		if (fileName == null || fileName.trim().isEmpty()) {
			return fileName;
		}

		if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
			return fileName;
		}

		if (fileName.contains("/api/files/")) {
			String path = fileName.substring(fileName.indexOf("/api/files/"));
			return baseUrl + path;
		}

		// If it's a plain filename, assume posts category
		if (!fileName.startsWith("/")) {
			return baseUrl + "/api/files/posts/" + fileName;
		}

		return baseUrl + fileName;
	}
}


