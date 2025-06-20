import { Topic, Message, TopicState } from '../types';

export class TopicStateManager {
  private topicStates: Map<string, TopicState> = new Map();
  private topicMessages: Map<string, Message[]> = new Map();
  private topicStartTimes: Map<string, Date> = new Map();
  private completionCallbacks: Map<string, (topicId: string, state: TopicState) => void> = new Map();

  constructor() {
    this.initializeManager();
  }

  private initializeManager(): void {
    console.log('TopicStateManager initialized');
  }

  // Initialize a topic for tracking
  public initializeTopic(topic: Topic): void {
    const initialState: TopicState = {
      topicId: topic.id,
      status: 'pending',
      messageCount: 0,
      participantCount: 0,
      startTime: null,
      endTime: null,
      estimatedDuration: topic.estimatedDuration,
      actualDuration: 0,
      completionPercentage: 0,
      keyMetrics: {
        totalMessages: 0,
        agentMessages: 0,
        userMessages: 0,
        averageMessageLength: 0,
        topicRelevanceScore: 0
      }
    };

    this.topicStates.set(topic.id, initialState);
    this.topicMessages.set(topic.id, []);
    
    console.log(`Topic ${topic.id} initialized for tracking (${topic.estimatedDuration} minutes)`);
  }

  // Start tracking a topic
  public startTopic(topicId: string): void {
    const state = this.topicStates.get(topicId);
    if (!state) {
      console.error(`Topic ${topicId} not found in state manager`);
      return;
    }

    const updatedState: TopicState = {
      ...state,
      status: 'active',
      startTime: new Date(),
      completionPercentage: 0
    };

    this.topicStates.set(topicId, updatedState);
    this.topicStartTimes.set(topicId, new Date());
    
    console.log(`Topic ${topicId} started tracking (${state.estimatedDuration} min duration)`);
  }

  // Add a message to topic tracking
  public addMessage(topicId: string, message: Message): void {
    const state = this.topicStates.get(topicId);
    const messages = this.topicMessages.get(topicId);
    
    if (!state || !messages) {
      console.error(`Topic ${topicId} not found in state manager`);
      return;
    }

    // Add message to collection
    messages.push(message);
    this.topicMessages.set(topicId, messages);

    // Update state metrics
    const isUserMessage = message.agentId === 'user';
    const participants = new Set(messages.map(msg => msg.agentId));
    
    const updatedState: TopicState = {
      ...state,
      messageCount: messages.length,
      participantCount: participants.size,
      keyMetrics: {
        totalMessages: messages.length,
        agentMessages: messages.filter(msg => msg.agentId !== 'user').length,
        userMessages: messages.filter(msg => msg.agentId === 'user').length,
        averageMessageLength: messages.reduce((sum, msg) => sum + msg.text.length, 0) / messages.length,
        topicRelevanceScore: this.calculateRelevanceScore(messages, topicId)
      }
    };

    // Update completion percentage based on duration and message targets
    updatedState.completionPercentage = this.calculateCompletionPercentage(updatedState);

    this.topicStates.set(topicId, updatedState);

    // Check if topic should be completed based on duration-aware criteria
    if (this.shouldCompleteTopic(updatedState)) {
      this.completeTopic(topicId);
    }

    console.log(`Message added to topic ${topicId} (${state.estimatedDuration}min). Total messages: ${messages.length}`);
  }

  // Calculate topic relevance score based on content analysis
  private calculateRelevanceScore(messages: Message[], topicId: string): number {
    if (messages.length === 0) return 0;

    // Simple relevance scoring based on message content
    // In a real implementation, this could use NLP or keyword matching
    const totalWords = messages.reduce((sum, msg) => sum + msg.text.split(' ').length, 0);
    const averageWordsPerMessage = totalWords / messages.length;
    
    // Score based on message depth and engagement
    let score = Math.min(100, (averageWordsPerMessage / 20) * 100);
    
    // Bonus for multiple participants
    const participants = new Set(messages.map(msg => msg.agentId));
    if (participants.size > 2) score += 10;
    if (participants.size > 3) score += 10;
    
    return Math.round(score);
  }

  // Enhanced completion percentage calculation based on duration and message targets
  private calculateCompletionPercentage(state: TopicState): number {
    // Calculate target messages based on duration (similar to BoardroomTable logic)
    const getTargetMessages = (duration: number): number => {
      if (duration <= 5) return Math.max(4, duration * 1);
      if (duration <= 10) return duration * 1.2;
      if (duration <= 20) return duration * 0.8;
      return duration * 0.6;
    };

    const targetMessages = getTargetMessages(state.estimatedDuration);
    const messageWeight = Math.min(100, (state.messageCount / targetMessages) * 70); // 70% weight for messages
    
    let timeWeight = 0;
    if (state.startTime) {
      const elapsedMinutes = (Date.now() - state.startTime.getTime()) / (1000 * 60);
      timeWeight = Math.min(100, (elapsedMinutes / state.estimatedDuration) * 30); // 30% weight for time
    }
    
    return Math.round(messageWeight + timeWeight);
  }

