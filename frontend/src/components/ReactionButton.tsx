import React, { useState, useRef } from 'react';
import { ReactionPicker, ReactionType } from './ReactionPicker';
import { debugLogger } from '../utils/debugLogger';

interface ReactionButtonProps {
  currentReaction?: ReactionType | null;
  onReaction: (reaction: ReactionType) => void;
  onUnreact: () => void;
  className?: string;
  reactionCount?: number;
  reactions?: {
    totalCount: number;
    currentUserReacted: boolean;
    currentUserReactionType?: ReactionType | null;
  };
  disabled?: boolean;
}

const reactionEmojis: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  haha: '😆',
  wow: '😮',
  sad: '😢',
  angry: '😠'
};

const reactionColors: Record<ReactionType, string> = {
  like: 'text-blue-600',
  love: 'text-red-500',
  haha: 'text-yellow-500',
  wow: 'text-orange-500',
  sad: 'text-blue-400',
  angry: 'text-red-600'
};

const reactionLabels: Record<ReactionType, string> = {
  like: 'Thích',
  love: 'Yêu thích',
  haha: 'Haha',
  wow: 'Wow',
  sad: 'Buồn',
  angry: 'Phẫn nộ'
};

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  currentReaction,
  onReaction,
  onUnreact,
  className = '',
  reactionCount = 0,
  reactions,
  disabled = false
}) => {
  // Use reactions data if available, otherwise fallback to props
  const userReaction = reactions?.currentUserReactionType || currentReaction;
  const totalCount = reactions?.totalCount || reactionCount;
  const hasReacted = reactions?.currentUserReacted || !!userReaction;
  
  // Debug logging for reaction state
  debugLogger.log('ReactionButton', 'Reaction state check', {
    userReaction,
    currentUserReacted: reactions?.currentUserReacted,
    currentUserReactionType: reactions?.currentUserReactionType,
    hasReacted,
    totalCount,
    reactionCount,
    reactionsStructure: reactions
  });
  
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | undefined>();
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (disabled) return; // Only check disabled, allow showing picker even if already reacted
    
    debugLogger.logUserInteraction('Hover Enter', 'ReactionButton', { 
      hasReacted, 
      disabled 
    });
    
    // Clear any existing hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const position = {
          x: rect.left + rect.width / 2 - 150, // Center the picker
          y: rect.top - 60 // Show above the button
        };
        
        debugLogger.log('ReactionPicker', 'Showing reaction picker on hover', { position });
        
        setPickerPosition(position);
        setShowPicker(true);
      }
    }, 200); // Reduced to 200ms for faster response
    
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    debugLogger.logUserInteraction('Hover Leave', 'ReactionButton');
    
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    
    // Start hide timer - reduced delay for better UX
    const timeout = setTimeout(() => {
      setShowPicker(false);
    }, 150);
    setHideTimeout(timeout);
  };

  const handlePickerMouseEnter = () => {
    debugLogger.logUserInteraction('Picker Mouse Enter', 'ReactionPicker');
    // Cancel hide timer when entering picker
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  const handlePickerMouseLeave = () => {
    debugLogger.logUserInteraction('Picker Mouse Leave', 'ReactionPicker');
    // Hide picker when leaving picker area
    setShowPicker(false);
  };

  const handleClick = () => {
    if (disabled) {
      debugLogger.logButtonClick('ReactionButton - Disabled', { disabled });
      return;
    }

    // If user already reacted, unreact
    if (hasReacted) {
      debugLogger.logButtonClick('ReactionButton - Unreact', {
        currentReaction: userReaction,
        action: 'unreact'
      });
      
      debugLogger.logUserInteraction('Unreact', 'ReactionButton', { 
        previousReaction: userReaction 
      });
      onUnreact();
      return;
    }
    
    // If not reacted, default to like
    debugLogger.logButtonClick('ReactionButton - Single Click', {
      currentReaction,
      action: 'like'
    });
    
    debugLogger.logUserInteraction('React', 'ReactionButton', { reaction: 'like' });
    onReaction('like'); // Default to like on single click
  };

  const handleReactionSelect = (reaction: ReactionType) => {
    if (disabled) {
      debugLogger.logButtonClick('ReactionPicker - Disabled', { disabled });
      setShowPicker(false);
      return;
    }

    // If user already reacted with the same reaction, unreact
    if (hasReacted && userReaction === reaction) {
      debugLogger.logButtonClick('ReactionPicker - Unreact Same', {
        reaction,
        action: 'unreact'
      });
      
      debugLogger.logUserInteraction('Unreact via Picker', 'ReactionPicker', { 
        previousReaction: userReaction 
      });
      onUnreact();
      setShowPicker(false);
      return;
    }

    // If user already reacted with different reaction, or not reacted at all, react with new reaction
    debugLogger.logButtonClick('ReactionPicker - Reaction Select', {
      selectedReaction: reaction,
      previousReaction: userReaction,
      action: hasReacted ? 'change_reaction' : 'react'
    });
    
    debugLogger.logUserInteraction('React via Picker', 'ReactionPicker', { 
      newReaction: reaction,
      previousReaction: userReaction 
    });
    onReaction(reaction);
    
    debugLogger.log('ReactionPicker', 'Hiding reaction picker');
    setShowPicker(false);
  };

  const isReacted = !!userReaction;
  const buttonColor = userReaction ? reactionColors[userReaction] : 'text-gray-600';
  
  // Improved UI/UX: More intuitive text and styling
  const buttonText = userReaction ? `Đã ${reactionLabels[userReaction]}` : 'Thích';
  const emoji = userReaction ? reactionEmojis[userReaction] : '👍';
  
  // Enhanced styling for reacted state
  const buttonStyle = isReacted 
    ? `${buttonColor} bg-blue-50 border-2 border-blue-200 shadow-sm` 
    : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent';

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyle} ${className}`}
        title={hasReacted ? `Bỏ ${reactionLabels[userReaction!]}` : 'Thích bài viết (Hover để chọn cảm xúc khác)'}
      >
        <span className={`text-lg transition-all duration-200 ${isReacted ? 'scale-110 drop-shadow-sm' : ''} relative`}>
          {emoji}
          {/* Subtle indicator for hover reactions */}
          {!isReacted && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></span>
          )}
        </span>
        <span className={`transition-all duration-200 ${isReacted ? 'font-semibold text-blue-700' : 'font-medium'}`}>
          {buttonText}
          {totalCount > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              isReacted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {totalCount}
            </span>
          )}
        </span>
      </button>

      <ReactionPicker
        isVisible={showPicker}
        onReactionSelect={handleReactionSelect}
        onClose={() => setShowPicker(false)}
        position={pickerPosition}
        onMouseEnter={handlePickerMouseEnter}
        onMouseLeave={handlePickerMouseLeave}
      />
    </>
  );
};
