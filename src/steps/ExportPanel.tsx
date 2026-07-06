import { useState } from 'react';
import { Copy, Download, Check, FileJson, FileText } from 'lucide-react';
import { LayoutProject, LayoutZone, LayoutElement, RiskReport } from '../types';
import { buildExportJson, buildMarkdownReport } from '../services/exporters';

interface Props {
  project: LayoutProject;
  zones: LayoutZone[];
  elements: LayoutElement[];
  report: RiskReport | null;
  onBack: () => void;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
      }`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

export default function ExportPanel({ project, zones, elements, report, onBack }: Props) {
  const json = buildExportJson(project, zones, elements, report);
  const markdown = report ? buildMarkdownReport(project, zones, elements, report) : '';

  const downloadJson = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_').toLowerCase()}_layout_risk.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Export</h2>
        <p className="text-sm text-slate-400 mt-1">Download or copy your layout data and risk report for design meetings, contractors, or integration with other tools.</p>
      </div>

      {/* JSON */}
      <div className="rounded-xl border border-white/10 bg-slate-800/40 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <FileJson size={16} className="text-cyan-400" /> JSON Export
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={json} label="Copy JSON" />
            <button
              onClick={downloadJson}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium transition-colors"
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>
        <pre className="p-4 text-xs text-slate-400 overflow-auto max-h-64 font-mono leading-relaxed">
          {json}
        </pre>
      </div>

      {/* Markdown */}
      {report && (
        <div className="rounded-xl border border-white/10 bg-slate-800/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <FileText size={16} className="text-amber-400" /> Markdown Report
            </div>
            <CopyButton text={markdown} label="Copy Markdown" />
          </div>
          <pre className="p-4 text-xs text-slate-400 overflow-auto max-h-64 font-mono leading-relaxed whitespace-pre-wrap">
            {markdown}
          </pre>
        </div>
      )}

      {/* Integration hints */}
      <div className="rounded-xl border border-white/10 bg-slate-800/40 p-5 space-y-3">
        <div className="text-sm font-semibold text-slate-300">Integration Hints</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Flow', desc: 'Overlay physical risk warnings onto the puzzle flow diagram.' },
            { label: 'Locks', desc: 'Cross-reference lock placement density and reset logistics.' },
            { label: 'Logic', desc: 'Flag physical risk at critical dependency nodes.' },
            { label: 'Maintenance Log / Ready', desc: 'Convert staff-access conflicts into pre-game reset checklists.' },
          ].map((hint) => (
            <div key={hint.label} className="rounded-lg bg-white/5 p-3">
              <div className="text-xs font-semibold text-cyan-400 mb-1">{hint.label}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{hint.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-start">
        <button onClick={onBack} className="px-5 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">
          ← Back to Risk Map
        </button>
      </div>
    </div>
  );
}
