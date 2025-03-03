'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { aeonik } from '@/fonts/fonts'

export default function QRScanPage() {
  const [mounted, setMounted] = useState(false);
  const [scannedUserId, setScannedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setScannedUserId(decodedText);
        setError(null);
      },
      (errorMessage) => {
        if (errorMessage?.includes('NotFound')) return;
        setError(errorMessage);
      }
    );

    return () => {
      scanner.clear();
    };
  }, [mounted]);

  const handleBookMeal = async () => {
    if (!scannedUserId) return;

    try {
      const response = await fetch('/api/book-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: scannedUserId.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to book meal');
      }

      alert('Meal booked successfully!');
      setScannedUserId(null);
      setError(null);
    } catch (err: any) {
      setError('Error booking meal: ' + err.message);
    }
  };

  if (!mounted) {
    return (
      <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50 w-full`}>
        <main className="p-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-slate-800">
                Loading <span className="text-red-600">Scanner</span>...
              </h1>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50 w-full h-full fixed inset-0 overflow-auto`}>
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-slate-800">
              Scan QR Code to <span className="text-red-600">Book Meal</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Point your camera at a valid meal QR code to quickly book your meal
            </p>
          </div>
          
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all">
            <div 
              id="reader" 
              className="overflow-hidden rounded-xl"
              style={{ border: 'none' }}
            ></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center max-w-md w-full">
              {error}
            </div>
          )}
          
          {scannedUserId && (
            <div className="flex flex-col items-center space-y-6 bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Scanned User ID</p>
                <p className="text-2xl font-medium text-slate-800">{scannedUserId}</p>
              </div>
              
              <button 
                onClick={handleBookMeal}
                className="inline-flex items-center bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition-all transform hover:scale-105 text-lg font-medium shadow-lg hover:shadow-xl w-full justify-center group"
              >
                Book Meal
                <svg 
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
