interface Order {
  id: string;
  user_id: string;
  table_id: number;
  items: any;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed';
  created_at: string;
  tables?: {
    name: string;
  };
}

interface RecentOrdersProps {
  orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'confirmed':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-semibold text-slate-900">Recent Orders</h3>
        <span className="text-base text-slate-600">Last 5 orders</span>
      </div>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-medium text-lg">{order.id.slice(0, 4)}</span>
                </div>
              </div>
              <div>
                <div className="text-base font-medium text-slate-900">
                  Table {order.tables?.name || order.table_id}
                </div>
                <div className="text-sm text-slate-600">
                  {Object.keys(order.items).length} items • {new Date(order.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-base font-medium text-slate-900">
                ${order.total_amount.toFixed(2)}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 