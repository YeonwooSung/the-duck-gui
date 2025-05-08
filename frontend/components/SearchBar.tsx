// app/components/SearchBar.tsx
'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';


interface SearchBarProps {
  onSearch: (query: string) => void;
}


export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <form onSubmit={handleSubmit}>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-20 py-2 rounded-md border-0 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder='method="POST" and status!=200'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <div className="flex">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Run Query
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                onClick={() => {
                  // Clear the search
                  setQuery('');
                  onSearch('');
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-2 flex items-center text-xs text-gray-500">
        <span className="font-medium text-gray-700 mr-1">ClickHouse Performance Tip:</span>
        <span>Filter by</span>
        <button
          type="button"
          className="ml-1 text-blue-600 hover:text-blue-800"
          onClick={() => {
            const newQuery = 'method="POST"';
            setQuery(newQuery);
            onSearch(newQuery);
          }}
        >
          POST
        </button>
      </div>
    </div>
  );
}