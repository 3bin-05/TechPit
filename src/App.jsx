import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Feed } from './pages/Feed';
import { CreateRoom } from './pages/CreateRoom';
import { DebateRoom } from './pages/DebateRoom';
import { Forum } from './pages/Forum';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { NotFound } from './pages/NotFound';

function App() {
  console.log('App Rendering...');
  return (
    <Router>
      <div className="min-h-screen bg-ghost selection:bg-glitch">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/room/:id" element={<DebateRoom />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
