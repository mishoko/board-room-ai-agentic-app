import React, { useState, useEffect } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import BoardroomTable from '../components/BoardroomTable';
import Timeline from '../components/Timeline';
import SummaryPanel from '../components/SummaryPanel';
import { BoardroomSession, Message, Timeline as TimelineType } from '../types';
import { CEOAgent, CTOAgent, CFOAgent } from '../agents/ExecutiveAgents';
import { BoardAgentBase } from '../agents/BoardAgentBase';
import { ArrowLeft, TrendingUp, DollarSign, Settings, Target, Users, Briefcase } from 'lucide-react';

interface BoardroomPageProps {
  session: BoardroomSession;
  onBackToSetup: () => void;
}

const BoardroomPage: React.FC<BoardroomPageProps> = ({ session, onBackToSetup }) => {
  const [currentSession, setCurrentSession] = useState<BoardroomSession>(session);
  const [agents, setAgents] = useState<BoardAgentBase[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Initialize agents based on session configuration
  useEffect(() => {
    const initializedAgents: BoardAgentBase[] = [];
    
    session.agents.forEach(agentConfig => {
      let agent: BoardAgentBase;
      
      switch (agentConfig.role) {
        case 'CEO':
          agent = new CEOAgent(agentConfig, session.companyContext);
          break;
        case 'CTO':
          agent = new CTOAgent(agentConfig, session.companyContext);
          break;
        case 'CFO':
          agent = new CFOAgent(agentConfig, session.companyContext);
          break;
        default:
          // For other roles, use CEO as base (can be extended later)
          agent = new CEOAgent(agentConfig, session.companyContext);
          break;
      }
      
      initializedAgents.push(agent);
    });
    
    setAgents(initializedAgents);
    
    // Set first topic as selected by default
    if (session.topics.length > 0) {
      setSelectedTopic(session.topics[0].id);
    }
  }, [session]);

  const handleUserMessage = async (message: string) => {
    console.log('User message:', message);
    
    // TODO: Implement sophisticated conversation branching
    // This is where we'll integrate the agentic system to:
    // 1. Process user input
    // 2. Update conversation context
    // 3. Generate agent responses
    // 4. Create timeline branches
    
    // For now, just log the message
    // Later this will trigger agent responses and timeline updates
  };

  // Generate sample summaries based on session topics
  const generateSummaries = () => {
    const summaries: { [key: string]: any } = {};
    
    session.topics.forEach(topic => {
      summaries[topic.id] = {
        id: topic.id,
        title: topic.title,
        content: `The board discussed ${topic.title.toLowerCase()} with focus on ${session.companyContext.industry} industry challenges. Key considerations included the company's ${session.companyContext.stage} stage and current market position.`,
        keyPoints: [
          `Aligned with ${session.companyContext.name}'s strategic goals`,
          `Considered industry-specific challenges in ${session.companyContext.industry}`,
          `Evaluated resource requirements and timeline`,
          `Discussed potential risks and mitigation strategies`
        ],
        icon: getTopicIcon(topic.title)
      };
    });
    
    return summaries;
  };

  const getTopicIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('growth') || lowerTitle.includes('strategy')) {
      return <TrendingUp className="w-5 h-5 text-purple-400" />;
    } else if (lowerTitle.includes('budget') || lowerTitle.includes('financial')) {
      return <DollarSign className="w-5 h-5 text-purple-400" />;
    } else if (lowerTitle.includes('technology') || lowerTitle.includes('infrastructure')) {
      return <Settings className="w-5 h-5 text-purple-400" />;
    } else if (lowerTitle.includes('team') || lowerTitle.includes('hiring')) {
      return <Users className="w-5 h-5 text-purple-400" />;
    } else {
      return <Target className="w-5 h-5 text-purple-400" />;
    }
  };

  // Convert session topics to timeline format
  const timelineTopics = session.topics.map(topic => ({
    id: topic.id,
    title: topic.title,
    status: topic.status === 'completed' ? 'closed' as const : 'open' as const,
    timestamp: `${topic.estimatedDuration} min discussion`
  }));

  const summaries = generateSummaries();

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBackToSetup}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Setup
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              {session.companyContext.name} Boardroom
            </h1>
            <p className="text-slate-300">
              {session.companyContext.industry} • {session.agents.length} executives • {session.topics.length} topics
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-sm">{session.companyContext.stage}</span>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Boardroom Table */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <BoardroomTable 
                onUserMessage={handleUserMessage}
                agents={agents}
                currentTopic={selectedTopic ? session.topics.find(t => t.id === selectedTopic) : undefined}
              />
            </div>
          </div>

          {/* Bottom Section: Timeline and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline */}
            <div>
              <Timeline
                topics={timelineTopics}
                onTopicClick={setSelectedTopic}
                selectedTopic={selectedTopic}
              />
            </div>

            {/* Summary Panel */}
            <div>
              <SummaryPanel
                selectedTopicId={selectedTopic}
                summaries={summaries}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardroomPage;