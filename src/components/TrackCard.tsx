import React from 'react';
import { Play, Pause, Heart, MoreHorizontal, Clock, Link as LinkIcon } from 'lucide-react';
import { Track } from '../types';
import { usePlayer } from '../PlayerContext';
import { useFavorites } from '../hooks/useFavorites';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface TrackCardProps {
  track: Track;
  index?: number;
  variant?: 'card' | 'row';
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, index, variant = 'card' }) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isActive = currentTrack?.id === track.id;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://spoiled.music/track/${track.id}`);
    toast.success('Link copied to clipboard', {
      description: `${track.title} by ${track.artist}`,
      icon: <LinkIcon className="w-4 h-4" />,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = isFavorite(track.id);
    toggleFavorite(track);
    if (!isFav) {
      toast.success('Added to favorites', {
        description: `${track.title} added to your library`,
      });
    } else {
      toast.info('Removed from favorites', {
        description: `${track.title} removed from your library`,
      });
    }
  };

  if (variant === 'row') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        transition={{ delay: (index || 0) * 0.03 }}
        className={cn(
          "group grid grid-cols-[30px_1fr_40px] md:grid-cols-[40px_1fr_1fr_100px_40px] items-center gap-2 md:gap-4 p-3 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/5",
          isActive && "bg-white/5 border-white/5"
        )}
        onClick={() => playTrack(track)}
      >
        <div className="flex items-center justify-center text-zinc-500 font-mono text-xs md:text-sm">
          {isActive && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3">
              <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-brand-gold" />
              <motion.div animate={{ height: [8, 4, 12] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-brand-gold" />
              <motion.div animate={{ height: [12, 8, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-brand-gold" />
            </div>
          ) : (
            <span className="group-hover:hidden">{index !== undefined ? (index + 1).toString().padStart(2, '0') : ''}</span>
          )}
          <Play className={cn("w-3 h-3 md:w-4 md:h-4 text-white hidden group-hover:block fill-current", isActive && "block")} />
        </div>

        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <div className="relative shrink-0">
            <img src={track.coverUrl} alt={track.title} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-lg" referrerPolicy="no-referrer" />
            {isActive && (
              <div className="absolute inset-0 bg-brand-gold/20 flex items-center justify-center rounded-lg">
                <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={cn("font-bold truncate text-sm md:text-base tracking-tight", isActive ? "text-brand-gold" : "text-white")}>{track.title}</span>
            <span className="text-[10px] md:text-xs text-zinc-500 font-medium truncate">{track.artist}</span>
          </div>
        </div>

        <span className="hidden md:block text-sm text-zinc-500 font-medium truncate">{track.album}</span>
        
        <div className="hidden md:flex items-center gap-2 text-zinc-600 text-xs font-mono">
          {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={handleToggleFavorite}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={cn("w-4 h-4", isFavorite(track.id) ? "fill-brand-gold text-brand-gold opacity-100" : "text-zinc-500 hover:text-white")} />
          </button>
          <button 
            onClick={handleCopyLink}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-white"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -12, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-brand-surface/30 backdrop-blur-md p-5 rounded-[32px] hover:bg-white/5 transition-all group cursor-pointer border border-white/5 gold-glow-hover"
      onClick={() => playTrack(track)}
    >
      <div className="relative aspect-square mb-6 overflow-hidden rounded-[24px] shadow-2xl">
        <img 
          src={track.coverUrl} 
          alt={track.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            whileHover={{ scale: 1.1 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.5)]"
          >
            {isActive && isPlaying ? <Pause className="w-8 h-8 text-black fill-current" /> : <Play className="w-8 h-8 text-black fill-current ml-1" />}
          </motion.div>
        </div>
      </div>
      <div className="px-1">
        <h3 className={cn("font-bold text-lg truncate mb-1 tracking-tight", isActive ? "text-brand-gold" : "text-white")}>{track.title}</h3>
        <p className="text-sm text-zinc-500 font-medium truncate">{track.artist}</p>
      </div>
    </motion.div>
  );
};
