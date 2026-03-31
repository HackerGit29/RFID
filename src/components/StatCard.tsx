import { StatCard as StatCardType } from '../types';

interface StatCardProps {
  stat: StatCardType;
}

export default function StatCard({ stat }: StatCardProps) {
  return (
    <div className={`min-w-[160px] bg-surface-container-high p-4 rounded-xl flex flex-col justify-between border-l-4 ${stat.color}`}>
      <span className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
        {stat.label}
      </span>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold font-headline text-on-surface">
          {stat.value}
        </span>
        {stat.trend !== undefined && (
          <span className={`text-[10px] font-bold mb-1 ${stat.trend >= 0 ? 'text-tertiary' : 'text-error'}`}>
            {stat.trend >= 0 ? '+' : ''}{stat.trend}
          </span>
        )}
      </div>
    </div>
  );
}
