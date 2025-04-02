'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import { aeonik } from '@/fonts/fonts';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  join_date: string;
  salary: number;
  department: string;
  shift: string;
  image_url?: string;
}

export default function StaffManagement() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deleteStaff, setDeleteStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: 'active',
    salary: '',
    department: '',
    shift: '',
    image_url: '',
  });

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');

      if (error) throw error;
      setStaffMembers(data || []);
    } catch (error) {
      console.error('Error fetching staff members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const staffData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        salary: parseFloat(formData.salary),
        department: formData.department,
        shift: formData.shift,
        image_url: formData.image_url,
        join_date: new Date().toISOString(),
      };

      if (editingStaff) {
        const { error } = await supabase
          .from('staff')
          .update(staffData)
          .eq('id', editingStaff.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('staff')
          .insert([staffData]);

        if (error) throw error;
      }

      await fetchStaffMembers();
      resetForm();
    } catch (error) {
      console.error('Error saving staff member:', error);
      alert('Failed to save staff member. Please try again.');
    }
  };

  const handleDelete = async (staff: StaffMember) => {
    setDeleteStaff(staff);
  };

  const confirmDelete = async () => {
    if (!deleteStaff) return;
    
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', deleteStaff.id);

      if (error) throw error;
      await fetchStaffMembers();
      setDeleteStaff(null);
    } catch (error) {
      console.error('Error deleting staff member:', error);
      alert('Failed to delete staff member. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      status: 'active',
      salary: '',
      department: '',
      shift: '',
      image_url: '',
    });
    setEditingStaff(null);
    setIsAddingStaff(false);
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      status: staff.status,
      salary: staff.salary.toString(),
      department: staff.department,
      shift: staff.shift,
      image_url: staff.image_url || '',
    });
    setIsAddingStaff(true);
  };

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
      <SideNav isNavOpen={isNavOpen} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
            <button
              onClick={() => setIsAddingStaff(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Staff
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">👥</div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Staff</h3>
              <p className="text-3xl font-bold text-red-600">{staffMembers.length}</p>
              <p className="text-sm text-gray-600 mt-2">All staff members</p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">✅</div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Active Staff</h3>
              <p className="text-3xl font-bold text-red-600">
                {staffMembers.filter(staff => staff.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600 mt-2">Currently working</p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">💰</div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Average Salary</h3>
              <p className="text-3xl font-bold text-red-600">
                ₹{staffMembers.length > 0 
                  ? (staffMembers.reduce((sum, staff) => sum + staff.salary, 0) / staffMembers.length).toFixed(2)
                  : '0'}
              </p>
              <p className="text-sm text-gray-600 mt-2">Monthly average</p>
            </div>
          </div>

          {/* Staff List */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Staff Members</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Shift</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Salary</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map((staff) => (
                    <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {staff.image_url ? (
                              <img
                                src={staff.image_url}
                                alt={staff.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg text-gray-500">
                                {staff.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{staff.name}</div>
                            <div className="text-sm text-gray-500">{staff.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.role}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.department}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          staff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.shift}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">₹{staff.salary}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(staff)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(staff)}
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

          {/* Add/Edit Form */}
          {isAddingStaff && (
            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    >
                      <option value="">Select Shift</option>
                      <option value="Morning">Morning (6 AM - 2 PM)</option>
                      <option value="Afternoon">Afternoon (2 PM - 10 PM)</option>
                      <option value="Night">Night (10 PM - 6 AM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary (₹)</label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    {editingStaff ? 'Update Staff' : 'Add Staff'}
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
          {deleteStaff && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Confirm Delete</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{deleteStaff.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setDeleteStaff(null)}
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

          {/* Footer */}
          <footer className="mt-12 border-t border-gray-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Staff Management Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Staff Management</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/admin/staff" className="text-gray-600 hover:text-red-600 transition-colors">
                      View All Staff
                    </a>
                  </li>
                  <li>
                    <a href="/admin/staff/schedule" className="text-gray-600 hover:text-red-600 transition-colors">
                      Staff Schedule
                    </a>
                  </li>
                  <li>
                    <a href="/admin/staff/attendance" className="text-gray-600 hover:text-red-600 transition-colors">
                      Attendance
                    </a>
                  </li>
                  <li>
                    <a href="/admin/staff/performance" className="text-gray-600 hover:text-red-600 transition-colors">
                      Performance Reviews
                    </a>
                  </li>
                </ul>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/admin/dashboard" className="text-gray-600 hover:text-red-600 transition-colors">
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="/admin/menu" className="text-gray-600 hover:text-red-600 transition-colors">
                      Menu Management
                    </a>
                  </li>
                  <li>
                    <a href="/admin/orders" className="text-gray-600 hover:text-red-600 transition-colors">
                      Orders
                    </a>
                  </li>
                  <li>
                    <a href="/admin/inventory" className="text-gray-600 hover:text-red-600 transition-colors">
                      Inventory
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
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
                  <li>
                    <a href="/admin/reports" className="text-gray-600 hover:text-red-600 transition-colors">
                      Reports
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>
                <ul className="space-y-2">
                  <li className="text-gray-600">
                    <span className="font-medium">Email:</span> support@foodie.com
                  </li>
                  <li className="text-gray-600">
                    <span className="font-medium">Phone:</span> +91 98765 43210
                  </li>
                  <li className="text-gray-600">
                    <span className="font-medium">Hours:</span> 9 AM - 10 PM
                  </li>
                  <li className="text-gray-600">
                    <span className="font-medium">Address:</span> 123 Food Street, Cuisine City
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
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