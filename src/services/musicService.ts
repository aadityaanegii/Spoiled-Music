import { Track } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const JAMENDO_CLIENT_ID = '56d30c95'; // Public test ID

// Using iTunes Search API for metadata and Jamendo for full-length tracks
export async function searchTracks(query: string): Promise<Track[]> {
  try {
    // Parallel fetch from iTunes and Jamendo
    const [itunesRes, jamendoRes] = await Promise.all([
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=15`),
      fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=15&search=${encodeURIComponent(query)}&include=musicinfo&audioformat=mp32`)
    ]);

    const itunesData = await itunesRes.json();
    const jamendoData = await jamendoRes.json();

    const itunesTracks: Track[] = itunesData.results.map((item: any) => ({
      id: `itunes-${item.trackId}`,
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName,
      coverUrl: item.artworkUrl100.replace('100x100', '600x600'),
      audioUrl: item.previewUrl,
      duration: Math.floor(item.trackTimeMillis / 1000),
      genre: item.primaryGenreName,
      isFull: false
    }));

    const jamendoTracks: Track[] = jamendoData.results.map((item: any) => ({
      id: `jamendo-${item.id}`,
      title: item.name,
      artist: item.artist_name,
      album: item.album_name,
      coverUrl: item.album_image || item.image,
      audioUrl: item.audio,
      duration: item.duration,
      genre: item.musicinfo?.genre || 'Independent',
      isFull: true
    }));

    // Interleave results, prioritizing Jamendo for full-length access
    const combined: Track[] = [];
    const maxLen = Math.max(itunesTracks.length, jamendoTracks.length);
    for (let i = 0; i < maxLen; i++) {
      if (jamendoTracks[i]) combined.push(jamendoTracks[i]);
      if (itunesTracks[i]) combined.push(itunesTracks[i]);
    }

    return combined;
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}

export async function getTracksByArtist(artist: string): Promise<Track[]> {
  return searchTracks(artist);
}

export async function getLyrics(track: Track): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide the full lyrics for the song "${track.title}" by "${track.artist}". 
      Format the lyrics with timestamps in [mm:ss.xx] format if possible, otherwise just plain text. 
      If you can't find the exact lyrics, provide a poetic description or a summary of the song's meaning.
      Only return the lyrics text, no other commentary.`,
    });
    
    return response.text || "Lyrics not found.";
  } catch (error) {
    console.error('Error fetching lyrics with Gemini:', error);
    return "Could not load lyrics at this time.";
  }
}

// Find a YouTube ID for a track to provide full-length access
export async function getYouTubeId(track: Track): Promise<string | null> {
  if (track.youtubeId) return track.youtubeId;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the official YouTube video ID for the song "${track.title}" by "${track.artist}". 
      Return ONLY the 11-character video ID. If you can't find it, return "null".`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const id = response.text.trim();
    return id.length === 11 ? id : null;
  } catch (error) {
    console.error('Error finding YouTube ID:', error);
    return null;
  }
}

export async function getTrendingTracks(): Promise<Track[]> {
  try {
    const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&order=boost_total&include=musicinfo&audioformat=mp32`);
    const data = await response.json();
    
    return data.results.map((item: any) => ({
      id: `jamendo-${item.id}`,
      title: item.name,
      artist: item.artist_name,
      album: item.album_name,
      coverUrl: item.album_image || item.image,
      audioUrl: item.audio,
      duration: item.duration,
      genre: item.musicinfo?.genre || 'Independent',
      isFull: true
    }));
  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    return searchTracks('popular hits');
  }
}

export async function getRecommendations(seedTrack?: Track): Promise<Track[]> {
  if (seedTrack?.id.startsWith('jamendo-')) {
    try {
      const jamId = seedTrack.id.replace('jamendo-', '');
      const response = await fetch(`https://api.jamendo.com/v3.0/tracks/similar/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&id=${jamId}&include=musicinfo&audioformat=mp32`);
      const data = await response.json();
      
      return data.results.map((item: any) => ({
        id: `jamendo-${item.id}`,
        title: item.name,
        artist: item.artist_name,
        album: item.album_name,
        coverUrl: item.album_image || item.image,
        audioUrl: item.audio,
        duration: item.duration,
        genre: item.musicinfo?.genre || 'Independent',
        isFull: true
      }));
    } catch (error) {
      console.error('Error fetching Jamendo recommendations:', error);
    }
  }
  
  const query = seedTrack ? `${seedTrack.artist} ${seedTrack.genre}` : 'recommended for you';
  return searchTracks(query);
}
