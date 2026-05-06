import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { RiskIssue, LayoutZone, LayoutElement } from '../types';

interface Props {
  issue: RiskIssue;
  zones: LayoutZone[];
  elements: LayoutElement[];
}

const SEVERITY_CONFIG = {
  critical: {
    Icon: AlertCircle,
    label: 'Critical',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    badge: 'bg-red-500/20 text-red-400',
    text: 'text-red-400',
  },
  warning: {
    Icon: AlertTriangle,
    label: 'Warning',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-400',
    text: 'text-amber-400',
  },
  improvement: {
    Icon: Info,
    label: 'Improvement',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    badge: 'bg-sky-500/20 text-sky-400',
    text: 'text-sky-400',
  },
  clean: {
    Icon: CheckCircle,
    label: 'Clean',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-400',
    text: 'text-emerald-400',
  },
};

export default function RiskIssueCard({ issue, zones, elements }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[issue.severity];
  const { Icon } = cfg;

  const affectedZoneLabels = issue.affectedZoneIds
    .map((id) => zones.find((z) => z.id === id)?.label)
    .filter(Boolean) as string[];
  const affectedElLabels = issue.affectedElementIds
    .map((id) => elements.find((e) => e.id === id)?.label)
    .filter(Boolean) as string[];

  return (
    <div className={`rounded-xl border ${cfg.bg} ${cfg.border} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <Icon size={16} className={cfg.text} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
            <span className="text-xs text-slate-500">{issue.category}</span>
          </div>
          <div className="text-sm font-medium text-white mt-0.5 leading-snug">{issue.title}</div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-slate-500 shrink-0" /> : <ChevronDown size={14} className="text-slate-500 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {affectedZoneLabels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {affectedZoneLabels.map((l) => (
                <span key={l} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-md">Zone: {l}</span>
              ))}
            </div>
          )}
          {affectedElLabels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {affectedElLabels.map((l) => (
                <span key={l} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-md">{l}</span>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-300 leading-relaxed">{issue.explanation}</p>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-xs font-semibold text-slate-400 mb-1">Suggested Fix</div>
            <p className="text-sm text-slate-200 leading-relaxed">{issue.suggestedFix}</p>
          </div>
        </div>
      )}
    </div>
  );
}
