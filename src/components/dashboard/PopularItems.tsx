interface PopularItem {
  name: string;
  orders: number;
  revenue: string;
}

interface PopularItemsProps {
  items: PopularItem[];
}

export default function PopularItems({ items }: PopularItemsProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-semibold text-slate-900">Popular Items</h3>
        <span className="text-base text-slate-600">Top 4 items</span>
      </div>
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-medium text-lg">#{index + 1}</span>
                </div>
              </div>
              <div>
                <div className="text-base font-medium text-slate-900">{item.name}</div>
                <div className="text-sm text-slate-600">{item.orders} orders</div>
              </div>
            </div>
            <div className="text-base font-medium text-slate-900">{item.revenue}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 