'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car } from '@/models/Car';

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`/api/cars`);
        const cars: Car[] = await res.json();
        const foundCar = cars.find((c) => c._id?.toString() === id);
        if (foundCar) {
          setCar(foundCar);
        } else {
          setError('Car not found');
        }
      } catch (err) {
        setError('Error loading car details');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const calculateTotal = () => {
    if (!startDate || !endDate || !car) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return diffDays * car.pricePerDay;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };
    
    const token = getCookie('token') || localStorage.getItem('token');

    if (!token) {
      setError('Please log in to book a car.');
      router.push('/login');
      return;
    }

    setBookingLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId: id,
          startDate,
          endDate,
          passengers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Booking failed');
      }

      setSuccess('Booking successful! We will contact you shortly.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!car) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Car Details */}
        <div className="space-y-6">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-gray-800">
            <img 
              src={car.imageUrl} 
              alt={`${car.brand} ${car.model}`}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium border border-indigo-500/20">
              {car.category}
            </span>
            <h1 className="text-4xl font-bold">{car.brand} {car.model}</h1>
            <p className="text-gray-400 text-xl font-semibold">${car.pricePerDay} / day</p>
          </div>
          <div className="prose prose-invert">
            <p>Experience luxury and performance with the {car.brand} {car.model}. Perfect for your next trip, whether it's for business or leisure.</p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 h-fit shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">Book this car</h2>
          
          {error && <div className="bg-red-900/50 p-4 rounded-xl border border-red-700 mb-6 text-red-200">{error}</div>}
          {success && <div className="bg-green-900/50 p-4 rounded-xl border border-green-700 mb-6 text-green-200">{success}</div>}

          <form onSubmit={handleBooking} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                <input 
                  type="date" 
                  required
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                <input 
                  type="date" 
                  required
                  value={endDate}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Passengers</label>
              <select 
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full bg-gray-700 border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Passengers</option>)}
              </select>
            </div>

            {startDate && endDate && (
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-indigo-400">${calculateTotal()}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={bookingLoading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all ${bookingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {bookingLoading ? 'Processing...' : 'Reserve Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
