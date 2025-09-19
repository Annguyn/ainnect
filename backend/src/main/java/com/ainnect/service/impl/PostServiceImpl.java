package com.ainnect.service.impl;

import com.ainnect.common.enums.ReactionTargetType;
import com.ainnect.dto.post.PostDtos;
import com.ainnect.entity.*;
import com.ainnect.repository.*;
import com.ainnect.service.PostService;
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
public class PostServiceImpl implements PostService {
	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final CommentRepository commentRepository;
	private final ReactionRepository reactionRepository;
	private final ShareRepository shareRepository;

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
			// group optional; resolve if provided
			// Skipped: need CommunityRepository; add when group posts used
		}
		Post saved = postRepository.save(post);
		return toResponse(saved);
	}

	@Override
	public PostDtos.Response update(Long postId, PostDtos.UpdateRequest request) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new IllegalArgumentException("Post not found"));
		post.setContent(request.getContent());
		post.setVisibility(request.getVisibility());
		Post saved = postRepository.save(post);
		return toResponse(saved);
	}

	@Override
	public void delete(Long postId) {
		if (!postRepository.existsById(postId)) {
			throw new IllegalArgumentException("Post not found");
		}
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
	public Page<PostDtos.Response> getFeed(Pageable pageable) {
		Page<Post> posts = postRepository.findAllActivePosts(pageable);
		return posts.map(this::toResponse);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<PostDtos.Response> listByAuthor(Long authorId, Pageable pageable) {
		List<Post> posts = postRepository.findByAuthor_Id(authorId);
		int start = (int) pageable.getOffset();
		int end = Math.min(start + pageable.getPageSize(), posts.size());
		List<PostDtos.Response> content = posts.subList(start, end).stream().map(this::toResponse).toList();
		return new PageImpl<>(content, pageable, posts.size());
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
		return saved.getId();
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Comment> listComments(Long postId, Pageable pageable) {
		List<Comment> comments = commentRepository.findByPost_Id(postId);
		int start = (int) pageable.getOffset();
		int end = Math.min(start + pageable.getPageSize(), comments.size());
		return new PageImpl<>(comments.subList(start, end), pageable, comments.size());
	}

	@Override
	public void reactToPost(Long postId, PostDtos.ReactionRequest request, Long userId) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new IllegalArgumentException("Post not found"));
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		boolean exists = reactionRepository.existsByTargetTypeAndTargetIdAndUser_IdAndType(
				ReactionTargetType.POST, post.getId(), user.getId(), request.getType());
		if (exists) return; // idempotent
		Reaction reaction = Reaction.builder()
				.targetType(ReactionTargetType.POST)
				.targetId(post.getId())
				.user(user)
				.type(request.getType())
				.build();
		reactionRepository.save(reaction);
		post.setReactionCount(post.getReactionCount() + 1);
		postRepository.save(post);
	}

	@Override
	public void unreactToPost(Long postId, Long userId) {
		List<Reaction> reactions = reactionRepository.findByTargetTypeAndTargetId(ReactionTargetType.POST, postId);
		boolean removed = false;
		for (Reaction r : reactions) {
			if (r.getUser().getId().equals(userId)) {
				reactionRepository.delete(r);
				removed = true;
			}
		}
		if (removed) {
			postRepository.findById(postId).ifPresent(p -> {
				p.setReactionCount(Math.max(0, p.getReactionCount() - 1));
				postRepository.save(p);
			});
		}
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
		return PostDtos.Response.builder()
				.id(post.getId())
				.authorId(post.getAuthor() != null ? post.getAuthor().getId() : null)
				.groupId(post.getGroup() != null ? post.getGroup().getId() : null)
				.content(post.getContent())
				.visibility(post.getVisibility())
				.commentCount(post.getCommentCount())
				.reactionCount(post.getReactionCount())
				.shareCount(post.getShareCount())
				.createdAt(post.getCreatedAt())
				.updatedAt(post.getUpdatedAt())
				.build();
	}
}


