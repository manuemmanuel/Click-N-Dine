import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-red-600">Foodie</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/menu" className="text-gray-700 hover:text-red-600 transition-colors">
              Menu
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-red-600 transition-colors">
              How it Works
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-red-600 transition-colors">
              Pricing
            </Link>
            <Link href="/reviews" className="text-gray-700 hover:text-red-600 transition-colors">
              Reviews
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-red-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/menu"
                className="block px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Menu
              </Link>
              <Link
                href="/how-it-works"
                className="block px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                How it Works
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/reviews"
                className="block px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Reviews
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 