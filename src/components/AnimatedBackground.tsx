import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated geometric shapes representing AI/ML concepts */}
      <div className="absolute inset-0">
        {/* Floating nodes */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-500/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-indigo-500/20 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-cyan-500/20 rounded-full animate-bounce delay-500"></div>
        
        {/* Neural network lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.3}} />
              <stop offset="100%" style={{stopColor: '#8B5CF6', stopOpacity: 0.1}} />
            </linearGradient>
          </defs>
          <line x1="25%" y1="25%" x2="75%" y2="33%" stroke="url(#lineGradient)" strokeWidth="1">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="33%" y1="66%" x2="66%" y2="25%" stroke="url(#lineGradient)" strokeWidth="1">
            <animate attributeName="opacity" values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="75%" y1="75%" x2="25%" y2="50%" stroke="url(#lineGradient)" strokeWidth="1">
            <animate attributeName="opacity" values="0.1;0.2;0.1" dur="5s" repeatCount="indefinite" />
          </line>
        </svg>
        
        {/* Floating data particles */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-1 bg-blue-400/30 rounded-full animate-ping"></div>
        </div>
        <div className="absolute top-1/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-1 bg-purple-400/30 rounded-full animate-ping delay-1000"></div>
        </div>
        <div className="absolute bottom-1/3 right-1/4 transform translate-x-1/2 translate-y-1/2">
          <div className="w-1 h-1 bg-indigo-400/30 rounded-full animate-ping delay-2000"></div>
        </div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95"></div>
    </div>
  );
};

export default AnimatedBackground;