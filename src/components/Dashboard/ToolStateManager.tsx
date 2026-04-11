import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { motion } from 'framer-motion';

interface ToolStateManagerProps {
  tools: Tool[];
  onToggleState: (id: string, newState: 'authorized' | 'locked') => Promise<void>;
}

export default function ToolStateManager({ tools, onToggleState }: ToolStateManagerProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(tools.map(t => t.category));
    return ['All', ...Array.from(cats)];
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                            t.serialNumber.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [tools, search, categoryFilter]);

  const handleBulkLock = async () => {
    const lockPromises = tools
      .filter(t => t.state === 'authorized')
      .map(t => onToggleState(t.id, 'locked'));
    await Promise.all(lockPromises);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tool Control Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">search</span>
            <input
              type="text"
              placeholder="Search tools..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-high text-xs border border-outline/10 focus:border-primary outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="bg-surface-container-high text-xs border border-outline/10 rounded-xl px-3 py-2 outline-none focus:border-primary transition-all"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <button
          onClick={handleBulkLock}
          className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">lock</span>
          Lock All
        </button>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {filteredTools.map(tool => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={tool.id}
              className="p-3 rounded-2xl bg-surface-container-highest border border-outline/10 flex items-center justify-between group hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`size-2 rounded-full ${tool.state === 'authorized' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                <div>
                  <p className="text-xs font-bold text-white leading-none">{tool.name}</p>
                  <p className="text-[10px] text-on-surface-variant font-mono mt-1">{tool.serialNumber}</p>
                </div>
              </div>

              <button
                onClick={() => onToggleState(tool.id, tool.state === 'authorized' ? 'locked' : 'authorized')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  tool.state === 'authorized'
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                }`}
              >
                {tool.state === 'authorized' ? 'Lock' : 'Auth'}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTools.length === 0 && (
        <div className="py-12 text-center">
          <span className="material-symbols-outlined text-outline text-4xl block mb-2">search_off</span>
          <p className="text-xs text-on-surface-variant">No tools found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
