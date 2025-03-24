'use client';

import { aeonik } from '@/fonts/fonts';
import Navbar from '@/components/Navbar';

const pricingPlans = [
  {
    name: 'Lunch Special',
    price: 24.99,
    description: 'Perfect for a quick business lunch',
    features: [
      'Main course selection',
      'Side dish',
      'Soft drink',
      'Free WiFi',
      '30-minute service guarantee'
    ],
    popular: false
  },
  {
    name: 'Dinner Experience',
    price: 49.99,
    description: 'Full dining experience with premium options',
    features: [
      'Premium main course',
      'Appetizer',
      'Dessert',
      'Wine pairing',
      'Priority service'
    ],
    popular: true
  },
  {
    name: 'Family Package',
    price: 89.99,
    description: 'Great value for family dining',
    features: [
      '4 main courses',
      '2 appetizers',
      '2 desserts',
      'Family-style sides',
      'Free kids menu'
    ],
    popular: false
  }
];

export default function PricingPage() {
  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50 w-full`}>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] pt-16 bg-gradient-to-r from-red-600 to-red-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-6 px-4">
            <h1 className="text-5xl md:text-6xl font-bold">
              Our <span className="text-yellow-400">Pricing</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
              Choose the perfect dining experience for you
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-red-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-red-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-red-600">${plan.price}</span>
                  <span className="text-gray-600">/person</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-colors ${
                    plan.popular
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-50'
                  }`}
                >
                  Select Plan
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Additional Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Special Offers</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-gray-600">Happy Hour: 20% off all drinks (4-6 PM)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-gray-600">Weekend Brunch: Free dessert with main course</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-gray-600">Student Discount: 15% off with valid ID</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Group Bookings</h3>
              <p className="text-gray-600 mb-4">
                Planning a special event? Contact us for custom group packages and special arrangements.
              </p>
              <button className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors">
                Contact for Group Booking
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 