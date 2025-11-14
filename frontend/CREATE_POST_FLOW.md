# CreatePost Component - Async Media Processing Flow

## Overview

Backend xử lý media (ảnh/video) **bất đồng bộ** để tránh timeout và cải thiện UX. 

### Flow Diagram

```
User submits post with media
         ↓
Frontend: API call (multipart/form-data)
         ↓
Backend: Save post to DB → Return response immediately
         ↓
Frontend: Show "Processing..." notification (5s)
         ↓
Backend (async): Process media in background thread
         ├─ Resize images
         ├─ Optimize quality
         ├─ Upload to CDN
         └─ Update post with media URLs
         ↓
Backend: Send WebSocket notification (POST_UPDATED)
         ↓
Frontend: Receive WebSocket → Update feed with media
         ↓
User sees complete post with images/videos
```

## User Experience

### Text-only Post (No Media)
- ✅ Submit successful
- ✅ Notification: "Đăng bài thành công! 🎉" (3 seconds)
- ✅ Post xuất hiện ngay trong feed

### Post with Media (Images/Videos)
- ⏳ Submit successful
- ⏳ Notification: "Đang xử lý bài viết... Vui lòng đợi trong giây lát!" (5 seconds)
- ⏳ Subtitle: "Backend đang xử lý ảnh/video của bạn"
- ✅ Post xuất hiện trong feed sau ~2-5 giây (khi backend hoàn tất)

## API Response Example

### Request
```http
POST /api/posts
Content-Type: multipart/form-data

content: "Bài viết đầu tiên ở môi trường kiểm thử"
visibility: "public_"
mediaFiles: [image1.jpg, video1.mp4]
```

### Immediate Response (before media processing)
```json
{
  "id": 1,
  "authorId": 26,
  "authorUsername": "testserveruser",
  "authorDisplayName": "Nguyễn Bá Xuân An",
  "content": "Bài viết đầu tiên ở môi trường kiểm thử",
  "visibility": "public_",
  "media": [],  // Empty initially!
  "createdAt": "2025-11-14T02:15:54",
  "updatedAt": "2025-11-14T02:15:54"
}
```

### WebSocket Update (after media processing complete)
```json
{
  "type": "POST_UPDATED",
  "postId": 1,
  "data": {
    "id": 1,
    "content": "Bài viết đầu tiên ở môi trường kiểm thử",
    "media": [
      {
        "id": 1,
        "mediaUrl": "https://cdn-stg.ainnect.me/posts/xxx.JPG",
        "mediaType": "image",
        "createdAt": "2025-11-14T02:15:54.998645"
      },
      {
        "id": 2,
        "mediaUrl": "https://cdn-stg.ainnect.me/posts/yyy.webp",
        "mediaType": "image",
        "createdAt": "2025-11-14T02:15:55.003796"
      },
      {
        "id": 3,
        "mediaUrl": "https://cdn-stg.ainnect.me/posts/zzz.mp4",
        "mediaType": "video",
        "createdAt": "2025-11-14T02:15:55.006005"
      }
    ],
    "updatedAt": "2025-11-14T02:15:55"
  }
}
```

## Processing Time Expectations

| Content Type | Expected Time | User Experience |
|--------------|---------------|-----------------|
| Text only | < 100ms | Instant display |
| 1-2 images | 2-4 seconds | Brief wait |
| 3-4 images | 4-6 seconds | Short wait |
| Video | 5-10 seconds | Noticeable wait |

## Frontend Implementation

