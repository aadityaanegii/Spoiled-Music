import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Auth: React.FC = () => {
  const { user, loading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) return null;

  return (
    <div className="relative">
      {user ? (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1 pr-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
          >
            <img 
              src={user.photoURL || ''} 
              alt={user.displayName || ''} 
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-48 bg-brand-charcoal border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 border-bottom border-white/5">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Account</p>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-bold">Log Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-gold/20"
        >
          <LogIn className="w-4 h-4" />
          <span>Login</span>
        </button>
      )}
    </div>
  );
};
