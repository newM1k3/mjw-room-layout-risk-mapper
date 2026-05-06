import { useState } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Check, X } from 'lucide-react';
import { LayoutZone, ZonePurpose, LayoutProject } from '../types';

interface Props {
  project: LayoutProject;
  zones: LayoutZone[];
  onChange: (zones: LayoutZone[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const PURPOSE_OPTIONS: { value: ZonePurpose; label: string }[] = [
  { value: 'start', label: 'Start Area' },
  { value: 'main_puzzle', label: 'Main Puzzle Zone' },
  { value: 'transition', label: 'Transition' },
  { value: 'reveal', label: 'Reveal' },
  { value: 'finale', label: 'Finale' },
  { value: 'staff_reset', label: 'Staff Reset' },
  { value: 'atmosphere', label: 'Atmosphere' },
  { value: 'storage', label: 'Storage' },
];

const PURPOSE_COLORS: Record<ZonePurpose, string> = {
  start: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  main_puzzle: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  transition: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  reveal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  finale: 'bg-red-500/20 text-red-400 border-red-500/30',
  staff_reset: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  atmosphere: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  storage: 'bg-stone-500/20 text-stone-400 border-stone-500/30',
};

const inputCls = 'w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors';

function newZone(idx: number): LayoutZone {
  return {
    id: `zone_${Date.now()}_${idx}`,
    label: 'New Zone',
    x: 1,
    y: 1,
    width: 6,
    height: 5,
    purpose: 'main_puzzle',
    expectedPlayerLoad: 3,
  };
}

interface ZoneRowProps {
  zone: LayoutZone;
  project: LayoutProject;
  onUpdate: (z: LayoutZone) => void;
  onDelete: () => void;
}

function ZoneRow({ zone, project, onUpdate, onDelete }: ZoneRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(zone);

  const save = () => { onUpdate(draft); setEditing(false); };
  const cancel = () => { setDraft(zone); setEditing(false); };

  if (!editing) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition-colors">
        <div className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${PURPOSE_COLORS[zone.purpose]}`}>
          {PURPOSE_OPTIONS.find((p) => p.value === zone.purpose)?.label}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{zone.label}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {zone.width} × {zone.height} {project.unit} at ({zone.x}, {zone.y}) — {zone.expectedPlayerLoad} players
          </div>
        </div>
        <button onClick={() => setEditing(true)} className="p-1.5 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-colors">
          <Edit2 size={14} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Label</label>
          <input className={inputCls} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Purpose</label>
          <select className={inputCls + ' cursor-pointer'} value={draft.purpose} onChange={(e) => setDraft({ ...draft, purpose: e.target.value as ZonePurpose })}>
            {PURPOSE_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Expected Players</label>
          <input type="number" min={0} max={20} className={inputCls} value={draft.expectedPlayerLoad} onChange={(e) => setDraft({ ...draft, expectedPlayerLoad: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">X ({project.unit})</label>
          <input type="number" min={0} className={inputCls} value={draft.x} onChange={(e) => setDraft({ ...draft, x: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Y ({project.unit})</label>
          <input type="number" min={0} className={inputCls} value={draft.y} onChange={(e) => setDraft({ ...draft, y: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Width ({project.unit})</label>
          <input type="number" min={1} className={inputCls} value={draft.width} onChange={(e) => setDraft({ ...draft, width: parseFloat(e.target.value) || 1 })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Height ({project.unit})</label>
          <input type="number" min={1} className={inputCls} value={draft.height} onChange={(e) => setDraft({ ...draft, height: parseFloat(e.target.value) || 1 })} />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Notes</label>
          <input className={inputCls} value={draft.notes ?? ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={cancel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors">
          <X size={12} /> Cancel
        </button>
        <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold transition-colors">
          <Check size={12} /> Save
        </button>
      </div>
    </div>
  );
}

export default function ZoneBuilder({ project, zones, onChange, onNext, onBack }: Props) {
  const update = (idx: number, z: LayoutZone) => {
    const next = [...zones];
    next[idx] = z;
    onChange(next);
  };
  const remove = (idx: number) => onChange(zones.filter((_, i) => i !== idx));
  const add = () => onChange([...zones, newZone(zones.length)]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Zone Builder</h2>
          <p className="text-sm text-slate-400 mt-1">Define the physical zones in your room. Each zone gets a purpose and expected player load.</p>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-300 font-medium transition-colors"
        >
          <Plus size={14} /> Add Zone
        </button>
      </div>

      {zones.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <div className="text-sm">No zones yet. Add your first zone to get started.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {zones.map((zone, idx) => (
            <ZoneRow
              key={zone.id}
              zone={zone}
              project={project}
              onUpdate={(z) => update(idx, z)}
              onDelete={() => remove(idx)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="px-5 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors"
        >
          Continue to Elements →
        </button>
      </div>
    </div>
  );
}
