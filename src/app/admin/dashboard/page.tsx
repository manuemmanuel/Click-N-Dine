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
  revenueData: {
    daily: Array<{ date: string; revenue: number }>;
    weekly: Array<{ week: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
  };
  staffCount: number;
  menuItemsCount: number;
  activeOrdersCount: number;
}

type TimeRange = 'daily' | 'weekly' | 'monthly';

export default function Dashboard() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    occupiedTables: 0,
    recentOrders: [],
    popularItems: [],
    revenueData: {
      daily: [],
      weekly: [],
      monthly: []
    },
    staffCount: 0,
    menuItemsCount: 0,
    activeOrdersCount: 0,
  });

  const toggleSidebar = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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
        .select('*')
        .order('created_at', { ascending: true });

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

      // Process revenue data for different time ranges
      const revenueData = processRevenueData(ordersData || []);

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
        revenueData,
        staffCount: staffCount || 0,
        menuItemsCount: menuItemsCount || 0,
        activeOrdersCount: activeOrdersCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const processRevenueData = (orders: Order[]) => {
    const now = new Date();
    const dailyData: { [key: string]: number } = {};
    const weeklyData: { [key: string]: number } = {};
    const monthlyData: { [key: string]: number } = {};
    
    // Process last 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = 0;
    }

    // Process last 12 weeks of data
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      const weekStr = `Week ${Math.ceil(date.getDate() / 7)}`;
      weeklyData[weekStr] = 0;
    }

    // Process last 12 months of data
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleString('default', { month: 'short' });
      monthlyData[monthStr] = 0;
    }

    // Aggregate order data
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const dateStr = orderDate.toISOString().split('T')[0];
      const weekStr = `Week ${Math.ceil(orderDate.getDate() / 7)}`;
      const monthStr = orderDate.toLocaleString('default', { month: 'short' });

      dailyData[dateStr] = (dailyData[dateStr] || 0) + Number(order.total_amount);
      weeklyData[weekStr] = (weeklyData[weekStr] || 0) + Number(order.total_amount);
      monthlyData[monthStr] = (monthlyData[monthStr] || 0) + Number(order.total_amount);
    });

    return {
      daily: Object.entries(dailyData)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      weekly: Object.entries(weeklyData)
        .map(([week, revenue]) => ({ week, revenue }))
        .sort((a, b) => a.week.localeCompare(b.week)),
      monthly: Object.entries(monthlyData)
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => a.month.localeCompare(b.month))
    };
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
      <SideNav 
        isNavOpen={isNavOpen} 
        onClose={closeNav} 
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className={`${isNavOpen ? (isCollapsed ? 'ml-0' : 'ml-64') : 'ml-0'} transition-all duration-200 ease-in-out w-full`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-4 sm:p-6 md:p-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back, Admin!</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600">Here's what's happening with your restaurant today.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <a href="/admin/staff/list" className="group relative bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-4 sm:p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-xl sm:text-2xl">👥</div>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="relative text-base sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">Manage Staff</h3>
              <p className="relative text-xs sm:text-sm text-gray-600">Add, remove, or update staff members</p>
            </a>

            <a href="/admin/menu/items" className="group relative bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-4 sm:p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-xl sm:text-2xl">🍽️</div>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="relative text-base sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">Update Menu</h3>
              <p className="relative text-xs sm:text-sm text-gray-600">Modify dishes, prices, and availability</p>
            </a>

            <a href="/admin/orders/active" className="group relative bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-4 sm:p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-xl sm:text-2xl">📝</div>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="relative text-base sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">Track Orders</h3>
              <p className="relative text-xs sm:text-sm text-gray-600">Monitor and manage active orders</p>
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-4 sm:space-y-6">
              {/* Revenue Overview Card */}
              <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-0">Revenue Overview</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs sm:text-sm text-slate-600">Revenue</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setTimeRange('daily')}
                        className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          timeRange === 'daily'
                            ? 'bg-red-100 text-red-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Daily
                      </button>
                      <button
                        onClick={() => setTimeRange('weekly')}
                        className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          timeRange === 'weekly'
                            ? 'bg-red-100 text-red-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Weekly
                      </button>
                      <button
                        onClick={() => setTimeRange('monthly')}
                        className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          timeRange === 'monthly'
                            ? 'bg-red-100 text-red-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] overflow-hidden">
                  <div className="absolute inset-0">
                    <RevenueChart
                      data={
                        timeRange === 'daily'
                          ? dashboardData.revenueData.daily
                          : timeRange === 'weekly'
                          ? dashboardData.revenueData.weekly
                          : dashboardData.revenueData.monthly
                      }
                      type={timeRange}
                    />
                  </div>
                </div>
              </div>

              {/* Revenue Metrics Card */}
              <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Revenue Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Average Order Value</p>
                        <p className="text-base sm:text-lg font-semibold text-slate-900">
                          ₹{(dashboardData.totalRevenue / (dashboardData.totalOrders || 1)).toFixed(2)}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-base sm:text-lg">💰</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Peak Revenue Day</p>
                        <p className="text-base sm:text-lg font-semibold text-slate-900">
                          {dashboardData.revenueData.daily.length > 0 
                            ? new Date(dashboardData.revenueData.daily.reduce((max, curr) => 
                                curr.revenue > max.revenue ? curr : max
                              ).date).toLocaleDateString('en-US', { weekday: 'long' }) 
                            : 'No data available'}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-base sm:text-lg">📈</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Revenue Growth</p>
                        <p className="text-base sm:text-lg font-semibold text-slate-900">
                          {dashboardData.revenueData[timeRange].length >= 2 
                            ? ((dashboardData.revenueData[timeRange][dashboardData.revenueData[timeRange].length - 1].revenue /
                                dashboardData.revenueData[timeRange][0].revenue - 1) * 100).toFixed(1) + '%'
                            : 'Insufficient data'}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-base sm:text-lg">📊</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Projected Revenue</p>
                        <p className="text-base sm:text-lg font-semibold text-slate-900">
                          {dashboardData.revenueData[timeRange].length > 0 
                            ? `₹${(dashboardData.revenueData[timeRange][dashboardData.revenueData[timeRange].length - 1].revenue * 1.1).toFixed(2)}`
                            : 'No data available'}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-base sm:text-lg">🎯</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Insights Card */}
              <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Revenue Insights</h2>
                <div className="space-y-4 sm:space-y-6">
                  {/* Revenue Distribution */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">Revenue Distribution</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">Morning (6AM-12PM)</span>
                          <span className="text-xs sm:text-sm font-medium text-slate-900">
                            {((dashboardData.revenueData.daily.length > 0 
                              ? dashboardData.revenueData.daily.reduce((sum, curr) => sum + curr.revenue, 0) 
                              : 0) * 0.3 / 1000).toFixed(1)}K
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">Afternoon (12PM-6PM)</span>
                          <span className="text-xs sm:text-sm font-medium text-slate-900">
                            {((dashboardData.revenueData.daily.length > 0 
                              ? dashboardData.revenueData.daily.reduce((sum, curr) => sum + curr.revenue, 0) 
                              : 0) * 0.4 / 1000).toFixed(1)}K
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">Evening (6PM-12AM)</span>
                          <span className="text-xs sm:text-sm font-medium text-slate-900">
                            {((dashboardData.revenueData.daily.length > 0 
                              ? dashboardData.revenueData.daily.reduce((sum, curr) => sum + curr.revenue, 0) 
                              : 0) * 0.3 / 1000).toFixed(1)}K
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Trends */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">Revenue Trends</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Weekday vs Weekend</p>
                            <p className="text-base sm:text-lg font-semibold text-slate-900">Weekend +25%</p>
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-base sm:text-lg">📅</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Lunch vs Dinner</p>
                            <p className="text-base sm:text-lg font-semibold text-slate-900">Dinner +40%</p>
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-base sm:text-lg">🍽️</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">Recommendations</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-red-50 rounded-xl">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs sm:text-sm">💡</span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">Optimize Lunch Menu</p>
                          <p className="text-xs sm:text-sm text-gray-600">Consider adding more lunch specials to increase afternoon revenue</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-red-50 rounded-xl">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs sm:text-sm">💡</span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">Weekend Staffing</p>
                          <p className="text-xs sm:text-sm text-gray-600">Increase staff during weekend peak hours to handle higher demand</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-0">Recent Orders</h2>
                  <a href="/admin/orders/active" className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700">
                    View All
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                          <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.recentOrders.length > 0 ? (
                          dashboardData.recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">#{String(order.id).slice(0, 8)}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">Table {order.table_id}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">₹{order.total_amount.toFixed(2)}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                                <span className={`px-1.5 sm:px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-2 sm:px-3 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500">No recent orders</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Popular Items</h2>
                  <a href="/admin/menu/items" className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700">
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
