import { StatCard as StatCardType } from '../types';

interface StatCardProps {
  stat: StatCardType;
}

export default function StatCard({ stat }: StatCardProps) {
  return (
    <div className="min-w-[160px] bg-[#121212] p-5 rounded-2xl flex flex-col justify-between border-l-4 border-[#06C167] shadow-uber-md">
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
        {stat.label}
      </span>
      <div className="flex items-end justify-between">
        <span className="text-4xl font-bold font-headline text-white">
          {stat.value}
        </span>
        {stat.trend !== undefined && (
          <span className={`text-[10px] font-bold mb-1 ${stat.trend >= 0 ? 'text-[#06C167]' : 'text-red-500'}`}>
            {stat.trend >= 0 ? '+' : ''}{stat.trend}%
          </span>
        )}
      </div>
    </div>
  );
}
