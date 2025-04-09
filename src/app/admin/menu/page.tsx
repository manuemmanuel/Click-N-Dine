'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import { aeonik } from '@/fonts/fonts';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export default function MenuManagement() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
      <SideNav isNavOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Menu Management</h1>
            <div className="flex gap-4">
              <a
                href="/admin/menu/items"
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Manage Items
              </a>
              <a
                href="/admin/menu/categories"
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Manage Categories
              </a>
              <a
                href="/admin/menu/inventory"
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                Manage Inventory
              </a>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">🍽️</div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Menu Items</h3>
              <p className="text-3xl font-bold text-red-600">{menuItems.length}</p>
              <p className="text-sm text-gray-600 mt-2">Total items in menu</p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📑</div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Categories</h3>
              <p className="text-3xl font-bold text-red-600">{categories.length}</p>
              <p className="text-sm text-gray-600 mt-2">Active categories</p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📦</div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Inventory Items</h3>
              <p className="text-3xl font-bold text-red-600">View Inventory</p>
              <p className="text-sm text-gray-600 mt-2">Manage stock levels</p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Current Menu</h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-red-600">₹{item.price}</span>
                      <span className="text-sm text-gray-500">{item.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/admin/menu/items" className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">🍽️</div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Menu Items</h3>
              <p className="text-gray-600 text-sm">Add, edit, or remove menu items</p>
            </a>

            <a href="/admin/menu/categories" className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📑</div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Categories</h3>
              <p className="text-gray-600 text-sm">Organize menu items by category</p>
            </a>

            <a href="/admin/menu/inventory" className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">📦</div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Inventory</h3>
              <p className="text-gray-600 text-sm">Track ingredients and stock levels</p>
            </a>
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-gray-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Menu Management</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/admin/menu/items" className="text-gray-600 hover:text-red-600 transition-colors">
                      Menu Items
                    </a>
                  </li>
                  <li>
                    <a href="/admin/menu/categories" className="text-gray-600 hover:text-red-600 transition-colors">
                      Categories
                    </a>
                  </li>
                  <li>
                    <a href="/admin/menu/inventory" className="text-gray-600 hover:text-red-600 transition-colors">
                      Inventory
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/admin/dashboard" className="text-gray-600 hover:text-red-600 transition-colors">
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="/admin/orders" className="text-gray-600 hover:text-red-600 transition-colors">
                      Orders
                    </a>
                  </li>
                  <li>
                    <a href="/admin/staff" className="text-gray-600 hover:text-red-600 transition-colors">
                      Staff
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/admin/help" className="text-gray-600 hover:text-red-600 transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="/admin/settings" className="text-gray-600 hover:text-red-600 transition-colors">
                      Settings
                    </a>
                  </li>
                  <li>
                    <a href="/admin/notifications" className="text-gray-600 hover:text-red-600 transition-colors">
                      Notifications
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>
                <ul className="space-y-2">
                  <li className="text-gray-600">
                    <span className="font-medium">Email:</span> support@foodie.com
                  </li>
                  <li className="text-gray-600">
                    <span className="font-medium">Phone:</span> +91 123 456 7890
                  </li>
                  <li className="text-gray-600">
                    <span className="font-medium">Hours:</span> 9:00 AM - 10:00 PM
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-600 text-sm">
                  © {new Date().getFullYear()} Foodie. All rights reserved.
                </p>
                <div className="flex gap-6">
                  <a href="/privacy" className="text-gray-600 hover:text-red-600 text-sm transition-colors">
                    Privacy Policy
                  </a>
                  <a href="/terms" className="text-gray-600 hover:text-red-600 text-sm transition-colors">
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
} 