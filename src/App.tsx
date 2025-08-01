import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TwitterBotCleaner from './components/TwitterBotCleaner';
import AuthCallback from './components/AuthCallback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TwitterBotCleaner />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}

export default App; 