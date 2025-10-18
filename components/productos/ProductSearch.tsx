'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface ProductSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export function ProductSearch({
  onSearch,
  placeholder = 'Buscar productos...',
  initialValue = '',
}: ProductSearchProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
          size={20} 
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          fullWidth
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </form>
  );
}

