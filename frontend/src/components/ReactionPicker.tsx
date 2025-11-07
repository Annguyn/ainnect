import React, { useEffect, useRef } from 'react';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

interface ReactionPickerProps {
  isVisible: boolean;
  onReactionSelect: (reaction: ReactionType) => void;
  onClose: () => void;
  position?: { x: number; y: number };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const reactions: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like', emoji: '👍', label: 'Thích', color: 'text-blue-500' },
  { type: 'love', emoji: '❤️', label: 'Yêu thích', color: 'text-red-500' },
  { type: 'haha', emoji: '😆', label: 'Haha', color: 'text-yellow-500' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: 'text-orange-500' },
  { type: 'sad', emoji: '😢', label: 'Buồn', color: 'text-blue-400' },
  { type: 'angry', emoji: '😠', label: 'Phẫn nộ', color: 'text-red-600' }
];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ 
  isVisible, 
  onReactionSelect, 
  onClose, 
  position,
  onMouseEnter,
  onMouseLeave
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [hideTimeout, setHideTimeout] = React.useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseLeave = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.relatedTarget as Node)) {
          if (hideTimeout) {
              clearTimeout(hideTimeout); 
              setHideTimeout(null);
          }
      }
    };

    if (isVisible) {
      pickerRef.current?.addEventListener('mouseleave', handleMouseLeave);
      return () => pickerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [isVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        const timeout = setTimeout(() => {
            onClose();
        }, 5000); 
        setHideTimeout(timeout);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const pickerStyle = position 
    ? { 
        position: 'fixed' as const, // Changed to fixed for viewport-relative positioning
        left: position.x, 
        top: position.y, // Removed hardcoded offset
        zIndex: 50 
      }
    : {};

  return (
    <div
      ref={pickerRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => {
          if (hideTimeout) {
              clearTimeout(hideTimeout); // Cancel hide timeout when hovering over the picker
              setHideTimeout(null);
          }
          onMouseLeave?.();
      }}
      className="bg-white rounded-full shadow-xl border border-gray-200 p-3 flex items-center space-x-1 animate-bounce-in backdrop-blur-sm transform transition-all duration-200 hover:scale-105"
      style={pickerStyle}
    >
      {reactions.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => onReactionSelect(reaction.type)}
          className="relative group p-2 rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-125 hover:shadow-md active:scale-110 reaction-button-hover"
          title={reaction.label}
        >
          <span className="text-2xl filter drop-shadow-sm transition-transform duration-200 group-hover:scale-110">{reaction.emoji}</span>
          
          {/* Enhanced Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg">
            {reaction.label}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      ))}
    </div>
  );
};

// Custom CSS for animation (add to your CSS file or use Tailwind plugin)
const styles = `
  @keyframes bounce-in {
    0% {
      transform: scale(0.3) translateY(20px);
      opacity: 0;
    }
    50% {
      transform: scale(1.05) translateY(-5px);
      opacity: 0.8;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.3s ease-out;
  }
  
  /* Enhanced hover effects for reaction buttons */
  .reaction-button-hover {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .reaction-button-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
