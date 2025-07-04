import React, { useState } from 'react';
import SetupPage from './pages/SetupPage';
import BoardroomPage from './pages/BoardroomPage';
import VersionBadge from './components/VersionBadge';
import BoltBadge from './components/BoltBadge';
import { BoardroomSession } from './types';

function App() {
  const [currentSession, setCurrentSession] = useState<BoardroomSession | null>(null);

  const handleSessionStart = (session: BoardroomSession) => {
    setCurrentSession(session);
  };

  const handleBackToSetup = () => {
    setCurrentSession(null);
  };

  return (
    <>
      {!currentSession ? (
        <SetupPage onSessionStart={handleSessionStart} />
      ) : (
        <BoardroomPage 
          session={currentSession} 
          onBackToSetup={handleBackToSetup}
        />
      )}
      {/* Hackathon compliance badges - always visible */}
      <BoltBadge />
      <VersionBadge />
    </>
  );
}

export default App;