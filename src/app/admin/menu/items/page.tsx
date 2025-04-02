'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import { aeonik } from '@/fonts/fonts';
import { MenuItem } from '@/types/database';

export default function MenuItems() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_available: true,
  });

  useEffect(() => {
    fetchMenuItems();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const menuItemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url,
        is_available: formData.is_available,
      };

      if (editingItem) {
        const { data, error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', editingItem.id)
          .select();

        if (error) {
          console.error('Error updating menu item:', error);
          alert('Failed to update menu item. Please try again.');
          return;
        }

        if (!data) {
          console.error('No data returned after update');
          alert('Failed to update menu item. Please try again.');
          return;
        }
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert([{
            ...menuItemData,
            order_count: 0,
          }])
          .select();

        if (error) {
          console.error('Error inserting menu item:', error);
          alert('Failed to add menu item. Please try again.');
          return;
        }

        if (!data) {
          console.error('No data returned after insert');
          alert('Failed to add menu item. Please try again.');
          return;
        }
      }

      await fetchMenuItems();
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleDelete = async (item: MenuItem) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', deleteItem.id);

      if (error) throw error;
      await fetchMenuItems();
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      is_available: true,
    });
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url,
      is_available: item.is_available,
    });
    setIsAddingItem(true);
  };

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
      <SideNav isNavOpen={isNavOpen} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Menu Items</h1>
            <button
              onClick={() => setIsAddingItem(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Item
            </button>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col h-[400px]">
                <div className="h-48 flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-slate-900 line-clamp-1">{item.name}</h3>
                    <span className="text-lg font-bold text-red-600">₹{item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{item.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm text-gray-500">{item.category}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Examples Section */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Example Menu Items</h2>
              <span className="text-sm text-gray-500">Reference examples for creating menu items</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="border border-gray-200 rounded-xl p-4 flex flex-col h-[400px] hover:shadow-lg transition-shadow">
                <div className="h-48 flex-shrink-0 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    alt="Bruschetta"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium text-slate-900 mb-1 line-clamp-1">Bruschetta</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3 flex-grow">Toasted bread topped with fresh tomatoes, garlic, and basil</p>
                <div className="flex items-center justify-between text-sm mt-auto">
                  <span className="text-red-600 font-medium">₹299</span>
                  <span className="text-green-600">Available</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">Category: Starters</div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 flex flex-col h-[400px] hover:shadow-lg transition-shadow">
                <div className="h-48 flex-shrink-0 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    alt="Grilled Salmon"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium text-slate-900 mb-1 line-clamp-1">Grilled Salmon</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3 flex-grow">Fresh Atlantic salmon with seasonal vegetables and lemon butter sauce</p>
                <div className="flex items-center justify-between text-sm mt-auto">
                  <span className="text-red-600 font-medium">₹899</span>
                  <span className="text-green-600">Available</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">Category: Main Course</div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 flex flex-col h-[400px] hover:shadow-lg transition-shadow">
                <div className="h-48 flex-shrink-0 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1551024506-0b9d5d1f99f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    alt="Tiramisu"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium text-slate-900 mb-1 line-clamp-1">Tiramisu</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3 flex-grow">Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream</p>
                <div className="flex items-center justify-between text-sm mt-auto">
                  <span className="text-red-600 font-medium">₹399</span>
                  <span className="text-green-600">Available</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">Category: Desserts</div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 flex flex-col h-[400px] hover:shadow-lg transition-shadow">
                <div className="h-48 flex-shrink-0 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    alt="Signature Cocktail"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium text-slate-900 mb-1 line-clamp-1">Signature Cocktail</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3 flex-grow">House special blend of premium spirits and fresh ingredients</p>
                <div className="flex items-center justify-between text-sm mt-auto">
                  <span className="text-red-600 font-medium">₹499</span>
                  <span className="text-green-600">Available</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">Category: Beverages</div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 flex flex-col h-[400px] hover:shadow-lg transition-shadow">
                <div className="h-48 flex-shrink-0 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    alt="Chef's Special"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium text-slate-900 mb-1 line-clamp-1">Chef's Special</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3 flex-grow">Daily curated dish showcasing seasonal ingredients and culinary expertise</p>
                <div className="flex items-center justify-between text-sm mt-auto">
                  <span className="text-red-600 font-medium">₹999</span>
                  <span className="text-green-600">Available</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">Category: Specials</div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 flex flex-col h-[400px] hover:shadow-lg transition-shadow">
                <div className="h-48 flex-shrink-0 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    alt="Summer Salad"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium text-slate-900 mb-1 line-clamp-1">Summer Salad</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3 flex-grow">Fresh seasonal greens with local produce and light vinaigrette</p>
                <div className="flex items-center justify-between text-sm mt-auto">
                  <span className="text-red-600 font-medium">₹399</span>
                  <span className="text-red-600">Unavailable</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">Category: Seasonal</div>
              </div>
            </div>
            <div className="mt-8 text-sm text-gray-600 border-t pt-6">
              <p className="mb-2">Tips for creating menu items:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use high-quality images that showcase the dish well</li>
                <li>Write clear, appetizing descriptions that highlight key ingredients</li>
                <li>Set competitive prices that reflect the quality and portion size</li>
                <li>Organize items into appropriate categories for easy navigation</li>
                <li>Keep availability status up to date to avoid customer disappointment</li>
                <li>Use seasonal ingredients and update the menu accordingly</li>
              </ul>
            </div>
          </div>

          {/* Add/Edit Form */}
          {isAddingItem && (
            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Available</label>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Confirm Delete</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{deleteItem.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setDeleteItem(null)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 