import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoadingPit } from './components/shared/LoadingPit';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Feed = lazy(() => import('./pages/Feed').then(m => ({ default: m.Feed })));
const CreateRoom = lazy(() => import('./pages/CreateRoom').then(m => ({ default: m.CreateRoom })));
const DebateRoom = lazy(() => import('./pages/DebateRoom').then(m => ({ default: m.DebateRoom })));
const Forum = lazy(() => import('./pages/Forum').then(m => ({ default: m.Forum })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

function App() {
  console.log('App Rendering...');
  return (
    <Router>
      <div className="min-h-screen bg-ghost selection:bg-glitch">
        <Suspense fallback={<LoadingPit />}>
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
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
