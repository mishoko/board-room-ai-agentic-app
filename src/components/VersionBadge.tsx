import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { getShortVersion, isDevelopment } from '../version';
import VersionInfo from './VersionInfo';

const VersionBadge: React.FC = () => {
  const [showVersionInfo, setShowVersionInfo] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowVersionInfo(true)}
        className={`
          fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
          transition-all duration-200 hover:scale-105 shadow-lg
          ${isDevelopment 
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' 
            : 'bg-slate-800/80 text-slate-300 border border-slate-600/50 hover:bg-slate-700/80'
          }
          backdrop-blur-sm
        `}
        title="Click to view version information"
      >
        <Package className="w-3 h-3" />
        <span>v{getShortVersion()}</span>
        {isDevelopment && (
          <span className="text-amber-400 text-xs">DEV</span>
        )}
      </button>

      <VersionInfo 
        isOpen={showVersionInfo} 
        onClose={() => setShowVersionInfo(false)} 
      />
    </>
  );
};

export default VersionBadge;