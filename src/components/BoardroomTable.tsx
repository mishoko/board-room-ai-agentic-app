import React, { useState, useEffect } from 'react';
import BoardMember from './BoardMember';
import { Users, User, Pause, Play, MessageSquare, Send } from 'lucide-react';
import { BoardAgentBase } from '../agents/BoardAgentBase';
import { Topic, Message, TopicState } from '../types';
import { TopicStateManager } from '../agents/TopicStateManager';

interface BoardroomTableProps {
  onUserMessage?: (message: string) => void;
  onTopicStateChange?: (topicId: string, state: TopicState) => void;
  agents?: BoardAgentBase[];
  currentTopic?: Topic;
  stateManager?: TopicStateManager;
}

const BoardroomTable: React.FC<BoardroomTableProps> = ({ 
  onUserMessage, 
  onTopicStateChange,
  agents = [], 
  currentTopic,
  stateManager
}) => {
  const [activeMembers, setActiveMembers] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isInterrupting, setIsInterrupting] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [currentMessages, setCurrentMessages] = useState<{[key: string]: string}>({});
  const [topicState, setTopicState] = useState<TopicState | null>(null);
  const [messageDurations, setMessageDurations] = useState<{[key: string]: number}>({});

  // Calculate display duration based on message length
  const calculateMessageDuration = (message: string): number => {
    const baseTime = 2000; // 2 seconds minimum
    const wordsPerMinute = 200; // Average reading speed
    const words = message.trim().split(/\s+/).length;
    const readingTime = (words / wordsPerMinute) * 60 * 1000; // Convert to milliseconds
    
    // Ensure minimum 2 seconds, maximum 15 seconds
    const duration = Math.max(baseTime, Math.min(readingTime * 1.5, 15000));
    
    return duration;
  };

  // Initialize topic in state manager when topic changes
  useEffect(() => {
    if (currentTopic && stateManager) {
      // Initialize topic if not already tracked
      let state = stateManager.getTopicState(currentTopic.id);
      if (!state) {
        stateManager.initializeTopic(currentTopic);
        state = stateManager.getTopicState(currentTopic.id);
      }
      
      // Start topic if it's pending
      if (state && state.status === 'pending') {
        stateManager.startTopic(currentTopic.id);
        state = stateManager.getTopicState(currentTopic.id);
      }
      
      setTopicState(state);
      setCurrentMessages({});
      setActiveMembers([]);
      setMessageDurations({});
      
      // Register completion callback
      if (state && onTopicStateChange) {
        stateManager.onTopicComplete(currentTopic.id, (topicId, completedState) => {
          setTopicState(completedState);
          onTopicStateChange(topicId, completedState);
        });
      }
    }
  }, [currentTopic?.id, stateManager, onTopicStateChange]);

  // Enhanced conversation system with state manager integration and dynamic durations
  useEffect(() => {
    if (isPaused || isInterrupting || agents.length === 0 || !currentTopic || !stateManager) return;
    
    const currentState = stateManager.getTopicState(currentTopic.id);
    if (!currentState || currentState.status === 'completed') return;

    const interval = setInterval(async () => {
      // Check current state before proceeding
      const latestState = stateManager.getTopicState(currentTopic.id);
      if (!latestState || latestState.status === 'completed') {
        setActiveMembers([]);
        return;
      }

      // Select a random agent to speak
      const availableAgents = agents.filter(agent => agent.getAgent().isActive);
      if (availableAgents.length === 0) return;

      const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
      
      // Check if agent should respond based on context
      const recentMessages = stateManager.getTopicMessages(currentTopic.id).slice(-3);
      const shouldRespond = randomAgent.shouldRespond(recentMessages, currentTopic);
      
      if (shouldRespond) {
        try {
          // Generate contextual response
          const response = await randomAgent.generateResponse('', {
            recentMessages,
            topic: currentTopic
          });
          
          // Calculate duration for this specific message
          const duration = calculateMessageDuration(response);
          
          setActiveMembers([randomAgent.getAgent().role]);
          setCurrentMessages(prev => ({
            ...prev,
            [randomAgent.getAgent().role]: response
          }));
          
          // Store the duration for this agent's message
          setMessageDurations(prev => ({
            ...prev,
            [randomAgent.getAgent().role]: duration
          }));
          
          // Create message object
          const message: Message = {
            id: `msg-${Date.now()}`,
            agentId: randomAgent.getAgent().id,
            text: response,
            timestamp: new Date(),
            topicId: currentTopic.id
          };
          
          // Add message to state manager
          stateManager.addMessage(currentTopic.id, message);
          
          // Update local state
          const updatedState = stateManager.getTopicState(currentTopic.id);
          setTopicState(updatedState);
          
          // Add to agent's conversation history
          randomAgent.addToHistory(message);
          
          // Clear active member after calculated duration
          setTimeout(() => {
            setActiveMembers(prev => prev.filter(member => member !== randomAgent.getAgent().role));
            setCurrentMessages(prev => {
              const updated = { ...prev };
              delete updated[randomAgent.getAgent().role];
              return updated;
            });
            setMessageDurations(prev => {
              const updated = { ...prev };
              delete updated[randomAgent.getAgent().role];
              return updated;
            });
          }, duration);
          
        } catch (error) {
          console.error('Error generating agent response:', error);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, isInterrupting, agents, currentTopic, stateManager]);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      setActiveMembers([]);
    }
  };

  const handleInterrupt = () => {
    setIsInterrupting(true);
    setIsPaused(true);
    setActiveMembers([]);
  };

  const handleSendMessage = async () => {
    if (userMessage.trim() && currentTopic && stateManager) {
      // Create user message
      const userMsg: Message = {
        id: `msg-user-${Date.now()}`,
        agentId: 'user',
        text: userMessage,
        timestamp: new Date(),
        topicId: currentTopic.id
      };
      
      // Add message to state manager
      stateManager.addMessage(currentTopic.id, userMsg);
      
      // Update local state
      const updatedState = stateManager.getTopicState(currentTopic.id);
      setTopicState(updatedState);
      
      if (onUserMessage) {
        onUserMessage(userMessage);
      }
      
      setUserMessage('');
      setIsInterrupting(false);
      setIsPaused(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCancelInterrupt = () => {
    setUserMessage('');
    setIsInterrupting(false);
    setIsPaused(false);
  };

  // Get positions for agents (distribute around table)
  const getAgentPosition = (index: number, total: number): 'top-left' | 'top-center' | 'top-right' => {
    if (total === 1) return 'top-center';
    if (total === 2) return index === 0 ? 'top-left' : 'top-right';
    
    // For 3+ agents, distribute evenly
    const positions: ('top-left' | 'top-center' | 'top-right')[] = ['top-left', 'top-center', 'top-right'];
    return positions[index % 3];
  };

  const isTopicCompleted = topicState?.status === 'completed';

  return (
    <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
      {/* Status Indicator */}
      {(isPaused || isInterrupting) && (
        <div className="absolute top-4 right-4 z-20">
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${isPaused && !isInterrupting 
              ? 'bg-amber-500/30 text-amber-200' 
              : 'bg-blue-500/30 text-blue-200'
            }
          `}>
            {isInterrupting ? 'Waiting for your input...' : 'Conversation paused'}
          </div>
        </div>
      )}

      {/* Current Topic Indicator with Progress */}
      {currentTopic && topicState && (
        <div className="absolute top-4 left-4 z-20">
          <div className="space-y-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isTopicCompleted
                ? 'bg-green-500/30 text-green-200' 
                : topicState.status === 'active'
                  ? 'bg-purple-500/30 text-purple-200'
                  : 'bg-slate-500/30 text-slate-300'
            }`}>
              Topic: {currentTopic.title} {isTopicCompleted ? '(Completed)' : ''}
            </div>
            {!isTopicCompleted && (
              <div className="bg-slate-800/50 rounded-full px-3 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-400 transition-all duration-1000"
                      style={{ width: `${topicState.completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-300">
                    {topicState.messageCount} msgs • {topicState.completionPercentage}%
                  </span>
                </div>
              </div>
            )}
            {isTopicCompleted && (
              <div className="bg-green-500/20 rounded-full px-3 py-1">
                <span className="text-xs text-green-300">
                  Completed in {topicState.actualDuration}min • {topicState.messageCount} messages
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Poker Table Surface */}
      <div className="relative h-96 bg-gradient-to-br from-green-800/30 to-green-900/30 rounded-full border-8 border-amber-700/50 shadow-inner">
        {/* Table felt pattern */}
        <div className="absolute inset-4 bg-gradient-to-br from-green-700/20 to-green-800/20 rounded-full"></div>
        
        {/* Center logo/emblem */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-20 h-20 bg-slate-800/70 rounded-full flex items-center justify-center border-2 border-amber-600/50">
            <Users className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        {/* Board Members */}
        {agents.slice(0, 3).map((agent, index) => (
          <BoardMember
            key={agent.getAgent().id}
            name={agent.getAgent().role}
            position={getAgentPosition(index, Math.min(agents.length, 3))}
            message={currentMessages[agent.getAgent().role] || ''}
            isActive={activeMembers.includes(agent.getAgent().role) && !isPaused && !isInterrupting && !isTopicCompleted}
          />
        ))}

        {/* Control Panel - Bottom Right */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
          <button
            onClick={handlePauseToggle}
            disabled={isInterrupting || isTopicCompleted}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${isPaused 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
              }
              ${(isInterrupting || isTopicCompleted) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button
            onClick={handleInterrupt}
            disabled={isInterrupting || isTopicCompleted}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30
              ${(isInterrupting || isTopicCompleted) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <MessageSquare className="w-4 h-4" />
            Comment
          </button>
        </div>
      </div>

      {/* User Position (Bottom Center) */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white text-xs px-3 py-1 rounded-full">
          You
        </div>
      </div>

      {/* User Input Modal */}
      {isInterrupting && (
        <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-30">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-600 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Add Your Comment</h3>
            </div>
            
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts with the board..."
              className="w-full h-24 bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              autoFocus
            />
            
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={handleCancelInterrupt}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!userMessage.trim()}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${userMessage.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardroomTable;