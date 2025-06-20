import React, { useState, useEffect } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import BoardroomTable from '../components/BoardroomTable';
import Timeline from '../components/Timeline';
import SummaryPanel from '../components/SummaryPanel';
import { BoardroomSession, Message, Timeline as TimelineType, Topic, TopicState, TopicSummary } from '../types';
import { CEOAgent, CTOAgent, CFOAgent } from '../agents/ExecutiveAgents';
import { BoardAgentBase } from '../agents/BoardAgentBase';
import { TopicStateManager } from '../agents/TopicStateManager';
import { ArrowLeft, TrendingUp, DollarSign, Settings, Target, Users, Briefcase } from 'lucide-react';

interface BoardroomPageProps {
  session: BoardroomSession;
  onBackToSetup: () => void;
}

const BoardroomPage: React.FC<BoardroomPageProps> = ({ session, onBackToSetup }) => {
  const [currentSession, setCurrentSession] = useState<BoardroomSession>(session);
  const [agents, setAgents] = useState<BoardAgentBase[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [stateManager] = useState<TopicStateManager>(new TopicStateManager());
  const [topicStates, setTopicStates] = useState<Map<string, TopicState>>(new Map());

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
    
    // Initialize all topics in state manager
    session.topics.forEach(topic => {
      stateManager.initializeTopic(topic);
    });
    
    // Set first topic as selected by default
    if (session.topics.length > 0) {
      setSelectedTopic(session.topics[0].id);
    }
    
    // Update local state with initial topic states
    setTopicStates(stateManager.getAllTopicStates());
  }, [session, stateManager]);

  const handleUserMessage = async (message: string) => {
    console.log('User message:', message);
    // User messages are now handled directly in BoardroomTable through state manager
  };

  const handleTopicStateChange = (topicId: string, state: TopicState) => {
    console.log(`Topic ${topicId} state changed:`, state);
    
    // Update local topic states
    setTopicStates(prev => new Map(prev.set(topicId, state)));
    
    // Update session topics if completed
    if (state.status === 'completed') {
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
        index > currentTopicIndex && !stateManager.isTopicCompleted(topic.id)
      );
      
      if (nextTopic) {
        setTimeout(() => {
          setSelectedTopic(nextTopic.id);
        }, 2000); // 2 second delay before moving to next topic
      }
    }
  };

  // Generate summaries based on actual conversation data from state manager
  const generateSummaries = (): { [key: string]: TopicSummary } => {
    const summaries: { [key: string]: TopicSummary } = {};
    
    currentSession.topics.forEach(topic => {
      const state = topicStates.get(topic.id);
      const messages = stateManager.getTopicMessages(topic.id);
      const isCompleted = stateManager.isTopicCompleted(topic.id);
      
      if (isCompleted && messages.length > 0 && state) {
        // Generate detailed summary from actual conversation
        const agentMessages = messages.filter(msg => msg.agentId !== 'user');
        const userMessages = messages.filter(msg => msg.agentId === 'user');
        const participants = new Set(messages.map(msg => msg.agentId));
        
        const keyPoints = [
          `${participants.size} participants engaged in discussion`,
          `${agentMessages.length} executive insights shared`,
          userMessages.length > 0 ? `${userMessages.length} stakeholder input(s) received` : 'No additional stakeholder input',
          `Discussion completed in ${state.actualDuration} minutes`,
          `Topic relevance score: ${state.keyMetrics.topicRelevanceScore}%`
        ];
        
        // Extract key themes from messages (enhanced analysis)
        const allText = messages.map(msg => msg.text).join(' ').toLowerCase();
        const themes = [];
        if (allText.includes('strategy') || allText.includes('strategic')) themes.push('Strategic planning discussed');
        if (allText.includes('risk') || allText.includes('challenge')) themes.push('Risk assessment conducted');
        if (allText.includes('budget') || allText.includes('cost') || allText.includes('financial')) themes.push('Financial implications reviewed');
        if (allText.includes('technology') || allText.includes('technical')) themes.push('Technical considerations evaluated');
        if (allText.includes('market') || allText.includes('competition')) themes.push('Market analysis performed');
        if (allText.includes('team') || allText.includes('hiring') || allText.includes('resource')) themes.push('Resource planning addressed');
        
        keyPoints.push(...themes.slice(0, 3)); // Add up to 3 themes
        
        summaries[topic.id] = {
          id: topic.id,
          title: topic.title,
          content: `The board completed a comprehensive discussion on ${topic.title.toLowerCase()}. The conversation involved ${agentMessages.length} executive contributions from ${participants.size - (userMessages.length > 0 ? 1 : 0)} board members${userMessages.length > 0 ? ' plus stakeholder input' : ''}. The discussion addressed key aspects relevant to ${currentSession.companyContext.name}'s ${currentSession.companyContext.stage} stage in the ${currentSession.companyContext.industry} industry, with a focus on strategic, operational, and risk considerations. The topic achieved a ${state.keyMetrics.topicRelevanceScore}% relevance score based on content analysis.`,
          keyPoints: keyPoints.slice(0, 8), // Limit to 8 key points
          icon: getTopicIcon(topic.title),
          isCompleted: true,
          metrics: {
            duration: state.actualDuration,
            messageCount: state.messageCount,
            participantCount: state.participantCount,
            relevanceScore: state.keyMetrics.topicRelevanceScore
          }
        };
      } else {
        // Placeholder for incomplete topics - no content until completed
        summaries[topic.id] = {
          id: topic.id,
          title: topic.title,
          content: '', // Empty content for incomplete topics
          keyPoints: [], // Empty key points for incomplete topics
          icon: getTopicIcon(topic.title),
          isCompleted: false,
          metrics: state ? {
            duration: 0,
            messageCount: state.messageCount,
            participantCount: state.participantCount,
            relevanceScore: state.keyMetrics.topicRelevanceScore
          } : undefined
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

  // Convert session topics to timeline format with individual state tracking
  const timelineTopics = currentSession.topics.map(topic => {
    const state = topicStates.get(topic.id);
    const isCompleted = stateManager.isTopicCompleted(topic.id);
    const messageCount = state?.messageCount || 0;
    
    return {
      id: topic.id,
      title: topic.title,
      status: isCompleted ? 'closed' as const : 'open' as const,
      timestamp: isCompleted 
        ? `Completed • ${messageCount} messages • ${state?.actualDuration || 0}min`
        : state?.status === 'active'
          ? `Active • ${messageCount} messages • ${state?.completionPercentage || 0}%`
          : `${topic.estimatedDuration} min discussion`
    };
  });

  const summaries = generateSummaries();
  const currentTopicData = selectedTopic ? currentSession.topics.find(t => t.id === selectedTopic) : undefined;
  const progressReport = stateManager.getProgressReport();

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
              {session.companyContext.industry} • {session.agents.length} executives • {progressReport.completedTopics}/{progressReport.totalTopics} topics completed
            </p>
            {progressReport.totalTopics > 0 && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                    style={{ width: `${progressReport.overallProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-slate-400">{progressReport.overallProgress}%</span>
              </div>
            )}
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
                onTopicStateChange={handleTopicStateChange}
                agents={agents}
                currentTopic={currentTopicData}
                stateManager={stateManager}
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