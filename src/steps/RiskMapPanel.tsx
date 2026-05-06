import { useState } from 'react';
import { Play, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { LayoutProject, LayoutZone, LayoutElement, RiskReport } from '../types';
import { runLayoutRiskAudit } from '../lib/riskEngine';
import LayoutCanvas from '../components/LayoutCanvas';
import RiskIssueCard from '../components/RiskIssueCard';

interface Props {
  project: LayoutProject;
  zones: LayoutZone[];
  elements: LayoutElement[];
  report: RiskReport | null;
  onReportChange: (r: RiskReport) => void;
  onMoveZone: (id: string, x: number, y: number) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onNext: () => void;
  onBack: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 90 ? '#10b981' :
    score >= 70 ? '#22d3ee' :
    score >= 40 ? '#f59e0b' : '#ef4444';
  const label =
    score >= 90 ? 'Low Layout Risk' :
    score >= 70 ? 'Usable With Revisions' :
    score >= 40 ? 'High Risk Layout' : 'Not Ready for Build Review';

  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={120} height={120}>
          <circle cx={60} cy={60} r={r} fill="none" stroke="#1e293b" strokeWidth={10} />
          <circle
            cx={60} cy={60} r={r} fill="none"
            stroke={color}
            strokeWidth={10}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          <text x={60} y={64} textAnchor="middle" fill="white" fontSize={24} fontWeight="bold">{score}</text>
        </svg>
      </div>
      <div className="text-sm font-semibold" style={{ color }}>{label}</div>
    </div>
  );
}

export default function RiskMapPanel({
  project, zones, elements, report, onReportChange,
  onMoveZone, onMoveElement, onNext, onBack,
}: Props) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'critical' | 'warning' | 'improvement' | 'clean'>('critical');

  const runAudit = () => {
    const r = runLayoutRiskAudit(project, zones, elements);
    onReportChange(r);
    setActiveTab(r.criticalCount > 0 ? 'critical' : r.warningCount > 0 ? 'warning' : 'improvement');
  };

  const filteredIssues = report?.issues.filter((i) => i.severity === activeTab) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Risk Map</h2>
          <p className="text-sm text-slate-400 mt-1">Run the deterministic layout risk audit to see your score and issues.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
          >
            {showHeatmap ? <Eye size={14} /> : <EyeOff size={14} />}
            {showHeatmap ? 'Heatmap On' : 'Heatmap Off'}
          </button>
          <button
            onClick={runAudit}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors"
          >
            <Play size={14} /> Run Risk Map
          </button>
        </div>
      </div>

      {/* Canvas */}
      <LayoutCanvas
        project={project}
        zones={zones}
        elements={elements}
        selectedZoneId={selectedZoneId}
        selectedElementId={selectedElementId}
        report={report}
        showHeatmap={showHeatmap}
        onSelectZone={setSelectedZoneId}
        onSelectElement={setSelectedElementId}
        onMoveZone={onMoveZone}
        onMoveElement={onMoveElement}
      />

      {/* Heatmap Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs text-slate-500">Zone Risk:</span>
        {[
          { color: 'bg-emerald-500/30 border-emerald-500/50', label: 'Clean' },
          { color: 'bg-sky-500/30 border-sky-500/50', label: 'Improvement' },
          { color: 'bg-amber-500/30 border-amber-500/50', label: 'Warning' },
          { color: 'bg-red-500/30 border-red-500/50', label: 'Critical' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm border ${item.color}`} />
            <span className="text-xs text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Score and issues */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score */}
          <div className="rounded-xl border border-white/10 bg-slate-800/40 p-6 flex flex-col items-center gap-4">
            <ScoreRing score={report.score} />
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="text-center">
                <div className="text-xl font-bold text-red-400">{report.criticalCount}</div>
                <div className="text-xs text-slate-500">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-amber-400">{report.warningCount}</div>
                <div className="text-xs text-slate-500">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-sky-400">{report.improvementCount}</div>
                <div className="text-xs text-slate-500">Improve</div>
              </div>
            </div>
          </div>

          {/* Issues */}
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-slate-800/40 p-4 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 flex-wrap">
              {(['critical', 'warning', 'improvement', 'clean'] as const).map((tab) => {
                const counts = {
                  critical: report.criticalCount,
                  warning: report.warningCount,
                  improvement: report.improvementCount,
                  clean: report.cleanChecks.length,
                };
                const colors = {
                  critical: activeTab === tab ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'text-slate-500 border-transparent hover:text-slate-300',
                  warning: activeTab === tab ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'text-slate-500 border-transparent hover:text-slate-300',
                  improvement: activeTab === tab ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'text-slate-500 border-transparent hover:text-slate-300',
                  clean: activeTab === tab ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'text-slate-500 border-transparent hover:text-slate-300',
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-colors ${colors[tab]}`}
                  >
                    {tab} ({counts[tab]})
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scroll">
              {activeTab === 'clean' ? (
                report.cleanChecks.length === 0 ? (
                  <div className="text-sm text-slate-600 italic py-4 text-center">No clean checks yet.</div>
                ) : (
                  report.cleanChecks.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      {c}
                    </div>
                  ))
                )
              ) : filteredIssues.length === 0 ? (
                <div className="text-sm text-slate-600 italic py-4 text-center">No {activeTab} issues found.</div>
              ) : (
                filteredIssues.map((issue) => (
                  <RiskIssueCard key={issue.id} issue={issue} zones={zones} elements={elements} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!report && (
        <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
          <AlertCircle size={32} className="text-slate-600 mx-auto mb-3" />
          <div className="text-sm text-slate-500">Click "Run Risk Map" to analyse your layout and see the risk score.</div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/70 leading-relaxed">
        <strong className="text-amber-400">Design guidance only.</strong> This tool provides heuristic layout risk analysis. It is not a substitute for local safety codes, accessibility review, professional inspection, insurance requirements, or emergency planning.
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="px-5 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!report}
          className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors"
        >
          Continue to Export →
        </button>
      </div>
    </div>
  );
}
