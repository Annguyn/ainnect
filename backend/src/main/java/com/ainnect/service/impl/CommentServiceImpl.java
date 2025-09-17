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
	public Page<Comment> listByPost(Long postId, Pageable pageable) {
		List<Comment> comments = commentRepository.findByPost_Id(postId);
		int start = (int) pageable.getOffset();
		int end = Math.min(start + pageable.getPageSize(), comments.size());
		return new PageImpl<>(comments.subList(start, end), pageable, comments.size());
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Comment> listReplies(Long commentId, Pageable pageable) {
		List<Comment> replies = commentRepository.findByParent_Id(commentId);
		int start = (int) pageable.getOffset();
		int end = Math.min(start + pageable.getPageSize(), replies.size());
		return new PageImpl<>(replies.subList(start, end), pageable, replies.size());
	}

	@Override
	public Long replyToComment(Long commentId, CommentDtos.ReplyRequest request) {
		Comment parent = commentRepository.findById(commentId)
				.orElseThrow(() -> new IllegalArgumentException("Comment not found"));
		User author = userRepository.findById(request.getAuthorId())
				.orElseThrow(() -> new IllegalArgumentException("Author not found"));
		Comment reply = Comment.builder()
				.post(parent.getPost())
				.author(author)
				.parent(parent)
				.content(request.getContent())
				.build();
		Comment saved = commentRepository.save(reply);
		Post post = parent.getPost();
		post.setCommentCount(post.getCommentCount() + 1);
		postRepository.save(post);
		return saved.getId();
	}

	@Override
	public void reactToComment(Long commentId, CommentDtos.ReactionRequest request) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new IllegalArgumentException("Comment not found"));
		User user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		boolean exists = reactionRepository.existsByTargetTypeAndTargetIdAndUser_IdAndType(
				ReactionTargetType.COMMENT, comment.getId(), user.getId(), request.getType());
		if (exists) return;
		Reaction reaction = Reaction.builder()
				.targetType(ReactionTargetType.COMMENT)
				.targetId(comment.getId())
				.user(user)
				.type(request.getType())
				.build();
		reactionRepository.save(reaction);
		comment.setReactionCount(comment.getReactionCount() + 1);
		commentRepository.save(comment);
	}

	@Override
	public void unreactToComment(Long commentId, Long userId) {
		List<Reaction> reactions = reactionRepository.findByTargetTypeAndTargetId(ReactionTargetType.COMMENT, commentId);
		boolean removed = false;
		for (Reaction r : reactions) {
			if (r.getUser().getId().equals(userId)) {
				reactionRepository.delete(r);
				removed = true;
			}
		}
		if (removed) {
			commentRepository.findById(commentId).ifPresent(c -> {
				c.setReactionCount(Math.max(0, c.getReactionCount() - 1));
				commentRepository.save(c);
			});
		}
	}
}


