'use client';

import { useState, useEffect } from 'react';
import { aeonik } from '@/fonts/fonts';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

interface Review {
  id: string;
  name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedRating) {
        query = query.eq('rating', selectedRating);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      setError('Failed to load reviews. Please try again later.');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedRating]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] bg-gradient-to-r from-red-600 to-red-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-6 px-4">
            <h1 className="text-5xl md:text-6xl font-bold">
              Customer <span className="text-yellow-400">Reviews</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
              See what our customers have to say about their dining experience
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Rating Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">{averageRating}</div>
              <div className="flex justify-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-2xl text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-600">Based on {reviews.length} reviews</p>
            </div>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <div className="w-12 text-sm font-medium text-gray-900">{rating} stars</div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{
                        width: `${((ratingCounts[rating] || 0) / reviews.length) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm text-gray-600">{ratingCounts[rating] || 0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{review.name}</h3>
                <div className="flex items-center">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{review.review_text}</p>
              <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {reviews.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Foodie</h4>
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
              <p className="text-gray-400">123 Restaurant Street</p>
              <p className="text-gray-400">City, State 12345</p>
              <p className="text-gray-400">Phone: (123) 456-7890</p>
              <a 
                href="https://wa.me/919497085797" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors flex items-center space-x-2 mt-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.287.129.332.202.045.073.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                </svg>
                <span>WhatsApp: +91 9497085797</span>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Foodie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 