### WebSocket Subscription (UserFeed.tsx)
```typescript
// Subscribe to user's post updates
websocketService.subscribeToUserPosts(user.id, handlePostUpdate);

// Handle incoming WebSocket messages
const handlePostUpdate = (message: any) => {
  if (message.type === 'POST_UPDATED') {
    const updatedPost = message.data;
    // Add/update post in feed
    setInternalPosts(prev => {
      const existingIndex = prev.findIndex(p => p.id === updatedPost.id);
      if (existingIndex >= 0) {
        // Update existing post with media
        const newPosts = [...prev];
        newPosts[existingIndex] = updatedPost;
        return newPosts;
      } else {
        // Add new post to top
        return [updatedPost, ...prev];
      }
    });
  } else if (message.type === 'POST_UPDATE_FAILED') {
    // Show error state
    console.error('Media processing failed:', message);
  }
};
```

### Success Notification (CreatePost.tsx)
```typescript
const showSuccessNotification = (hasMedia: boolean) => {
  const message = hasMedia 
    ? '✅ Đang xử lý bài viết... Vui lòng đợi trong giây lát!'
    : '🎉 Đăng bài thành công!';
  
  const duration = hasMedia ? 5000 : 3000;
  
  // Show toast notification
  // ...
};
```

## Error Handling

### Possible Errors
1. **Upload Failed**: Network error during API call
   - User sees: "❌ Không thể đăng bài viết. Vui lòng thử lại."
   - Form data preserved, user can retry

2. **Media Processing Failed**: Backend error processing media
   - User sees: WebSocket message with POST_UPDATE_FAILED
   - Post shows error state in feed

3. **Timeout**: No WebSocket response after 30 seconds
   - User can refresh feed to see post status

## Validation Rules (CreatePost)

### Content Validation
- **Empty content**: Must have text OR media
- **Max length**: 5000 characters
- Character counter color:
  - Gray: < 4500 chars (normal)
  - Yellow: 4500-5000 chars (warning)
  - Red: > 5000 chars (error + disabled)

### Media Validation
- **Max files**: 4 images/videos
- **Max size**: 10MB per file
- **Allowed types**: JPG, PNG, GIF, WebP, MP4, WebM
- Shows file size on each preview
- Shows total count: "X/4 ảnh/video"
- Shows total size: "X.XX MB"

## Testing Scenarios

### Scenario 1: Text-only Post
1. Enter content: "Hello world"
2. Click "Đăng"
3. ✅ See "Đăng bài thành công! 🎉" (3s)
4. ✅ Post appears immediately in feed

### Scenario 2: Post with 2 Images
1. Enter content + upload 2 images (each 3MB)
2. Click "Đăng"
3. ⏳ See "Đang xử lý bài viết..." (5s)
4. Wait ~3 seconds
5. ✅ Post appears in feed with images loaded

### Scenario 3: Post with Video
1. Enter content + upload 1 video (8MB)
2. Click "Đăng"
3. ⏳ See "Đang xử lý bài viết..." (5s)
4. Wait ~6 seconds
5. ✅ Post appears in feed with video player

### Scenario 4: Network Error
1. Disconnect internet
2. Try to post
3. ❌ See error message
4. ✅ Form data preserved
5. Reconnect + retry successfully

## Best Practices

### For Users
- ✅ Upload images < 5MB for faster processing
- ✅ Use JPG/PNG for photos, WebP for smaller size
- ✅ Limit videos to < 8MB if possible
- ⚠️ Don't refresh page during processing

### For Developers
- ✅ Always show clear feedback (processing vs. success)
- ✅ Don't block UI while waiting for media
- ✅ Clean up preview URLs to prevent memory leaks
- ✅ Handle both POST_UPDATED and POST_UPDATE_FAILED events
- ✅ Log all stages for debugging

## Configuration

### API Endpoints
- **Development**: `http://localhost:8080/api/posts`
- **Staging**: `https://api-stg.ainnect.me/api/posts`
- **Production**: `https://api.ainnect.me/api/posts`

### CDN URLs
- **Staging**: `https://cdn-stg.ainnect.me/posts/*`
- **Production**: `https://cdn.ainnect.me/posts/*`

### WebSocket Topics
- User posts: `/topic/posts/user/{userId}`
- Post updates: Message type = `POST_UPDATED` or `POST_UPDATE_FAILED`
