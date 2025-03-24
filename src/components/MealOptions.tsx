import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CartItem, MealBooking } from '@/types/database';
import TableSelector from './TableSelector';
import { useRouter } from 'next/navigation';

interface MealOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface MealOptionsProps {
  userId: string;
  onClose: () => void;
}

export default function MealOptions({ userId, onClose }: MealOptionsProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [tableCount, setTableCount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  
  const mealOptions: MealOption[] = [
    {
      id: '1',
      name: 'Classic Burger',
      description: 'Beef patty with lettuce, tomato, and cheese',
      price: 12.99,
      category: 'Main Course'
    },
    {
      id: '2',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with caesar dressing and croutons',
      price: 8.99,
      category: 'Salads'
    },
    {
      id: '3',
      name: 'Margherita Pizza',
      description: 'Fresh tomatoes, mozzarella, and basil',
      price: 14.99,
      category: 'Main Course'
    },
    // Add more meal options as needed
  ];

  const addToCart = (meal: MealOption) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === meal.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === meal.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...meal, quantity: 1 }];
    });
  };

  const removeFromCart = (mealId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== mealId));
  };

  const updateQuantity = (mealId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === mealId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (selectedTables.length === 0) {
      alert('Please select at least one table');
      return;
    }

    setLoading(true);
    try {
      // Create booking records for each table
      const bookings = selectedTables.map(tableId => ({
        user_id: userId,
        table_id: tableId,
        items: cart,
        total_amount: getTotalPrice(),
        status: 'pending',
      }));

      const { data, error: bookingError } = await supabase
        .from('meal_bookings')
        .insert(bookings)
        .select();

      if (bookingError) throw bookingError;

      // Update table status for all selected tables
      const { error: tableError } = await supabase
        .from('tables')
        .update({ is_occupied: true })
        .in('id', selectedTables);

      if (tableError) throw tableError;

      // Navigate to tracking page with the first booking ID
      router.push(`/track-meal?id=${data[0].id}`);
    } catch (error: any) {
      alert('Error booking meals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Select Your Meals</h2>
          <button onClick={onClose} className="text-gray-700 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Select Number of Tables</h3>
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setTableCount(Math.max(1, tableCount - 1))}
              className="bg-gray-200 px-3 py-1 rounded text-slate-900"
            >
              -
            </button>
            <span className="text-slate-900 font-medium">{tableCount}</span>
            <button
              onClick={() => setTableCount(Math.min(10, tableCount + 1))}
              className="bg-gray-200 px-3 py-1 rounded text-slate-900"
            >
              +
            </button>
          </div>
          <TableSelector 
            onTablesSelected={setSelectedTables}
            maxTables={tableCount}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900">Available Meals</h3>
            {mealOptions.map(meal => (
              <div key={meal.id} className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-medium text-lg text-slate-900">{meal.name}</h4>
                <p className="text-slate-700 text-sm">{meal.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium text-slate-900">${meal.price}</span>
                  <button
                    onClick={() => addToCart(meal)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900">Your Cart</h3>
            {cart.length === 0 ? (
              <p className="text-slate-700">Your cart is empty</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-slate-900">{item.name}</h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-200 px-2 rounded text-slate-900"
                        >
                          -
                        </button>
                        <span className="text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-200 px-2 rounded text-slate-900"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-slate-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-slate-900">Total:</span>
                    <span className="font-semibold text-slate-900">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading || selectedTables.length === 0 || cart.length === 0}
                    className={`
                      w-full py-3 rounded-xl font-medium transition-colors
                      ${loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700'
                      } text-white
                    `}
                  >
                    {loading ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 