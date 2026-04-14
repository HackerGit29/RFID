import { useUIFilters } from '../contexts/UIFiltersContext';

interface SearchBarProps {
  placeholder?: string;
  showFilter?: boolean;
  onFilter?: () => void;
  useGlobalSearch?: boolean;
}

export default function SearchBar({
  placeholder = 'Rechercher un outil...',
  showFilter = false,
  onFilter,
  useGlobalSearch = true,
}: SearchBarProps) {
  const { searchQuery, setSearchQuery } = useUIFilters();

  const query = useGlobalSearch ? searchQuery : '';
  const setQuery = useGlobalSearch ? setSearchQuery : () => {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <section className="relative">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 flex items-center bg-[#121212] rounded-full px-5 py-3.5 shadow-uber-md border border-white/10">
          <span className="material-symbols-outlined text-white/40 mr-3" style={{ fontSize: '20px' }}>search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-white placeholder-white/40 w-full text-sm font-body"
            placeholder={placeholder}
            type="text"
            value={query}
            onChange={handleChange}
          />
        </div>

        {showFilter && (
          <button
            onClick={onFilter}
            className="bg-[#121212] p-4 rounded-full text-white active:scale-95 transition-all shadow-uber-md border border-white/10"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>tune</span>
          </button>
        )}
      </div>
    </section>
  );
}
