import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onClick?: () => void;
}

export default function ToolCard({ tool, onClick }: ToolCardProps) {
  const getStatusColor = () => {
    switch (tool.status) {
      case 'available':
        return 'bg-tertiary-container text-tertiary';
      case 'in_use':
        return 'bg-blue-900/40 text-blue-300';
      case 'maintenance':
        return 'bg-error-container text-error';
      case 'lost':
        return 'bg-error/20 text-error';
      default:
        return 'bg-surface-container-high text-outline';
    }
  };

  const getStatusLabel = () => {
    switch (tool.status) {
      case 'available':
        return 'Disponible';
      case 'in_use':
        return 'En utilisation';
      case 'maintenance':
        return 'Maintenance';
      case 'lost':
        return 'Perdu';
      default:
        return 'Inconnu';
    }
  };

  const getStatusIcon = () => {
    switch (tool.status) {
      case 'available':
        return 'check_circle';
      case 'in_use':
        return 'sync';
      case 'maintenance':
        return 'warning';
      case 'lost':
        return 'error';
      default:
        return 'help';
    }
  };

  return (
    <div
      className="glass-card rounded-lg p-4 flex gap-4 items-center group active:scale-[0.98] transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="w-16 h-16 rounded-lg bg-slate-800/60 flex items-center justify-center relative overflow-hidden border border-slate-700/30">
        <img
          alt={tool.name}
          className="w-full h-full object-cover"
          src={`https://source.unsplash.com/featured/?tool,${tool.category}`}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="font-bold text-on-surface truncate text-sm">{tool.name}</h4>
          <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono text-outline uppercase">{tool.serialNumber}</p>
          <p className="text-[10px] font-bold text-on-surface">{tool.price.toFixed(2)} €</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-extrabold uppercase tracking-wider ${getStatusColor()}`}>
            <span className="material-symbols-outlined text-[10px] mr-1">
              {getStatusIcon()}
            </span>
            {getStatusLabel()}
          </span>
          
          <div className="flex gap-1.5 ml-auto">
            {tool.rfidEnabled && (
              <span className="text-[9px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded-sm border border-primary/20">
                RFID
              </span>
            )}
            {tool.bleEnabled && (
              <span className="text-[9px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded-sm border border-primary/20">
                BLE
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
