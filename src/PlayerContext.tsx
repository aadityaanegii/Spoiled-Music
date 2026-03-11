import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track } from './types';
import { getYouTubeId } from './services/musicService';
import { toast } from 'sonner';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  progress: number;
  duration: number;
  seek: (time: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  queue: Track[];
  addToQueue: (track: Track) => void;
  playNext: () => void;
  playPrevious: () => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  findFullVersion: (track: Track) => Promise<void>;
  isSearchingFull: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isSearchingFull, setIsSearchingFull] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Initialize YouTube API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      ytPlayerRef.current = new window.YT.Player('yt-player-hidden', {
        height: '0',
        width: '0',
        videoId: '',
        playerVars: {
          'playsinline': 1,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'modestbranding': 1,
          'rel': 0,
          'showinfo': 0
        },
        events: {
          'onStateChange': (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(ytPlayerRef.current.getDuration());
              startProgressTimer();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopProgressTimer();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              stopProgressTimer();
              playNext();
            }
          }
        }
      });
    };

    return () => {
      stopProgressTimer();
    };
  }, []);

  const startProgressTimer = () => {
    stopProgressTimer();
    progressIntervalRef.current = window.setInterval(() => {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        setProgress(ytPlayerRef.current.getCurrentTime());
      }
    }, 1000);
  };

  const stopProgressTimer = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    const handleTimeUpdate = () => {
      if (!currentTrack?.youtubeId) {
        setProgress(audio.currentTime);
      }
    };
    const handleDurationChange = () => {
      if (!currentTrack?.youtubeId) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      if (!currentTrack?.youtubeId) {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
      ytPlayerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  const playTrack = async (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (!isPlaying) togglePlay();
      return;
    }

    if (currentTrack) setHistory(prev => [currentTrack, ...prev]);
    setCurrentTrack(track);
    setProgress(0);

    if (track.youtubeId) {
      audioRef.current?.pause();
      if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
        ytPlayerRef.current.loadVideoById(track.youtubeId);
        ytPlayerRef.current.playVideo();
      }
    } else {
      if (ytPlayerRef.current && ytPlayerRef.current.pauseVideo) {
        ytPlayerRef.current.pauseVideo();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = track.audioUrl;
        audioRef.current.load();
        try {
          playPromiseRef.current = audioRef.current.play();
          await playPromiseRef.current;
          setIsPlaying(true);
        } catch (error) {
          console.error('Playback failed:', error);
          setIsPlaying(false);
        }
      }
    }
  };

  const togglePlay = async () => {
    if (!currentTrack) return;

    if (currentTrack.youtubeId) {
      if (isPlaying) {
        ytPlayerRef.current?.pauseVideo();
      } else {
        ytPlayerRef.current?.playVideo();
      }
    } else {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        try {
          playPromiseRef.current = audioRef.current?.play() || null;
          await playPromiseRef.current;
          setIsPlaying(true);
        } catch (error) {
          console.error('Playback failed:', error);
        }
      }
    }
  };

  const seek = (time: number) => {
    if (currentTrack?.youtubeId) {
      ytPlayerRef.current?.seekTo(time, true);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setProgress(time);
  };

  const findFullVersion = async (track: Track) => {
    setIsSearchingFull(true);
    toast.loading('Finding full version...', { id: 'full-version' });
    
    const ytId = await getYouTubeId(track);
    setIsSearchingFull(false);
    
    if (ytId) {
      const fullTrack = { ...track, youtubeId: ytId, isFull: true };
      toast.success('Full version found!', { id: 'full-version' });
      playTrack(fullTrack);
    } else {
      toast.error('Could not find full version.', { id: 'full-version' });
    }
  };

  const addToQueue = (track: Track) => setQueue(prev => [...prev, track]);

  const playNext = async () => {
    if (queue.length > 0) {
      let nextIndex = isShuffle ? Math.floor(Math.random() * queue.length) : 0;
      const next = queue[nextIndex];
      setQueue(prev => prev.filter((_, i) => i !== nextIndex));
      playTrack(next);
    } else if (currentTrack) {
      const { getRecommendations } = await import('./services/musicService');
      const recs = await getRecommendations(currentTrack);
      if (recs.length > 0) {
        playTrack(recs[0]);
        setQueue(recs.slice(1));
      }
    }
  };

  const playPrevious = () => {
    if (history.length > 0) {
      const prev = history[0];
      setHistory(prevHistory => prevHistory.slice(1));
      playTrack(prev);
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, isExpanded, setIsExpanded, playTrack, togglePlay,
      progress, duration, seek, volume, setVolume,
      queue, addToQueue, playNext, playPrevious,
      isShuffle, toggleShuffle, findFullVersion, isSearchingFull
    }}>
      {children}
      <div id="yt-player-hidden" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
