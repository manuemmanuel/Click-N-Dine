'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface SideNavProps {
  isNavOpen: boolean;
}

export default function SideNav({ isNavOpen }: SideNavProps) {
  const router = useRouter();
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { 
      name: 'User & Staff', 
      href: '/admin/staff', 
      icon: '👥',
      subItems: [
        { name: 'Staff List', href: '/admin/staff/list' },
        { name: 'Roles', href: '/admin/staff/roles' },
        { name: 'Permissions', href: '/admin/staff/permissions' }
      ]
    },
    { 
      name: 'Menu & Inventory', 
      href: '/admin/menu', 
      icon: '🍽️',
      subItems: [
        { name: 'Menu Items', href: '/admin/menu/items' },
        { name: 'Categories', href: '/admin/menu/categories' },
        { name: 'Inventory', href: '/admin/menu/inventory' }
      ]
    },
    { 
      name: 'Orders & Reports', 
      href: '/admin/orders', 
      icon: '📝',
      subItems: [
        { name: 'Active Orders', href: '/admin/orders/active' },
        { name: 'Order History', href: '/admin/orders/history' },
        { name: 'Sales Reports', href: '/admin/orders/reports' }
      ]
    },
    { name: 'Payments', href: '/admin/payments', icon: '💳' },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] transform transition-transform duration-200 ease-in-out ${
        isNavOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4 border-b bg-gradient-to-r from-red-600 to-red-700">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.name}>
              <a
                href={item.href}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
                {item.subItems && (
                  <svg 
                    className="w-4 h-4 ml-auto" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </a>
              {item.subItems && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <a
                      key={subItem.name}
                      href={subItem.href}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      {subItem.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 