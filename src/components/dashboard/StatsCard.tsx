interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({ title, value, icon, trend, className = '' }: StatsCardProps) {
  return (
    <div className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <div className={`flex items-center ${trend.isPositive ? 'text-green-500' : 'text-red-600'}`}>
          <span className="text-sm font-medium">
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        </div>
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );
} 