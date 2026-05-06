import { LayoutProject } from '../types';

interface Props {
  project: LayoutProject;
  onChange: (p: LayoutProject) => void;
  onNext: () => void;
  onBack: () => void;
}

const inputCls =
  'w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors';

const PX_PER_UNIT = 28;

export default function CanvasSetupPanel({
  project,
  onChange,
  onNext,
  onBack,
}: Props) {
  const set = <K extends keyof LayoutProject>(key: K, value: LayoutProject[K]) =>
    onChange({ ...project, [key]: value });

  const previewW = project.roomWidth * PX_PER_UNIT;
  const previewH = project.roomHeight * PX_PER_UNIT;
  const maxPreview = 420;
  const scale = Math.min(1, maxPreview / Math.max(previewW, previewH));
  const pw = previewW * scale;
  const ph = previewH * scale;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Canvas Setup</h2>
        <p className="text-sm text-slate-400 mt-1">
          Set approximate room dimensions. Exact precision is not required — the
          tool uses heuristic checks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Room Width ({project.unit})
          </label>
          <input
            type="number"
            min={5}
            max={200}
            className={inputCls}
            value={project.roomWidth}
            onChange={(e) => set('roomWidth', parseInt(e.target.value) || 20)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Room Height ({project.unit})
          </label>
          <input
            type="number"
            min={5}
            max={200}
            className={inputCls}
            value={project.roomHeight}
            onChange={(e) => set('roomHeight', parseInt(e.target.value) || 20)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Unit
          </label>
          <select
            className={inputCls + ' cursor-pointer'}
            value={project.unit}
            onChange={(e) =>
              set('unit', e.target.value as LayoutProject['unit'])
            }
          >
            <option value="feet">Feet</option>
            <option value="meters">Meters</option>
          </select>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Room Preview
        </div>
        <div className="flex items-center justify-center bg-slate-900/60 rounded-xl border border-white/10 p-6">
          <div
            className="relative overflow-hidden rounded border-2 border-cyan-500/40"
            style={{ width: pw, height: ph }}
          >
            <svg className="absolute inset-0 opacity-20" width={pw} height={ph}>
              <defs>
                <pattern
                  id="prev-grid"
                  width={PX_PER_UNIT * scale}
                  height={PX_PER_UNIT * scale}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${PX_PER_UNIT * scale} 0 L 0 0 0 ${PX_PER_UNIT * scale}`}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width={pw} height={ph} fill="url(#prev-grid)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-cyan-400/60 text-xs font-mono">
                {project.roomWidth} × {project.roomHeight} {project.unit}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center mt-2">
          Area: {(project.roomWidth * project.roomHeight).toFixed(0)} sq{' '}
          {project.unit} — approx{' '}
          {(
            (project.roomWidth * project.roomHeight) /
            project.targetPlayerCount
          ).toFixed(1)}{' '}
          sq {project.unit} per player
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors"
        >
          Continue to Zones →
        </button>
      </div>
    </div>
  );
}
