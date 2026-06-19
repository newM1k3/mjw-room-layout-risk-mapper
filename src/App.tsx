import { useState, useEffect, useCallback } from 'react';
import { Map, Zap, FlaskConical, FolderOpen } from 'lucide-react';
import { AppStep, LayoutProject, LayoutZone, LayoutElement, RiskReport } from './types';
import ProgressRail from './components/ProgressRail';
import SummaryPanel from './components/SummaryPanel';
import WelcomeScreen from './steps/WelcomeScreen';
import ProjectSetupForm from './steps/ProjectSetupForm';
import CanvasSetupPanel from './steps/CanvasSetupPanel';
import ZoneBuilder from './steps/ZoneBuilder';
import ElementsStep from './steps/ElementsStep';
import RiskMapPanel from './steps/RiskMapPanel';
import ExportPanel from './steps/ExportPanel';
import { sampleProject, sampleZones, sampleElements } from './data/sampleProject';
import { runLayoutRiskAudit } from './lib/riskEngine';
import { pb, saveProject, loadProjects, type SavedProjectMeta } from './lib/pocketbase';

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
  const [step, setStep] = useState<AppStep>('welcome');
  const [completed, setCompleted] = useState<Set<AppStep>>(new Set());
  const [project, setProject] = useState<LayoutProject>(DEFAULT_PROJECT);
  const [zones, setZones] = useState<LayoutZone[]>([]);
  const [elements, setElements] = useState<LayoutElement[]>([]);
  const [report, setReport] = useState<RiskReport | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProjectMeta[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  // SSO token handoff + load saved projects on mount
  useEffect(() => {
    async function initApp() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        try {
          pb.authStore.save(token, null);
          await pb.collection('users').authRefresh();
        } catch {
          pb.authStore.clear();
        }
        window.history.replaceState({}, '', window.location.pathname);
      }

      const projects = await loadProjects();
      setSavedProjects(projects);
    }
    void initApp();
  }, []);

  // Auto-save when entering the export step
  const persistProject = useCallback(async () => {
    if (!pb.authStore.isValid) return;
    setIsSaving(true);
    try {
      await saveProject({ project, zones, elements, report });
      const refreshed = await loadProjects();
      setSavedProjects(refreshed);
    } catch (err) {
      console.warn('Room Layout Risk Mapper: project save failed', err);
    } finally {
      setIsSaving(false);
    }
  }, [project, zones, elements, report]);

  function loadSavedProject(meta: SavedProjectMeta) {
    const { project: p, zones: z, elements: e, report: r } = meta.payload;
    setProject(p);
    setZones(z);
    setElements(e);
    setReport(r);
    setCompleted(new Set(ORDER));
    setStep('project');
    setShowLoadMenu(false);
  }

  const markComplete = (s: AppStep) => setCompleted((prev) => new Set([...prev, s]));

  const goTo = (s: AppStep) => setStep(s);

  const next = () => {
    markComplete(step);
    const idx = ORDER.indexOf(step);
    const nextStep = ORDER[idx + 1];
    if (nextStep) {
      setStep(nextStep);
      if (nextStep === 'export') {
        void persistProject();
      }
    }
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
            {savedProjects.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowLoadMenu((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/25 text-violet-400 text-xs font-semibold transition-colors"
                >
                  <FolderOpen size={12} /> Load Saved ({savedProjects.length})
                </button>
                {showLoadMenu && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-white/10 bg-[#0d1120] shadow-xl py-1">
                    {savedProjects.map((meta) => (
                      <button
                        key={meta.id}
                        onClick={() => loadSavedProject(meta)}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors"
                      >
                        <div className="text-sm text-white font-medium truncate">{meta.title || 'Untitled Project'}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{new Date(meta.savedAt).toLocaleDateString()}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={loadSample}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-xs font-semibold transition-colors"
            >
              <FlaskConical size={12} /> Load Sample: Clockmaker's Workshop
            </button>
            {isSaving && (
              <div className="text-xs text-slate-500 italic">Saving…</div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Zap size={10} />
              Physical Design QA Tool
            </div>
          </div>
        </div>
      </header>

      {/* Welcome screen — full-width, no rail or summary panel */}
      {step === 'welcome' && (
        <WelcomeScreen
          onStart={() => setStep('project')}
          onLoadSample={loadSample}
        />
      )}

      {/* Main layout — wizard steps */}
      {step !== 'welcome' && (
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
      )}
    </div>
  );
}
