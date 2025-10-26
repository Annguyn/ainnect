import React, { useEffect, useState } from 'react';

interface ConnectionAnimationProps {
  className?: string;
  variant?: 'login' | 'register';
}

export const ConnectionAnimation: React.FC<ConnectionAnimationProps> = ({ 
  className = '', 
  variant = 'login' 
}) => {
  const [activeConnections, setActiveConnections] = useState<number[]>([]);
  const [pulseNodes, setPulseNodes] = useState<number[]>([]);

  useEffect(() => {
    const connectionInterval = setInterval(() => {
      setActiveConnections((prev) => {
        const newConnections = [...prev];
        const randomConnection = Math.floor(Math.random() * connections.length);
        if (!newConnections.includes(randomConnection)) {
          newConnections.push(randomConnection);
        }
        if (newConnections.length > 2) {
          newConnections.shift();
        }
        return newConnections;
      });
    }, 1200); 

    const pulseInterval = setInterval(() => {
      setPulseNodes((prev) => {
        const newPulses = [...prev];
        const randomNode = Math.floor(Math.random() * nodes.length);
        if (!newPulses.includes(randomNode)) {
          newPulses.push(randomNode);
        }
        if (newPulses.length > 1) {
          newPulses.shift();
        }
        return newPulses;
      });
    }, 1800); // Điều chỉnh thời gian để chuyển động mượt mà hơn

    return () => {
      clearInterval(connectionInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const nodes = [
    { id: 0, x: 50, y: 25, color: 'from-blue-400 to-blue-600', label: '' },
    { id: 1, x: 20, y: 45, color: 'from-purple-400 to-purple-600', label: '' },
    { id: 2, x: 80, y: 45, color: 'from-green-400 to-green-600', label: '' },
    { id: 3, x: 30, y: 75, color: 'from-yellow-400 to-yellow-600', label: '' },
    { id: 4, x: 70, y: 75, color: 'from-pink-400 to-pink-600', label: '' }
  ];

  const connections = [
    { from: 0, to: 1, id: 0 },
    { from: 0, to: 2, id: 1 },
    { from: 0, to: 3, id: 2 },
    { from: 0, to: 4, id: 3 },
    { from: 1, to: 2, id: 4 },
    { from: 1, to: 3, id: 5 },
    { from: 2, to: 4, id: 6 },
    { from: 3, to: 4, id: 7 }
  ];

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-secondary-100 to-tertiary-100 rounded-2xl"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary-200 rounded-full opacity-40 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-700 mb-2">
            {variant === 'login' ? 'Chào mừng trở lại!' : 'Tham gia cộng đồng!'}
          </h2>
          <p className="text-gray-500 text-lg">
            {variant === 'login' ? 'Đăng nhập tài khoản của bạn' : 'Tạo tài khoản mới'}
          </p>
        </div>

        {/* Network visualization */}
        <div className="relative w-80 h-80 mx-auto mb-8">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Connection lines */}
            <g className="opacity-50">
              {connections.map((connection) => {
                const fromNode = nodes[connection.from];
                const toNode = nodes[connection.to];
                const isActive = activeConnections.includes(connection.id);
                
                return (
                  <line
                    key={connection.id}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isActive ? '#60A5FA' : '#D1D5DB'}
                    strokeWidth={isActive ? '2.5' : '1.5'}
                    className={`transition-all duration-700 ${isActive ? 'animate-pulse' : ''}`}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            {nodes.map((node) => {
              const isPulsing = pulseNodes.includes(node.id);
              const isCenter = node.id === 0;
              
              return (
                <g key={node.id}>
                  {/* Pulse ring for center node */}
                  {isCenter && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="10"
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="1.5"
                      opacity="0.4"
                      className="animate-ping"
                    />
                  )}
                  
                  {/* Main node */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isCenter ? '7' : '5'}
                    fill={`url(#nodeGradient${node.id})`}
                    className={`transition-all duration-500 ${isPulsing ? 'animate-pulse' : ''}`}
                  />
                </g>
              );
            })}

            {/* Gradient definitions */}
            <defs>
              <radialGradient id="nodeGradient0" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#3B82F6" />
              </radialGradient>
              <radialGradient id="nodeGradient1" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#C4B5FD" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </radialGradient>
              <radialGradient id="nodeGradient2" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#10B981" />
              </radialGradient>
              <radialGradient id="nodeGradient3" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#F59E0B" />
              </radialGradient>
              <radialGradient id="nodeGradient4" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FCA5A5" />
                <stop offset="100%" stopColor="#EF4444" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};
