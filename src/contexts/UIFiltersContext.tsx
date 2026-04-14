import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface UIFiltersContextType {
  // Global search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Inventory filter
  activeFilter: string;
  setActiveFilter: (filter: string) => void;

  // ToolStateManager filters
  toolSearch: string;
  setToolSearch: (query: string) => void;
  toolCategoryFilter: string;
  setToolCategoryFilter: (category: string) => void;
}

const UIFiltersContext = createContext<UIFiltersContextType | undefined>(undefined);

export function UIFiltersProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [toolSearch, setToolSearch] = useState('');
  const [toolCategoryFilter, setToolCategoryFilter] = useState('All');

  const value: UIFiltersContextType = {
    searchQuery,
    setSearchQuery: useCallback((query: string) => setSearchQuery(query), []),
    activeFilter,
    setActiveFilter: useCallback((filter: string) => setActiveFilter(filter), []),
    toolSearch,
    setToolSearch: useCallback((query: string) => setToolSearch(query), []),
    toolCategoryFilter,
    setToolCategoryFilter: useCallback((category: string) => setToolCategoryFilter(category), []),
  };

  return (
    <UIFiltersContext.Provider value={value}>
      {children}
    </UIFiltersContext.Provider>
  );
}

export function useUIFilters() {
  const context = useContext(UIFiltersContext);
  if (context === undefined) {
    throw new Error('useUIFilters must be used within a UIFiltersProvider');
  }
  return context;
}
