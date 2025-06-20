import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  status: 'open' | 'closed';
  timestamp: string;
}

interface TimelineProps {
  topics: Topic[];
  onTopicClick: (topicId: string) => void;
  selectedTopic: string | null;
}

const Timeline: React.FC<TimelineProps> = ({ topics, onTopicClick, selectedTopic }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Discussion Timeline</h2>
      </div>
      
      <div className="space-y-3">
        {topics.map((topic, index) => (
          <div
            key={topic.id}
            onClick={() => onTopicClick(topic.id)}
            className={`
              relative flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200
              ${topic.status === 'open' 
                ? 'bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30' 
                : 'bg-green-500/20 border border-green-500/30 hover:bg-green-500/30'
              }
              ${selectedTopic === topic.id ? 'ring-2 ring-white/50' : ''}
            `}
          >
            {/* Timeline connector */}
            {index < topics.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-slate-600"></div>
            )}
            
            {/* Status icon */}
            <div className={`
              w-4 h-4 rounded-full flex-shrink-0
              ${topic.status === 'open' ? 'bg-blue-400' : 'bg-green-400'}
            `}>
              {topic.status === 'closed' && (
                <CheckCircle className="w-4 h-4 text-green-800" />
              )}
            </div>
            
            {/* Topic content */}
            <div className="flex-1 min-w-0">
              <h3 className={`
                font-medium text-sm
                ${topic.status === 'open' ? 'text-blue-100' : 'text-green-100'}
              `}>
                {topic.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{topic.timestamp}</p>
            </div>
            
            {/* Status badge */}
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${topic.status === 'open' 
                ? 'bg-blue-500/30 text-blue-200' 
                : 'bg-green-500/30 text-green-200'
              }
            `}>
              {topic.status === 'open' ? 'Active' : 'Closed'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;