package com.ainnect.service;

import com.ainnect.common.enums.PostVisibility;
import com.ainnect.dto.post.PostDtos;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

@Service
public class PostAsyncService {

    private final FileStorageService fileStorageService;
    private final PostService postService;
    private final SimpMessagingTemplate messagingTemplate;

    public PostAsyncService(FileStorageService fileStorageService, PostService postService, SimpMessagingTemplate messagingTemplate) {
        this.fileStorageService = fileStorageService;
        this.postService = postService;
        this.messagingTemplate = messagingTemplate;
    }

    @Async("postMediaExecutor")
    public AsyncResult<Void> processPostMediaAsync(Long postId, MultipartFile[] mediaFiles, Long authorId, String content, String visibility, Long groupId) {
        try {
            List<String> mediaUrls = java.util.Arrays.stream(mediaFiles)
                    .filter(f -> f != null && !f.isEmpty())
                    .map(f -> fileStorageService.storeFile(f, "posts"))
                    .toList();

            PostDtos.UpdateRequest update = new PostDtos.UpdateRequest();
            update.setContent(content);
            if (visibility != null) {
                update.setVisibility(PostVisibility.valueOf(visibility));
            }
            update.setMediaUrls(mediaUrls);

            PostDtos.Response updated = postService.update(postId, update);

            messagingTemplate.convertAndSend("/topic/users/" + authorId + "/posts",
                    java.util.Map.of(
                            "type", "POST_UPDATED",
                            "postId", postId,
                            "data", updated
                    ));
            return AsyncResult.forValue(null);
        } catch (Exception ex) {
            messagingTemplate.convertAndSend("/topic/users/" + authorId + "/posts",
                    java.util.Map.of(
                            "type", "POST_UPDATE_FAILED",
                            "postId", postId,
                            "error", ex.getMessage()
                    ));
            return AsyncResult.forExecutionException(ex);
        }
    }
}


