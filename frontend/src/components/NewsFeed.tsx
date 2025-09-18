import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  IconButton,
  Divider,
  Button,
  CardActions,
  CardMedia,
  TextField
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  commentsList?: Comment[];
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Nguyễn Văn A',
      avatar: '/api/placeholder/40/40'
    },
    content: 'Hôm nay thật là một ngày tuyệt vời! Cảm ơn tất cả mọi người đã ủng hộ dự án của chúng tôi. 🎉',
    image: '/api/placeholder/500/300',
    timestamp: '2 giờ trước',
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    commentsList: [
      {
        id: '1-1',
        author: { name: 'Phạm Thị D', avatar: '/api/placeholder/32/32' },
        content: 'Chúc mừng bạn! Dự án rất thú vị đấy ',
        timestamp: '1 giờ trước',
        likes: 3,
        isLiked: false
      },
      {
        id: '1-2',
        author: { name: 'Hoàng Văn E', avatar: '/api/placeholder/32/32' },
        content: 'Cảm ơn bạn đã chia sẻ. Mình cũng đang làm dự án tương tự.',
        timestamp: '45 phút trước',
        likes: 2,
        isLiked: true
      }
    ]
  },
  {
    id: '2',
    author: {
      name: 'Trần Thị B',
      avatar: '/api/placeholder/40/40'
    },
    content: 'Vừa hoàn thành khóa học AI và Machine Learning. Rất hứng thú với những kiến thức mới! #AI #MachineLearning',
    timestamp: '4 giờ trước',
    likes: 15,
    comments: 5,
    shares: 2,
    isLiked: true,
    commentsList: [
      {
        id: '2-1',
        author: { name: 'Lê Văn F', avatar: '/api/placeholder/32/32' },
        content: 'Bạn học ở đâu vậy? Mình cũng đang quan tâm đến AI.',
        timestamp: '3 giờ trước',
        likes: 1,
        isLiked: false
      },
      {
        id: '2-2',
        author: { name: 'Ngô Thị G', avatar: '/api/placeholder/32/32' },
        content: 'Có thể chia sẻ một số tài liệu không bạn?',
        timestamp: '2 giờ trước',
        likes: 4,
        isLiked: false
      }
    ]
  },
  {
    id: '3',
    author: {
      name: 'Lê Văn C',
      avatar: '/api/placeholder/40/40'
    },
    content: 'Chia sẻ một số tips về React development mà mình vừa học được...',
    timestamp: '6 giờ trước',
    likes: 32,
    comments: 12,
    shares: 7,
    isLiked: false,
    commentsList: [
      {
        id: '3-1',
        author: { name: 'Vũ Văn H', avatar: '/api/placeholder/32/32' },
        content: 'Cảm ơn bạn! Tips rất hữu ích ',
        timestamp: '5 giờ trước',
        likes: 8,
        isLiked: true
      }
    ]
  }
];

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
  const [liked, setLiked] = React.useState(comment.isLiked);
  const [likes, setLikes] = React.useState(comment.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Avatar
        src={comment.author.avatar}
        sx={{ width: 32, height: 32, backgroundColor: '#3b82f6' }}
      >
        {comment.author.name.charAt(0)}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            backgroundColor: '#f3f4f6',
            borderRadius: '12px',
            p: 2,
            mb: 1
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}
          >
            {comment.author.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#374151' }}>
            {comment.content}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1 }}>
          <Button
            size="small"
            onClick={handleLike}
            sx={{
              color: liked ? '#ef4444' : '#6b7280',
              minWidth: 'auto',
              p: 0.5,
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            {liked ? '❤️' : '🤍'} {likes > 0 && likes}
          </Button>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            {comment.timestamp}
          </Typography>
          <Button
            size="small"
            sx={{
              color: '#6b7280',
              minWidth: 'auto',
              p: 0.5,
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            Trả lời
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [liked, setLiked] = React.useState(post.isLiked);
  const [likes, setLikes] = React.useState(post.likes);
  const [showComments, setShowComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState('');

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Trong thực tế sẽ gửi comment lên server
      console.log('New comment:', newComment);
      setNewComment('');
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar 
            src={post.author.avatar} 
            alt={post.author.name}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#3b82f6',
              color: 'white'
            }}
          >
            {post.author.name.charAt(0)}
          </Avatar>
        }
        action={
          <IconButton
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6'
              }
            }}
          >
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#1f2937',
              fontSize: '1rem'
            }}
          >
            {post.author.name}
          </Typography>
        }
        subheader={
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#6b7280',
              fontSize: '0.875rem'
            }}
          >
            {post.timestamp}
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0, pb: 2 }}>
        <Typography 
          variant="body1" 
          sx={{
            color: '#374151',
            lineHeight: 1.6,
            fontSize: '0.95rem'
          }}
        >
          {post.content}
        </Typography>
      </CardContent>
      {post.image && (
        <Box sx={{ px: 2, pb: 2 }}>
          <CardMedia
            component="img"
            height="350"
            image={post.image}
            alt="Post image"
            sx={{
              borderRadius: '8px',
              objectFit: 'cover'
            }}
          />
        </Box>
      )}
      <Divider sx={{ mx: 2, opacity: 0.6 }} />
      <CardActions 
        disableSpacing 
        sx={{ 
          px: 3, 
          py: 2,
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleLike}
            sx={{
              color: liked ? '#ef4444' : '#6b7280',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 1,
              minWidth: 'auto',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f3f4f6'
              }
            }}
          >
            {likes}
          </Button>
          <Button 
            startIcon={<CommentIcon />}
            onClick={handleCommentToggle}
            sx={{
              color: '#6b7280',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 1,
              minWidth: 'auto',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f3f4f6'
              }
            }}
          >
            {post.comments}
          </Button>
          <Button 
            startIcon={<ShareIcon />}
            sx={{
              color: '#6b7280',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 1,
              minWidth: 'auto',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f3f4f6'
              }
            }}
          >
            {post.shares}
          </Button>
        </Box>
      </CardActions>

      {/* Comments Section */}
      {showComments && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Divider sx={{ mb: 2 }} />
          
          {/* Add Comment */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 32, height: 32, backgroundColor: '#3b82f6' }}>
              U
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f9fafb',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />
              {newComment.trim() && (
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    onClick={handleAddComment}
                    sx={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 2,
                      '&:hover': {
                        backgroundColor: '#2563eb'
                      }
                    }}
                  >
                    Đăng
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          {/* Comments List */}
          {post.commentsList && post.commentsList.length > 0 && (
            <Box>
              {post.commentsList.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Card>
  );
};

const NewsFeed: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 650, width: '100%' }}>
      {/* Create Post Section */}
      <Card 
        sx={{ 
          mb: 3, 
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#3b82f6',
                color: 'white'
              }}
            >
              U
            </Avatar>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                borderRadius: '24px',
                textTransform: 'none',
                color: '#9ca3af',
                borderColor: '#e5e7eb',
                backgroundColor: '#f9fafb',
                py: 1.5,
                px: 3,
                fontSize: '1rem',
                fontWeight: 400,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#d1d5db',
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              Bạn đang nghĩ gì thế?
            </Button>
          </Box>
          <Divider sx={{ my: 2, opacity: 0.6 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 1 }}>
            <Button 
              startIcon={<span style={{ fontSize: '18px' }}>📷</span>}
              sx={{
                color: '#6b7280',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 1,
                flex: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              Ảnh/Video
            </Button>
            <Button 
              startIcon={<span style={{ fontSize: '18px' }}>😊</span>}
              sx={{
                color: '#6b7280',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 1,
                flex: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              Cảm xúc
            </Button>
            <Button 
              startIcon={<span style={{ fontSize: '18px' }}>📍</span>}
              sx={{
                color: '#6b7280',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 1,
                flex: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              Địa điểm
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Posts */}
      {mockPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Box>
  );
};

export default NewsFeed;
