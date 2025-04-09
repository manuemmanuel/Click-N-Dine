'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface SideNavProps {
  isNavOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function SideNav({ isNavOpen, onClose, isCollapsed = false, onToggleCollapse }: SideNavProps) {
  const router = useRouter();
  const [localIsCollapsed, setLocalIsCollapsed] = useState(isCollapsed);
  
  // Listen for the custom event to force sidebar visibility
  useEffect(() => {
    const handleForceVisible = () => {
      setLocalIsCollapsed(false);
      if (onToggleCollapse) {
        onToggleCollapse();
      }
    };
    
    window.addEventListener('forceSidebarVisible', handleForceVisible);
    
    return () => {
      window.removeEventListener('forceSidebarVisible', handleForceVisible);
    };
  }, [onToggleCollapse]);
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalIsCollapsed(isCollapsed);
  }, [isCollapsed]);
  
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
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isNavOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] transform transition-all duration-200 ease-in-out ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${localIsCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-red-600 to-red-700">
            {!localIsCollapsed && <h1 className="text-xl font-bold text-white">Admin Panel</h1>}
            <div className="flex items-center">
              {!localIsCollapsed && (
                <button 
                  onClick={onClose}
                  className="p-2 text-white hover:bg-red-700 rounded-md md:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button 
                onClick={onToggleCollapse}
                className={`p-2 text-white hover:bg-red-700 rounded-md ${localIsCollapsed ? 'absolute right-0 top-4 -mr-10 bg-red-600' : 'ml-2'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {localIsCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name} className="mb-2">
                <a
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors ${
                    localIsCollapsed ? 'justify-center' : ''
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 768) { // md breakpoint
                      onClose();
                    }
                  }}
                  title={localIsCollapsed ? item.name : ''}
                >
                  <span className={`${localIsCollapsed ? 'text-xl' : 'mr-3'}`}>{item.icon}</span>
                  {!localIsCollapsed && <span className="flex-1">{item.name}</span>}
                  {!localIsCollapsed && item.subItems && (
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
                {!localIsCollapsed && item.subItems && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <a
                        key={subItem.name}
                        href={subItem.href}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={() => {
                          if (window.innerWidth < 768) { // md breakpoint
                            onClose();
                          }
                        }}
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
              className={`flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors ${
                localIsCollapsed ? 'justify-center' : ''
              }`}
              title={localIsCollapsed ? 'Logout' : ''}
            >
              <span className={`${localIsCollapsed ? 'text-xl' : 'mr-3'}`}>🚪</span>
              {!localIsCollapsed && 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 