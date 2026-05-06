import { useRef, useState, useCallback } from 'react';
import { LayoutProject, LayoutZone, LayoutElement, RiskReport, Severity } from '../types';

const ZONE_PURPOSE_COLORS: Record<string, string> = {
  start: '#22d3ee22',
  main_puzzle: '#3b82f622',
  transition: '#a855f722',
  reveal: '#f59e0b22',
  finale: '#ef444422',
  staff_reset: '#10b98122',
  atmosphere: '#6b728022',
  storage: '#78716c22',
};

const ZONE_PURPOSE_BORDER: Record<string, string> = {
  start: '#22d3ee',
  main_puzzle: '#3b82f6',
  transition: '#a855f7',
  reveal: '#f59e0b',
  finale: '#ef4444',
  staff_reset: '#10b981',
  atmosphere: '#9ca3af',
  storage: '#78716c',
};

const SEVERITY_OVERLAY: Record<Severity, string> = {
  critical: 'rgba(239,68,68,0.18)',
  warning: 'rgba(245,158,11,0.15)',
  improvement: 'rgba(14,165,233,0.12)',
  clean: 'rgba(16,185,129,0.1)',
};

const ELEMENT_COLORS: Record<string, string> = {
  door: '#6b7280',
  exit: '#ef4444',
  puzzle_station: '#3b82f6',
  lock: '#f59e0b',
  clue: '#22d3ee',
  prop: '#8b5cf6',
  scenic_blocker: '#6b7280',
  staff_access: '#10b981',
  reset_path: '#10b981',
  camera_view: '#f97316',
  sound_light: '#ec4899',
};

interface DragState {
  type: 'zone' | 'element';
  id: string;
  startMouseX: number;
  startMouseY: number;
  startItemX: number;
  startItemY: number;
}

interface Props {
  project: LayoutProject;
  zones: LayoutZone[];
  elements: LayoutElement[];
  selectedZoneId: string | null;
  selectedElementId: string | null;
  report: RiskReport | null;
  showHeatmap: boolean;
  onSelectZone: (id: string | null) => void;
  onSelectElement: (id: string | null) => void;
  onMoveZone: (id: string, x: number, y: number) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
}

const PX_PER_UNIT = 28;

