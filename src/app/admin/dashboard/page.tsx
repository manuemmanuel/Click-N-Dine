'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentOrders, { Order } from '@/components/dashboard/RecentOrders';
import PopularItems from '@/components/dashboard/PopularItems';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { aeonik } from '@/fonts/fonts';

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  occupiedTables: number;
  recentOrders: Order[];
  popularItems: any[];
  revenueData: Array<{
    month: string;
    revenue: number;
  }>;
  staffCount: number;
  menuItemsCount: number;
  activeOrdersCount: number;
}

export default function Dashboard() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    occupiedTables: 0,
    recentOrders: [],
    popularItems: [],
    revenueData: [],
    staffCount: 0,
    menuItemsCount: 0,
    activeOrdersCount: 0,
  });

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscription for orders
    const subscription = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders data
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*');

      // Fetch reviews data
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*');

      // Fetch tables data
      const { data: tablesData } = await supabase
        .from('tables')
        .select('*');

      // Fetch recent orders
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate popular items from orders
      const popularItems = calculatePopularItems(ordersData || []);

      // Fetch revenue data
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .order('created_at', { ascending: true });

      // Transform revenue data for the chart
      const transformedRevenueData = revenueData?.reduce((acc: { [key: string]: number }, order) => {
        const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + Number(order.total_amount);
        return acc;
      }, {}) || {};

      const chartData = Object.entries(transformedRevenueData).map(([month, revenue]) => ({
        month,
        revenue
      }));

      // Fetch staff count
      const { count: staffCount } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true });

      // Fetch menu items count
      const { count: menuItemsCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });

      // Calculate active orders count
      const activeOrdersCount = ordersData?.filter(order => 
        order.status === 'pending' || order.status === 'preparing'
      ).length || 0;

      setDashboardData({
        totalOrders: ordersData?.length || 0,
        totalRevenue: ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        averageRating: reviewsData?.length 
          ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
          : 0,
        occupiedTables: tablesData?.filter(table => table.is_occupied).length || 0,
        recentOrders: recentOrdersData || [],
        popularItems: popularItems || [],
        revenueData: chartData,
        staffCount: staffCount || 0,
        menuItemsCount: menuItemsCount || 0,
        activeOrdersCount: activeOrdersCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const calculatePopularItems = (orders: Order[]) => {
    const itemCounts: { [key: string]: number } = {};
    
    orders.forEach(order => {
      order.items.forEach((item: { name: string; quantity: number }) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    return Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-gray-50 to-white`}>
      <SideNav isNavOpen={isNavOpen} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, Admin!</h1>
            <p className="mt-2 text-slate-600">Here's what's happening with your restaurant today.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a href="/admin/staff/list" className="group relative bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-between mb-4">
                <div className="text-2xl">👥</div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="relative text-lg font-semibold text-slate-900 mb-2">Manage Staff</h3>
              <p className="relative text-gray-600 text-sm">Add, remove, or update staff members</p>
            </a>

            <a href="/admin/menu/items" className="group relative bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-between mb-4">
                <div className="text-2xl">🍽️</div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="relative text-lg font-semibold text-slate-900 mb-2">Update Menu</h3>
              <p className="relative text-gray-600 text-sm">Modify dishes, prices, and availability</p>
            </a>

            <a href="/admin/orders/active" className="group relative bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-between mb-4">
                <div className="text-2xl">📝</div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="relative text-lg font-semibold text-slate-900 mb-2">Track Orders</h3>
              <p className="relative text-gray-600 text-sm">Monitor and manage active orders</p>
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Orders"
              value={dashboardData.totalOrders}
              icon="📝"
              trend={{ value: 12, isPositive: true }}
              className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all"
            />
            <StatsCard
              title="Total Revenue"
              value={`₹${dashboardData.totalRevenue.toFixed(2)}`}
              icon="💰"
              trend={{ value: 8, isPositive: true }}
              className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all"
            />
            <StatsCard
              title="Active Orders"
              value={dashboardData.activeOrdersCount}
              icon="⚡"
              trend={{ value: 5, isPositive: true }}
              className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all"
            />
            <StatsCard
              title="Menu Items"
              value={dashboardData.menuItemsCount}
              icon="🍽️"
              trend={{ value: 3, isPositive: true }}
              className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all"
            />
          </div>

          {/* Charts and Lists Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Revenue Overview</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-slate-600">Revenue</span>
                </div>
              </div>
              <RevenueChart data={dashboardData.revenueData} />
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
                  <a href="/admin/orders/active" className="text-sm font-medium text-red-600 hover:text-red-700">
                    View All
                  </a>
                </div>
                <RecentOrders orders={dashboardData.recentOrders} />
              </div>
              <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Popular Items</h2>
                  <a href="/admin/menu/items" className="text-sm font-medium text-red-600 hover:text-red-700">
                    View All
                  </a>
                </div>
                <PopularItems items={dashboardData.popularItems} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
