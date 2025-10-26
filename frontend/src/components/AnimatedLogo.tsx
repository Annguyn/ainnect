import React from 'react';

interface AnimatedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const nodeSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection lines */}
        <g className="opacity-60">
          {/* Central connections */}
          <line
            x1="50"
            y1="20"
            x2="50"
            y2="50"
            stroke="url(#gradient1)"
            strokeWidth="2"
            className="animate-pulse"
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="80"
            stroke="url(#gradient2)"
            strokeWidth="2"
            className="animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <line
            x1="20"
            y1="50"
            x2="50"
            y2="50"
            stroke="url(#gradient3)"
            strokeWidth="2"
            className="animate-pulse"
            style={{ animationDelay: '0.4s' }}
          />
          <line
            x1="50"
            y1="50"
            x2="80"
            y2="50"
            stroke="url(#gradient4)"
            strokeWidth="2"
            className="animate-pulse"
            style={{ animationDelay: '0.6s' }}
          />
          {/* Diagonal connections */}
          <line
            x1="20"
            y1="20"
            x2="50"
            y2="50"
            stroke="url(#gradient5)"
            strokeWidth="1.5"
            className="animate-pulse"
            style={{ animationDelay: '0.8s' }}
          />
          <line
            x1="80"
            y1="20"
            x2="50"
            y2="50"
            stroke="url(#gradient6)"
            strokeWidth="1.5"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <line
            x1="20"
            y1="80"
            x2="50"
            y2="50"
            stroke="url(#gradient7)"
            strokeWidth="1.5"
            className="animate-pulse"
            style={{ animationDelay: '1.2s' }}
          />
          <line
            x1="80"
            y1="80"
            x2="50"
            y2="50"
            stroke="url(#gradient8)"
            strokeWidth="1.5"
            className="animate-pulse"
            style={{ animationDelay: '1.4s' }}
          />
        </g>

        {/* Animated nodes */}
        <g>
          {/* Top node */}
          <circle
            cx="50"
            cy="20"
            r="6"
            fill="url(#nodeGradient1)"
            className="animate-bounce"
            style={{ animationDuration: '2s', animationDelay: '0s' }}
          />
          
          {/* Center node */}
          <circle
            cx="50"
            cy="50"
            r="8"
            fill="url(#nodeGradient2)"
            className="animate-pulse"
            style={{ animationDuration: '1.5s' }}
          />
          
          {/* Bottom node */}
          <circle
            cx="50"
            cy="80"
            r="6"
            fill="url(#nodeGradient3)"
            className="animate-bounce"
            style={{ animationDuration: '2s', animationDelay: '0.5s' }}
          />
          
          {/* Left node */}
          <circle
            cx="20"
            cy="50"
            r="6"
            fill="url(#nodeGradient4)"
            className="animate-bounce"
            style={{ animationDuration: '2s', animationDelay: '1s' }}
          />
          
          {/* Right node */}
          <circle
            cx="80"
            cy="50"
            r="6"
            fill="url(#nodeGradient5)"
            className="animate-bounce"
            style={{ animationDuration: '2s', animationDelay: '1.5s' }}
          />
        </g>

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="gradient8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>

          {/* Node gradients */}
          <radialGradient id="nodeGradient1" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </radialGradient>
          <radialGradient id="nodeGradient2" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </radialGradient>
          <radialGradient id="nodeGradient3" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </radialGradient>
          <radialGradient id="nodeGradient4" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <radialGradient id="nodeGradient5" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#EF4444" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
