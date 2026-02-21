'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'fleet'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCar, setEditingCar] = useState<any>(null);
  const router = useRouter();

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getCookie('token') || localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        if (activeTab === 'bookings') {
          const res = await fetch('/api/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to fetch bookings');
          setBookings(await res.json());
        } else {
          const res = await fetch('/api/cars');
          if (!res.ok) throw new Error('Failed to fetch fleet');
          setCars(await res.json());
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, activeTab]);

  const updateBookingStatus = async (id: string, newStatus: string) => {
    const token = getCookie('token') || localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteCar = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle from the fleet?')) return;
    const token = getCookie('token') || localStorage.getItem('token');
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete car');
      setCars(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie('token') || localStorage.getItem('token');
    try {
      const res = await fetch(`/api/cars/${editingCar._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingCar)
      });
      if (!res.ok) throw new Error('Failed to update car');
      setCars(prev => prev.map(c => c._id === editingCar._id ? editingCar : c));
      setEditingCar(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 uppercase tracking-tighter">
              Admin Control Center
            </h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2">Enterprise Resource Management</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/add-car" className="bg-white text-black px-6 py-3 rounded-2xl font-black transition-all hover:bg-gray-200 shadow-xl shadow-white/5 active:scale-95 text-xs uppercase tracking-widest">
              + Register New Vehicle
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 w-fit mb-10 backdrop-blur-xl">
           <button 
             onClick={() => setActiveTab('bookings')}
             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
           >
             Bookings
           </button>
           <button 
             onClick={() => setActiveTab('fleet')}
             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'fleet' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
           >
             Manage Fleet
           </button>
        </div>

        {error && (
          <div className="bg-red-900/20 text-red-400 p-4 rounded-xl border border-red-900/50 mb-8 max-w-2xl text-xs font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <div className="bg-gray-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl relative">
          {loading && (
            <div className="absolute inset-0 z-50 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          )}

          {activeTab === 'bookings' ? (
            <div className="overflow-x-auto">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                <h2 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400">System Reservations</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{bookings.length} Orders</span>
              </div>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-white/2">
                    <th className="px-8 py-4 font-black">Customer / Date</th>
                    <th className="px-8 py-4 font-black">Vehicle</th>
                    <th className="px-8 py-4 font-black">Period</th>
                    <th className="px-8 py-4 font-black text-right">Revenue</th>
                    <th className="px-8 py-4 font-black text-center">Status</th>
                    <th className="px-8 py-4 font-black text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-8 py-5">
                        <div className="text-sm font-black text-white">{booking.userId}</div>
                        <div className="text-[9px] text-gray-500 mt-1 font-bold uppercase tracking-widest">
                          ID: {booking._id?.slice(-8)}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 rounded-lg overflow-hidden bg-gray-800 shrink-0 border border-white/5">
                             <img src={booking.carDetails.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                             <div className="text-xs font-black uppercase tracking-tight">{booking.carDetails.brand} {booking.carDetails.model}</div>
                             <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{booking.carDetails.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-[10px] font-bold text-gray-300">
                           {new Date(booking.startDate).toLocaleDateString()} &rarr; {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">{booking.passengers} Pax</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="text-sm font-black text-emerald-400">${booking.totalPrice}</div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400' : 
                          booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        {booking.status === 'pending' ? (
                          <div className="flex justify-center gap-2">
                            <button onClick={() => updateBookingStatus(booking._id, 'confirmed')} className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all">Confirm</button>
                            <button onClick={() => updateBookingStatus(booking._id, 'cancelled')} className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-500/20 transition-all">Reject</button>
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                <h2 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400">Fleet Inventory</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">{cars.length} Vehicles</span>
              </div>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-white/2">
                    <th className="px-8 py-4 font-black">Model</th>
                    <th className="px-8 py-4 font-black">Category</th>
                    <th className="px-8 py-4 font-black text-right">Daily Rate</th>
                    <th className="px-8 py-4 font-black text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cars.map((car) => (
                    <tr key={car._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           <img src={car.imageUrl} alt="" className="w-12 h-8 rounded-lg object-cover border border-white/5" />
                           <div className="text-xs font-black uppercase tracking-tight text-white">{car.brand} {car.model}</div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">{car.category}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-sm text-indigo-400">
                        ${car.pricePerDay}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setEditingCar(car)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button 
                            onClick={() => deleteCar(car._id)}
                            className="text-red-900/40 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Car Modal */}
        {editingCar && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-lg rounded-3xl border border-white/5 shadow-2xl p-8">
               <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-6">Modify Vehicle Details</h3>
               <form onSubmit={handleUpdateCar} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Brand</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      value={editingCar.brand}
                      onChange={e => setEditingCar({...editingCar, brand: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Model</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      value={editingCar.model}
                      onChange={e => setEditingCar({...editingCar, model: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Price Per Day ($)</label>
                    <input 
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      value={editingCar.pricePerDay}
                      onChange={e => setEditingCar({...editingCar, pricePerDay: Number(e.target.value)})}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                     <button type="submit" className="flex-1 bg-white text-black py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200">Save Changes</button>
                     <button type="button" onClick={() => setEditingCar(null)} className="flex-1 bg-white/5 border border-white/10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10">Cancel</button>
                  </div>
               </form>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between items-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
             <Link href="/" className="hover:text-white transition-colors flex items-center gap-2">
                &larr; Exit to Corporate Site
             </Link>
             <p>&copy; 2026 ProFleet Logistics</p>
        </div>
      </div>
    </div>
  );
}
