import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import CaptionEditor from './components/CaptionEditor';
import { Sparkles, Github, Layout } from 'lucide-react';

function App() {
  const [videoData, setVideoData] = useState(null);
  const [view, setView] = useState('landing'); // 'landing' | 'studio'

  const handleUploadComplete = (data) => {
    setVideoData(data);
    setView('studio');
  };

  const handleBackToHome = () => {
    setVideoData(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-blue-500/30 flex flex-col">

      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-16 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* Logo */}
          <button onClick={handleBackToHome} className="flex items-center gap-3 group focus:outline-none">
            <div className="relative flex items-center justify-center w-10 h-10">
              <div className="absolute inset-0 bg-blue-600/20 blur-lg rounded-lg group-hover:bg-blue-500/40 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

              {/* Glassy Square Container */}
              <div className="relative w-8 h-8 glass rounded-lg flex items-center justify-center border border-white/10 shadow-lg group-hover:border-white/20 transition-all">
                <span className="text-white font-bold text-sm">L</span>
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-200 transition-colors">
              LipiStudio
            </span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => setView('landing')} className={`text-sm font-medium transition-colors ${view === 'landing' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Home</button>
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {view === 'studio' && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium animate-in fade-in">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                Studio Active
              </div>
            )}
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main View Switcher */}
      <main className="flex-1 pt-16">
        {view === 'landing' ? (
          <LandingPage onUploadComplete={handleUploadComplete} />
        ) : (
          <div className="p-6 h-[calc(100vh-64px)] overflow-hidden">
            <div className="max-w-[1800px] mx-auto h-full animate-in fade-in zoom-in-95 duration-500">
              <CaptionEditor
                videoData={videoData}
                onBack={handleBackToHome}
              />
            </div>
          </div>
        )}
      </main>

    </div>
  );
}

export default App;
