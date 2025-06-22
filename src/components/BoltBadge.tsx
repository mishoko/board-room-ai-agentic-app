import React, { useState } from 'react';

interface BoltBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'bottom-right' | 'custom';
}

const BoltBadge: React.FC<BoltBadgeProps> = ({ 
  className = '', 
  size = 'md',
  position = 'top-right'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Size configurations
  const sizeClasses = {
    sm: 'w-16 h-16 md:w-20 md:h-20',
    md: 'w-20 h-20 md:w-24 md:h-24',
    lg: 'w-24 h-24 md:w-32 md:h-32'
  };

  // Position configurations
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'custom': ''
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <a 
        href="https://bolt.new/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block transition-all duration-300 hover:shadow-2xl hover:scale-105 group"
        title="Built with Bolt.new"
      >
        {!imageError ? (
          <img 
            src="/assets/white_circle_360x360.png"
            alt="Built with Bolt.new badge" 
            className={`
              ${sizeClasses[size]} 
              rounded-full 
              shadow-lg 
              transition-all 
              duration-300 
              group-hover:shadow-xl
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          // Fallback text badge if image fails to load
          <div className={`
            ${sizeClasses[size]} 
            rounded-full 
            bg-white 
            shadow-lg 
            flex 
            items-center 
            justify-center 
            text-black 
            font-bold 
            text-xs 
            md:text-sm
            transition-all 
            duration-300 
            group-hover:shadow-xl
          `}>
            <span className="text-center leading-tight">
              Built with<br />Bolt.new
            </span>
          </div>
        )}
      </a>
    </div>
  );
};

export default BoltBadge;
