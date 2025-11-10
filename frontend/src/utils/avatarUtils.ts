/**
 * Utility functions for avatar handling
 */

/**
 * Generate initials from display name
 * @param displayName - User's display name
 * @returns Initials (max 2 characters)
 */
export const getInitials = (displayName?: string): string => {
  if (!displayName) return 'U';
  
  const words = displayName.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate a gradient color based on user's name for consistent avatar colors
 * @param displayName - User's display name
 * @returns CSS gradient string
 */
export const getAvatarColor = (displayName?: string): string => {
  if (!displayName) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // default gradient
  
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // orange
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // teal
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // mint
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // rose
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // peach
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', // coral
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // lavender
    'linear-gradient(135deg, #f77062 0%, #fe5196 100%)', // red
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', // sunset
    'linear-gradient(135deg, #e9defa 0%, #fbfcdb 100%)', // pastel
    'linear-gradient(135deg, #17ead9 0%, #6078ea 100%)', // ocean
    'linear-gradient(135deg, #a9c9ff 0%, #ffbbec 100%)', // candy
  ];
  
  // Generate hash from display name
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    const char = displayName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use hash to select gradient
  const gradientIndex = Math.abs(hash) % gradients.length;
  return gradients[gradientIndex];
};

/**
 * Generate avatar URL or return default avatar component props
 * @param user - User object with avatarUrl and displayName
 * @returns Object with either avatarUrl or default avatar props
 */
export const getAvatarProps = (user?: { avatarUrl?: string | null; displayName?: string; userId?: number }) => {
  if (user?.avatarUrl) {
    return {
      type: 'image' as const,
      src: user.avatarUrl,
      alt: user.displayName || 'User avatar'
    };
  }
  
  // Fallback to generated avatar if no avatarUrl
  if (user?.displayName) {
    return {
      type: 'initials' as const,
      initials: getInitials(user.displayName),
      backgroundColor: getAvatarColor(user.displayName),
      alt: `${user.displayName} avatar`
    };
  }
  
  // Ultimate fallback
  return {
    type: 'initials' as const,
    initials: 'U',
    backgroundColor: '#6B7280',
    alt: 'User avatar'
  };
};
