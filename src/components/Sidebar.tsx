import React from 'react';
import { Home, Search, Library, Heart, PlusSquare, Music2, TrendingUp, Sparkles, Crown, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'trending', icon: TrendingUp, label: 'Trending' },
    { id: 'recommendations', icon: Sparkles, label: 'For You' },
    { id: 'favorites', icon: Heart, label: 'Liked' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-black flex-col h-full border-r border-white/5 shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center">
              <Music2 className="text-black w-5 h-5" />
            </div>
            <span className="font-display italic text-brand-gold">Spoiled</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  activeTab === item.id 
                    ? "bg-brand-gold/10 text-brand-gold" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-brand-gold rounded-full"
                  />
                )}
                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-brand-gold" : "group-hover:scale-110 transition-transform")} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="pt-8 pb-4">
            <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Your Library</p>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('playlists')}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                activeTab === 'playlists' 
                  ? "bg-brand-gold/10 text-brand-gold" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {activeTab === 'playlists' && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-brand-gold rounded-full"
                />
              )}
              <Library className={cn("w-5 h-5", activeTab === 'playlists' ? "text-brand-gold" : "group-hover:scale-110 transition-transform")} />
              <span className="font-medium">Playlists</span>
            </motion.button>
          </div>
        </nav>

        <div className="p-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-colors border border-white/5 mb-4 group"
          >
            <PlusSquare className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
            <span className="font-medium">New Playlist</span>
          </motion.button>
          
          <div className="px-4 py-4 rounded-2xl bg-gradient-to-br from-brand-gold/20 via-brand-gold/5 to-transparent border border-brand-gold/20 relative overflow-hidden group mb-4">
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
              <Crown className="w-8 h-8 text-brand-gold" />
            </div>
            <p className="text-[10px] text-brand-gold uppercase tracking-[0.2em] font-black mb-1">Spoiled Premium</p>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">Unlock high-fidelity audio and exclusive curations.</p>
            <button className="text-[10px] font-black uppercase tracking-widest text-white hover:text-brand-gold transition-colors">Upgrade Now</button>
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex flex-col">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Curated by</p>
              <p className="text-xs font-display italic text-brand-gold">Aditya Negi</p>
            </div>
            <button className="p-2 text-zinc-500 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-[60] pb-safe">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-2 py-1 transition-colors",
              activeTab === item.id ? "text-brand-gold" : "text-zinc-500"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
