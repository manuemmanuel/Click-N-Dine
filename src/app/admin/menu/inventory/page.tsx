'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import { aeonik } from '@/fonts/fonts';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  cost_per_unit: number;
  supplier: string;
  last_restocked: string;
  is_low_stock: boolean;
}

export default function Inventory() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    min_quantity: '',
    cost_per_unit: '',
    supplier: '',
  });

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('category');

      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const inventoryData = {
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        min_quantity: parseFloat(formData.min_quantity),
        cost_per_unit: parseFloat(formData.cost_per_unit),
        supplier: formData.supplier,
        last_restocked: new Date().toISOString(),
        is_low_stock: parseFloat(formData.quantity) <= parseFloat(formData.min_quantity),
      };

      if (editingItem) {
        const { error } = await supabase
          .from('inventory')
          .update(inventoryData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('inventory')
          .insert([inventoryData]);

        if (error) throw error;
      }

      await fetchInventoryItems();
      resetForm();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save inventory item. Please try again.');
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', deleteItem.id);

      if (error) throw error;
      await fetchInventoryItems();
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Failed to delete inventory item. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: '',
      min_quantity: '',
      cost_per_unit: '',
      supplier: '',
    });
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      min_quantity: item.min_quantity.toString(),
      cost_per_unit: item.cost_per_unit.toString(),
      supplier: item.supplier,
    });
    setIsAddingItem(true);
  };

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
      <SideNav isNavOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
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

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {inventoryItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-slate-900">{item.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.is_low_stock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {item.is_low_stock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span> {item.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Min Quantity:</span> {item.min_quantity} {item.unit}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Cost per Unit:</span> ₹{item.cost_per_unit}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Supplier:</span> {item.supplier}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Last Restocked:</span> {new Date(item.last_restocked).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
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
            ))}
          </div>

          {/* Examples Section */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Example Inventory Items</h2>
              <span className="text-sm text-gray-500">Reference examples for inventory management</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-slate-900">Fresh Tomatoes</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">In Stock</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600"><span className="font-medium">Category:</span> Produce</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Quantity:</span> 25 kg</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Min Quantity:</span> 10 kg</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Cost per Unit:</span> ₹40</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Supplier:</span> Local Market</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-slate-900">Olive Oil</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Low Stock</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600"><span className="font-medium">Category:</span> Pantry</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Quantity:</span> 2 L</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Min Quantity:</span> 5 L</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Cost per Unit:</span> ₹800</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Supplier:</span> Food Distributors</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-slate-900">Chicken Breast</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">In Stock</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600"><span className="font-medium">Category:</span> Meat</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Quantity:</span> 15 kg</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Min Quantity:</span> 8 kg</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Cost per Unit:</span> ₹300</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Supplier:</span> Meat Suppliers</p>
                </div>
              </div>
            </div>
            <div className="mt-8 text-sm text-gray-600 border-t pt-6">
              <p className="mb-2">Tips for inventory management:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Set appropriate minimum quantities to prevent stockouts</li>
                <li>Regularly update stock levels after deliveries and usage</li>
                <li>Monitor low stock items and reorder in time</li>
                <li>Keep track of supplier information for easy reordering</li>
                <li>Use consistent units of measurement across items</li>
                <li>Regularly review and adjust minimum quantities based on usage patterns</li>
              </ul>
            </div>
          </div>

          {/* Add/Edit Form */}
          {isAddingItem && (
            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.min_quantity}
                      onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_per_unit}
                      onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
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