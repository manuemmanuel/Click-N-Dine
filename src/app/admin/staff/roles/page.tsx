'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import { aeonik } from '@/fonts/fonts';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export default function StaffRoles() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roleData = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      };

      if (editingRole) {
        const { error } = await supabase
          .from('staff_roles')
          .update(roleData)
          .eq('id', editingRole.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('staff_roles')
          .insert([roleData]);

        if (error) throw error;
      }

      await fetchRoles();
      resetForm();
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Failed to save role. Please try again.');
    }
  };

  const handleDelete = async (role: Role) => {
    setDeleteRole(role);
  };

  const confirmDelete = async () => {
    if (!deleteRole) return;
    
    try {
      const { error } = await supabase
        .from('staff_roles')
        .delete()
        .eq('id', deleteRole.id);

      if (error) throw error;
      await fetchRoles();
      setDeleteRole(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setEditingRole(null);
    setIsAddingRole(false);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsAddingRole(true);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
      <SideNav isNavOpen={isNavOpen} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Staff Roles</h1>
            <button
              onClick={() => setIsAddingRole(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Role
            </button>
          </div>

          {/* Roles List */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Available Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{role.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(role)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{role.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Permissions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Form */}
          {isAddingRole && (
            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'View Dashboard',
                      'Manage Staff',
                      'Manage Menu',
                      'Manage Orders',
                      'Manage Inventory',
                      'View Reports',
                      'Manage Settings',
                      'Manage Roles',
                    ].map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    {editingRole ? 'Update Role' : 'Add Role'}
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
          {deleteRole && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Confirm Delete</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the role "{deleteRole.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setDeleteRole(null)}
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
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Example Roles</h2>
            <p className="text-gray-600 mb-6">Here are some common staff roles and their recommended permissions:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Manager Role */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Manager</h3>
                <p className="text-gray-600 mb-4">Full access to all restaurant operations and staff management.</p>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Key Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Dashboard</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Staff</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Menu</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Orders</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Inventory</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Reports</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Settings</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Roles</span>
                  </div>
                </div>
              </div>

              {/* Chef Role */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Chef</h3>
                <p className="text-gray-600 mb-4">Access to kitchen operations and menu management.</p>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Key Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Dashboard</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Menu</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Orders</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Inventory</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Reports</span>
                  </div>
                </div>
              </div>

              {/* Server Role */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Server</h3>
                <p className="text-gray-600 mb-4">Access to order management and customer service.</p>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Key Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Dashboard</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Orders</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Reports</span>
                  </div>
                </div>
              </div>

              {/* Host Role */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Host</h3>
                <p className="text-gray-600 mb-4">Access to table management and reservations.</p>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Key Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Dashboard</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Orders</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Reports</span>
                  </div>
                </div>
              </div>

              {/* Cashier Role */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Cashier</h3>
                <p className="text-gray-600 mb-4">Access to payment processing and basic order management.</p>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Key Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Dashboard</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Orders</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Reports</span>
                  </div>
                </div>
              </div>

              {/* Kitchen Staff Role */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Kitchen Staff</h3>
                <p className="text-gray-600 mb-4">Access to order processing and inventory management.</p>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Key Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Dashboard</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Orders</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">Manage Inventory</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">View Reports</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tips for Role Management</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Start with predefined roles and customize them based on your restaurant's needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Regularly review and update role permissions as your restaurant operations evolve</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Ensure each role has only the permissions necessary for their job responsibilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Document any role changes and communicate them to affected staff members</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 