// app/components/SummaryStats.tsx
'use client';

import { SummaryData } from '@/app/lib/api';


interface SummaryStatsProps {
  data: SummaryData;
}

export default function SummaryStats({ data }: SummaryStatsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getStatusColorClass = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMethodColorClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-blue-600';
      case 'POST': return 'text-green-600';
      case 'PUT': return 'text-yellow-600';
      case 'DELETE': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Sort status and method distributions by count (descending)
  const sortedStatusDist = Object.entries(data.status_distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5

  const sortedMethodDist = Object.entries(data.method_distribution)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Requests */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{formatNumber(data.total_requests)}</p>
      </div>

      {/* Average Response Size */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-500">Average Response Size</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{formatNumber(data.average_response_size)} bytes</p>
      </div>
      
      {/* Status Distribution */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-500">Top Status Codes</h3>
        <div className="mt-2">
          {sortedStatusDist.map(([status, count]) => (
            <div key={status} className="flex items-center justify-between mt-1">
              <div className="flex items-center">
                <span className={`font-medium ${getStatusColorClass(parseInt(status))}`}>
                  {status}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                  <div
                    className={`h-2.5 rounded-full ${getStatusColorClass(parseInt(status)).replace('text-', 'bg-')}`}
                    style={{ width: `${(count / data.total_requests) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {count} ({((count / data.total_requests) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Method Distribution */}
      <div className="bg-white shadow rounded-lg p-4 md:col-span-3">
        <h3 className="text-sm font-medium text-gray-500">HTTP Methods</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {sortedMethodDist.map(([method, count]) => (
            <div
              key={method}
              className="flex items-center px-3 py-1 bg-gray-100 rounded-full"
            >
              <span className={`font-medium ${getMethodColorClass(method)}`}>
                {method}
              </span>
              <span className="ml-1 text-xs text-gray-500">
                {count} ({((count / data.total_requests) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}