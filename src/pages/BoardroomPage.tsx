import React, { useState, useEffect } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import BoardroomTable from '../components/BoardroomTable';
import Timeline from '../components/Timeline';
import SummaryPanel from '../components/SummaryPanel';
import { BoardroomSession, Message, Timeline as TimelineType, Topic } from '../types';
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
  const [topicMessages, setTopicMessages] = useState<{[key: string]: Message[]}>({});
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

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
    // User messages are now handled directly in BoardroomTable
  };

  const handleTopicComplete = (topicId: string, messages: Message[]) => {
    console.log(`Topic ${topicId} completed with ${messages.length} messages`);
    
    // Store messages for this topic
    setTopicMessages(prev => ({
      ...prev,
      [topicId]: messages
    }));
    
    // Mark topic as completed
    setCompletedTopics(prev => new Set([...prev, topicId]));
    
    // Update session topics
    setCurrentSession(prev => ({
      ...prev,
      topics: prev.topics.map(topic => 
        topic.id === topicId 
          ? { ...topic, status: 'completed' as const }
          : topic
      )
    }));
    
    // Auto-select next incomplete topic
    const currentTopicIndex = currentSession.topics.findIndex(t => t.id === topicId);
    const nextTopic = currentSession.topics.find((topic, index) => 
      index > currentTopicIndex && !completedTopics.has(topic.id)
    );
    
    if (nextTopic) {
      setTimeout(() => {
        setSelectedTopic(nextTopic.id);
      }, 2000); // 2 second delay before moving to next topic
    }
  };

  // Generate summaries based on actual conversation messages
  const generateSummaries = () => {
    const summaries: { [key: string]: any } = {};
    
    currentSession.topics.forEach(topic => {
      const messages = topicMessages[topic.id] || [];
      const isCompleted = completedTopics.has(topic.id);
      
      if (isCompleted && messages.length > 0) {
        // Generate summary from actual conversation
        const agentMessages = messages.filter(msg => msg.agentId !== 'user');
        const userMessages = messages.filter(msg => msg.agentId === 'user');
        
        const keyPoints = [
          `Discussion involved ${new Set(agentMessages.map(msg => {
            const agent = agents.find(a => a.getAgent().id === msg.agentId);
            return agent?.getAgent().role || 'Unknown';
          })).size} board members`,
          `${agentMessages.length} executive insights shared`,
          userMessages.length > 0 ? `${userMessages.length} stakeholder input(s) received` : 'No additional stakeholder input',
          `Completed in approximately ${Math.ceil(messages.length * 0.5)} minutes`
        ];
        
        // Extract key themes from messages (simple keyword analysis)
        const allText = messages.map(msg => msg.text).join(' ').toLowerCase();
        const themes = [];
        if (allText.includes('strategy') || allText.includes('strategic')) themes.push('Strategic planning discussed');
        if (allText.includes('risk') || allText.includes('challenge')) themes.push('Risk assessment conducted');
        if (allText.includes('budget') || allText.includes('cost') || allText.includes('financial')) themes.push('Financial implications reviewed');
        if (allText.includes('technology') || allText.includes('technical')) themes.push('Technical considerations evaluated');
        
        keyPoints.push(...themes);
        
        summaries[topic.id] = {
          id: topic.id,
          title: topic.title,
          content: `The board completed a comprehensive discussion on ${topic.title.toLowerCase()}. The conversation involved ${agentMessages.length} executive contributions and covered key aspects relevant to ${currentSession.companyContext.name}'s ${currentSession.companyContext.stage} stage in the ${currentSession.companyContext.industry} industry. The discussion addressed strategic, operational, and risk considerations.`,
          keyPoints: keyPoints.slice(0, 6), // Limit to 6 key points
          icon: getTopicIcon(topic.title)
        };
      } else {
        // Placeholder for incomplete topics
        summaries[topic.id] = {
          id: topic.id,
          title: topic.title,
          content: isCompleted 
            ? `Discussion on ${topic.title.toLowerCase()} has been completed but no detailed conversation was recorded.`
            : `Discussion on ${topic.title.toLowerCase()} is pending or in progress.`,
          keyPoints: isCompleted 
            ? ['Discussion completed', 'Summary will be available once conversation data is processed']
            : ['Discussion not yet started', 'Select this topic to begin the conversation'],
          icon: getTopicIcon(topic.title)
        };
      }
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

  // Convert session topics to timeline format with proper status
  const timelineTopics = currentSession.topics.map(topic => ({
    id: topic.id,
    title: topic.title,
    status: completedTopics.has(topic.id) ? 'closed' as const : 'open' as const,
    timestamp: completedTopics.has(topic.id) 
      ? `Completed • ${topicMessages[topic.id]?.length || 0} messages`
      : `${topic.estimatedDuration} min discussion`
  }));

  const summaries = generateSummaries();
  const currentTopicData = selectedTopic ? currentSession.topics.find(t => t.id === selectedTopic) : undefined;

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
              {session.companyContext.industry} • {session.agents.length} executives • {completedTopics.size}/{session.topics.length} topics completed
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
                onTopicComplete={handleTopicComplete}
                agents={agents}
                currentTopic={currentTopicData}
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