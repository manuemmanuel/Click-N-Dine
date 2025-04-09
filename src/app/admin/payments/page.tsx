'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import SideNav from '@/components/dashboard/SideNav';
import Image from 'next/image';
import { aeonik } from '@/fonts/fonts';

interface TablePayment {
  id: string;
  table_number: number;
  total_amount: number;
  status: 'pending' | 'paid';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  created_at: string;
}

export default function PaymentsPage() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [tables, setTables] = useState<TablePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TablePayment | null>(null);

  useEffect(() => {
    fetchTablePayments();

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
          fetchTablePayments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchTablePayments = async () => {
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending');

      if (ordersData) {
        const tablePayments = ordersData.map(order => ({
          id: order.id,
          table_number: order.table_id,
          total_amount: order.total_amount,
          status: order.status,
          items: order.items,
          created_at: order.created_at
        }));

        setTables(tablePayments);
      }
    } catch (error) {
      console.error('Error fetching table payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async (tableId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', tableId);

      if (error) throw error;
      fetchTablePayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-gray-50 to-white`}>
      <SideNav isNavOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className={`${isNavOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Table Payments</h1>
            <p className="mt-2 text-slate-600">Manage and track payments for all tables.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tables List */}
              <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Pending Payments</h2>
                <div className="space-y-4">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedTable?.id === table.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTable(table)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-lg">🪑</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">Table {table.table_number}</h3>
                            <p className="text-sm text-slate-500">
                              {new Date(table.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            ₹{table.total_amount.toFixed(2)}
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] p-6">
                {selectedTable ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-slate-900">Payment Details</h2>
                      <button
                        onClick={() => handlePaymentComplete(selectedTable.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Mark as Paid
                      </button>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-slate-900 mb-4">Order Items</h3>
                      <div className="space-y-3">
                        {selectedTable.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                            <div>
                              <p className="font-medium text-slate-900">{item.name}</p>
                              <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-slate-900 mb-4">Payment QR Code</h3>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                        <div className="relative w-[200px] h-[200px]">
                          <Image
                            src="/qr-codes/payment-qr.jpg"
                            alt="Payment QR Code"
                            fill
                            className="object-contain"
                            priority
                          />
                        </div>
                        <p className="mt-2 text-sm text-slate-500 text-center">
                          Scan to pay ₹{selectedTable.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-500">Select a table to view payment details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 