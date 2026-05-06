export type ZonePurpose =
  | 'start'
  | 'main_puzzle'
  | 'transition'
  | 'reveal'
  | 'finale'
  | 'staff_reset'
  | 'atmosphere'
  | 'storage';

export type ElementType =
  | 'door'
  | 'exit'
  | 'puzzle_station'
  | 'lock'
  | 'clue'
  | 'prop'
  | 'scenic_blocker'
  | 'staff_access'
  | 'reset_path'
  | 'camera_view'
  | 'sound_light';

export type Intensity = 'low' | 'medium' | 'high';
export type Severity = 'critical' | 'warning' | 'improvement' | 'clean';

export interface LayoutZone {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  purpose: ZonePurpose;
  expectedPlayerLoad: number;
  notes?: string;
}

export interface LayoutElement {
  id: string;
  type: ElementType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zoneId?: string;
  interactionIntensity: Intensity;
  importance: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

export interface LayoutProject {
  id: string;
  title: string;
  theme: string;
  roomType: 'linear' | 'semi_linear' | 'open_world' | 'multi_room';
  targetPlayerCount: number;
  durationMinutes: number;
  difficulty: 'family' | 'standard' | 'advanced' | 'expert';
  buildStage: 'concept' | 'prototype' | 'renovation' | 'live_room_review';
  roomWidth: number;
  roomHeight: number;
  unit: 'feet' | 'meters';
}

export interface RiskIssue {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  affectedZoneIds: string[];
  affectedElementIds: string[];
  explanation: string;
  suggestedFix: string;
}

export interface RiskReport {
  score: number;
  label: string;
  criticalCount: number;
  warningCount: number;
  improvementCount: number;
  issues: RiskIssue[];
  cleanChecks: string[];
  zoneRiskLevels: Record<string, Severity>;
}

export type AppStep =
  | 'project'
  | 'canvas'
  | 'zones'
  | 'elements'
  | 'risk'
  | 'export';
