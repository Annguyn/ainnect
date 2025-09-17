package com.ainnect.common.enums;

public enum NotificationType {
	LIKE,           // Ai đó thích bài viết/comment của bạn
	COMMENT,        // Ai đó bình luận bài viết của bạn
	REPLY,          // Ai đó trả lời comment của bạn
	FOLLOW,         // Ai đó theo dõi bạn
	UNFOLLOW,       // Ai đó hủy theo dõi bạn
	FRIEND_REQUEST, // Ai đó gửi lời mời kết bạn
	FRIEND_ACCEPT,  // Ai đó chấp nhận lời mời kết bạn của bạn
	MENTION,        // Ai đó nhắc đến bạn
	SHARE,          // Ai đó chia sẻ bài viết của bạn
	MESSAGE,        // Tin nhắn mới
	GROUP_INVITE,   // Lời mời tham gia nhóm
	GROUP_JOIN,     // Ai đó tham gia nhóm của bạn
	SYSTEM          // Thông báo hệ thống
}
