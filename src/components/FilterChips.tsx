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
            className={`flex-none px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-surface-container-high text-on-surface-variant font-semibold hover:bg-surface-bright'
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
