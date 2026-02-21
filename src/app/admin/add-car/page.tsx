'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddCarPage() {
  const [model, setModel] = useState('');
  const [brand, setBrand] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!imageFile) {
      setError('Please select an image to upload.');
      return;
    }

    // Extract token from cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };
    
    const token = getCookie('token') || localStorage.getItem('token');

    if (!token) {
      setError('Not authenticated. Please log in.');
      router.push('/login');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('model', model);
      formData.append('brand', brand);
      formData.append('pricePerDay', pricePerDay);
      formData.append('category', category);
      formData.append('image', imageFile);

      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add car');
      }

      setSuccess('Car added successfully with image!');
      // Clear form
      setModel('');
      setBrand('');
      setPricePerDay('');
      setCategory('');
      setImageFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6">Add New Car</h1>
        
        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded mb-6 border border-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 text-green-200 p-4 rounded mb-6 border border-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                placeholder="Mercedes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                placeholder="E-Class"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Price Per Day</label>
              <input
                type="number"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              >
                <option value="">Select Category</option>
                <option value="Luxury">Luxury</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required
                className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? 'Adding Car...' : 'Add Car'}
          </button>
        </form>
      </div>
    </div>
  );
}
