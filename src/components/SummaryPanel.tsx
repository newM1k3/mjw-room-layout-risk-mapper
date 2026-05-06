import { Users, Ruler, Grid2x2 as Grid, Box, AlertTriangle, TrendingUp } from 'lucide-react';
import { LayoutProject, LayoutZone, LayoutElement, RiskReport } from '../types';

interface Props {
  project: LayoutProject | null;
  zones: LayoutZone[];
  elements: LayoutElement[];
  report: RiskReport | null;
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 90 ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' :
    score >= 70 ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' :
    score >= 40 ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
    'text-red-400 border-red-500/40 bg-red-500/10';

  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="text-4xl font-black">{score}</div>
      <div className="text-xs font-semibold mt-1 opacity-80">{label}</div>
    </div>
  );
}

export default function SummaryPanel({ project, zones, elements, report }: Props) {
  return (
    <aside className="w-64 shrink-0 flex flex-col gap-4 py-4">
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Project Stats</div>
        {project ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white truncate">{project.title}</div>
            <div className="text-xs text-slate-400 truncate">{project.theme}</div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
                <Users size={10} /> {project.targetPlayerCount} players
              </span>
              <span className="flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
                <Ruler size={10} /> {project.roomWidth}×{project.roomHeight} {project.unit}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-600 italic">No project yet</div>
        )}
      </div>

      <div className="border-t border-white/5 pt-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Layout</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/60 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-cyan-400">{zones.length}</div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1"><Grid size={10} /> Zones</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-cyan-400">{elements.length}</div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1"><Box size={10} /> Elements</div>
          </div>
        </div>
      </div>

      {report ? (
        <div className="border-t border-white/5 pt-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
            <TrendingUp size={10} /> Risk Score
          </div>
          <ScoreBadge score={report.score} label={report.label} />
          <div className="mt-3 space-y-1.5">
            {report.criticalCount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-red-400"><AlertTriangle size={10} /> Critical</span>
                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">{report.criticalCount}</span>
              </div>
            )}
            {report.warningCount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-amber-400"><AlertTriangle size={10} /> Warnings</span>
                <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">{report.warningCount}</span>
              </div>
            )}
            {report.improvementCount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-sky-400">Improvements</span>
                <span className="bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-bold">{report.improvementCount}</span>
              </div>
            )}
          </div>
          {report.issues.slice(0, 2).map((issue) => (
            <div key={issue.id} className="mt-2 rounded-lg border border-white/5 bg-slate-800/40 p-2.5">
              <div className={`text-xs font-semibold ${
                issue.severity === 'critical' ? 'text-red-400' :
                issue.severity === 'warning' ? 'text-amber-400' : 'text-sky-400'
              }`}>{issue.title}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-t border-white/5 pt-4">
          <div className="text-xs text-slate-600 italic">Run the risk map to see your score.</div>
        </div>
      )}

      <div className="mt-auto border-t border-white/5 pt-4">
        <div className="text-xs text-slate-600 leading-relaxed">
          Design-risk guidance only. Not a substitute for safety codes, professional inspection, or emergency planning.
        </div>
      </div>
    </aside>
  );
}
