'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { aeonik } from '@/fonts/fonts'
import MealOptions from '@/components/MealOptions'
import Navbar from '@/components/Navbar';
import MenuDisplay from '@/components/MenuDisplay';

export default function QRScanPage() {
  const [mounted, setMounted] = useState(false);
  const [scannedUserId, setScannedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMealOptions, setShowMealOptions] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const newScanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      },
      false
    );

    setScanner(newScanner);

    // Don't render immediately, wait for button click
    return () => {
      newScanner.clear();
    };
  }, [mounted]);

  const handleStartScanner = () => {
    if (!scanner) return;
    
    // Clear any existing scanner
    scanner.clear();
    
    // Render the scanner
    scanner.render(
      (decodedText) => {
        setScannedUserId(decodedText);
        setError(null);
        // Stop scanning after successful scan
        scanner.clear();
      },
      (errorMessage) => {
        if (errorMessage?.includes('NotFound')) return;
        setError(errorMessage);
      }
    );

    // Scroll to QR scanner section
    const scannerSection = document.getElementById('qr-scanner-section');
    if (scannerSection) {
      scannerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookMeal = () => {
    if (!scannedUserId) return;
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
    setScannedUserId(null);
    // Restart scanner when closing menu
    if (scanner) {
      scanner.render(
        (decodedText) => {
          setScannedUserId(decodedText);
          setError(null);
          scanner.clear();
        },
        (errorMessage) => {
          if (errorMessage?.includes('NotFound')) return;
          setError(errorMessage);
        }
      );
    }
  };

  const handleRestartScanner = () => {
    if (scanner) {
      scanner.clear();
      scanner.render(
        (decodedText) => {
          setScannedUserId(decodedText);
          setError(null);
          scanner.clear();
        },
        (errorMessage) => {
          if (errorMessage?.includes('NotFound')) return;
          setError(errorMessage);
        }
      );
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
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50 w-full`}>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[80vh] pt-16 bg-gradient-to-r from-red-600 to-red-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="text-center text-white space-y-8 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Effortless Dining – <br />
              <span className="text-yellow-400">Scan, Order & Enjoy!</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto">
              Experience the future of dining with our smart ordering system. No more waiting for menus or servers.
            </p>
            
            {/* Call-to-action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button 
                onClick={handleStartScanner}
                className="inline-flex items-center bg-white text-red-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 text-lg font-medium shadow-lg hover:shadow-xl group"
              >
                Scan QR to Order
                <svg 
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <a 
                href="/admin/login"
                className="inline-flex items-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-all transform hover:scale-105 text-lg font-medium shadow-lg hover:shadow-xl group"
              >
                Admin Login
                <svg 
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Overview Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Why Choose Click-N-Dine?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our smart ordering system revolutionizes the dining experience by combining convenience, efficiency, and technology to create a seamless journey from order to plate.
            </p>
            
            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="p-6 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Quick & Easy</h3>
                <p className="text-gray-600">Order in seconds with our intuitive QR code scanning system</p>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Accurate Orders</h3>
                <p className="text-gray-600">Eliminate order errors with our digital ordering system</p>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Real-time Updates</h3>
                <p className="text-gray-600">Track your order status in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              How Click-N-Dine Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these simple steps to place your order and enjoy your meal
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex-shrink-0 w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">
                1
              </div>
              <div className="text-center">
                <h4 className="font-medium text-slate-900 text-xl mb-3">Find your table</h4>
                <p className="text-gray-600">Locate your assigned table number</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex-shrink-0 w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">
                2
              </div>
              <div className="text-center">
                <h4 className="font-medium text-slate-900 text-xl mb-3">Scan the QR code</h4>
                <p className="text-gray-600">Point your camera at the QR code on your table</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex-shrink-0 w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">
                3
              </div>
              <div className="text-center">
                <h4 className="font-medium text-slate-900 text-xl mb-3">Place your order</h4>
                <p className="text-gray-600">Browse the menu and select your items</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex-shrink-0 w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">
                4
              </div>
              <div className="text-center">
                <h4 className="font-medium text-slate-900 text-xl mb-3">Track your order</h4>
                <p className="text-gray-600">Monitor your order status in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* QR Scanner Section */}
      <div id="qr-scanner-section" className="py-8 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 sm:space-y-8 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Scan Your Table QR Code
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Point your camera at the QR code on your table to start ordering
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all">
              <div 
                id="reader" 
                className="overflow-hidden rounded-xl"
                style={{ border: 'none' }}
              ></div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center text-sm sm:text-base">
                {error}
              </div>
            )}
            
            {scannedUserId && (
                <div className="flex flex-col items-center space-y-4 sm:space-y-6 bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg">
                <div className="text-center">
                    <p className="text-xl sm:text-2xl font-medium text-slate-800">{scannedUserId}</p>
                </div>
                
                  <div className="flex flex-col space-y-3 sm:space-y-4 w-full">
                  <button 
                    onClick={handleBookMeal}
                      className="inline-flex items-center bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-red-700 transition-all transform hover:scale-105 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl w-full justify-center group"
                  >
                    Book Meal
                    <svg 
                        className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button 
                    onClick={handleRestartScanner}
                      className="inline-flex items-center bg-white text-red-600 border-2 border-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-red-50 transition-all transform hover:scale-105 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl w-full justify-center group"
                  >
                    Scan Another Code
                    <svg 
                        className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
                  </div>
                </div>
              </div>
            </div>

      {/* Help & Support Section */}
      <div className="py-8 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 sm:space-y-8 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Need Help?
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Our support team is here to assist you with any questions or concerns
            </p>
            </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg">
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">
                Contact Support
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Our staff is here to assist you with any questions or concerns.
              </p>
              <a 
                href="https://wa.me/919497085797" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white py-2 sm:py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.287.129.332.202.045.073.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                </svg>
                <span>WhatsApp: +91 9497085797</span>
              </a>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg">
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">
                Tips for Scanning
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600">
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Ensure good lighting for better scanning</span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Hold your camera steady</span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Make sure the QR code is fully visible</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Click-N-Dine</h4>
              <p className="text-gray-400">
                Experience the future of dining with our smart ordering system.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Hours</h4>
              <p className="text-gray-400">Monday - Friday: 11:00 AM - 10:00 PM</p>
              <p className="text-gray-400">Saturday - Sunday: 10:00 AM - 11:00 PM</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Contact</h4>
              <a 
                href="https://wa.me/919497085797" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.287.129.332.202.045.073.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                </svg>
                <span>WhatsApp: +91 9497085797</span>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Click-N-Dine. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {showMenu && scannedUserId && (
        <MenuDisplay 
          tableId={scannedUserId} 
          onClose={handleCloseMenu} 
        />
      )}
    </div>
  );
}
