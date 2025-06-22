# AI Agentic Boardroom - Next-Generation Executive Decision Making

[![Built with Bolt.new](https://img.shields.io/badge/Built%20with-Bolt.new-FF6B6B?style=for-the-badge&logo=bolt&logoColor=white)](https://bolt.new)
[![Powered by Ollama](https://img.shields.io/badge/Powered%20by-Ollama-4A90E2?style=for-the-badge&logo=llama&logoColor=white)](https://ollama.ai)
[![OpenRouter](https://img.shields.io/badge/and-OpenRouter-4A90E2?style=for-the-badge&logo=openrouter&logoColor=white)](https://openrouter.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> **🏆 Bolt.new Hackathon Submission** - Revolutionizing executive decision-making with AI-powered agentic boardroom simulations

**Follow the creator:** [@mishoko](https://x.com/0xmishoko)

---

## What It Is

**AI Agentic Boardroom** is a cutting-edge simulation platform that creates realistic C-level executive discussions using advanced AI agents. Unlike traditional chatbots, our agents exhibit **emergent behavior**, **challenge each other**, and provide **contextually-aware strategic insights** that mirror real boardroom dynamics.

### Advanced Features

- **Multi-Agent Coordination**: Agents interact naturally without central orchestration
- **Real-time LLM Integration**: Powered by local Ollama or OpenRouter AI for privacy and performance
- **Dynamic Personality System**: Agents can be challenging, salty, or supportive based on conversation context
- **Adaptive Timing**: Smart conversation pacing based on meeting duration and urgency
- **Emergent Behavior**: Conversations develop organically with surprising insights
- **User Interruption Handling**: Non-blocking real-time user input integration
- **Contextual Memory**: Agents remember everything said and adapt accordingly. Full conversation history and user input awareness

---

### 🤖 Agentic AI System Highlights

```typescript
// Each agent is an autonomous entity with:
- Unique personality and expertise
- Memory of full conversation history
- Ability to challenge and disagree
- Context-aware response generation
- Real-time LLM integration
```

### Modern Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom glassmorphism components
- **AI**: Local Ollama integration (even small models like llama3.2:latest) or OpenRouter AI
- **State Management**: Custom boardroom state manager
- **Architecture**: Component-based with service layer separation

---

## Resolve Your Company Challenges Like a Pro

### 👥 Meet Your AI Executive Team

**Core C-Suite Executives:**
- **CEO**: Strategic visionary with market focus and leadership expertise
- **CTO**: Technical architecture and scalability expert
- **CFO**: Financial analysis and risk assessment specialist
- **CMO**: Brand positioning and customer insights strategist
- **CHRO**: Organizational development and talent strategy leader
- **COO**: Operational excellence and execution expert
- **CPO**: Product strategy and user experience champion

**Plus additional specialized executives** including Chief Data Officer (CDO), Chief Information Security Officer (CISO), Chief Legal Officer (CLO), Chief Strategy Officer (CSO), Chief AI Officer (CAIO), and other domain experts to provide comprehensive boardroom coverage.

### Realistic Boardroom Scenarios

- **Strategic Planning**: Long-term vision and market positioning
- **Budget Allocation**: Resource prioritization and ROI analysis
- **Product Launches**: Go-to-market strategy and risk assessment
- **Crisis Management**: Rapid decision-making under pressure
- **Innovation Initiatives**: Technology adoption and competitive advantage

---

## Quick Setup

### Prerequisites

- **Node.js** 18+
- **Ollama** installed and running OR **OpenRouter AI** API key
- **llama3.2:latest** (or smarter) model downloaded for local Ollama instance

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-agentic-boardroom
cd ai-agentic-boardroom

# Install dependencies
npm install

# Start Ollama (if using local LLM)
ollama serve

# Download the model (if not already downloaded)
ollama pull llama3.2:latest

# Start the development server
npm run dev
```

### Environment Setup

Create a `.env` file or copy from `.env.example`:

```env
# LLM Provider Selection (openai | ollama)
VITE_LLM_PROVIDER=openai

# OpenRouter AI (recommended) or OpenAI API
VITE_LLM_API_KEY=your_openrouter_or_openai_api_key_here
VITE_OPENAI_API_KEY=your_openrouter_or_openai_api_key_here

# Local Ollama Configuration
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2:latest

# Default AI Model for Agents (for OpenRouter)
VITE_DEFAULT_AI_MODEL=google/gemma-3-27b-it:free
```

**⚠️ Note**: The `openai` provider setting is optimized for **OpenRouter AI**, which provides an OpenAI-compatible API with access to multiple models. Direct OpenAI API integration is also supported but primarily tested with OpenRouter.

---

## How It Works

1. **Company Setup**: Define your company context, industry, and stage
2. **Executive Selection**: Choose your C-level team from available agents
3. **Topic Configuration**: Set discussion topics with priorities and durations
4. **Real-time Simulation**: Watch AI agents engage in strategic discussions
5. **Interactive Participation**: Interrupt and guide conversations in real-time

### Agent Behavior Examples

- **Challenging**: _"I fundamentally disagree with this financial framework..."_
- **Salty**: _"These ROI calculations are embarrassingly simplistic..."_
- **Strategic**: _"The market dynamics suggest we're at an inflection point..."_
- **Contextual**: Agents reference previous statements and user input

---

## Technical Highlights

### AI Integration

- **Local LLM**: Privacy-focused with Ollama integration
- **OpenRouter AI**: Access to multiple models via OpenAI-compatible API
- **Context Awareness**: Full conversation history in every request
- **Fallback System**: Graceful degradation when LLM unavailable
- **Real-time Generation**: No pre-computed responses

### User Experience

- **Glassmorphism Design**: Modern, professional aesthetic
- **Multi-part Messages**: Long agent responses split into digestible parts
- **Hover Controls**: Pause conversations to read full messages
- **Accessibility**: WCAG compliant with keyboard navigation

---

## Future Roadmap

- **Enhanced OpenAI Integration**: Continued optimization and testing for direct OpenAI API
- **Analytics Dashboard**: Meeting insights and decision tracking
- **Meeting Recording**: Export conversations and summaries
- **Multi-language Support**: Global boardroom simulations
- **Event-Driven Architecture**: Switch to event orchestrator pattern
- **BYOE**: Bring Your Own Executive support

---

Built with ❤️ using Bolt.new for the Bolt.new Hackathon 2025 - world's largest hackathon