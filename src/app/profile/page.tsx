'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const router = useRouter();

  const fetchProfileData = async () => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const token = getCookie('token') || localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Fetch user info
      const userRes = await fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userRes.ok) setUser(await userRes.json());

      // Fetch bookings
      const bookingRes = await fetch('/api/bookings/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bookingRes.ok) setBookings(await bookingRes.json());
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
    router.refresh();
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (!res.ok) throw new Error('Failed to cancel booking');
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    try {
      const res = await fetch(`/api/bookings/${editingBooking._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startDate: editingBooking.startDate,
          endDate: editingBooking.endDate,
          passengers: editingBooking.passengers
        })
      });
      if (!res.ok) throw new Error('Failed to update booking');
      const data = await res.json();
      setBookings(prev => prev.map(b => b._id === editingBooking._id ? { ...b, ...data.updates } : b));
      setEditingBooking(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">
              My <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Profile</span>
            </h1>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xl">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Account ID</p>
                 <p className="text-xs font-bold text-gray-300">{user?.email}</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xl">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Membership</p>
                 <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{user?.role} Elite</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="group bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 active:scale-95"
          >
            Terminal Logout
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Summary Card */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-white/2 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8 text-white">Drive Metrics</h3>
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Bookings</span>
                      <span className="text-2xl font-black text-white">{bookings.filter(b => b.status === 'confirmed').length}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Credit</span>
                      <span className="text-2xl font-black text-emerald-400">$0.00</span>
                   </div>
                   <div className="h-px bg-white/5 w-full" />
                   <p className="text-[10px] text-gray-600 font-bold leading-relaxed uppercase tracking-widest">Your account is in good standing. Premium perks are available.</p>
                </div>
             </div>
          </div>

          {/* Bookings List */}
          <div className="lg:col-span-8">
             <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 text-white">Reservation Ledger</h3>
             {bookings.length === 0 ? (
               <div className="bg-white/2 border border-white/5 rounded-[3rem] p-20 text-center backdrop-blur-3xl">
                  <p className="text-gray-500 font-bold uppercase tracking-widest mb-6">No Active Reservations Found</p>
                  <Link href="/#fleet" className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Browse Corporate Fleet</Link>
               </div>
             ) : (
               <div className="space-y-6">
                 {bookings.map((booking) => (
                   <div key={booking._id} className="group bg-white/2 border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 hover:border-white/10 transition-all backdrop-blur-3xl relative overflow-hidden">
                      <div className="w-full md:w-48 h-32 rounded-3xl overflow-hidden bg-gray-800 shrink-0 border border-white/5">
                         <img src={booking.carDetails?.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <h4 className="text-xl font-black uppercase tracking-tight text-white">{booking.carDetails?.brand} {booking.carDetails?.model}</h4>
                               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">{booking.carDetails?.category}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                              booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                               {booking.status}
                            </span>
                         </div>
                         <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <div>
                               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Duration</p>
                               <p className="text-xs font-bold text-gray-300">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Guests</p>
                               <p className="text-xs font-bold text-gray-300">{booking.passengers} Pax</p>
                            </div>
                            <div className="col-span-2 lg:col-span-1">
                               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Fee</p>
                               <p className="text-xl font-black text-white tracking-tighter">${booking.totalPrice}</p>
                            </div>
                         </div>
                         
                         {/* Action Buttons */}
                         {(booking.status === 'pending' || booking.status === 'confirmed') && (
                           <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5">
                              <button 
                                onClick={() => setEditingBooking(booking)}
                                className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95 flex items-center gap-2"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Modify Dates
                              </button>
                              <button 
                                onClick={() => handleCancelBooking(booking._id)}
                                className="bg-red-500/5 hover:bg-red-500/10 text-red-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/10 active:scale-95 flex items-center gap-2"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                Cancel Reserve
                              </button>
                           </div>
                         )}
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-lg rounded-[3rem] border border-white/5 shadow-2xl p-10 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full" />
             <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-8">Adjust Reservation</h3>
             <form onSubmit={handleUpdateBooking} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Pickup Date</label>
                     <input 
                       type="date"
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white font-bold"
                       value={editingBooking.startDate.split('T')[0]}
                       onChange={e => setEditingBooking({...editingBooking, startDate: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Return Date</label>
                     <input 
                       type="date"
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white font-bold"
                       value={editingBooking.endDate.split('T')[0]}
                       onChange={e => setEditingBooking({...editingBooking, endDate: e.target.value})}
                     />
                   </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Occupants</label>
                  <input 
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white font-bold"
                    value={editingBooking.passengers}
                    onChange={e => setEditingBooking({...editingBooking, passengers: Number(e.target.value)})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="submit" className="flex-1 bg-white text-black py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95">Verify & Update</button>
                   <button type="button" onClick={() => setEditingBooking(null)} className="flex-1 bg-white/5 border border-white/10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Dismiss</button>
                </div>
                <p className="text-[9px] text-gray-500 font-bold uppercase text-center tracking-widest">Pricing will be automatically recalculated upon verification.</p>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{label}</p>
      <p className="font-bold text-gray-200">{value}</p>
    </div>
  );
}

