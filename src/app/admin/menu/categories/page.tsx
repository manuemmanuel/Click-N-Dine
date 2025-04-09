'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import { aeonik } from '@/fonts/fonts';

interface Category {
  id: number;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export default function MenuCategories() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: formData.name,
        description: formData.description,
        display_order: parseInt(formData.display_order.toString()),
        is_active: formData.is_active,
      };

      if (editingCategory) {
        const { data, error } = await supabase
          .from('menu_categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
          .select();

        if (error) {
          console.error('Error updating category:', error);
          alert('Failed to update category. Please try again.');
          return;
        }

        if (!data) {
          console.error('No data returned after update');
          alert('Failed to update category. Please try again.');
          return;
        }
      } else {
        const { data, error } = await supabase
          .from('menu_categories')
          .insert([categoryData])
          .select();

        if (error) {
          console.error('Error inserting category:', error);
          alert('Failed to add category. Please try again.');
          return;
        }

        if (!data) {
          console.error('No data returned after insert');
          alert('Failed to add category. Please try again.');
          return;
        }
      }

      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleDelete = async (category: Category) => {
    setDeleteCategory(category);
  };

  const confirmDelete = async () => {
    if (!deleteCategory) return;
    
    try {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', deleteCategory.id);

      if (error) throw error;
      await fetchCategories();
      setDeleteCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      display_order: 0,
      is_active: true,
    });
    setEditingCategory(null);
    setIsAddingCategory(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setIsAddingCategory(true);
  };

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
      <SideNav isNavOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Menu Categories</h1>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Category
            </button>
          </div>

          {/* Examples Section */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Example Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-2">Starters</h3>
                <p className="text-sm text-gray-600 mb-4">Appetizers and small plates to begin your meal</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Order: 1</span>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-2">Main Course</h3>
                <p className="text-sm text-gray-600 mb-4">Primary dishes featuring meat, fish, or vegetarian options</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Order: 2</span>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-2">Desserts</h3>
                <p className="text-sm text-gray-600 mb-4">Sweet treats and desserts to end your meal</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Order: 3</span>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-2">Beverages</h3>
                <p className="text-sm text-gray-600 mb-4">Drinks including soft drinks, juices, and alcoholic beverages</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Order: 4</span>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-2">Specials</h3>
                <p className="text-sm text-gray-600 mb-4">Daily specials and chef's recommendations</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Order: 5</span>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-2">Seasonal</h3>
                <p className="text-sm text-gray-600 mb-4">Limited-time items based on seasonal ingredients</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Order: 6</span>
                  <span className="text-red-600">Inactive</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">Tips for creating categories:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use clear, descriptive names that customers can easily understand</li>
                <li>Add helpful descriptions to explain what items belong in each category</li>
                <li>Set display order to control how categories appear on the menu</li>
                <li>Use the active/inactive status to temporarily hide categories</li>
                <li>Keep categories organized and logically grouped</li>
              </ul>
            </div>
          </div>

          {/* Add/Edit Form */}
          {isAddingCategory && (
            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
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
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    {editingCategory ? 'Update Category' : 'Add Category'}
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

          {/* Categories List */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{category.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{category.display_order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {deleteCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Confirm Delete</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{deleteCategory.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setDeleteCategory(null)}
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