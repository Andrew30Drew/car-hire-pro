'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Simple token decode to get role (client-side)
    const token = localStorage.getItem('token') || (document.cookie.match(/token=([^;]+)/)?.[1]);
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setRole(payload.role);
    } catch (e) {
      console.error('Failed to parse token', e);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-indigo-400">Your Account</h2>
            <p className="text-gray-400 mb-4">You are logged in as: <span className="text-white font-medium capitalize">{role || 'User'}</span></p>
            <div className="text-sm text-gray-500">
              Welcome back to Car Hire Pro.
            </div>
          </div>

          {role === 'admin' && (
             <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-emerald-400">Admin Controls</h2>
              <p className="text-gray-400 mb-6">Manage fleet and view reports.</p>
              <Link
                href="/admin"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition-colors"
              >
                Go to Admin Dashboard
              </Link>
            </div>
          )}
        </div>
        
        <div className="mt-12">
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                &larr; Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}
