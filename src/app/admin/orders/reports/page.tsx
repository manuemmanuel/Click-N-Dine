'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import { aeonik } from '@/fonts/fonts';
import { Order } from '@/components/dashboard/RecentOrders';

interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: {
    [key: string]: number;
  };
  topItems: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  ordersByHour: Array<{
    hour: number;
    count: number;
    revenue: number;
  }>;
}

export default function OrderReports() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [analytics, setAnalytics] = useState<OrderAnalytics>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    ordersByStatus: {},
    topItems: [],
    ordersByHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0, revenue: 0 })),
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    fetchAnalytics();

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
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      let query = supabase
        .from('orders')
        .select('*');

      // Apply date filter
      const now = new Date();
      let startDate = new Date();
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      query = query.gte('created_at', startDate.toISOString());

      const { data: orders, error } = await query;

      if (error) throw error;

      // Calculate analytics
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate orders by status
      const ordersByStatus = orders?.reduce((acc: { [key: string]: number }, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Calculate top items
      const itemStats: { [key: string]: { count: number; revenue: number } } = {};
      orders?.forEach(order => {
        order.items.forEach((item: { name: string; price: number; quantity: number }) => {
          if (!itemStats[item.name]) {
            itemStats[item.name] = { count: 0, revenue: 0 };
          }
          itemStats[item.name].count += item.quantity;
          itemStats[item.name].revenue += item.price * item.quantity;
        });
      });

      const topItems = Object.entries(itemStats)
        .map(([name, stats]) => ({
          name,
          count: stats.count,
          revenue: stats.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate orders by hour
      const ordersByHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0, revenue: 0 }));
      orders?.forEach(order => {
        const hour = new Date(order.created_at).getHours();
        ordersByHour[hour].count++;
        ordersByHour[hour].revenue += Number(order.total_amount);
      });

      setAnalytics({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus,
        topItems,
        ordersByHour,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50`}>
      <SideNav isNavOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-6">
          <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Order Analytics</h1>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-slate-600 mb-2">Total Orders</h3>
                    <p className="text-2xl font-bold text-slate-900">{analytics.totalOrders}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-slate-600 mb-2">Total Revenue</h3>
                    <p className="text-2xl font-bold text-slate-900">₹{analytics.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-slate-600 mb-2">Average Order Value</h3>
                    <p className="text-2xl font-bold text-slate-900">₹{analytics.averageOrderValue.toFixed(2)}</p>
                  </div>
                </div>

                {/* Orders by Status */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Orders by Status</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                      <div key={status} className="bg-slate-50 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-slate-600 mb-1">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </h3>
                        <p className="text-xl font-bold text-slate-900">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Items */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Items</h2>
                  <div className="space-y-4">
                    {analytics.topItems.map((item) => (
                      <div key={item.name} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                        <div>
                          <h3 className="font-medium text-slate-900">{item.name}</h3>
                          <p className="text-sm text-slate-600">{item.count} orders</p>
                        </div>
                        <p className="text-lg font-bold text-slate-900">₹{item.revenue.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orders by Hour */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Orders by Hour</h2>
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                    {analytics.ordersByHour.map((hour) => (
                      <div key={hour.hour} className="bg-slate-50 rounded-xl p-4 text-center">
                        <h3 className="text-sm font-medium text-slate-600 mb-1">
                          {hour.hour.toString().padStart(2, '0')}:00
                        </h3>
                        <p className="text-lg font-bold text-slate-900">{hour.count}</p>
                        <p className="text-sm text-slate-600">₹{hour.revenue.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 