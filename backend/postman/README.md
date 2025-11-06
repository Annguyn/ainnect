# Ainnect Backend API - Postman Collection

## 📊 Tổng quan API

**Tổng số endpoints**: 85+ (bao gồm Notification APIs)

## 📋 Tổng quan

File `postman-new.json` là bộ collection Postman hoàn toàn mới được thiết kế theo nguyên tắc **JWT-based authentication** và **security best practices**.

## 🔑 Những cải tiến chính

### 1. **JWT-based Authentication**
- ✅ Tất cả endpoints sử dụng JWT token thay vì truyền user ID
- ✅ User ID được extract tự động từ JWT token
- ✅ Không cần truyền `authorId`, `userId` trong request body nữa

### 2. **Automatic Token Management**
- ✅ Auto-extract và lưu `accessToken` & `refreshToken` từ response
- ✅ Auto-set Authorization header cho các request cần authentication
- ✅ Collection-level variables để quản lý tokens

### 3. **Complete API Coverage**
- ✅ **Authentication**: Register, Login, Logout, Refresh Token, Validate, Get Current User
- ✅ **User Management**: Profile, Update, Password Change, Account Management
- ✅ **Posts**: CRUD operations, Reactions, Comments, Sharing
- ✅ **Comments**: Replies, Reactions, Threading

### 4. **Realistic Examples**
- ✅ Proper request bodies với dữ liệu thực tế
- ✅ Complete response examples
- ✅ Error response examples
- ✅ Validation error examples

## 🚀 Cách sử dụng

### Bước 1: Import Collection
```bash
# Import file postman-new.json vào Postman
```

### Bước 2: Set Environment Variables
```javascript
baseUrl = http://localhost:8080
accessToken = (sẽ được set tự động)
refreshToken = (sẽ được set tự động)
```

### Bước 3: Authentication Flow
1. **Register** hoặc **Login** → Tokens sẽ được lưu tự động
2. Sử dụng các endpoints khác với token đã có

## 📝 Các thay đổi quan trọng

### ❌ Cách cũ (Không an toàn)
```json
// React to Post - CŨ
{
  "userId": 1,  // ← Truyền user ID từ frontend
  "type": "like"
}
```

### ✅ Cách mới (An toàn)
```json
// React to Post - MỚI
{
  "type": "like"  // ← User ID lấy từ JWT token
}
// Header: Authorization: Bearer <token>
```

### ❌ Cách cũ (Phụ thuộc frontend)
```json
// Add Comment - CŨ
{
  "authorId": 1,  // ← Frontend phải gửi author ID
  "content": "Nice post!"
}
```

### ✅ Cách mới (Độc lập frontend)
```json
// Add Comment - MỚI
{
  "content": "Nice post!"  // ← Author ID từ JWT
}
// Header: Authorization: Bearer <token>
```

## 🔒 Security Benefits

1. **Không thể giả mạo user ID**: User ID được extract từ JWT token đã verify
2. **Stateless authentication**: Không cần lưu session ở server
3. **Frontend đơn giản hơn**: Không cần track user ID ở client
4. **Audit trail tốt hơn**: Mọi action đều có thể trace được user thực hiện

## 📊 API Endpoints Summary

