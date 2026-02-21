'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const token = getCookie('token') || localStorage.getItem('token');
    
    if (token) {
      try {
        const res = await fetch('/api/user/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const user = await res.json();
          setIsLoggedIn(true);
          setIsAdmin(user.role === 'admin');
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    // Re-check auth when navigation occurs or storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg md:text-xl">C</span>
            </div>
            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              CarHirePro
            </span>
          </Link>

          {!loading && (
            <div className="flex items-center space-x-4 md:space-x-8">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors font-medium hidden sm:block">
                Home
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className="text-gray-400 hover:text-white transition-colors font-medium">
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 rounded-lg hidden md:block">
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors font-medium">
                    Log In
                  </Link>
                  <Link href="/register" className="bg-white text-black px-4 py-1.5 md:px-6 md:py-2.5 rounded-full font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5 active:scale-95 text-sm md:text-base">
                    Join Now
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
