import React from 'react';
import { Movement } from '../../types';

interface ActivityFeedProps {
  movements: Movement[];
}

export default function ActivityFeed({ movements }: ActivityFeedProps) {
  return (
    <div className="space-y-3">
      {movements.map((movement) => (
        <div
          key={movement.id}
          className="glass-panel p-4 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all border-l-4"
          style={{
            borderLeftColor: movement.authorized ? '#10b981' : '#ef4444',
            backgroundColor: movement.authorized ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black-container-highest rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#06C167]">
                {movement.toolIcon}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{movement.toolName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                  movement.authorized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {movement.type} {movement.authorized ? '✓' : '⚠'}
                </span>
                <span className="text-[10px] text-outline font-medium">
                  {movement.checkpointId || 'Unknown Portal'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="block font-bold text-xs text-white">{movement.timestamp}</span>
            <span className={`block text-[10px] font-bold uppercase ${
              movement.authorized ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {movement.authorized ? 'Autorisé' : 'Alerte'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