### 🔐 Authentication (6 endpoints)
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/validate` - Validate token
- `POST /api/auth/logout` - Đăng xuất

### 👤 User Management (9 endpoints)
- `GET /api/users/profile` - Profile của tôi
- `GET /api/users/{id}` - Profile user khác
- `PUT /api/users/profile` - Cập nhật profile
- `PUT /api/users/change-password` - Đổi mật khẩu
- `POST /api/users/upload-avatar` - **MỚI**: Upload avatar từ file
- `PUT /api/users/deactivate` - Vô hiệu hóa tài khoản
- `PUT /api/users/activate` - Kích hoạt tài khoản
- `GET /api/users/check-username/{username}` - Kiểm tra username
- `GET /api/users/check-email/{email}` - Kiểm tra email

### 📁 File Management (7 endpoints) - **MỚI**
- `POST /api/files/upload` - Upload file tổng quát
- `GET /api/files/{category}/{fileName}` - Xem/tải file
- `DELETE /api/files/{category}/{fileName}` - Xóa file

#### 📂 Supported Categories:
- **avatars** - Ảnh đại diện người dùng
- **schools** - Ảnh trường đại học/học viện
- **companies** - Ảnh công ty/tổ chức
- **interests** - Ảnh sở thích/hobby
- **locations** - Ảnh địa điểm/thành phố
- **posts** - Ảnh trong bài viết
- **general** - File tổng quát khác

### 📝 Posts Management (12 endpoints)
- `POST /api/posts` - Tạo post
- `GET /api/posts/{id}` - Lấy post theo ID
- `GET /api/posts/feed?page=0&size=10` - Lấy feed (infinite scroll, default size=10)
- `GET /api/posts?authorId=X&page=0&size=10` - Lấy posts theo author (infinite scroll, default size=10)
- `PUT /api/posts/{id}` - Cập nhật post
- `DELETE /api/posts/{id}` - Xóa post
- `POST /api/posts/{id}/reactions` - React post
- `DELETE /api/posts/{id}/reactions` - Bỏ react
- `GET /api/posts/{id}/reactions?page=0&size=10` - Lấy danh sách reactions (infinite scroll, default size=10)
- `POST /api/posts/{id}/comments` - Thêm comment
- `GET /api/posts/{id}/comments?page=0&size=10` - Lấy comments (show more button, default size=10)
- `POST /api/posts/{id}/shares` - Share post

### 💬 Comments Management (6 endpoints)
- `GET /api/comments/by-post/{postId}?page=0&size=4` - Comments theo post (show more button, default size=4)
- `GET /api/comments/{id}/replies?page=0&size=5` - Replies của comment (show more button, default size=5)
- `POST /api/comments/{id}/replies` - Reply comment
- `POST /api/comments/{id}/reactions` - React comment
- `DELETE /api/comments/{id}/reactions` - Bỏ react comment
- `DELETE /api/comments/{id}` - **MỚI**: Xóa comment (chỉ author)

### 👤 Profile Management (25 endpoints) - **MỚI**
#### Education (4 endpoints)
- `POST /api/profile/education` - Thêm thông tin học vấn
- `PUT /api/profile/education/{id}` - Cập nhật thông tin học vấn
- `DELETE /api/profile/education/{id}` - Xóa thông tin học vấn
- `GET /api/profile/education` - Lấy danh sách học vấn

#### Work Experience (4 endpoints)
- `POST /api/profile/work-experience` - Thêm kinh nghiệm làm việc
- `PUT /api/profile/work-experience/{id}` - Cập nhật kinh nghiệm làm việc
- `DELETE /api/profile/work-experience/{id}` - Xóa kinh nghiệm làm việc
- `GET /api/profile/work-experience` - Lấy danh sách kinh nghiệm làm việc

#### Interests (4 endpoints)
- `POST /api/profile/interest` - Thêm sở thích
- `PUT /api/profile/interest/{id}` - Cập nhật sở thích
- `DELETE /api/profile/interest/{id}` - Xóa sở thích
- `GET /api/profile/interest` - Lấy danh sách sở thích

#### Locations (4 endpoints)
- `POST /api/profile/location` - Thêm địa điểm
- `PUT /api/profile/location/{id}` - Cập nhật địa điểm
- `DELETE /api/profile/location/{id}` - Xóa địa điểm
- `GET /api/profile/location` - Lấy danh sách địa điểm

#### Complete Profile & Suggestions (3 endpoints)
- `GET /api/profile/complete` - Lấy profile hoàn chỉnh (cần auth)
- `GET /api/profile/suggestions?type=school&query=harvard` - Lấy gợi ý (public, không cần auth)
- `GET /api/profile/suggestions/categories?type=school` - Lấy danh mục gợi ý (public, không cần auth)

### 🔔 Notification System (6 endpoints) - **MỚI**
- `GET /api/notifications` - Lấy danh sách thông báo (có pagination)
- `GET /api/notifications/stats` - Lấy thống kê thông báo (tổng, chưa đọc, hôm nay)
- `PUT /api/notifications/{id}/read` - Đánh dấu thông báo đã đọc
- `PUT /api/notifications/read-all` - Đánh dấu tất cả thông báo đã đọc
- `DELETE /api/notifications/{id}` - Xóa thông báo
- `DELETE /api/notifications/cleanup` - Dọn dẹp thông báo cũ (>30 ngày)

### 🤝 Social Features (25 endpoints) - **MỚI**
#### Follow/Unfollow (5 endpoints)
- `POST /api/social/follow` - Follow user
- `DELETE /api/social/follow/{followeeId}` - Unfollow user
- `GET /api/social/followers/{userId}?page=0&size=10` - Lấy danh sách followers
- `GET /api/social/following/{userId}?page=0&size=10` - Lấy danh sách following
- `GET /api/social/is-following/{followeeId}` - Kiểm tra trạng thái follow

#### Friendship (8 endpoints)
- `POST /api/social/friend-request` - Gửi lời mời kết bạn
- `POST /api/social/friend-request/accept` - Chấp nhận lời mời kết bạn
- `POST /api/social/friend-request/reject` - Từ chối lời mời kết bạn
- `DELETE /api/social/friend/{friendId}` - Hủy kết bạn
- `GET /api/social/friends/{userId}?page=0&size=10` - Lấy danh sách bạn bè
- `GET /api/social/friend-requests?page=0&size=10` - Lấy lời mời kết bạn nhận được
- `GET /api/social/sent-friend-requests?page=0&size=10` - Lấy lời mời kết bạn đã gửi
- `GET /api/social/is-friend/{friendId}` - Kiểm tra trạng thái bạn bè

#### Block/Unblock (4 endpoints)
- `POST /api/social/block` - Block user
- `DELETE /api/social/block/{blockedUserId}` - Unblock user
- `GET /api/social/blocked-users?page=0&size=10` - Lấy danh sách user đã block
- `GET /api/social/is-blocked/{blockedId}` - Kiểm tra trạng thái block

#### Share (4 endpoints)
- `POST /api/social/share` - Share post
- `DELETE /api/social/share/{shareId}` - Xóa share
- `GET /api/social/shares/post/{postId}?page=0&size=10` - Lấy shares của post
- `GET /api/social/shares/user/{userId}?page=0&size=10` - Lấy shares của user

#### Social Stats (3 endpoints)
- `GET /api/social/stats/{userId}` - Lấy thống kê social (public)
- `GET /api/social/stats/{userId}` - Lấy thống kê social (với auth)
- `GET /api/social/my-stats` - Lấy thống kê social của mình

## 🆕 Tính năng Upload File

### 📂 File Categories & Usage
- **avatars**: Ảnh đại diện người dùng
- **schools**: Ảnh trường đại học cho Education profile
- **companies**: Ảnh công ty cho Work Experience profile  
- **interests**: Ảnh sở thích cho Interest profile
- **locations**: Ảnh địa điểm cho Location profile
- **posts**: Ảnh trong bài viết
- **general**: File tổng quát khác

### 📸 Upload Flow (Khuyến nghị)
1. **Frontend**: User chọn file
2. **Upload**: `POST /api/files/upload` với `category` phù hợp
3. **Response**: Nhận URL ảnh
4. **Update Profile**: Sử dụng URL trong các profile fields

### 🔒 File Validation
- **Formats**: JPEG, PNG, GIF, WebP
- **Size limit**: 5MB
- **Categories**: Chỉ chấp nhận categories được định nghĩa
- **Security**: Path traversal protection

**Endpoint**: `POST /api/files/upload`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file` (file), `category` (string)
- **Supported formats**: JPEG, PNG, GIF, WebP
- **Max size**: 5MB
- **Authentication**: Not required (public endpoint)

