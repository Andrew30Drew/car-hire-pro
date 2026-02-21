'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Car } from '@/models/Car';

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('token=')) || localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    checkAuth();

    const fetchCars = async () => {
      try {
        const res = await fetch('/api/cars');
        if (!res.ok) throw new Error('Failed to fetch cars');
        const data = await res.json();
        setCars(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <div className="relative isolate overflow-hidden bg-gray-950">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-indigo-600/10 blur-[150px] rounded-full -z-10 animate-pulse" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full -z-10" />

      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 pt-24 pb-32 md:pt-40 md:pb-56 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-xl mb-10 animate-fade-in shadow-2xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
          <span className="text-xs md:text-sm text-gray-300 font-bold uppercase tracking-[0.2em]">Exotic Collection 2026</span>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-black tracking-tight text-white mb-10 leading-[0.85] text-balance uppercase">
          ELEVATE YOUR <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-cyan-400">
            DRIVE
          </span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-lg md:text-2xl text-gray-400 font-medium leading-relaxed mb-16 text-balance">
          Bespoke car hire for those who demand excellence. Discover an elite fleet of luxury, performance, and prestige vehicles.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href={isLoggedIn ? "/profile" : "/register"} className="w-full sm:w-auto bg-white text-black px-10 py-5 rounded-[2rem] font-black hover:bg-gray-200 transition-all shadow-[0_20px_50px_-15px_rgba(255,255,255,0.2)] active:scale-95 text-xl uppercase tracking-tighter">
            {isLoggedIn ? "Access Dashboard" : "Start Registration"}
          </Link>
          <a href="#fleet" className="w-full sm:w-auto bg-white/5 border border-white/10 backdrop-blur-xl px-10 py-5 rounded-[2rem] font-bold hover:bg-white/10 transition-all text-xl uppercase tracking-tighter">
            Explore Fleet
          </a>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-40 text-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-10">Trusted Global Partners</p>
        <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 items-center grayscale invert">
           <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Mercedes-Benz_Logo_2010.svg" className="h-8 md:h-10" alt="" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Porsche_wordmark.svg" className="h-4 md:h-5" alt="" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/9/90/BMW_logo_%28gray%29.svg" className="h-8 md:h-10" alt="" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Audi_logo_detail.svg" className="h-6 md:h-8" alt="" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Tesla_Motors_Logo.svg" className="h-10 md:h-12" alt="" />
        </div>
      </div>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-56 relative">
         <div className="absolute -top-40 left-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full" />
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Elite Selection" 
              desc="Access the world's most sought-after luxury and performance brands in one place."
              icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
            />
            <FeatureCard 
              title="Tailored Service" 
              desc="Personalized rental agreements and VIP concierge support for every journey."
              icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354l1.1 3.383h3.553l-2.873 2.087 1.097 3.385-2.877-2.09-2.877 2.09 1.097-3.385-2.873-2.087h3.553L12 4.354z" /></svg>}
            />
            <FeatureCard 
              title="Global Network" 
              desc="Whether it's for business or leisure, we provide mobility excellence worldwide."
              icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
         </div>
      </section>

      {/* Car Listing Section */}
      <section id="fleet" className="max-w-7xl mx-auto px-6 lg:px-8 pb-56">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-4">
            <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-xs">The Collection</span>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">Featured <br />Fleet</h2>
          </div>
          <div className="flex flex-wrap gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/5 backdrop-blur-xl">
            {['All Models', 'Prestige', 'Executive', 'Sports'].map((cat, idx) => (
              <button key={cat} className={`px-6 py-2.5 rounded-full transition-all text-xs font-black uppercase tracking-widest ${idx === 0 ? 'bg-white text-black' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 bg-red-900/10 p-12 rounded-[3rem] border border-red-900/30 backdrop-blur-3xl">
            <p className="font-extrabold text-2xl mb-3 uppercase tracking-tighter">System Offline</p>
            <p className="text-sm font-bold opacity-60 tracking-widest uppercase">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {cars.map((car) => (
              <Link
                key={car._id?.toString()}
                href={`/cars/${car._id?.toString()}`}
                className="group relative bg-gray-900/20 rounded-[3rem] overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all duration-700 hover:shadow-[0_40px_100px_-20px_rgba(79,70,229,0.25)] flex flex-col backdrop-blur-3xl"
              >
                <div className="h-64 overflow-hidden relative bg-gray-800">
                  <img
                    src={car.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute top-8 left-8">
                    <span className="bg-black/40 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-white/10">
                      {car.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-10 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight uppercase">
                        {car.brand} <br /> {car.model}
                      </h3>
                      <p className="text-gray-500 mt-2 font-bold text-xs uppercase tracking-widest">Ultimate Series • Elite Comfort</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-8 border-t border-white/5 flex justify-between items-center group/btn">
                    <div>
                       <p className="text-4xl font-black text-white tracking-tighter">${car.pricePerDay}</p>
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">Daily Reserve</p>
                    </div>
                    <div className="bg-white text-black p-5 rounded-[1.5rem] transition-all group-hover:bg-indigo-500 group-hover:text-white shadow-xl">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Rental Process */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-56">
         <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 md:p-24 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full" />
            <div className="text-center mb-20">
               <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-xs">Methodology</span>
               <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mt-4 uppercase">How it <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Works</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 relative">
               <Step num="01" title="Select Vehicle" desc="Browse our exclusive collection and choose the model that fits your occasion." />
               <Step num="02" title="Reserve Dates" desc="Choose your pickup and return locations. Our system calculates instant pricing." />
               <Step num="03" title="Take Command" desc="Once verified, your vehicle will be ready for pickup or luxury delivery." />
            </div>
         </div>
      </section>

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-6 pb-20 text-center">
         <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
                <span className="text-black font-black text-xl">C</span>
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter text-white">CarHirePro</span>
            </div>
         </div>
         <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />
         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-[10px] font-black tracking-[0.5em] uppercase">
              &copy; 2026 CarHirePro Enterprise • All Rights Reserved
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
               <a href="#" className="hover:text-white transition-colors">Legal</a>
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Fleet Solutions</a>
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/2 rounded-[2.5rem] p-10 border border-white/5 hover:border-indigo-500/20 transition-all group backdrop-blur-3xl">
       <div className="bg-indigo-600/10 text-indigo-400 p-5 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{title}</h3>
       <p className="text-gray-500 font-medium leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="text-center md:text-left relative group">
       <span className="text-8xl font-black text-white/5 absolute -top-12 -left-4 md:-left-8 group-hover:text-indigo-500/10 transition-colors pointer-events-none">{num}</span>
       <h3 className="text-2xl font-black text-white mb-4 relative uppercase tracking-tighter">{title}</h3>
       <p className="text-gray-400 font-medium leading-relaxed relative text-sm">{desc}</p>
    </div>
  );
}

