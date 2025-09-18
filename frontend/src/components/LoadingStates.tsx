import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Avatar,
  Typography,
  CircularProgress,
  Fade,
} from '@mui/material';

// Profile skeleton loader
export const ProfileSkeleton: React.FC = () => {
  return (
    <Box sx={{ py: 3 }}>
      {/* Header skeleton */}
      <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height={200} />
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid size={{ xs: 12, sm: 3, md: 2 }}>
              <Skeleton variant="circular" width={120} height={120} />
            </Grid>
            <Grid size={{ xs: 12, sm: 9, md: 10 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ width: '70%' }}>
                  <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Skeleton variant="text" width={100} height={20} />
                    <Skeleton variant="text" width={120} height={20} />
                    <Skeleton variant="text" width={140} height={20} />
                  </Box>
                </Box>
                <Skeleton variant="rectangular" width={100} height={36} />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Tabs skeleton */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="text" width={100} height={48} sx={{ mx: 2 }} />
          ))}
        </Box>
      </Card>

      {/* Content skeleton */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                  <Box sx={{ width: '100%' }}>
                    <Skeleton variant="text" width="30%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Skeleton variant="text" width={40} height={32} />
                  <Skeleton variant="text" width={80} height={16} />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Skeleton variant="text" width={40} height={32} />
                  <Skeleton variant="text" width={80} height={16} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" width="100%" height={8} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Skill cards skeleton
export const SkillsSkeleton: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="circular" width={56} height={56} />
      </Box>
      
      {['Technical Skills', 'Soft Skills'].map((category) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="50%" height={16} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" width="100%" height={4} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={14} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

// Loading overlay with animation
interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading...', 
  isVisible 
}) => {
  return (
    <Fade in={isVisible}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{
            color: 'primary.main',
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Fade>
  );
};

// Mini loading spinner for buttons
export const ButtonLoader: React.FC = () => {
  return (
    <CircularProgress 
      size={16} 
      thickness={4}
      sx={{ color: 'inherit' }}
    />
  );
};

// Shimmer loading for text
interface ShimmerTextProps {
  lines?: number;
  width?: string | number;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({ 
  lines = 1, 
  width = '100%' 
}) => {
  return (
    <Box>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          variant="text" 
          width={typeof width === 'string' ? width : `${width}%`}
          height={20}
          sx={{ mb: lines > 1 ? 1 : 0 }}
          className="loading-shimmer"
        />
      ))}
    </Box>
  );
};

// Custom hook for loading states
export const useLoadingState = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const withLoading = async <T,>(
    asyncFunction: () => Promise<T>,
    errorMessage = 'An error occurred'
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(errorMessage);
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, withLoading, setError };
};