### 🔄 Profile Update Flow (QUAN TRỌNG)
1. **Upload images TRƯỚC**: `POST /api/files/upload` với category phù hợp
2. **Lấy URL từ response**: Server trả về URL dạng `http://localhost:8080/api/files/category/filename`
3. **Update profile**: Sử dụng URL từ server trong profile fields
4. **Education**: Upload school image với `category=schools`
5. **Work Experience**: Upload company image với `category=companies`
6. **Interests**: Upload interest image với `category=interests`
7. **Locations**: Upload location image với `category=locations`

### ⚠️ Lưu ý quan trọng:
- **KHÔNG** sử dụng blob URLs từ client (blob:http://localhost:3000/...)
- **KHÔNG** sử dụng localhost:3000 URLs
- **CHỈ** sử dụng URLs từ server (http://localhost:8080/api/files/...)
- Server sẽ reject requests có blob URLs hoặc client URLs

**Lưu ý**: Không nên gửi `avatarUrl` trong `PUT /api/users/profile` nữa!

### 📁 General File Upload
- **Endpoint**: `POST /api/files/upload`
- **Content-Type**: `multipart/form-data`
- **Parameters**: 
  - `file` (file) - Required
  - `category` (text) - Optional, default: "general"

### 📂 File Access
- **View/Download**: `GET /api/files/{category}/{fileName}`
- **Delete**: `DELETE /api/files/{category}/{fileName}`
- Files are stored in: `uploads/{category}/`

## 🧪 Testing Workflow

### Happy Path Testing:
1. **Register** → Lấy tokens
2. **Upload Avatar** → Test file upload system
3. **Create Post** → Test post creation
4. **React to Post** → Test reaction system
5. **Add Comment** → Test commenting
6. **Reply to Comment** → Test comment threading
7. **Share Post** → Test sharing

### File Upload Testing:
1. **Upload Avatar** → Test với different file formats
2. **View File** → Test file access
3. **Update Profile** → Test với URL-based avatar
4. **Upload General File** → Test general file upload

### Error Testing:
1. Test với invalid tokens
2. Test với missing data
3. Test với unauthorized access
4. Test validation errors
5. **File Upload Errors**:
   - Invalid file formats
   - File size too large
   - Missing file parameter

## 📈 Performance & Scalability

- **Stateless**: Server không cần lưu session
- **Cacheable**: JWT tokens có thể cache
- **Scalable**: Dễ scale horizontal
- **Secure**: Industry standard JWT security

## 📄 Cải tiến Pagination (Mới)

### 🔄 Thay đổi Pagination Strategy
- **Comments**: Chuyển từ infinite scroll sang "Show More" button pagination
  - `GET /api/comments/by-post/{postId}?page=0&size=4` - Comments theo post (default size=4)
  - `GET /api/comments/{id}/replies?page=0&size=5` - Replies của comment (default size=5)
  - Response format: `{comments: [], currentPage: 0, pageSize: 4, totalElements: 50, totalPages: 13, hasNext: true, hasPrevious: false}`
- **Posts**: Giữ nguyên infinite scroll với database pagination
  - `GET /api/posts/feed?page=0&size=10` - Feed posts (default size=10)
  - `GET /api/posts?authorId=X&page=0&size=10` - Posts theo author (default size=10)
- **Reactions**: Chuyển sang infinite scroll với database pagination
  - `GET /api/posts/{id}/reactions?page=0&size=10` - Danh sách reactions (default size=10)

### 🎯 Lợi ích
- **Comments**: UX tốt hơn với button "Hiển thị thêm" thay vì auto-load
- **Posts**: Performance tốt hơn với database pagination
- **Reactions**: Infinite scroll mượt mà cho danh sách dài

## 👤 Profile Management System (Mới)

### 🌟 Tính năng Profile mở rộng
- **Education**: Quản lý thông tin học vấn với thời gian, bằng cấp, hình ảnh
- **Work Experience**: Quản lý kinh nghiệm làm việc với công ty, vị trí, thời gian
- **Interests**: Quản lý sở thích với danh mục và mô tả
- **Locations**: Quản lý địa điểm với tọa độ, loại địa điểm
- **Complete Profile**: API tổng hợp tất cả thông tin profile

### 🤖 Hệ thống Gợi ý Thông Minh
- **Auto-suggestion**: Tự động gợi ý dựa trên dữ liệu người dùng khác
- **Usage-based ranking**: Sắp xếp gợi ý theo độ phổ biến
- **Category filtering**: Lọc gợi ý theo danh mục
- **Search functionality**: Tìm kiếm gợi ý theo từ khóa
- **Public access**: Suggestion endpoints không cần authentication

### 📊 Cấu trúc dữ liệu
```json
{
  "userId": 1,
  "username": "john_doe",
  "displayName": "John Doe",
  "avatarUrl": "https://...",
  "bio": "Software Engineer",
  "educations": [
    {
      "id": 1,
      "schoolName": "Harvard University",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startDate": "2018-09-01",
      "endDate": "2022-05-30",
      "isCurrent": false,
      "description": "Focused on AI and Machine Learning",
      "imageUrl": "https://..."
    }
  ],
  "workExperiences": [...],
  "interests": [...],
  "locations": [...]
}
```

## 🔧 Các lỗi đã được sửa

### ✅ Security Configuration
- **Suggestion endpoints**: Đã thêm `/api/profile/suggestions/**` vào permitAll() để cho phép truy cập public
- **Parameter name warnings**: Đã sửa lỗi parameter name trong FileController với @PathVariable annotations

### ✅ Pagination Defaults
- **Comments**: Default size = 4 (thay vì 10) để phù hợp với "show more" button
- **Comment replies**: Default size = 5
- **Posts**: Default size = 10 cho infinite scroll
- **Reactions**: Default size = 10 cho infinite scroll

### ✅ Entity Annotations
- **@Builder.Default**: Đã thêm cho các field có default values trong entities
- **Lombok imports**: Đã sửa missing imports cho Setter annotation

### ✅ API Documentation
- **Postman collection**: Đã tạo `postman-updated.json` với tất cả API mới
- **README updates**: Đã cập nhật documentation với thông tin chính xác
- **Endpoint descriptions**: Đã thêm thông tin về authentication requirements

---

**Note**: 
- File `postman-updated.json` là collection mới nhất với tất cả API đã cập nhật
- File `postman-new.json` vẫn có thể sử dụng nhưng thiếu Profile Management APIs
- Sử dụng file `postman-updated.json` để có trải nghiệm API tốt nhất! 🚀
