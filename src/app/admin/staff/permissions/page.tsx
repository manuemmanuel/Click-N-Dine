'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import { aeonik } from '@/fonts/fonts';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export default function StaffPermissions() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [deletePermission, setDeletePermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category, name');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_roles')
        .select('id, name, permissions');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const permissionData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
      };

      if (editingPermission) {
        const { error } = await supabase
          .from('permissions')
          .update(permissionData)
          .eq('id', editingPermission.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('permissions')
          .insert([permissionData]);

        if (error) throw error;
      }

      await fetchPermissions();
      resetForm();
    } catch (error) {
      console.error('Error saving permission:', error);
      alert('Failed to save permission. Please try again.');
    }
  };

  const handleDelete = async (permission: Permission) => {
    setDeletePermission(permission);
  };

  const confirmDelete = async () => {
    if (!deletePermission) return;
    
    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', deletePermission.id);

      if (error) throw error;
      await fetchPermissions();
      setDeletePermission(null);
    } catch (error) {
      console.error('Error deleting permission:', error);
      alert('Failed to delete permission. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
    });
    setEditingPermission(null);
    setIsAddingPermission(false);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description,
      category: permission.category,
    });
    setIsAddingPermission(true);
  };

  const handleRolePermissionToggle = async (roleId: string, permissionId: string) => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      const hasPermission = role.permissions.includes(permissionId);
      const newPermissions = hasPermission
        ? role.permissions.filter(p => p !== permissionId)
        : [...role.permissions, permissionId];

      const { error } = await supabase
        .from('staff_roles')
        .update({ permissions: newPermissions })
        .eq('id', roleId);

      if (error) throw error;
      await fetchRoles();
    } catch (error) {
      console.error('Error updating role permissions:', error);
      alert('Failed to update role permissions. Please try again.');
    }
  };

  const categories = Array.from(new Set(permissions.map(p => p.category)));

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
      <SideNav isNavOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Staff Permissions</h1>
            <button
              onClick={() => setIsAddingPermission(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Permission
            </button>
          </div>

          {/* Role Selection */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Select Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedRole === role.id
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-red-200'
                  }`}
                >
                  <h3 className="font-semibold text-slate-900">{role.name}</h3>
                  <p className="text-sm text-gray-600">
                    {role.permissions.length} permissions assigned
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Grid */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Available Permissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">{category}</h3>
                  <div className="space-y-4">
                    {permissions
                      .filter((p) => p.category === category)
                      .map((permission) => (
                        <div
                          key={permission.id}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-slate-900">{permission.name}</h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(permission)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(permission)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{permission.description}</p>
                          {selectedRole && (
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={roles
                                  .find((r) => r.id === selectedRole)
                                  ?.permissions.includes(permission.id)}
                                onChange={() => handleRolePermissionToggle(selectedRole, permission.id)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700">Assign to role</span>
                            </label>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Form */}
          {isAddingPermission && (
            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {editingPermission ? 'Edit Permission' : 'Add New Permission'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permission Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                    required
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Dashboard">Dashboard</option>
                    <option value="Staff Management">Staff Management</option>
                    <option value="Menu Management">Menu Management</option>
                    <option value="Order Management">Order Management</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Reports">Reports</option>
                    <option value="Settings">Settings</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    {editingPermission ? 'Update Permission' : 'Add Permission'}
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
          {deletePermission && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Confirm Delete</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the permission "{deletePermission.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setDeletePermission(null)}
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

          {/* Examples Section */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mt-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Example Permissions</h2>
            <p className="text-gray-600 mb-6">Here are some common permissions organized by category:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dashboard Permissions */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Dashboard</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Dashboard</span>
                    <span className="text-xs text-red-600">Basic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Analytics</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Export Reports</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                </div>
              </div>

              {/* Staff Management Permissions */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Staff Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Staff List</span>
                    <span className="text-xs text-red-600">Basic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Add Staff Member</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Edit Staff Details</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manage Roles</span>
                    <span className="text-xs text-red-600">Admin</span>
                  </div>
                </div>
              </div>

              {/* Menu Management Permissions */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Menu Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Menu</span>
                    <span className="text-xs text-red-600">Basic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Add Menu Item</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Edit Menu Item</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manage Categories</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                </div>
              </div>

              {/* Order Management Permissions */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Orders</span>
                    <span className="text-xs text-red-600">Basic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Create Order</span>
                    <span className="text-xs text-red-600">Basic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Update Order Status</span>
                    <span className="text-xs text-red-600">Basic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cancel Order</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                </div>
              </div>

              {/* Inventory Permissions */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Inventory</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Inventory</span>
                    <span className="text-xs text-red-600">Basic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Add Stock</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Update Stock</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manage Suppliers</span>
                    <span className="text-xs text-red-600">Advanced</span>
                  </div>
                </div>
              </div>

              {/* Settings Permissions */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Settings</span>
                    <span className="text-xs text-red-600">Basic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Update Settings</span>
                    <span className="text-xs text-red-600">Admin</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manage Permissions</span>
                    <span className="text-xs text-red-600">Admin</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">System Configuration</span>
                    <span className="text-xs text-red-600">Admin</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tips for Permission Management</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Follow the principle of least privilege - grant only necessary permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Regularly audit permissions to ensure they align with current roles and responsibilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Document any permission changes and communicate them to affected staff members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Consider creating role templates for common job positions to streamline permission assignment</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 