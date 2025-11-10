package com.ainnect.service.impl;

import com.ainnect.common.enums.ReactionTargetType;
import com.ainnect.dto.comment.CommentDtos;
import com.ainnect.entity.*;
import com.ainnect.repository.*;
import com.ainnect.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {
	private final CommentRepository commentRepository;
	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final ReactionRepository reactionRepository;

	@Override
	@Transactional(readOnly = true)
	public Page<CommentDtos.Response> listByPost(Long postId, Pageable pageable) {
		List<Comment> comments = commentRepository.findByPost_IdAndParentIsNullOrderByCreatedAtDesc(postId);
		int start = (int) pageable.getOffset();
		int end = Math.min(start + pageable.getPageSize(), comments.size());
		List<CommentDtos.Response> responseList = comments.subList(start, end).stream()
				.map(this::toResponse)
				.toList();
		return new PageImpl<>(responseList, pageable, comments.size());
	}

	@Override
	@Transactional(readOnly = true)
	public CommentDtos.PaginatedResponse listByPostWithPagination(Long postId, int page, int size) {
		List<Comment> allComments = commentRepository.findByPost_IdAndParentIsNullOrderByCreatedAtDesc(postId);
		long totalElements = allComments.size();
		int totalPages = (int) Math.ceil((double) totalElements / size);
		
		int start = page * size;
		int end = Math.min(start + size, allComments.size());
		
		List<CommentDtos.Response> comments = allComments.subList(start, end).stream()
				.map(this::toResponse)
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
	@Transactional(readOnly = true)
	public Page<CommentDtos.Response> listReplies(Long commentId, Pageable pageable) {
		List<Comment> replies = commentRepository.findByParent_Id(commentId);
		int start = (int) pageable.getOffset();
		int end = Math.min(start + pageable.getPageSize(), replies.size());
		List<CommentDtos.Response> responseList = replies.subList(start, end).stream()
				.map(this::toResponse)
				.toList();
		return new PageImpl<>(responseList, pageable, replies.size());
	}

	@Override
	@Transactional(readOnly = true)
	public CommentDtos.PaginatedResponse listRepliesWithPagination(Long commentId, int page, int size) {
		List<Comment> allReplies = commentRepository.findByParent_Id(commentId);
		long totalElements = allReplies.size();
		int totalPages = (int) Math.ceil((double) totalElements / size);
		
		int start = page * size;
		int end = Math.min(start + size, allReplies.size());
		
		List<CommentDtos.Response> replies = allReplies.subList(start, end).stream()
				.map(this::toResponse)
				.toList();
		
		return CommentDtos.PaginatedResponse.builder()
				.comments(replies)
				.currentPage(page)
				.pageSize(size)
				.totalElements(totalElements)
				.totalPages(totalPages)
				.hasNext(page < totalPages - 1)
				.hasPrevious(page > 0)
				.build();
	}

	@Override
	public Long replyToComment(Long commentId, CommentDtos.ReplyRequest request, Long authorId) {
		Comment parent = commentRepository.findById(commentId)
				.orElseThrow(() -> new IllegalArgumentException("Comment not found"));
		User author = userRepository.findById(authorId)
				.orElseThrow(() -> new IllegalArgumentException("Author not found"));
		Comment reply = Comment.builder()
				.post(parent.getPost())
				.author(author)
				.parent(parent)
				.content(request.getContent())
				.reactionCount(0)
				.build();
		Comment saved = commentRepository.save(reply);
		Post post = parent.getPost();
		post.setCommentCount(post.getCommentCount() + 1);
		postRepository.save(post);
		return saved.getId();
	}

	@Override
	@Transactional
	public void reactToComment(Long commentId, CommentDtos.ReactionRequest request, Long userId) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new IllegalArgumentException("Comment not found"));
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		
		// Check for existing reactions and clean up duplicates if any
		List<Reaction> existingReactions = reactionRepository.findAllByTargetTypeAndTargetIdAndUser_Id(
				ReactionTargetType.comment, commentId, userId);
		
		if (!existingReactions.isEmpty()) {
			// Keep the most recent reaction and delete duplicates
			Reaction mostRecent = existingReactions.get(0);
			
			// Delete duplicate reactions if any exist
			if (existingReactions.size() > 1) {
				for (int i = 1; i < existingReactions.size(); i++) {
					reactionRepository.delete(existingReactions.get(i));
					// Adjust reaction count for each duplicate removed
					comment.setReactionCount(Math.max(0, comment.getReactionCount() - 1));
				}
			}
			
			if (mostRecent.getType() == request.getType()) {
				// Same reaction type - do nothing (idempotent)
				commentRepository.save(comment); // Save any count adjustments
				return;
			} else {
				// Different reaction type - update existing reaction
				mostRecent.setType(request.getType());
				reactionRepository.save(mostRecent);
				commentRepository.save(comment); // Save any count adjustments
				return;
			}
		}
		
		// Create new reaction
		Reaction reaction = Reaction.builder()
				.targetType(ReactionTargetType.comment)
				.targetId(comment.getId())
				.user(user)
				.type(request.getType())
				.build();
		reactionRepository.save(reaction);
		
		// Update reaction count
		comment.setReactionCount(comment.getReactionCount() + 1);
		commentRepository.save(comment);
	}

	@Override
	@Transactional
	public void unreactToComment(Long commentId, Long userId) {
		// Get all reactions from this user to this comment (in case there are duplicates)
		List<Reaction> existingReactions = reactionRepository.findAllByTargetTypeAndTargetIdAndUser_Id(
				ReactionTargetType.comment, commentId, userId);
		
		if (!existingReactions.isEmpty()) {
			// Delete all reactions from this user to this comment
			reactionRepository.deleteAll(existingReactions);
			
			// Update reaction count - subtract the number of reactions deleted
			commentRepository.findById(commentId).ifPresent(comment -> {
				comment.setReactionCount(Math.max(0, comment.getReactionCount() - existingReactions.size()));
				commentRepository.save(comment);
			});
		}
	}

	@Override
	@Transactional
	public void deleteComment(Long commentId, Long userId) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new IllegalArgumentException("Comment not found"));
		
		// Check if user is the author of the comment
		if (!comment.getAuthor().getId().equals(userId)) {
			throw new IllegalArgumentException("You can only delete your own comments");
		}
		
		// Soft delete by setting deletedAt timestamp
		comment.setDeletedAt(java.time.LocalDateTime.now());
		commentRepository.save(comment);
		
		// Update post comment count
		Post post = comment.getPost();
		if (post != null) {
			post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
			postRepository.save(post);
		}
	}

	private CommentDtos.Response toResponse(Comment comment) {
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

		boolean hasChild = commentRepository.existsByParent_Id(comment.getId());

		return CommentDtos.Response.builder()
				.id(comment.getId())
				.postId(postId)
				.authorId(authorId)
				.authorUsername(authorUsername)
				.authorDisplayName(authorDisplayName)
				.authorAvatarUrl(authorAvatarUrl)
				.parentId(parentId)
				.content(comment.getContent())
				.reactionCount(comment.getReactionCount())
				.hasChild(hasChild)
				.createdAt(comment.getCreatedAt())
				.updatedAt(comment.getUpdatedAt())
				.build();
	}
}