  // Enhanced completion criteria based on duration-aware targets
  private shouldCompleteTopic(state: TopicState): boolean {
    if (state.status !== 'active') return false;
    
    // Calculate dynamic targets based on duration
    const getTargetMessages = (duration: number): number => {
      if (duration <= 5) return Math.max(4, duration * 1);
      if (duration <= 10) return duration * 1.2;
      if (duration <= 20) return duration * 0.8;
      return duration * 0.6;
    };

    const targetMessages = getTargetMessages(state.estimatedDuration);
    const hasReachedMessageTarget = state.messageCount >= targetMessages;
    const hasReachedTimeThreshold = state.completionPercentage >= 85;
    const hasMaxMessages = state.messageCount >= Math.max(targetMessages * 1.5, 15); // Cap at 1.5x target or 15 messages
    
    console.log(`📊 Topic completion check (${state.estimatedDuration}min):
      Target messages: ${targetMessages} | Current: ${state.messageCount}
      Completion: ${state.completionPercentage}% | Max messages: ${Math.max(targetMessages * 1.5, 15)}`);
    
    return hasReachedMessageTarget && (hasReachedTimeThreshold || hasMaxMessages);
  }

  // Complete a topic
  public completeTopic(topicId: string): void {
    const state = this.topicStates.get(topicId);
    if (!state) {
      console.error(`Topic ${topicId} not found in state manager`);
      return;
    }

    const endTime = new Date();
    const actualDuration = state.startTime 
      ? (endTime.getTime() - state.startTime.getTime()) / (1000 * 60)
      : 0;

    const completedState: TopicState = {
      ...state,
      status: 'completed',
      endTime,
      actualDuration: Math.round(actualDuration * 10) / 10, // Round to 1 decimal
      completionPercentage: 100
    };

    this.topicStates.set(topicId, completedState);
    
    // Trigger completion callback if registered
    const callback = this.completionCallbacks.get(topicId);
    if (callback) {
      callback(topicId, completedState);
    }

    console.log(`Topic ${topicId} completed (${state.estimatedDuration}min planned). Duration: ${actualDuration.toFixed(1)} minutes, Messages: ${state.messageCount}`);
  }

  // Register completion callback
  public onTopicComplete(topicId: string, callback: (topicId: string, state: TopicState) => void): void {
    this.completionCallbacks.set(topicId, callback);
  }

  // Get topic state
  public getTopicState(topicId: string): TopicState | null {
    return this.topicStates.get(topicId) || null;
  }

  // Get topic messages
  public getTopicMessages(topicId: string): Message[] {
    return this.topicMessages.get(topicId) || [];
  }

  // Get all topic states
  public getAllTopicStates(): Map<string, TopicState> {
    return new Map(this.topicStates);
  }

  // Check if topic is completed
  public isTopicCompleted(topicId: string): boolean {
    const state = this.topicStates.get(topicId);
    return state?.status === 'completed' || false;
  }

  // Get completion summary for a topic
  public getTopicSummary(topicId: string): {
    isCompleted: boolean;
    messageCount: number;
    duration: number;
    participants: number;
    relevanceScore: number;
    targetMessages?: number;
  } | null {
    const state = this.topicStates.get(topicId);
    if (!state) return null;

    // Calculate target messages for context
    const getTargetMessages = (duration: number): number => {
      if (duration <= 5) return Math.max(4, duration * 1);
      if (duration <= 10) return duration * 1.2;
      if (duration <= 20) return duration * 0.8;
      return duration * 0.6;
    };

    return {
      isCompleted: state.status === 'completed',
      messageCount: state.messageCount,
      duration: state.actualDuration,
      participants: state.participantCount,
      relevanceScore: state.keyMetrics.topicRelevanceScore,
      targetMessages: getTargetMessages(state.estimatedDuration)
    };
  }

  // Reset topic (for testing or restart)
  public resetTopic(topicId: string): void {
    const state = this.topicStates.get(topicId);
    if (!state) return;

    const resetState: TopicState = {
      ...state,
      status: 'pending',
      messageCount: 0,
      participantCount: 0,
      startTime: null,
      endTime: null,
      actualDuration: 0,
      completionPercentage: 0,
      keyMetrics: {
        totalMessages: 0,
        agentMessages: 0,
        userMessages: 0,
        averageMessageLength: 0,
        topicRelevanceScore: 0
      }
    };

    this.topicStates.set(topicId, resetState);
    this.topicMessages.set(topicId, []);
    this.topicStartTimes.delete(topicId);
    
    console.log(`Topic ${topicId} reset`);
  }

  // Get progress report for all topics
  public getProgressReport(): {
    totalTopics: number;
    completedTopics: number;
    activeTopics: number;
    pendingTopics: number;
    overallProgress: number;
  } {
    const states = Array.from(this.topicStates.values());
    
    const completed = states.filter(s => s.status === 'completed').length;
    const active = states.filter(s => s.status === 'active').length;
    const pending = states.filter(s => s.status === 'pending').length;
    
    return {
      totalTopics: states.length,
      completedTopics: completed,
      activeTopics: active,
      pendingTopics: pending,
      overallProgress: states.length > 0 ? Math.round((completed / states.length) * 100) : 0
    };
  }
}