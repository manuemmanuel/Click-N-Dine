import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface RatingModalProps {
  bookingId: string;
  onClose: () => void;
}

export default function RatingModal({ bookingId, onClose }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const { data, error } = await supabase
          .from('meal_bookings')
          .select('user_id')
          .eq('id', bookingId)
          .single();

        if (error) throw error;
        setUserId(data.user_id);
      } catch (error: any) {
        console.error('Error fetching booking:', error);
      }
    }

    fetchBooking();
  }, [bookingId]);

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a rating');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!userId) {
      alert('Error: User information not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          user_id: userId,
          rating,
          review_text: review,
          name: name.trim(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      onClose();
    } catch (error: any) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Rate Your Experience</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-900 font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-500'
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <div>
            <label className="block text-gray-900 font-medium mb-2">Review</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500 h-32 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 