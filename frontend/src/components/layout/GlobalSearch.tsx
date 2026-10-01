import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { data: results, isLoading } = useGlobalSearch(query);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (link: string) => {
    navigate(link);
    setIsFocused(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="relative w-96 ml-8">
      <div className={`flex items-center bg-gray-100 rounded-lg overflow-hidden transition-all ${isFocused ? 'ring-2 ring-primary bg-white' : ''}`}>
        <Search className="text-gray-400 ml-3" size={18} />
        <input 
          type="text" 
          placeholder="Search customers, invoices, serials..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full bg-transparent p-2 outline-none text-sm"
        />
        {isLoading && query.length >= 2 && <Loader2 className="animate-spin text-gray-400 mr-3" size={16} />}
      </div>

      {isFocused && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          {!isLoading && (!results || results.length === 0) ? (
            <div className="p-4 text-center text-sm text-gray-500">No results found for "{query}"</div>
          ) : (
            <div className="py-2">
              {results?.map((res: any, idx: number) => (
                <button
                  key={`${res.type}-${res.id}-${idx}`}
                  onClick={() => handleSelect(res.link)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{res.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{res.subtitle}</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-gray-100 rounded text-gray-600">{res.type}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
