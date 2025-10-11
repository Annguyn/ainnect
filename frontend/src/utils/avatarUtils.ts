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
 * Generate a color based on user's name for consistent avatar colors
 * @param displayName - User's display name
 * @returns Hex color code
 */
export const getAvatarColor = (displayName?: string): string => {
  if (!displayName) return '#6B7280'; // gray-500
  
  const colors = [
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#F59E0B', // amber-500
    '#EAB308', // yellow-500
    '#84CC16', // lime-500
    '#22C55E', // green-500
    '#10B981', // emerald-500
    '#14B8A6', // teal-500
    '#06B6D4', // cyan-500
    '#0EA5E9', // sky-500
    '#3B82F6', // blue-500
    '#6366F1', // indigo-500
    '#8B5CF6', // violet-500
    '#A855F7', // purple-500
    '#D946EF', // fuchsia-500
    '#EC4899', // pink-500
    '#F43F5E', // rose-500
  ];
  
  // Generate hash from display name
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    const char = displayName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use hash to select color
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
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
