'use client';

import { aeonik } from '@/fonts/fonts';
import Navbar from '@/components/Navbar';

const steps = [
  {
    id: 1,
    title: 'Find Your Table',
    description: 'Locate your assigned table number in the restaurant. Each table has a unique QR code.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Scan the QR Code',
    description: 'Open your camera and scan the QR code on your table. This connects you to our ordering system.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Browse & Order',
    description: 'Explore our menu, select your items, and customize your order as needed.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Track Your Order',
    description: 'Monitor your order status in real-time and receive notifications when it\'s ready.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export default function HowItWorksPage() {
  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50 w-full`}>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] pt-16 bg-gradient-to-r from-red-600 to-red-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-6 px-4">
            <h1 className="text-5xl md:text-6xl font-bold">
              How it <span className="text-yellow-400">Works</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
              Simple steps to enjoy your meal
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Steps Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-semibold text-red-600">Step {step.id}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Need Help?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Common Questions</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-gray-600">What if I can't scan the QR code?</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-gray-600">How do I modify my order?</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-gray-600">Can I split the bill?</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Contact Support</h3>
              <p className="text-gray-600 mb-4">
                Our staff is always ready to help you with any questions or concerns.
              </p>
              <button className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors">
                Contact Staff
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 