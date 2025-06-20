// Core types for the AI Agentic Boardroom App

export interface Agent {
  id: string;
  role: string;
  name: string;
  persona: string;
  experience: string;
  expertise: string[];
  isActive: boolean;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'active' | 'completed';
  estimatedDuration: number; // in minutes
}

export interface CompanyContext {
  name: string;
  industry: string;
  size: string;
  stage: string;
  description: string;
  challenges: string[];
  goals: string[];
}

export interface Message {
  id: string;
  agentId: string;
  text: string;
  timestamp: Date;
  replyTo?: string;
  topicId: string;
  metadata?: {
    sentiment?: 'positive' | 'neutral' | 'negative';
    confidence?: number;
    keywords?: string[];
  };
}

export interface Timeline {
  id: string;
  topicId: string;
  messages: Message[];
  branches: Timeline[];
  isMainBranch: boolean;
  createdAt: Date;
}

export interface BoardroomSession {
  id: string;
  agents: Agent[];
  topics: Topic[];
  companyContext: CompanyContext;
  timelines: Timeline[];
  currentTopicId?: string;
  status: 'setup' | 'active' | 'paused' | 'completed';
  createdAt: Date;
}

// New types for enhanced topic state tracking
export interface TopicState {
  topicId: string;
  status: 'pending' | 'active' | 'completed';
  messageCount: number;
  participantCount: number;
  startTime: Date | null;
  endTime: Date | null;
  estimatedDuration: number;
  actualDuration: number;
  completionPercentage: number;
  keyMetrics: {
    totalMessages: number;
    agentMessages: number;
    userMessages: number;
    averageMessageLength: number;
    topicRelevanceScore: number;
  };
}

export interface TopicSummary {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  icon: React.ReactNode;
  isCompleted: boolean;
  metrics?: {
    duration: number;
    messageCount: number;
    participantCount: number;
    relevanceScore: number;
  };
}