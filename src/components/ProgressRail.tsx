import { Check, Settings, LayoutGrid as Layout, Grid2x2 as Grid, Box, AlertTriangle, Download, type LucideIcon } from 'lucide-react';
import { AppStep } from '../types';

const STEPS: { id: AppStep; label: string; Icon: LucideIcon }[] = [
  { id: 'project', label: 'Project Setup', Icon: Settings },
  { id: 'canvas', label: 'Canvas', Icon: Layout },
  { id: 'zones', label: 'Zones', Icon: Grid },
  { id: 'elements', label: 'Elements', Icon: Box },
  { id: 'risk', label: 'Risk Map', Icon: AlertTriangle },
  { id: 'export', label: 'Export', Icon: Download },
];

const ORDER: AppStep[] = ['project', 'canvas', 'zones', 'elements', 'risk', 'export'];

interface Props {
  current: AppStep;
  completed: Set<AppStep>;
  onSelect: (step: AppStep) => void;
}

export default function ProgressRail({ current, completed, onSelect }: Props) {
  return (
    <aside className="w-52 shrink-0 flex flex-col gap-1 py-4">
      {STEPS.map((step, idx) => {
        const isCurrent = step.id === current;
        const isDone = completed.has(step.id);
        const isAccessible = isDone || isCurrent || ORDER.indexOf(step.id) <= ORDER.indexOf(current);

        return (
          <button
            key={step.id}
            onClick={() => isAccessible && onSelect(step.id)}
            disabled={!isAccessible}
            className={[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isCurrent
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : isDone
                ? 'text-slate-300 hover:bg-white/5 cursor-pointer'
                : isAccessible
                ? 'text-slate-400 hover:bg-white/5 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed opacity-50',
            ].join(' ')}
          >
            <span className={[
              'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
              isCurrent
                ? 'bg-cyan-500 text-black'
                : isDone
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/5 text-slate-500',
            ].join(' ')}>
              {isDone && !isCurrent ? <Check size={12} /> : idx + 1}
            </span>
            <span>{step.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
