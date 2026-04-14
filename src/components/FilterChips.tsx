interface FilterChipsProps {
  filters: string[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export default function FilterChips({
  filters,
  activeFilter,
  onSelectFilter,
}: FilterChipsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
      {filters.map((filter) => {
        const isActive = filter === activeFilter;
        
        return (
          <button
            key={filter}
            onClick={() => onSelectFilter(filter)}
            className={`flex-none px-6 py-3 rounded-full font-bold text-sm transition-all ${
              isActive
                ? 'bg-[#06C167] text-black shadow-uber-md'
                : 'bg-[#121212] text-white/60 font-semibold hover:bg-[#1E1E1E] border border-white/10'
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
