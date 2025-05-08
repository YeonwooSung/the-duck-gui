// app/components/DateRangePicker.tsx
'use client';

import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline';


interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (startDate: Date, endDate: Date) => void;
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState<Date>(startDate);
  const [localEndDate, setLocalEndDate] = useState<Date>(endDate);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    
    if (start) {
      setLocalStartDate(start);
    }
    
    if (end) {
      setLocalEndDate(end);
      setIsOpen(false);
      
      // Only trigger onChange when both dates are selected
      if (start) {
        onChange(start, end);
      }
    }
  };

  // Predefined date ranges
  const handleLastHour = () => {
    const end = new Date();
    const start = new Date(end.getTime() - 60 * 60 * 1000); // 1 hour ago
    setLocalStartDate(start);
    setLocalEndDate(end);
    onChange(start, end);
    setIsOpen(false);
  };

  const handleLastDay = () => {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    setLocalStartDate(start);
    setLocalEndDate(end);
    onChange(start, end);
    setIsOpen(false);
  };

  const handleLastWeek = () => {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    setLocalStartDate(start);
    setLocalEndDate(end);
    onChange(start, end);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" aria-hidden="true" />
        <span>
          {format(localStartDate, 'MMM d, HH:mm')} - {format(localEndDate, 'MMM d, HH:mm')}
        </span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="p-4">
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={handleLastHour}
              >
                Last Hour
              </button>
              <button
                type="button"
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={handleLastDay}
              >
                Last 24h
              </button>
              <button
                type="button"
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={handleLastWeek}
              >
                Last 7d
              </button>
            </div>
            <ReactDatePicker
              selected={localStartDate}
              onChange={handleDateChange}
              startDate={localStartDate}
              endDate={localEndDate}
              selectsRange
              inline
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
            />
          </div>
        </div>
      )}
    </div>
  );
}