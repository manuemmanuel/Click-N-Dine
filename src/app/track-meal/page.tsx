'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { aeonik } from '@/fonts/fonts';
import { MealBooking } from '@/types/database';
import { useRouter } from 'next/navigation';
import RatingModal from '@/components/RatingModal';

export default function TrackMealPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<MealBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    // Get booking ID from URL
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('id');

    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const { data, error } = await supabase
          .from('meal_bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (error) throw error;
        setBooking(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // Set up real-time subscription
    const subscription = supabase
      .channel('booking_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meal_bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          setBooking(payload.new as MealBooking);
        }
      )
      .subscribe();

    fetchBooking();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCompleteOrder = async () => {
    if (!booking) return;

    try {
      // Update booking status to completed
      const { error: bookingError } = await supabase
        .from('meal_bookings')
        .update({ status: 'completed' })
        .eq('id', booking.id);

      if (bookingError) throw bookingError;

      // Clear table occupation
      const { error: tableError } = await supabase
        .from('tables')
        .update({ is_occupied: false })
        .eq('id', booking.table_id);

      if (tableError) throw tableError;

      // Show rating modal instead of redirecting
      setShowRatingModal(true);
    } catch (error: any) {
      alert('Error completing order: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50 w-full`}>
        <main className="p-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-slate-800">
                Loading <span className="text-red-600">Booking</span>...
              </h1>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50 w-full`}>
        <main className="p-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-slate-800">
                <span className="text-red-600">Error</span>
              </h1>
              <p className="text-gray-600">{error || 'Booking not found'}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50 w-full`}>
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-slate-800">
              Track Your <span className="text-red-600">Meal</span>
            </h1>
            <p className="text-gray-600">Booking ID: {booking.id}</p>
          </div>

          <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-slate-900">Order Status</h2>
                <span className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'}
                `}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Order Details</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">Table: {booking.table_id}</p>
                  <p className="text-gray-600">Total Amount: ${booking.total_amount}</p>
                  <p className="text-gray-600">Ordered At: {new Date(booking.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Items</h3>
                <div className="space-y-2">
                  {booking.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-red-600">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {booking.status !== 'completed' && (
                <div className="pt-6 border-t">
                  <button
                    onClick={handleCompleteOrder}
                    className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
                  >
                    Mark Order as Completed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {showRatingModal && (
        <RatingModal
          bookingId={booking.id}
          onClose={() => {
            setShowRatingModal(false);
            router.push('/');
          }}
        />
      )}
    </div>
  );
} 