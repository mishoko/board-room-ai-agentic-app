import React from 'react';
import { FileText, TrendingUp, DollarSign, Settings, Clock, Users, MessageSquare } from 'lucide-react';
import { TopicSummary } from '../types';

interface SummaryPanelProps {
  selectedTopicId: string | null;
  summaries: { [key: string]: TopicSummary };
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ selectedTopicId, summaries }) => {
  const currentSummary = selectedTopicId ? summaries[selectedTopicId] : null;

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50 shadow-xl h-full">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Discussion Summary</h2>
      </div>
      
      {currentSummary ? (
        <div className="space-y-6">
          {/* Summary header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              {currentSummary.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">{currentSummary.title}</h3>
              <div className="flex items-center gap-4 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currentSummary.isCompleted 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {currentSummary.isCompleted ? 'Completed' : 'In Progress'}
                </span>
                {currentSummary.metrics && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{currentSummary.metrics.duration}min</span>
                    <MessageSquare className="w-3 h-3 ml-1" />
                    <span>{currentSummary.metrics.messageCount}</span>
                    <Users className="w-3 h-3 ml-1" />
                    <span>{currentSummary.metrics.participantCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Summary content - only show for completed topics */}
          {currentSummary.isCompleted ? (
            <>
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-300 leading-relaxed">
                  {currentSummary.content}
                </p>
              </div>
              
              {/* Key points */}
              <div>
                <h4 className="text-sm font-medium text-slate-200 mb-3">Key Points Discussed</h4>
                <ul className="space-y-2">
                  {currentSummary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metrics section for completed topics */}
              {currentSummary.metrics && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-200 mb-3">Discussion Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{currentSummary.metrics.duration}min</div>
                      <div className="text-xs text-slate-400">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{currentSummary.metrics.messageCount}</div>
                      <div className="text-xs text-slate-400">Messages</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{currentSummary.metrics.participantCount}</div>
                      <div className="text-xs text-slate-400">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{currentSummary.metrics.relevanceScore}%</div>
                      <div className="text-xs text-slate-400">Relevance</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Placeholder for incomplete topics */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">Discussion In Progress</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                The summary will be available once the discussion on "{currentSummary.title}" is completed.
              </p>
              {currentSummary.metrics && (
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span>{currentSummary.metrics.messageCount} messages so far</span>
                  <span>•</span>
                  <span>{currentSummary.metrics.participantCount} participants</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">Select a Topic</h3>
          <p className="text-sm text-slate-400">
            Click on any topic in the timeline to view its discussion summary
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;