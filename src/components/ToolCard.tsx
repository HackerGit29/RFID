import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onClick?: () => void;
}

export default function ToolCard({ tool, onClick }: ToolCardProps) {
  const getStatusColor = () => {
    switch (tool.status) {
      case 'available':
        return 'bg-[#06C167] text-black';
      case 'in_use':
        return 'bg-blue-500/20 text-blue-400';
      case 'maintenance':
        return 'bg-red-500/20 text-red-400';
      case 'lost':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-white/10 text-white/50';
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
      className="bg-[#121212] rounded-2xl p-4 flex gap-4 items-center group active:scale-[0.98] transition-all cursor-pointer border border-white/10 shadow-uber-md hover:shadow-uber-lg hover:border-white/20"
      onClick={onClick}
    >
      <div className="w-16 h-16 rounded-xl bg-[#1E1E1E] flex items-center justify-center relative overflow-hidden border border-white/10">
        <img
          alt={tool.name}
          className="w-full h-full object-cover"
          src={`https://source.unsplash.com/featured/?tool,${tool.category}`}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-headline font-bold text-white truncate text-sm">{tool.name}</h4>
          <span className="material-symbols-outlined text-white/40" style={{ fontSize: '18px' }}>chevron_right</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-mono text-white/40 uppercase">{tool.serialNumber}</p>
          <p className="text-[10px] font-bold text-white">{tool.price.toFixed(2)} €</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor()}`}>
            <span className="material-symbols-outlined text-[10px] mr-1" style={{ fontSize: '10px' }}>
              {getStatusIcon()}
            </span>
            {getStatusLabel()}
          </span>
          
          <div className="flex gap-1.5 ml-auto">
            {tool.rfidEnabled && (
              <span className="text-[9px] font-bold text-[#06C167] px-2 py-1 bg-[#06C167]/10 rounded-full border border-[#06C167]/20">
                RFID
              </span>
            )}
            {tool.bleEnabled && (
              <span className="text-[9px] font-bold text-[#06C167] px-2 py-1 bg-[#06C167]/10 rounded-full border border-[#06C167]/20">
                BLE
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
