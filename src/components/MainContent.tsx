import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, TrendingUp, Sparkles, Heart, Music2, Loader2, Bell, Play, X } from 'lucide-react';
import { TrackCard } from './TrackCard';
import { getTrendingTracks, getRecommendations, searchTracks } from '../services/musicService';
import { Track } from '../types';
import { usePlayer } from '../PlayerContext';
import { motion, AnimatePresence } from 'motion/react';
import { useFavorites } from '../hooks/useFavorites';
import { Auth } from './Auth';

interface MainContentProps {
  activeTab: string;
}

export const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  const [trending, setTrending] = useState<Track[]>([]);
  const [recommended, setRecommended] = useState<Track[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { favorites } = useFavorites();
  const { playTrack } = usePlayer();

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      const [t, r] = await Promise.all([getTrendingTracks(), getRecommendations()]);
      setTrending(t);
      setRecommended(r);
      setLoading(false);
    };
    loadInitial();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery) {
        setLoading(true);
        const results = await searchTracks(searchQuery);
        setSearchResults(results);
        setLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderContent = () => {
    const isSearching = loading;
    if (loading && !trending.length) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case 'search':
        return (
          <div className="space-y-8">
            <div className="relative max-w-2xl group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-brand-gold transition-colors" />
              <input 
                type="text" 
                placeholder="What do you want to listen to?"
                className="w-full bg-brand-surface border border-white/10 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all text-lg font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-500 hover:text-white" />
                </button>
              )}
            </div>
            
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                <p className="text-zinc-500 font-medium animate-pulse">Searching the global library...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Search Results</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {searchResults.map(track => <TrackCard key={track.id} track={track} />)}
                </div>
              </div>
            ) : searchQuery ? (
              <div className="text-center py-32">
                <SearchIcon className="w-20 h-20 text-zinc-800 mx-auto mb-6 opacity-20" />
                <p className="text-zinc-500 text-xl font-medium">No results found for "{searchQuery}"</p>
                <p className="text-zinc-600 text-sm mt-2">Try searching for something else or check your spelling.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {['Pop', 'Rock', 'Jazz', 'Hip Hop', 'Classical', 'Electronic'].map(genre => (
                  <div key={genre} className="h-40 rounded-3xl bg-gradient-to-br from-brand-surface/50 to-zinc-900/50 p-8 cursor-pointer hover:scale-[1.02] transition-all border border-white/5 hover:border-brand-gold/20 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Music2 className="w-24 h-24" />
                    </div>
                    <h3 className="text-2xl font-display italic font-bold relative z-10">{genre}</h3>
                    <p className="text-xs text-zinc-500 mt-2 relative z-10">Explore {genre} hits</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'trending':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-8 h-8 text-brand-gold" />
              <h2 className="text-2xl md:text-4xl font-display italic font-bold">Trending Now</h2>
            </div>
            <div className="space-y-1">
              {trending.map((track, i) => <TrackCard key={track.id} track={track} index={i} variant="row" />)}
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-8 h-8 text-brand-gold" />
              <h2 className="text-2xl md:text-4xl font-display italic font-bold">Spoiled For You</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recommended.map(track => <TrackCard key={track.id} track={track} />)}
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center gap-8 mb-8 md:mb-16 text-center md:text-left"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 gold-gradient rounded-3xl shadow-[0_30px_60px_rgba(212,175,55,0.2)] flex items-center justify-center group">
                <Heart className="w-20 h-20 md:w-32 md:h-32 text-black fill-current group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-zinc-500 mb-4">Collection</p>
                <h2 className="text-5xl md:text-8xl font-display italic font-bold mb-4 tracking-tighter">Liked <br className="hidden md:block" /> Songs</h2>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <p className="text-zinc-400 font-medium">{favorites.length} curated tracks</p>
                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                  <p className="text-brand-gold font-bold">Spoiled Premium</p>
                </div>
              </div>
            </motion.div>
            {favorites.length > 0 ? (
              <div className="space-y-1">
                {favorites.map((track, i) => <TrackCard key={track.id} track={track} index={i} variant="row" />)}
              </div>
            ) : (
              <div className="text-center py-32">
                <Music2 className="w-20 h-20 text-zinc-800 mx-auto mb-6 opacity-20" />
                <p className="text-zinc-500 text-xl font-medium">Your sanctuary is empty</p>
                <p className="text-zinc-600 text-sm mt-2">Start liking songs to build your collection</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-20">
            {/* Editorial Hero Section */}
            <section className="relative h-[450px] md:h-[600px] rounded-[40px] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                src="https://picsum.photos/seed/music-editorial/1920/1080" 
                className="absolute inset-0 w-full h-full object-cover"
                alt="Hero"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 z-20 p-8 md:p-16 flex flex-col justify-end">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="max-w-4xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest">
                      New Release
                    </span>
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Available Now</span>
                  </div>
                  <h1 className="text-6xl md:text-[120px] font-display italic font-bold mb-6 text-glow leading-[0.85] tracking-tighter">
                    Ethereal <br /> Echoes.
                  </h1>
                  <div className="flex flex-col md:flex-row md:items-center gap-8 mt-8">
                    <p className="text-zinc-300 text-base md:text-xl max-w-md leading-relaxed font-medium">
                      Dive into the atmospheric soundscapes of the season's most anticipated curation.
                    </p>
                    <div className="flex items-center gap-4">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => trending[0] && playTrack(trending[0])}
                        className="px-10 py-4 rounded-full gold-gradient text-black font-black hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all flex items-center gap-3"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        Listen Now
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Floating Decorative Elements */}
              <div className="absolute top-12 right-12 z-20 hidden lg:block">
                <div className="flex flex-col items-end gap-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Volume 01</p>
                  <div className="w-32 h-[1px] bg-white/20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">Spring 2026</p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-display italic font-bold flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-brand-gold" />
                  The Daily Curation
                </h2>
                <button className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-brand-gold transition-colors">View All</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {recommended.slice(0, 5).map((track, i) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <TrackCard track={track} />
                  </motion.div>
                ))}
              </div>
            </section>

            <section id="top-hits">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-display italic font-bold flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-brand-gold" />
                  Global Charts
                </h2>
                <button className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-brand-gold transition-colors">Full Chart</button>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-2">
                {trending.slice(0, 10).map((track, i) => <TrackCard key={track.id} track={track} index={i} variant="row" />)}
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-brand-surface/50 to-brand-charcoal p-4 md:p-8 pb-40 lg:pb-32">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-8 sticky top-0 z-40 bg-brand-charcoal/80 backdrop-blur-xl p-4 -mx-4 md:-mx-8 rounded-b-3xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </button>
          <Auth />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};
