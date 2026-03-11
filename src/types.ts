export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  genre?: string;
  isFull?: boolean;
  youtubeId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
}
