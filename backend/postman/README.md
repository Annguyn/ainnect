# Ainnect Backend API - Postman Collection

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

### 👤 User Management (8 endpoints)
- `GET /api/users/profile` - Profile của tôi
- `GET /api/users/{id}` - Profile user khác
- `PUT /api/users/profile` - Cập nhật profile
- `PUT /api/users/change-password` - Đổi mật khẩu
- `PUT /api/users/deactivate` - Vô hiệu hóa tài khoản
- `PUT /api/users/activate` - Kích hoạt tài khoản
- `GET /api/users/check-username/{username}` - Kiểm tra username
- `GET /api/users/check-email/{email}` - Kiểm tra email

### 📝 Posts Management (12 endpoints)
- `POST /api/posts` - Tạo post
- `GET /api/posts/{id}` - Lấy post theo ID
- `GET /api/posts/feed` - Lấy feed
- `GET /api/posts?authorId=X` - Lấy posts theo author (optional)
- `PUT /api/posts/{id}` - Cập nhật post
- `DELETE /api/posts/{id}` - Xóa post
- `POST /api/posts/{id}/reactions` - React post
- `DELETE /api/posts/{id}/reactions` - Bỏ react
- `POST /api/posts/{id}/comments` - Thêm comment
- `GET /api/posts/{id}/comments` - Lấy comments
- `POST /api/posts/{id}/shares` - Share post

### 💬 Comments Management (5 endpoints)
- `GET /api/comments/by-post/{postId}` - Comments theo post
- `GET /api/comments/{id}/replies` - Replies của comment
- `POST /api/comments/{id}/replies` - Reply comment
- `POST /api/comments/{id}/reactions` - React comment
- `DELETE /api/comments/{id}/reactions` - Bỏ react comment

## 🧪 Testing Workflow

### Happy Path Testing:
1. **Register** → Lấy tokens
2. **Create Post** → Test post creation
3. **React to Post** → Test reaction system
4. **Add Comment** → Test commenting
5. **Reply to Comment** → Test comment threading
6. **Share Post** → Test sharing

### Error Testing:
1. Test với invalid tokens
2. Test với missing data
3. Test với unauthorized access
4. Test validation errors

## 📈 Performance & Scalability

- **Stateless**: Server không cần lưu session
- **Cacheable**: JWT tokens có thể cache
- **Scalable**: Dễ scale horizontal
- **Secure**: Industry standard JWT security

---

**Note**: File `postman-new.json` thay thế hoàn toàn file `postman.json` cũ. Sử dụng file mới để có trải nghiệm API tốt nhất! 🚀
