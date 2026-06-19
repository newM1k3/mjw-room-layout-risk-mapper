import {
  Users,
  DoorOpen,
  AlertTriangle,
  RefreshCw,
  Eye,
  Package,
  LayoutGrid,
} from 'lucide-react';

const DETECTIONS = [
  {
    Icon: Users,
    title: 'Player Congestion',
    desc: 'Too many players or interactions in one zone',
  },
  {
    Icon: DoorOpen,
    title: 'Doorway Bottlenecks',
    desc: 'High-traffic elements near transition points',
  },
  {
    Icon: AlertTriangle,
    title: 'Exit Obstruction',
    desc: 'Props or stations crowding emergency egress',
  },
  {
    Icon: RefreshCw,
    title: 'Staff Reset Conflicts',
    desc: 'Staff paths crossing active player areas',
  },
  {
    Icon: Eye,
    title: 'Weak Sightlines',
    desc: 'Critical clues hidden or obscured',
  },
  {
    Icon: Package,
    title: 'Prop Density Risk',
    desc: 'Too many large elements in one zone',
  },
];

interface Props {
  onStart: () => void;
  onLoadSample: () => void;
}

export default function WelcomeScreen({ onStart, onLoadSample }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-12">
      <div className="max-w-2xl w-full mx-auto text-center space-y-8">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <LayoutGrid size={12} />
          Physical Design QA Tool
        </div>

        {/* Title */}
        <div>
          <h1 className="text-5xl font-bold text-white leading-tight">
            Room Layout<br />
            <span className="text-cyan-400">Risk Mapper</span>
          </h1>
          <p className="mt-4 text-slate-400 text-base max-w-lg mx-auto">
            Identify physical layout problems before you build. Map your room, place
            elements, and get a deterministic risk audit — no simulation claims, no
            engineering fiction.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="text-left bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle size={15} />
            What this tool is
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            A heuristic layout risk mapper. It gives you structured design guidance
            based on zone sizing, element placement, player count, and spatial
            relationships. It is{' '}
            <strong className="text-slate-300">not</strong> a crowd-flow simulator,
            certified safety reviewer, or CAD tool. Use it to catch likely problems
            early — before fabrication, build, or launch.
          </p>
        </div>

        {/* Detection cards */}
        <div className="text-left space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            What it detects
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DETECTIONS.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/[0.08] rounded-xl p-4 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <Icon size={15} className="text-cyan-400 shrink-0" />
                  <span className="text-sm font-semibold text-white">{title}</span>
                </div>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors"
          >
            Start New Layout →
          </button>
          <button
            onClick={onLoadSample}
            className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition-colors"
          >
            Load Sample: The Clockmaker's Workshop
          </button>
        </div>

      </div>
    </div>
  );
}
