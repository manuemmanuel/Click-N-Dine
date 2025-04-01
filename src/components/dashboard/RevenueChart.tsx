interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-semibold text-slate-900">Revenue Overview</h3>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-base text-slate-600">Monthly Revenue</span>
          </div>
        </div>
        <div className="h-72 flex items-center justify-center">
          <p className="text-slate-500 text-lg">No revenue data available</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minHeight = 20; // Minimum height for bars in pixels

  return (
    <div className="bg-white p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-semibold text-slate-900">Revenue Overview</h3>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-base text-slate-600">Monthly Revenue</span>
        </div>
      </div>
      <div className="h-72 flex items-end space-x-4">
        {data.map((item) => {
          const height = maxRevenue > 0 
            ? Math.max(minHeight, (item.revenue / maxRevenue) * 100)
            : minHeight;

          return (
            <div key={item.month} className="flex-1 group">
              <div className="relative">
                <div
                  className="bg-gradient-to-t from-red-500 to-red-600 rounded-t-xl transition-all duration-300 group-hover:from-red-600 group-hover:to-red-700"
                  style={{
                    height: `${height}%`,
                  }}
                />
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-base text-slate-600 font-medium whitespace-nowrap">
                  {item.month}
                </div>
              </div>
              <div className="text-center text-base font-medium text-slate-900 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                ${item.revenue.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 