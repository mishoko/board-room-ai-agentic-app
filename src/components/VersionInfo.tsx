import React, { useState } from 'react';
import { Info, GitBranch, Calendar, Package, X } from 'lucide-react';
import { getVersionInfo, getLongVersion, getFullVersionString, isDevelopment } from '../version';

interface VersionInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const VersionInfo: React.FC<VersionInfoProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const versionInfo = getVersionInfo();
  const buildDate = new Date(versionInfo.buildDate);
  const daysSinceBuild = Math.floor((Date.now() - versionInfo.buildTimestamp) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Version Information</h2>
              <p className="text-sm text-slate-400">AI Agentic Boardroom Interface</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Version Details */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">Version Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Version:</span>
                <span className="text-white font-mono">v{versionInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Major.Minor.Patch:</span>
                <span className="text-white font-mono">
                  {versionInfo.major}.{versionInfo.minor}.{versionInfo.patch}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Environment:</span>
                <span className={`font-medium ${isDevelopment ? 'text-amber-400' : 'text-green-400'}`}>
                  {isDevelopment ? 'Development' : 'Production'}
                </span>
              </div>
            </div>
          </div>

          {/* Build Information */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-200">Build Information</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Build Date:</span>
                <span className="text-white">{buildDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Build Time:</span>
                <span className="text-white">{buildDate.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Build Age:</span>
                <span className="text-white">
                  {daysSinceBuild === 0 ? 'Today' : `${daysSinceBuild} day${daysSinceBuild !== 1 ? 's' : ''} ago`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-white font-mono text-xs">{versionInfo.buildTimestamp}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-slate-200">Key Features</span>
            </div>
            <ul className="space-y-1 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Real-time AI executive agents</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Dynamic conversation pacing</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Sophisticated C-level expertise</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Advanced topic state management</span>
              </li>
            </ul>
          </div>

          {/* Full Version String */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-mono">
              {getFullVersionString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionInfo;