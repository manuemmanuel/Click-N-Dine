'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentOrders from '@/components/dashboard/RecentOrders';
import PopularItems from '@/components/dashboard/PopularItems';
import RevenueChart from '@/components/dashboard/RevenueChart';

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  occupiedTables: number;
  recentOrders: any[];
  popularItems: any[];
  revenueData: any[];
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
  });

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('meal_bookings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_bookings' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const reviewsSubscription = supabase
      .channel('reviews_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const tablesSubscription = supabase
      .channel('tables_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      reviewsSubscription.unsubscribe();
      tablesSubscription.unsubscribe();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total orders and revenue
      const { data: ordersData, error: ordersError } = await supabase
        .from('meal_bookings')
        .select('*');

      if (ordersError) throw ordersError;

      // Fetch recent orders with table information
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('meal_bookings')
        .select(`
          *,
          tables (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentOrdersError) throw recentOrdersError;

      // Fetch average rating
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating');

      if (reviewsError) throw reviewsError;

      // Fetch occupied tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('is_occupied');

      if (tablesError) throw tablesError;

      // Calculate popular items
      const popularItems = calculatePopularItems(ordersData || []);

      // Calculate revenue data for the chart
      const revenueData = calculateRevenueData(ordersData || []);

      setDashboardData({
        totalOrders: ordersData?.length || 0,
        totalRevenue: ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        averageRating: reviewsData?.length 
          ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
          : 0,
        occupiedTables: tablesData?.filter(table => table.is_occupied).length || 0,
        recentOrders: recentOrdersData || [],
        popularItems,
        revenueData,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const calculatePopularItems = (orders: any[]) => {
    const itemCounts: { [key: string]: { count: number; revenue: number } } = {};
    
    orders.forEach(order => {
      const items = order.items;
      Object.entries(items).forEach(([itemName, details]: [string, any]) => {
        if (!itemCounts[itemName]) {
          itemCounts[itemName] = { count: 0, revenue: 0 };
        }
        itemCounts[itemName].count += details.quantity || 1;
        itemCounts[itemName].revenue += (details.price * (details.quantity || 1));
      });
    });

    return Object.entries(itemCounts)
      .map(([name, data]) => ({
        name,
        orders: data.count,
        revenue: `$${data.revenue.toFixed(2)}`
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4);
  };

  const calculateRevenueData = (orders: any[]) => {
    const monthlyData: { [key: string]: number } = {};
    
    // Get the last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' });
    }).reverse();
    
    // Initialize all months with 0
    months.forEach(month => {
      monthlyData[month] = 0;
    });
    
    // Add revenue to corresponding months
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      if (monthlyData[month] !== undefined) {
        monthlyData[month] += Number(order.total_amount);
      }
    });

    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({
        month,
        revenue
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SideNav isOpen={isNavOpen} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total Orders"
              value={dashboardData.totalOrders}
              icon="📝"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Total Revenue"
              value={`$${dashboardData.totalRevenue.toFixed(2)}`}
              icon="💰"
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Average Rating"
              value={dashboardData.averageRating.toFixed(1)}
              icon="⭐"
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="Occupied Tables"
              value={`${dashboardData.occupiedTables}/10`}
              icon="🪑"
              trend={{ value: 3, isPositive: false }}
            />
          </div>

          {/* Charts and Lists Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={dashboardData.revenueData} />
            <div className="space-y-6">
              <RecentOrders orders={dashboardData.recentOrders} />
              <PopularItems items={dashboardData.popularItems} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
