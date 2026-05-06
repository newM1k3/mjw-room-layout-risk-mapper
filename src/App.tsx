import { useState } from 'react';
import { Map, Zap, FlaskConical } from 'lucide-react';
import { AppStep, LayoutProject, LayoutZone, LayoutElement, RiskReport } from './types';
import ProgressRail from './components/ProgressRail';
import SummaryPanel from './components/SummaryPanel';
import ProjectSetupForm from './steps/ProjectSetupForm';
import CanvasSetupPanel from './steps/CanvasSetupPanel';
import ZoneBuilder from './steps/ZoneBuilder';
import ElementsStep from './steps/ElementsStep';
import RiskMapPanel from './steps/RiskMapPanel';
import ExportPanel from './steps/ExportPanel';
import { sampleProject, sampleZones, sampleElements } from './data/sampleProject';
import { runLayoutRiskAudit } from './lib/riskEngine';

const ORDER: AppStep[] = ['project', 'canvas', 'zones', 'elements', 'risk', 'export'];

const DEFAULT_PROJECT: LayoutProject = {
  id: `project_${Date.now()}`,
  title: '',
  theme: '',
  roomType: 'linear',
  targetPlayerCount: 6,
  durationMinutes: 60,
  difficulty: 'standard',
  buildStage: 'concept',
  roomWidth: 20,
  roomHeight: 16,
  unit: 'feet',
};

export default function App() {
  const [step, setStep] = useState<AppStep>('project');
  const [completed, setCompleted] = useState<Set<AppStep>>(new Set());
  const [project, setProject] = useState<LayoutProject>(DEFAULT_PROJECT);
  const [zones, setZones] = useState<LayoutZone[]>([]);
  const [elements, setElements] = useState<LayoutElement[]>([]);
  const [report, setReport] = useState<RiskReport | null>(null);

  const markComplete = (s: AppStep) => setCompleted((prev) => new Set([...prev, s]));

  const goTo = (s: AppStep) => setStep(s);

  const next = () => {
    markComplete(step);
    const idx = ORDER.indexOf(step);
    if (idx < ORDER.length - 1) setStep(ORDER[idx + 1]);
  };

  const back = () => {
    const idx = ORDER.indexOf(step);
    if (idx > 0) setStep(ORDER[idx - 1]);
  };

  const loadSample = () => {
    setProject(sampleProject);
    setZones(sampleZones);
    setElements(sampleElements);
    const r = runLayoutRiskAudit(sampleProject, sampleZones, sampleElements);
    setReport(r);
    setCompleted(new Set(ORDER));
    setStep('risk');
  };

  const moveZone = (id: string, x: number, y: number) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, x, y } : z)));
  };

  const moveElement = (id: string, x: number, y: number) => {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, x, y } : e)));
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white flex flex-col" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
      {/* Header */}
      <header className="shrink-0 border-b border-white/8 bg-[#0d1120]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Map size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white leading-none">Room Layout Risk Mapper</div>
              <div className="text-xs text-slate-500 mt-0.5 leading-none">Escape Room Physical Design QA</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadSample}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-xs font-semibold transition-colors"
            >
              <FlaskConical size={12} /> Load Sample: Clockmaker's Workshop
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Zap size={10} />
              Physical Design QA Tool
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6 flex gap-6">
        {/* Left rail */}
        <ProgressRail current={step} completed={completed} onSelect={goTo} />

        {/* Main workspace */}
        <main className="flex-1 min-w-0">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 min-h-[500px]">
            {step === 'project' && (
              <ProjectSetupForm
                project={project}
                onChange={setProject}
                onNext={next}
              />
            )}
            {step === 'canvas' && (
              <CanvasSetupPanel
                project={project}
                onChange={setProject}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 'zones' && (
              <ZoneBuilder
                project={project}
                zones={zones}
                onChange={setZones}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 'elements' && (
              <ElementsStep
                project={project}
                zones={zones}
                elements={elements}
                onChange={setElements}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 'risk' && (
              <RiskMapPanel
                project={project}
                zones={zones}
                elements={elements}
                report={report}
                onReportChange={(r) => { setReport(r); markComplete('risk'); }}
                onMoveZone={moveZone}
                onMoveElement={moveElement}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 'export' && (
              <ExportPanel
                project={project}
                zones={zones}
                elements={elements}
                report={report}
                onBack={back}
              />
            )}
          </div>
        </main>

        {/* Right panel */}
        <SummaryPanel
          project={project.title ? project : null}
          zones={zones}
          elements={elements}
          report={report}
        />
      </div>
    </div>
  );
}
