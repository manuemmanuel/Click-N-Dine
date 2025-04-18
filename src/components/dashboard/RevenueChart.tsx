'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface RevenueData {
  date?: string;
  week?: string;
  month?: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  type: TimeRange;
}

export default function RevenueChart({ data, type }: RevenueChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const getLabel = (item: RevenueData) => {
    switch (type) {
      case 'daily':
        return new Date(item.date!).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      case 'weekly':
        return item.week;
      case 'monthly':
        return item.month;
      default:
        return '';
    }
  };

  const chartData = {
    labels: data.map(item => getLabel(item)),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => item.revenue),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#ef4444',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            return `₹${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 12,
          },
          callback: function(value) {
            return `₹${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-[400px]">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
} 