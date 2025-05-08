// app/components/TimeSeriesChart.tsx
'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TimeSeriesData } from '@/app/lib/api';


interface TimeSeriesChartProps {
  data: TimeSeriesData | null;
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 text-gray-500">
        No data available
      </div>
    );
  }

  // Transform the data for recharts
  const chartData = data.labels.map((label, index) => {
    const dataPoint: Record<string, any> = { name: label };
    
    data.datasets.forEach(dataset => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    
    return dataPoint;
  });

  // Generate colors for each series
  const defaultColors = [
    '#4299E1', // blue-500
    '#48BB78', // green-500
    '#ECC94B', // yellow-500
    '#F56565', // red-500
    '#9F7AEA', // purple-500
    '#ED64A6', // pink-500
    '#38B2AC', // teal-500
    '#F97316', // orange-500
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={20}
          barGap={0}
          barCategoryGap={1}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#E2E8F0' }}
            axisLine={{ stroke: '#E2E8F0' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#E2E8F0' }}
            axisLine={{ stroke: '#E2E8F0' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #E2E8F0',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {data.datasets.map((dataset, index) => (
            <Bar
              key={dataset.label}
              dataKey={dataset.label}
              stackId="a"
              fill={dataset.backgroundColor || defaultColors[index % defaultColors.length]}
              radius={[0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}