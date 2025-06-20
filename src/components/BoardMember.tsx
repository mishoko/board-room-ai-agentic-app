import React from 'react';
import { User } from 'lucide-react';

interface BoardMemberProps {
  name: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  message: string;
  isActive: boolean;
}

const BoardMember: React.FC<BoardMemberProps> = ({ name, position, message, isActive }) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'absolute top-4 left-4';
      case 'top-center':
        return 'absolute top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'absolute top-4 right-4';
      case 'middle-left':
        return 'absolute top-1/2 left-4 transform -translate-y-1/2';
      case 'middle-right':
        return 'absolute top-1/2 right-4 transform -translate-y-1/2';
      case 'bottom-left':
        return 'absolute bottom-4 left-4';
      case 'bottom-center':
        return 'absolute bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'absolute bottom-4 right-4';
      default:
        return '';
    }
  };

  const getBubblePosition = () => {
    switch (position) {
      case 'top-left':
        return 'absolute top-20 left-0 w-80';
      case 'top-center':
        return 'absolute top-20 left-1/2 transform -translate-x-1/2 w-80';
      case 'top-right':
        return 'absolute top-20 right-0 w-80';
      case 'middle-left':
        return 'absolute top-1/2 left-20 transform -translate-y-1/2 w-80';
      case 'middle-right':
        return 'absolute top-1/2 right-20 transform -translate-y-1/2 w-80';
      case 'bottom-left':
        return 'absolute bottom-20 left-0 w-80';
      case 'bottom-center':
        return 'absolute bottom-20 left-1/2 transform -translate-x-1/2 w-80';
      case 'bottom-right':
        return 'absolute bottom-20 right-0 w-80';
      default:
        return '';
    }
  };

  const getBubblePointer = () => {
    switch (position) {
      case 'top-left':
        return 'absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45 shadow-sm';
      case 'top-center':
        return 'absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm';
      case 'top-right':
        return 'absolute -top-2 right-8 w-4 h-4 bg-white transform rotate-45 shadow-sm';
      case 'middle-left':
        return 'absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-white rotate-45 shadow-sm';
      case 'middle-right':
        return 'absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-white rotate-45 shadow-sm';
      case 'bottom-left':
        return 'absolute -bottom-2 left-8 w-4 h-4 bg-white transform rotate-45 shadow-sm';
      case 'bottom-center':
        return 'absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm';
      case 'bottom-right':
        return 'absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 shadow-sm';
      default:
        return 'absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45 shadow-sm';
    }
  };

  return (
    <div className={getPositionClasses()}>
      {/* Board Member Avatar */}
      <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
          {name}
        </div>
      </div>

      {/* Speech Bubble */}
      {isActive && message && (
        <div className={getBubblePosition()}>
          <div className="bg-white rounded-lg shadow-xl p-4 relative animate-fadeIn">
            <div className="text-sm text-gray-800 leading-relaxed">
              {message}
            </div>
            {/* Dynamic bubble pointer based on position */}
            <div className={getBubblePointer()}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardMember;