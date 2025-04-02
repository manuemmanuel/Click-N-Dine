'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { aeonik } from '@/fonts/fonts';

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

interface MenuDisplayProps {
  onClose: () => void;
  tableId: string;
}

export default function MenuDisplay({ onClose, tableId }: MenuDisplayProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<{ item: MenuItem; quantity: number }[]>([]);

  useEffect(() => {
    // Verify Supabase client
    if (!supabase) {
      console.error('Supabase client not initialized');
      setError('System error: Database connection not available');
      setLoading(false);
      return;
    }

    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching menu items...');
      
      // First, get all menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category');

      if (menuError) {
        console.error('Menu fetch error:', menuError);
        throw menuError;
      }

      if (!menuData) {
        console.error('No menu data received');
        throw new Error('No menu data received');
      }

      console.log('Menu data received:', menuData);

      // Then, get unique categories
      const uniqueCategories = Array.from(new Set(menuData.map(item => item.category)));

      setMenuItems(menuData);
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Failed to load menu items. Please try again.');
      setLoading(false);
    }
  };

  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  const addToOrder = (menuItem: MenuItem | number) => {
    // If a number is passed, find the corresponding menu item
    const itemToAdd = typeof menuItem === 'number' 
      ? menuItems.find(item => item.id === menuItem)
      : menuItem;

    if (!itemToAdd) {
      console.error('Menu item not found:', menuItem);
      return;
    }

    setOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { item: itemToAdd, quantity: 1 }];
    });
  };

  const removeFromOrder = (menuItemId: number) => {
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.item.id === menuItemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item =>
          item.item.id === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevItems.filter(item => item.item.id !== menuItemId);
    });
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.item.price * item.quantity);
    }, 0);
  };

  const validateTableId = (id: string): boolean => {
    // Check if the ID matches the format: XX/CS/XXX (e.g., 22/CS/062)
    const tableIdRegex = /^\d{2}\/CS\/\d{3}$/;
    return tableIdRegex.test(id);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate table ID format
      if (!validateTableId(tableId)) {
        throw new Error('Invalid table ID format. Expected format: XX/CS/XXX (e.g., 22/CS/062)');
      }

      // Create order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            table_id: tableId,
            status: 'pending',
            total_amount: calculateTotal(),
            items: orderItems.map(item => ({
              menu_item_id: item.item.id,
              quantity: item.quantity,
              price: item.item.price,
              name: item.item.name
            }))
          }
        ])
        .select()
        .single();

      if (orderError) {
        console.error('Order placement error:', orderError);
        throw orderError;
      }

      // Show success message
      setError('Order placed successfully! Redirecting to tracking page...');
      
      // Redirect to order tracking page after a short delay
      setTimeout(() => {
        window.location.href = `/order/track/${orderData.id}`;
      }, 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      setError(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${aeonik.variable} font-sans fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Loading Menu...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${aeonik.variable} font-sans fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4`}>
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Menu for Table {tableId}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-6">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={item.image_url || '/placeholder-food.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-red-600">
                        ₹{item.price}
                      </span>
                      <button
                        onClick={() => addToOrder(item)}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                      >
                        Add to Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-4">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Order Summary</h2>
            
            {orderItems.length === 0 ? (
              <p className="text-gray-600 text-center py-6">Your order is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  {orderItems.map((item) => (
                    <div key={item.item.id} className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-slate-900">{item.item.name}</h3>
                        <p className="text-sm text-gray-600">₹{item.item.price} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromOrder(item.item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          -
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button
                          onClick={() => addToOrder(item.item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">₹{(calculateTotal() * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900">Total</span>
                    <span className="text-lg font-bold text-red-600">
                      ₹{(calculateTotal() * 1.18).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || orderItems.length === 0}
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-colors ${
                    loading || orderItems.length === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 