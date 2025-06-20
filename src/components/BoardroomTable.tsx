import React, { useState, useEffect } from 'react';
import BoardMember from './BoardMember';
import { Users, User, Pause, Play, MessageSquare, Send } from 'lucide-react';
import { BoardAgentBase } from '../agents/BoardAgentBase';
import { Topic, Message } from '../types';

interface BoardroomTableProps {
  onUserMessage?: (message: string) => void;
  agents?: BoardAgentBase[];
  currentTopic?: Topic;
}

const BoardroomTable: React.FC<BoardroomTableProps> = ({ 
  onUserMessage, 
  agents = [], 
  currentTopic 
}) => {
  const [activeMembers, setActiveMembers] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isInterrupting, setIsInterrupting] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [currentMessages, setCurrentMessages] = useState<{[key: string]: string}>({});

  // Enhanced conversation system using agents
  useEffect(() => {
    if (isPaused || isInterrupting || agents.length === 0 || !currentTopic) return;

    const interval = setInterval(async () => {
      // Select a random agent to speak
      const availableAgents = agents.filter(agent => agent.getAgent().isActive);
      if (availableAgents.length === 0) return;

      const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
      
      // Check if agent should respond based on context
      const recentMessages: Message[] = []; // TODO: Implement message history
      const shouldRespond = randomAgent.shouldRespond(recentMessages, currentTopic);
      
      if (shouldRespond) {
        try {
          // Generate contextual response
          const response = await randomAgent.generateResponse('', {
            recentMessages,
            topic: currentTopic
          });
          
          setActiveMembers([randomAgent.getAgent().role]);
          setCurrentMessages(prev => ({
            ...prev,
            [randomAgent.getAgent().role]: response
          }));
          
          // Create message object for history
          const message: Message = {
            id: `msg-${Date.now()}`,
            agentId: randomAgent.getAgent().id,
            text: response,
            timestamp: new Date(),
            topicId: currentTopic.id
          };
          
          // Add to agent's conversation history
          randomAgent.addToHistory(message);
          
        } catch (error) {
          console.error('Error generating agent response:', error);
        }
      } else {
        // Clear active members if no one should speak
        setActiveMembers([]);
      }
    }, 4000); // Slightly longer interval for more realistic conversation

    return () => clearInterval(interval);
  }, [isPaused, isInterrupting, agents, currentTopic]);

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
    if (userMessage.trim() && currentTopic) {
      if (onUserMessage) {
        onUserMessage(userMessage);
      }
      
      // TODO: Process user message through agents and generate responses
      // This is where the agentic branching will happen
      
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

      {/* Current Topic Indicator */}
      {currentTopic && (
        <div className="absolute top-4 left-4 z-20">
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/30 text-purple-200">
            Topic: {currentTopic.title}
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
            isActive={activeMembers.includes(agent.getAgent().role) && !isPaused && !isInterrupting}
          />
        ))}

        {/* Control Panel - Bottom Right */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
          <button
            onClick={handlePauseToggle}
            disabled={isInterrupting}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${isPaused 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
              }
              ${isInterrupting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button
            onClick={handleInterrupt}
            disabled={isInterrupting}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30
              ${isInterrupting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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