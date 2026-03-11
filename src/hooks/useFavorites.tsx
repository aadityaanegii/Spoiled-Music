import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track } from '../types';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

interface FavoritesContextType {
  favorites: Track[];
  toggleFavorite: (track: Track) => Promise<void>;
  isFavorite: (trackId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Track[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favs = snapshot.docs.map(doc => doc.data() as Track);
      setFavorites(favs);
    }, (error) => {
      console.error('Firestore Error: ', error);
    });

    return unsubscribe;
  }, [user]);

  const toggleFavorite = async (track: Track) => {
    if (!user) {
      alert('Please login to save songs!');
      return;
    }

    const favId = `${user.uid}_${track.id}`;
    const isFav = favorites.some(t => t.id === track.id);

    try {
      if (isFav) {
        await deleteDoc(doc(db, 'favorites', favId));
      } else {
        await setDoc(doc(db, 'favorites', favId), {
          ...track,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const isFavorite = (trackId: string) => {
    return favorites.some(t => t.id === trackId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