export default function LayoutCanvas({
  project,
  zones,
  elements,
  selectedZoneId,
  selectedElementId,
  report,
  showHeatmap,
  onSelectZone,
  onSelectElement,
  onMoveZone,
  onMoveElement,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [, forceUpdate] = useState(0);

  const px = (v: number) => v * PX_PER_UNIT;
  const canvasW = px(project.roomWidth) + 2;
  const canvasH = px(project.roomHeight) + 2;

  const getRelativePos = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseDown = (
    e: React.MouseEvent,
    type: 'zone' | 'element',
    id: string,
    itemX: number,
    itemY: number,
  ) => {
    e.stopPropagation();
    if (type === 'zone') onSelectZone(id);
    else onSelectElement(id);
    dragRef.current = {
      type,
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startItemX: itemX,
      startItemY: itemY,
    };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (e.clientX - drag.startMouseX) / PX_PER_UNIT;
      const dy = (e.clientY - drag.startMouseY) / PX_PER_UNIT;
      const newX = Math.max(0, Math.round((drag.startItemX + dx) * 2) / 2);
      const newY = Math.max(0, Math.round((drag.startItemY + dy) * 2) / 2);
      if (drag.type === 'zone') onMoveZone(drag.id, newX, newY);
      else onMoveElement(drag.id, newX, newY);
      forceUpdate((n) => n + 1);
    },
    [onMoveZone, onMoveElement],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div className="overflow-auto rounded-xl border border-white/10 bg-slate-900/60">
      <div
        ref={containerRef}
        className="relative select-none"
        style={{ width: canvasW, height: canvasH, cursor: dragRef.current ? 'grabbing' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => { onSelectZone(null); onSelectElement(null); }}
      >
        {/* Blueprint grid */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={canvasW}
          height={canvasH}
          style={{ opacity: 0.18 }}
        >
          <defs>
            <pattern id="smallGrid" width={PX_PER_UNIT} height={PX_PER_UNIT} patternUnits="userSpaceOnUse">
              <path d={`M ${PX_PER_UNIT} 0 L 0 0 0 ${PX_PER_UNIT}`} fill="none" stroke="#22d3ee" strokeWidth="0.5" />
            </pattern>
            <pattern id="bigGrid" width={PX_PER_UNIT * 5} height={PX_PER_UNIT * 5} patternUnits="userSpaceOnUse">
              <rect width={PX_PER_UNIT * 5} height={PX_PER_UNIT * 5} fill="url(#smallGrid)" />
              <path d={`M ${PX_PER_UNIT * 5} 0 L 0 0 0 ${PX_PER_UNIT * 5}`} fill="none" stroke="#22d3ee" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={canvasW} height={canvasH} fill="url(#bigGrid)" />
        </svg>

        {/* Room border */}
        <div
          className="absolute border-2 border-cyan-500/30 pointer-events-none"
          style={{ left: 0, top: 0, width: canvasW - 2, height: canvasH - 2 }}
        />

        {/* Zones */}
        {zones.map((zone) => {
          const riskLevel = report?.zoneRiskLevels[zone.id];
          const isSelected = selectedZoneId === zone.id;
          return (
            <div
              key={zone.id}
              className="absolute rounded border transition-all"
              style={{
                left: px(zone.x),
                top: px(zone.y),
                width: px(zone.width),
                height: px(zone.height),
                backgroundColor: showHeatmap && riskLevel
                  ? SEVERITY_OVERLAY[riskLevel]
                  : ZONE_PURPOSE_COLORS[zone.purpose] ?? '#ffffff0a',
                borderColor: isSelected
                  ? '#22d3ee'
                  : ZONE_PURPOSE_BORDER[zone.purpose] ?? '#6b7280',
                borderWidth: isSelected ? 2 : 1,
                borderStyle: 'solid',
                cursor: 'grab',
                zIndex: 1,
              }}
              onMouseDown={(e) => handleMouseDown(e, 'zone', zone.id, zone.x, zone.y)}
            >
              <span
                className="absolute top-1 left-1 text-xs font-semibold leading-tight pointer-events-none"
                style={{
                  color: ZONE_PURPOSE_BORDER[zone.purpose] ?? '#9ca3af',
                  maxWidth: px(zone.width) - 8,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontSize: 10,
                }}
              >
                {zone.label}
              </span>
              {/* Heatmap overlay label */}
              {showHeatmap && riskLevel && riskLevel !== 'clean' && (
                <span
                  className={`absolute bottom-1 right-1 text-xs font-bold uppercase pointer-events-none ${
                    riskLevel === 'critical' ? 'text-red-400' :
                    riskLevel === 'warning' ? 'text-amber-400' : 'text-sky-400'
                  }`}
                  style={{ fontSize: 9 }}
                >
                  {riskLevel}
                </span>
              )}
            </div>
          );
        })}

        {/* Elements */}
        {elements.map((el) => {
          const isSelected = selectedElementId === el.id;
          const color = ELEMENT_COLORS[el.type] ?? '#9ca3af';
          return (
            <div
              key={el.id}
              className="absolute rounded flex items-center justify-center transition-all"
              style={{
                left: px(el.x),
                top: px(el.y),
                width: Math.max(px(el.width), 20),
                height: Math.max(px(el.height), 20),
                backgroundColor: color + '33',
                border: `${isSelected ? 2 : 1}px solid ${isSelected ? '#22d3ee' : color}`,
                cursor: 'grab',
                zIndex: 2,
              }}
              onMouseDown={(e) => handleMouseDown(e, 'element', el.id, el.x, el.y)}
            >
              <span
                className="pointer-events-none text-center leading-tight"
                style={{
                  color,
                  fontSize: 9,
                  fontWeight: 600,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  padding: '1px 2px',
                  textAlign: 'center',
                }}
              >
                {el.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
