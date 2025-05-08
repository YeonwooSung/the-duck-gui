// app/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LogEntry {
  timestamp: string;
  host: string;
  method: string;
  protocol: string;
  referer: string;
  request: string;
  status: number;
  user_identifier: string;
  bytes: number;
}

export interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export interface SummaryData {
  total_requests: number;
  status_distribution: Record<string, number>;
  method_distribution: Record<string, number>;
  average_response_size: number;
}

export interface LogsQueryParams {
  start_time?: string;
  end_time?: string;
  method?: string;
  status?: number;
  limit?: number;
  offset?: number;
}

export interface TimeSeriesQueryParams {
  start_time?: string;
  end_time?: string;
  interval?: string;
  group_by?: string;
}

const api = {
  getLogs: async (params: LogsQueryParams = {}): Promise<LogEntry[]> => {
    const response = await axios.get(`${API_URL}/logs`, { params });
    return response.data;
  },
  
  getTimeSeries: async (params: TimeSeriesQueryParams = {}): Promise<TimeSeriesData> => {
    const response = await axios.get(`${API_URL}/time-series`, { params });
    return response.data;
  },
  
  getSummary: async (params: { start_time?: string; end_time?: string } = {}): Promise<SummaryData> => {
    const response = await axios.get(`${API_URL}/summary`, { params });
    return response.data;
  }
};

export default api;