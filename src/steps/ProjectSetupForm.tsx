import { LayoutProject } from '../types';

interface Props {
  project: LayoutProject;
  onChange: (p: LayoutProject) => void;
  onNext: () => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors';
const selectCls = inputCls + ' cursor-pointer';

export default function ProjectSetupForm({
  project,
  onChange,
  onNext,
}: Props) {
  const set = <K extends keyof LayoutProject>(key: K, value: LayoutProject[K]) =>
    onChange({ ...project, [key]: value });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Project Setup</h2>
        <p className="text-sm text-slate-400 mt-1">
          Define the room context for the layout risk analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Room Title">
          <input
            className={inputCls}
            placeholder="e.g. The Clockmaker's Workshop"
            value={project.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </Field>

        <Field label="Theme">
          <input
            className={inputCls}
            placeholder="e.g. Victorian mystery"
            value={project.theme}
            onChange={(e) => set('theme', e.target.value)}
          />
        </Field>

        <Field label="Room Type">
          <select
            className={selectCls}
            value={project.roomType}
            onChange={(e) =>
              set('roomType', e.target.value as LayoutProject['roomType'])
            }
          >
            <option value="linear">Linear</option>
            <option value="semi_linear">Semi-Linear</option>
            <option value="open_world">Open World</option>
            <option value="multi_room">Multi-Room</option>
          </select>
        </Field>

        <Field label="Difficulty">
          <select
            className={selectCls}
            value={project.difficulty}
            onChange={(e) =>
              set('difficulty', e.target.value as LayoutProject['difficulty'])
            }
          >
            <option value="family">Family</option>
            <option value="standard">Standard</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </Field>

        <Field label="Target Player Count">
          <input
            type="number"
            min={1}
            max={20}
            className={inputCls}
            value={project.targetPlayerCount}
            onChange={(e) =>
              set('targetPlayerCount', parseInt(e.target.value) || 1)
            }
          />
        </Field>

        <Field label="Duration (minutes)">
          <input
            type="number"
            min={15}
            max={180}
            className={inputCls}
            value={project.durationMinutes}
            onChange={(e) =>
              set('durationMinutes', parseInt(e.target.value) || 60)
            }
          />
        </Field>

        <Field label="Build Stage">
          <select
            className={selectCls}
            value={project.buildStage}
            onChange={(e) =>
              set('buildStage', e.target.value as LayoutProject['buildStage'])
            }
          >
            <option value="concept">Concept</option>
            <option value="prototype">Prototype</option>
            <option value="renovation">Renovation</option>
            <option value="live_room_review">Live Room Review</option>
          </select>
        </Field>

        <Field label="Measurement Unit">
          <select
            className={selectCls}
            value={project.unit}
            onChange={(e) =>
              set('unit', e.target.value as LayoutProject['unit'])
            }
          >
            <option value="feet">Feet</option>
            <option value="meters">Meters</option>
          </select>
        </Field>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!project.title.trim()}
          className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors"
        >
          Continue to Canvas →
        </button>
      </div>
    </div>
  );
}
