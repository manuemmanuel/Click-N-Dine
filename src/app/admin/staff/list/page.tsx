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

export default function StaffList() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'join_date' | 'salary'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  useEffect(() => {
    filterAndSortStaff();
  }, [staffMembers, searchTerm, departmentFilter, sortBy, sortOrder]);

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

  const filterAndSortStaff = () => {
    let filtered = [...staffMembers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone.includes(searchTerm)
      );
    }

    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter(staff => staff.department === departmentFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'join_date') {
        return sortOrder === 'asc'
          ? new Date(a.join_date).getTime() - new Date(b.join_date).getTime()
          : new Date(b.join_date).getTime() - new Date(a.join_date).getTime();
      } else {
        return sortOrder === 'asc'
          ? a.salary - b.salary
          : b.salary - a.salary;
      }
    });

    setFilteredStaff(filtered);
  };

  const departments = Array.from(new Set(staffMembers.map(staff => staff.department)));

  const closeNav = () => {
    setIsNavOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
      <SideNav 
        isNavOpen={isNavOpen} 
        onClose={closeNav}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className={`${isNavOpen ? (isCollapsed ? 'ml-0' : 'ml-64') : 'ml-0'} transition-all duration-200 ease-in-out w-full`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Staff List</h1>
            <a
              href="/admin/staff"
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Staff
            </a>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'join_date' | 'salary')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-900"
                >
                  <option value="name">Name</option>
                  <option value="join_date">Join Date</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9M3 12h5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Staff List */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Shift</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Salary</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Join Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
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
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.shift}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0
                        }).format(staff.salary)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(staff.join_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Examples Section */}
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6 mt-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Example Staff Members</h2>
            <p className="text-gray-600 mb-6">Here are some example staff members you can add to your restaurant:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Manager Example */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xl text-red-600">JD</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">John Doe</h3>
                    <p className="text-sm text-gray-500">john.doe@restaurant.com</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-slate-900">Manager</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-slate-900">Management</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shift:</span>
                    <span className="font-medium text-slate-900">Day</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(45000)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chef Example */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xl text-red-600">MS</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Maria Smith</h3>
                    <p className="text-sm text-gray-500">maria.smith@restaurant.com</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-slate-900">Head Chef</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-slate-900">Kitchen</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shift:</span>
                    <span className="font-medium text-slate-900">Day</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(35000)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Server Example */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xl text-red-600">RJ</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Raj Kumar</h3>
                    <p className="text-sm text-gray-500">raj.kumar@restaurant.com</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-slate-900">Server</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-slate-900">Front of House</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shift:</span>
                    <span className="font-medium text-slate-900">Evening</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(15000)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Host Example */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xl text-red-600">AP</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Anjali Patel</h3>
                    <p className="text-sm text-gray-500">anjali.patel@restaurant.com</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-slate-900">Host</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-slate-900">Front of House</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shift:</span>
                    <span className="font-medium text-slate-900">Evening</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(12000)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kitchen Staff Example */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xl text-red-600">AK</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Amit Kumar</h3>
                    <p className="text-sm text-gray-500">amit.kumar@restaurant.com</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-slate-900">Line Cook</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-slate-900">Kitchen</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shift:</span>
                    <span className="font-medium text-slate-900">Night</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(18000)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cashier Example */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xl text-red-600">PS</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Priya Sharma</h3>
                    <p className="text-sm text-gray-500">priya.sharma@restaurant.com</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-slate-900">Cashier</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-slate-900">Front of House</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shift:</span>
                    <span className="font-medium text-slate-900">Day</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(14000)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tips for Staff Management</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Keep staff information up to date, including contact details and role changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Regularly review staff performance and update their status accordingly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Maintain accurate shift schedules and salary information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Document any disciplinary actions or commendations in staff records</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 