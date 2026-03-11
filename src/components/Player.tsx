import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Volume1, VolumeX, Heart, ListMusic, ChevronDown, Link as LinkIcon } from 'lucide-react';
import { usePlayer } from '../PlayerContext';
import { useFavorites } from '../hooks/useFavorites';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const Player: React.FC = () => {
  const { 
    currentTrack, isPlaying, togglePlay, 
    progress, duration, seek, 
    volume, setVolume, playNext, playPrevious,
    setIsExpanded, isShuffle, toggleShuffle,
    findFullVersion, isSearchingFull
  } = usePlayer();
  
  const { toggleFavorite, isFavorite } = useFavorites();

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://spoiled.music/track/${currentTrack.id}`);
    toast.success('Link copied', {
      description: `${currentTrack.title} by ${currentTrack.artist}`,
      icon: <LinkIcon className="w-4 h-4" />,
    });
  };

  const handlePlayFull = (e: React.MouseEvent) => {
    e.stopPropagation();
    findFullVersion(currentTrack);
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="h-20 lg:h-24 bg-brand-surface/90 backdrop-blur-2xl border-t border-white/5 px-4 lg:px-6 flex items-center justify-between fixed bottom-16 lg:bottom-0 left-0 right-0 z-50">
      {/* Track Info */}
      <div 
        className="flex items-center gap-3 lg:gap-4 w-full lg:w-1/3 cursor-pointer group/info"
        onClick={() => setIsExpanded(true)}
      >
        <div className="relative shrink-0 overflow-hidden rounded-lg">
          <img 
            src={currentTrack.coverUrl} 
            alt={currentTrack.title} 
            className="w-12 h-12 lg:w-14 lg:h-14 object-cover shadow-lg group-hover/info:scale-110 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/info:opacity-100 transition-opacity flex items-center justify-center">
             <ChevronDown className="w-5 h-5 text-white rotate-180" />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-xs lg:text-sm truncate max-w-[120px] lg:max-w-[200px] group-hover/info:text-brand-gold transition-colors">{currentTrack.title}</h4>
            {!currentTrack.isFull && !currentTrack.youtubeId && (
              <span className="text-[8px] font-black uppercase tracking-tighter px-1 bg-white/10 text-zinc-400 rounded">Preview</span>
            )}
            {currentTrack.youtubeId && (
              <span className="text-[8px] font-black uppercase tracking-tighter px-1 bg-red-500/20 text-red-500 rounded">Full (YT)</span>
            )}
          </div>
          <p className="text-[10px] lg:text-xs text-zinc-400 truncate max-w-[120px] lg:max-w-[200px]">{currentTrack.artist}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleFavorite(currentTrack); }}
            className="ml-1 lg:ml-2 transition-transform active:scale-125 shrink-0"
          >
            <Heart className={cn("w-4 h-4 lg:w-5 lg:h-5", isFavorite(currentTrack.id) ? "fill-brand-gold text-brand-gold" : "text-zinc-500 hover:text-white")} />
          </button>
          {!currentTrack.isFull && !currentTrack.youtubeId && (
            <button 
              onClick={handlePlayFull}
              disabled={isSearchingFull}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold hover:text-black transition-all disabled:opacity-50"
            >
              {isSearchingFull ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-3 h-3 border-2 border-current border-t-transparent rounded-full" /> : <Play className="w-3 h-3 fill-current" />}
              Full Version
            </button>
          )}
        </div>
      </div>

      {/* Controls - Desktop Only Center */}
      <div className="hidden lg:flex flex-col items-center gap-2 w-1/3">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle}
            className={cn("transition-colors", isShuffle ? "text-brand-gold" : "text-zinc-500 hover:text-white")}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={playPrevious} className="text-zinc-300 hover:text-white transition-colors"><SkipBack className="w-5 h-5 fill-current" /></button>
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            {isPlaying ? <Pause className="w-5 h-5 text-black fill-current" /> : <Play className="w-5 h-5 text-black fill-current ml-1" />}
          </button>
          <button onClick={playNext} className="text-zinc-300 hover:text-white transition-colors"><SkipForward className="w-5 h-5 fill-current" /></button>
          <button className="text-zinc-500 hover:text-white transition-colors"><Repeat className="w-4 h-4" /></button>
        </div>
        
        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[10px] text-zinc-500 font-mono w-8 text-right">{formatTime(progress)}</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full relative group cursor-pointer overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full gold-gradient" 
              style={{ width: `${(progress / duration) * 100}%` }}
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
          <span className="text-[10px] text-zinc-500 font-mono w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Mobile Controls & Volume */}
      <div className="flex items-center justify-end gap-3 lg:gap-4 w-auto lg:w-1/3">
        <div className="lg:hidden flex items-center gap-4">
           <button 
            onClick={togglePlay}
            className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center shadow-lg"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-black fill-current" /> : <Play className="w-4 h-4 text-black fill-current ml-0.5" />}
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-4 group/volume">
          <button 
            onClick={handleCopyLink}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <VolumeIcon className="w-4 h-4 text-zinc-400 group-hover/volume:text-brand-gold transition-colors" />
            <div className="w-24 h-1 bg-white/10 rounded-full relative group cursor-pointer">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-white/60 group-hover:bg-brand-gold transition-colors" 
                style={{ width: `${volume * 100}%` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${volume * 100}%` }}
              />
              <input 
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <button className="p-2 text-zinc-500 hover:text-white transition-colors relative">
            <ListMusic className="w-5 h-5" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-brand-gold rounded-full border-2 border-black" />
          </button>
        </div>
      </div>

      {/* Mobile Progress Bar (Top of player) */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-0.5 bg-white/10">
        <div 
          className="h-full gold-gradient" 
          style={{ width: `${(progress / duration) * 100}%` }}
        />
      </div>
    </div>
  );
};
