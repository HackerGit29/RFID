import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showFilter?: boolean;
  onFilter?: () => void;
}

export default function SearchBar({
  placeholder = 'Rechercher un outil...',
  onSearch,
  showFilter = false,
  onFilter,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch?.(newQuery);
  };

  return (
    <section className="relative">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 flex items-center bg-surface-container-highest rounded-xl px-4 py-3 shadow-lg">
          <span className="material-symbols-outlined text-outline mr-3">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-on-surface placeholder-outline w-full text-sm font-body"
            placeholder={placeholder}
            type="text"
            value={query}
            onChange={handleChange}
          />
        </div>
        
        {showFilter && (
          <button 
            onClick={onFilter}
            className="bg-surface-container-high p-3.5 rounded-lg text-on-surface active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">tune</span>
          </button>
        )}
      </div>
    </section>
  );
}
