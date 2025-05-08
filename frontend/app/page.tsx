// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import SearchBar from '@/components/SearchBar';
import LogTable from '@/components/LogTable';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import SummaryStats from '@/components/SummaryStats';
import DateRangePicker from '@/components/DateRangePicker';
import api, { LogEntry, TimeSeriesData, SummaryData } from './lib/api';


export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState({
    start_time: format(new Date(Date.now() - 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm:ss"),
    end_time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    method: undefined as string | undefined,
    status: undefined as number | undefined,
    limit: 100,
    offset: 0,
  });
  const [groupBy, setGroupBy] = useState<string>('status');
  const [interval, setInterval] = useState<string>('5m');

  useEffect(() => {
    fetchData();
  }, [queryParams]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch logs
      const logsData = await api.getLogs(queryParams);
      setLogs(logsData);
      
      // Fetch time series data
      const timeSeriesData = await api.getTimeSeries({
        start_time: queryParams.start_time,
        end_time: queryParams.end_time,
        interval,
        group_by: groupBy,
      });
      setTimeSeriesData(timeSeriesData);
      
      // Fetch summary data
      const summaryData = await api.getSummary({
        start_time: queryParams.start_time,
        end_time: queryParams.end_time,
      });
      setSummaryData(summaryData);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    // Parse search query to extract filters
    const methodMatch = searchQuery.match(/method="([^"]+)"/);
    const statusMatch = searchQuery.match(/status!=?(\d+)/);
    
    setQueryParams(prev => ({
      ...prev,
      method: methodMatch ? methodMatch[1] : undefined,
      status: statusMatch ? parseInt(statusMatch[1]) : undefined,
      offset: 0, // Reset offset when search changes
    }));
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setQueryParams(prev => ({
      ...prev,
      start_time: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
      end_time: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
      offset: 0, // Reset offset when date range changes
    }));
  };

  const handleGroupByChange = (value: string) => {
    setGroupBy(value);
    // Re-fetch time series data with new group by
    api.getTimeSeries({
      start_time: queryParams.start_time,
      end_time: queryParams.end_time,
      interval,
      group_by: value,
    }).then(setTimeSeriesData);
  };

  const handleIntervalChange = (value: string) => {
    setInterval(value);
    // Re-fetch time series data with new interval
    api.getTimeSeries({
      start_time: queryParams.start_time,
      end_time: queryParams.end_time,
      interval: value,
      group_by: groupBy,
    }).then(setTimeSeriesData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Log Analysis</h2>
        <div className="flex space-x-2">
          <select 
            className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={groupBy}
            onChange={(e) => handleGroupByChange(e.target.value)}
          >
            <option value="status">Status</option>
            <option value="method">Method</option>
          </select>
          <DateRangePicker 
            startDate={new Date(queryParams.start_time)} 
            endDate={new Date(queryParams.end_time)} 
            onChange={handleDateRangeChange} 
          />
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Series Chart */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Time Series Distribution</h3>
          <div className="flex space-x-2">
            <select 
              className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={interval}
              onChange={(e) => handleIntervalChange(e.target.value)}
            >
              <option value="1m">1 minute</option>
              <option value="5m">5 minutes</option>
              <option value="15m">15 minutes</option>
              <option value="1h">1 hour</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <TimeSeriesChart data={timeSeriesData} />
        )}
      </div>

      {/* Summary Stats */}
      {summaryData && <SummaryStats data={summaryData} />}

      {/* Log Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <LogTable 
          logs={logs} 
          loading={loading} 
          totalItems={100} // Replace with actual count
          currentPage={queryParams.offset / queryParams.limit + 1}
          itemsPerPage={queryParams.limit}
          onPageChange={(page) => {
            setQueryParams(prev => ({
              ...prev,
              offset: (page - 1) * prev.limit
            }));
          }}
        />
      </div>
    </div>
  );
}