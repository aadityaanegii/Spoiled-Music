/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Player } from './components/Player';
import { NowPlayingView } from './components/NowPlayingView';
import { PlayerProvider, usePlayer } from './PlayerContext';
import { AuthProvider } from './AuthContext';
import { FavoritesProvider } from './hooks/useFavorites';
import { Toaster } from 'sonner';

const KeyboardShortcuts = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const { togglePlay } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setActiveTab('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, setActiveTab]);

  return null;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <AuthProvider>
      <FavoritesProvider>
        <PlayerProvider>
          <KeyboardShortcuts setActiveTab={setActiveTab} />
          <div className="flex h-screen bg-brand-charcoal text-white overflow-hidden relative selection:bg-brand-gold selection:text-black">
            <Toaster position="top-center" expand={false} richColors theme="dark" />
            {/* Atmospheric Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-gold/10 blur-[120px] rounded-full animate-pulse-slow" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-accent/5 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '-5s' }} />
            </div>

            <div className="flex w-full h-full relative z-10">
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
              <MainContent activeTab={activeTab} />
              <Player />
              <NowPlayingView />
            </div>
          </div>
        </PlayerProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
