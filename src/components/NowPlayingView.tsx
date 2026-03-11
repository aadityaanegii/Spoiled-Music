import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MoreHorizontal, Share2, ListMusic, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, UserPlus, Mic2, Loader2, Link as LinkIcon } from 'lucide-react';
import { usePlayer } from '../PlayerContext';
import { useFavorites } from '../hooks/useFavorites';
import { getTracksByArtist, getLyrics } from '../services/musicService';
import { Track } from '../types';
import { TrackCard } from './TrackCard';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export const NowPlayingView: React.FC = () => {
  const { 
    currentTrack, isPlaying, togglePlay, isExpanded, setIsExpanded,
    progress, duration, seek, playNext, playPrevious, playTrack,
    isShuffle, toggleShuffle, findFullVersion, isSearchingFull
  } = usePlayer();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [lyrics, setLyrics] = useState<string>('');
  const [parsedLyrics, setParsedLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const lyricsRef = React.useRef<HTMLDivElement>(null);

  const parseLyrics = (text: string) => {
    const lines = text.split('\n');
    const parsed = lines.map(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/);
      if (match) {
        const mins = parseInt(match[1]);
        const secs = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const time = mins * 60 + secs + ms / 100;
        const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/, '').trim();
        return { time, text };
      }
      return { time: -1, text: line.trim() };
    }).filter(line => line.text !== '');
    return parsed;
  };

  useEffect(() => {
    if (currentTrack && isExpanded) {
      setLoading(true);
      Promise.all([
        getTracksByArtist(currentTrack.artist),
        getLyrics(currentTrack)
      ]).then(([tracks, lyricsText]) => {
        setArtistTracks(tracks.filter(t => t.id !== currentTrack.id).slice(0, 6));
        setLyrics(lyricsText);
        setParsedLyrics(parseLyrics(lyricsText));
        setLoading(false);
      });
    }
  }, [currentTrack, isExpanded]);

  useEffect(() => {
    if (parsedLyrics.length > 0) {
      let index = -1;
      for (let i = parsedLyrics.length - 1; i >= 0; i--) {
        if (parsedLyrics[i].time !== -1 && parsedLyrics[i].time <= progress) {
          index = i;
          break;
        }
      }
      if (index !== currentLineIndex) {
        setCurrentLineIndex(index);
      }
    }
  }, [progress, parsedLyrics, currentLineIndex]);

  useEffect(() => {
    if (currentLineIndex !== -1 && lyricsRef.current) {
      const activeElement = lyricsRef.current.children[currentLineIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://spoiled.music/track/${currentTrack.id}`);
    toast.success('Link copied', {
      description: `${currentTrack.title} by ${currentTrack.artist}`,
      icon: <LinkIcon className="w-4 h-4" />,
    });
  };

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-gradient-to-b from-brand-accent/40 to-brand-charcoal backdrop-blur-3xl overflow-y-auto"
        >
          {/* Top Progress Bar */}
          <div className="sticky top-0 left-0 right-0 h-1 z-[110] bg-white/5 overflow-hidden">
            <motion.div 
              className="h-full bg-brand-gold"
              initial={{ width: 0 }}
              animate={{ width: `${(progress / duration) * 100}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
            />
          </div>

          <div className="fixed inset-0 z-[90] pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-brand-gold/20 blur-[120px] rounded-full"
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-brand-accent/30 blur-[120px] rounded-full"
            />
          </div>

          <div className="max-w-screen-md mx-auto px-6 py-8 pb-32 relative z-[100]">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
              <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronDown className="w-8 h-8" />
              </button>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Playing from playlist</p>
                <p className="text-sm font-bold">Spoiled Curations 🔥</p>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </header>

            {/* Artwork */}
            <motion.div 
              layoutId={`artwork-${currentTrack.id}`}
              className="aspect-square w-full mb-12 rounded-[40px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/10 relative group"
            >
              <img 
                src={currentTrack.coverUrl} 
                alt={currentTrack.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>

            {/* Track Info */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl md:text-4xl font-display italic font-bold text-glow truncate">{currentTrack.title}</h2>
                  {!currentTrack.isFull && !currentTrack.youtubeId && (
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400">Preview</span>
                  )}
                  {currentTrack.youtubeId && (
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500">Full (YT)</span>
                  )}
                </div>
                <p className="text-xl text-zinc-400 font-medium">{currentTrack.artist}</p>
              </div>
              <div className="flex items-center gap-4">
                {!currentTrack.isFull && !currentTrack.youtubeId && (
                  <button 
                    onClick={() => findFullVersion(currentTrack)}
                    disabled={isSearchingFull}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-black uppercase tracking-widest hover:bg-brand-gold hover:text-black transition-all disabled:opacity-50"
                  >
                    {isSearchingFull ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    Play Full
                  </button>
                )}
                <button 
                  onClick={() => toggleFavorite(currentTrack)}
                  className="p-3 hover:bg-white/5 rounded-full transition-all active:scale-125"
                >
                  <Heart className={cn("w-8 h-8", isFavorite(currentTrack.id) ? "fill-brand-gold text-brand-gold" : "text-zinc-500")} />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-4 mb-12">
              <div className="h-1 bg-white/10 rounded-full relative group cursor-pointer">
                <motion.div 
                  className="absolute top-0 left-0 h-full gold-gradient shadow-[0_0_15px_rgba(212,175,55,0.5)]" 
                  style={{ width: `${(progress / duration) * 100}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${(progress / duration) * 100}%` }}
                />
                <input 
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={progress}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between mb-16">
              <button 
                onClick={toggleShuffle}
                className={cn("transition-colors", isShuffle ? "text-brand-gold" : "text-zinc-500 hover:text-white")}
              >
                <Shuffle className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-8">
                <button onClick={playPrevious} className="text-white hover:scale-110 transition-transform"><SkipBack className="w-10 h-10 fill-current" /></button>
                <button 
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center hover:scale-105 transition-transform shadow-2xl gold-glow"
                >
                  {isPlaying ? <Pause className="w-10 h-10 text-black fill-current" /> : <Play className="w-10 h-10 text-black fill-current ml-2" />}
                </button>
                <button onClick={playNext} className="text-white hover:scale-110 transition-transform"><SkipForward className="w-10 h-10 fill-current" /></button>
              </div>
              <button className="text-zinc-500 hover:text-white transition-colors"><Repeat className="w-6 h-6" /></button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mb-12">
              <button 
                onClick={() => setShowLyrics(!showLyrics)}
                className={cn("transition-colors", showLyrics ? "text-brand-gold" : "text-zinc-400 hover:text-white")}
              >
                <Mic2 className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleCopyLink}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="text-zinc-400 hover:text-white transition-colors"><ListMusic className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Lyrics Section */}
            <AnimatePresence>
              {showLyrics && (
                <motion.section
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-12"
                >
                  <div className="bg-brand-gold/10 rounded-3xl p-8 border border-brand-gold/20 relative overflow-hidden group min-h-[400px]">
                    <div className="absolute top-0 right-0 p-4">
                      <Mic2 className="w-12 h-12 text-brand-gold/10 group-hover:text-brand-gold/20 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-gold">Full Lyrics</h3>
                      <div className="px-2 py-0.5 rounded bg-brand-gold/20 border border-brand-gold/30 text-[10px] font-bold text-brand-gold uppercase tracking-tighter">
                        AI Enhanced
                      </div>
                    </div>
                    
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                        <p className="text-sm text-brand-gold/60 font-medium animate-pulse">Fetching full lyrics from the cloud...</p>
                      </div>
                    ) : (
                      <div 
                        ref={lyricsRef}
                        className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide mask-fade-bottom scroll-smooth"
                      >
                        {parsedLyrics.length > 0 ? (
                          parsedLyrics.map((line, i) => (
                            <motion.p 
                              key={i} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ 
                                opacity: i === currentLineIndex ? 1 : 0.2, 
                                x: i === currentLineIndex ? 0 : -5,
                                scale: i === currentLineIndex ? 1.05 : 1
                              }}
                              className={cn(
                                "text-xl md:text-3xl font-bold leading-tight transition-all duration-500 cursor-pointer hover:opacity-100",
                                i === currentLineIndex ? "text-white text-glow" : "text-white/40"
                              )}
                              onClick={() => line.time !== -1 && seek(line.time)}
                            >
                              {line.text}
                            </motion.p>
                          ))
                        ) : (
                          lyrics.split('\n').map((line, i) => {
                            const cleanLine = line.trim();
                            if (!cleanLine) return <div key={i} className="h-4" />;
                            return (
                              <p key={i} className="text-xl md:text-2xl font-bold text-white/60">
                                {cleanLine}
                              </p>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-[10px] text-zinc-500 text-center uppercase tracking-[0.2em] font-bold">
                    {currentTrack.isFull || currentTrack.youtubeId ? 'Full song access enabled.' : 'Note: Audio is a high-quality 30s preview. Click "Play Full" for the full song.'} Full lyrics provided by Gemini AI.
                  </p>
                </motion.section>
              )}
            </AnimatePresence>

            {/* About the Artist */}
            <section className="mb-12">
              <div className="bg-brand-surface/60 rounded-3xl overflow-hidden border border-white/5">
                <div className="relative h-64">
                  <img 
                    src={currentTrack.coverUrl} 
                    alt={currentTrack.artist} 
                    className="w-full h-full object-cover blur-sm opacity-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surface to-transparent" />
                  <div className="absolute top-6 left-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2">About the artist</p>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl font-display italic font-bold">{currentTrack.artist}</h3>
                      <button 
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={cn(
                          "px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2",
                          isFollowing 
                            ? "bg-brand-gold text-black border-transparent" 
                            : "border border-white/20 hover:bg-white/10"
                        )}
                      >
                        <UserPlus className={cn("w-4 h-4", isFollowing && "fill-current")} />
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 mb-4">
                    {currentTrack.artist} is a visionary artist pushing the boundaries of {currentTrack.genre || 'modern music'}. 
                    With a unique blend of atmospheric textures and driving rhythms, they have quickly become a staple in the Spoiled community.
                  </p>
                  <button className="text-sm font-bold text-white hover:underline">See more</button>
                </div>
              </div>
            </section>

            {/* Explore Artist */}
            <section>
              <h3 className="text-xl font-bold mb-6">Explore more by {currentTrack.artist}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {artistTracks.map(track => (
                  <div 
                    key={track.id} 
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => playTrack(track)}
                  >
                    <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs font-bold truncate">{track.title}</p>
                      <p className="text-[10px] text-zinc-400">Songs by {track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
