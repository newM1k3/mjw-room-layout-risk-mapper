import { useState } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Check, X, DoorOpen, LogOut, Puzzle, Lock, Search, Package, Shield, UserCog, Route, Camera, Zap } from 'lucide-react';
import { LayoutElement, ElementType, Intensity, LayoutZone, LayoutProject } from '../types';

const TYPE_CONFIG: Record<ElementType, { label: string; Icon: React.FC<{ size?: number }> }> = {
  door: { label: 'Door', Icon: DoorOpen },
  exit: { label: 'Exit', Icon: LogOut },
  puzzle_station: { label: 'Puzzle Station', Icon: Puzzle },
  lock: { label: 'Lock', Icon: Lock },
  clue: { label: 'Clue', Icon: Search },
  prop: { label: 'Prop', Icon: Package },
  scenic_blocker: { label: 'Scenic Blocker', Icon: Shield },
  staff_access: { label: 'Staff Access', Icon: UserCog },
  reset_path: { label: 'Reset Path', Icon: Route },
  camera_view: { label: 'Camera', Icon: Camera },
  sound_light: { label: 'Sound / Light', Icon: Zap },
};

const ELEMENT_COLORS: Record<ElementType, string> = {
  door: 'text-slate-400',
  exit: 'text-red-400',
  puzzle_station: 'text-blue-400',
  lock: 'text-amber-400',
  clue: 'text-cyan-400',
  prop: 'text-purple-400',
  scenic_blocker: 'text-slate-400',
  staff_access: 'text-emerald-400',
  reset_path: 'text-emerald-400',
  camera_view: 'text-orange-400',
  sound_light: 'text-pink-400',
};

interface Props {
  project: LayoutProject;
  zones: LayoutZone[];
  elements: LayoutElement[];
  onChange: (els: LayoutElement[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const inputCls = 'w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors';

function newElement(type: ElementType): LayoutElement {
  return {
    id: `el_${Date.now()}`,
    type,
    label: TYPE_CONFIG[type].label,
    x: 2,
    y: 2,
    width: 2,
    height: 2,
    interactionIntensity: 'medium',
    importance: 'medium',
  };
}

interface ElRowProps {
  el: LayoutElement;
  project: LayoutProject;
  zones: LayoutZone[];
  onUpdate: (e: LayoutElement) => void;
  onDelete: () => void;
}

function ElRow({ el, project, zones, onUpdate, onDelete }: ElRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(el);
  const { Icon } = TYPE_CONFIG[el.type];

  const save = () => { onUpdate(draft); setEditing(false); };
  const cancel = () => { setDraft(el); setEditing(false); };

  if (!editing) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition-colors">
        <Icon size={14} className={ELEMENT_COLORS[el.type]} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{el.label}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {TYPE_CONFIG[el.type].label} · {el.width}×{el.height} {project.unit} · intensity: {el.interactionIntensity}
            {el.zoneId && <span className="ml-1">· {zones.find((z) => z.id === el.zoneId)?.label}</span>}
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
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Type</label>
          <select className={inputCls + ' cursor-pointer'} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as ElementType })}>
            {(Object.keys(TYPE_CONFIG) as ElementType[]).map((t) => (
              <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Zone</label>
          <select className={inputCls + ' cursor-pointer'} value={draft.zoneId ?? ''} onChange={(e) => setDraft({ ...draft, zoneId: e.target.value || undefined })}>
            <option value="">No zone</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Interaction Intensity</label>
          <select className={inputCls + ' cursor-pointer'} value={draft.interactionIntensity} onChange={(e) => setDraft({ ...draft, interactionIntensity: e.target.value as Intensity })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Importance</label>
          <select className={inputCls + ' cursor-pointer'} value={draft.importance} onChange={(e) => setDraft({ ...draft, importance: e.target.value as LayoutElement['importance'] })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
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
          <input type="number" min={0.5} step={0.5} className={inputCls} value={draft.width} onChange={(e) => setDraft({ ...draft, width: parseFloat(e.target.value) || 1 })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Height ({project.unit})</label>
          <input type="number" min={0.5} step={0.5} className={inputCls} value={draft.height} onChange={(e) => setDraft({ ...draft, height: parseFloat(e.target.value) || 1 })} />
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

export default function ElementsStep({ project, zones, elements, onChange, onNext, onBack }: Props) {
  const [showPalette, setShowPalette] = useState(false);

  const update = (idx: number, e: LayoutElement) => {
    const next = [...elements];
    next[idx] = e;
    onChange(next);
  };
  const remove = (idx: number) => onChange(elements.filter((_, i) => i !== idx));
  const addType = (type: ElementType) => {
    onChange([...elements, newElement(type)]);
    setShowPalette(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Element Placement</h2>
          <p className="text-sm text-slate-400 mt-1">Add doors, exits, props, locks, clues, puzzle stations, and more.</p>
        </div>
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium transition-colors"
        >
          <Plus size={14} /> Add Element
        </button>
      </div>

      {showPalette && (
        <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Choose Type</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {(Object.entries(TYPE_CONFIG) as [ElementType, typeof TYPE_CONFIG[ElementType]][]).map(([type, cfg]) => {
              const { Icon } = cfg;
              return (
                <button
                  key={type}
                  onClick={() => addType(type)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-colors ${ELEMENT_COLORS[type]}`}
                >
                  <Icon size={16} />
                  <span className="text-xs text-slate-300 text-center leading-tight">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {elements.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <div className="text-sm">No elements yet. Use "Add Element" to place doors, exits, props, and more.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {elements.map((el, idx) => (
            <ElRow
              key={el.id}
              el={el}
              project={project}
              zones={zones}
              onUpdate={(e) => update(idx, e)}
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
          Run Risk Map →
        </button>
      </div>
    </div>
  );
}
