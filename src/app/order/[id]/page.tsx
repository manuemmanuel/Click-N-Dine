'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { aeonik } from '@/fonts/fonts';
import Navbar from '@/components/Navbar';
import { useParams } from 'next/navigation';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  available: boolean;
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function OrderPage() {
  const params = useParams();
  const tableId = params.id as string;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true);

      if (menuError) throw menuError;

      const { data: categoryData, error: categoryError } = await supabase
        .from('menu_categories')
        .select('name');

      if (categoryError) throw categoryError;

      setMenuItems(menuData || []);
      setCategories(categoryData?.map(cat => cat.name) || []);
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

  const addToOrder = (menuItemOrId: MenuItem | string) => {
    const menuItem = typeof menuItemOrId === 'string' 
      ? menuItems.find(item => item.id === menuItemOrId)
      : menuItemOrId;

    if (!menuItem) return;

    setOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.menuItem.id === menuItem.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { menuItem, quantity: 1 }];
    });
  };

  const removeFromOrder = (menuItemId: string) => {
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.menuItem.id === menuItemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevItems.filter(item => item.menuItem.id !== menuItemId);
    });
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      
      // Create order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            table_id: tableId,
            status: 'pending',
            total_amount: calculateTotal(),
            items: orderItems.map(item => ({
              menu_item_id: item.menuItem.id,
              quantity: item.quantity,
              price: item.menuItem.price
            }))
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      setOrderPlaced(true);
      setOrderItems([]);
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50 w-full`}>
        <main className="p-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-slate-800">
                Loading <span className="text-red-600">Menu</span>...
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
      <div className="relative h-[30vh] sm:h-[40vh] pt-16 bg-gradient-to-r from-red-600 to-red-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 sm:space-y-6 px-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
              Table <span className="text-yellow-400">{tableId}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto">
              Browse our menu and place your order
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center mb-4 sm:mb-6">
            {error}
          </div>
        )}

        {orderPlaced && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-600 text-center mb-4 sm:mb-6">
            Order placed successfully! Your food will be served shortly.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-4 sm:mb-6">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900 text-sm sm:text-base"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">{item.name}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                      <span className="text-xl sm:text-2xl font-bold text-red-600">
                        ₹{item.price}
                      </span>
                      <button
                        onClick={() => addToOrder(item)}
                        className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors text-sm sm:text-base"
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
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 h-fit sticky top-4 sm:top-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">Order Summary</h2>
            
            {orderItems.length === 0 ? (
              <p className="text-gray-600 text-center py-6 sm:py-8">Your order is empty</p>
            ) : (
              <>
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {orderItems.map((item) => (
                    <div key={item.menuItem.id} className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-slate-900 text-sm sm:text-base">{item.menuItem.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">₹{item.menuItem.price} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromOrder(item.menuItem.id)}
                          className="text-red-600 hover:text-red-700 text-lg sm:text-xl"
                        >
                          -
                        </button>
                        <span className="font-medium text-sm sm:text-base">{item.quantity}</span>
                        <button
                          onClick={() => addToOrder(item.menuItem.id)}
                          className="text-red-600 hover:text-red-700 text-lg sm:text-xl"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4 sm:mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm sm:text-base">Subtotal</span>
                    <span className="font-medium text-sm sm:text-base">₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm sm:text-base">GST (18%)</span>
                    <span className="font-medium text-sm sm:text-base">₹{(calculateTotal() * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-semibold text-slate-900">Total</span>
                    <span className="text-base sm:text-lg font-bold text-red-600">
                      ₹{(calculateTotal() * 1.18).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || orderItems.length === 0}
                  className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-medium transition-colors text-sm sm:text-base ${
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
      </main>
    </div>
  );
} 