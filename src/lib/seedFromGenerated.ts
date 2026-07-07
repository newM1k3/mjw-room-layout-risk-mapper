// seedFromGenerated.ts — seed a layout-risk map from an AI Room Generator document.
//
// Rooms sent from Create ("Send to My Venue") carry their full generated
// document in experiences.design_parameters. Instead of Story-only seeding,
// we lay out act zones and place one puzzle station per generated puzzle so
// the designer starts with a draggable element palette instead of a blank
// canvas. Positions are a best-effort grid — the floorplan is theirs to draw.

import type { LayoutElement, LayoutProject, LayoutRiskPayload, LayoutZone } from '../types';

export interface GeneratedPuzzle {
  title?: string;
  role_in_flow?: string;
  required_props?: string[];
  safety_or_ops_notes?: string;
}

export interface GeneratedRoomDoc {
  title?: string;
  theme?: string;
  difficulty?: string;
  players?: string;
  duration?: string;
  format?: string;
  puzzle_flow?: GeneratedPuzzle[];
}

export interface GeneratedRoomPayload {
  source: string;
  room: GeneratedRoomDoc;
}

export function isGeneratedRoomPayload(value: unknown): value is GeneratedRoomPayload {
  const payload = value as GeneratedRoomPayload | null;
  return Boolean(payload && payload.source === 'room_generator' && payload.room && typeof payload.room === 'object');
}

const FORMAT_TO_ROOM_TYPE: Record<string, LayoutProject['roomType']> = {
  'Single Room': 'linear',
  Linear: 'linear',
  'Multi-Room': 'multi_room',
  'Non-Linear': 'open_world',
};

const DIFFICULTY_TO_SCALE: Record<string, LayoutProject['difficulty']> = {
  Beginner: 'family',
  Intermediate: 'standard',
  Expert: 'advanced',
  'Enthusiast-Only': 'expert',
};

const STATUS_TO_STAGE: Record<string, LayoutProject['buildStage']> = {
  draft: 'concept', review: 'prototype', approved: 'renovation', live: 'live_room_review', retired: 'concept',
};

function playersMax(players?: string): number {
  const match = players?.match(/(\d+)\s*[-+]\s*(\d+)?/);
  if (!match) return 6;
  return Number(match[2] || match[1]) || 6;
}

function durationMinutes(duration?: string): number {
  const match = duration?.match(/\d+/);
  return match ? Number(match[0]) : 60;
}

const truncate = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

export function seedFromGeneratedRoom(room: GeneratedRoomDoc, experienceStatus: string): LayoutRiskPayload {
  const puzzles = room.puzzle_flow || [];
  const roomType = FORMAT_TO_ROOM_TYPE[room.format || ''] || 'linear';
  const twoZones = roomType === 'multi_room' && puzzles.length >= 2;

  const width = twoZones ? 28 : 20;
  const height = 16;

  const project: LayoutProject = {
    id: `project_${Date.now()}`,
    title: room.title || 'Generated Room',
    theme: room.theme || '',
    roomType,
    targetPlayerCount: playersMax(room.players),
    durationMinutes: durationMinutes(room.duration),
    difficulty: DIFFICULTY_TO_SCALE[room.difficulty || ''] || 'standard',
    buildStage: STATUS_TO_STAGE[experienceStatus] ?? 'concept',
    roomWidth: width,
    roomHeight: height,
    unit: 'feet',
  };

  // Generated multi-room flows progress front space → back space, so split the
  // puzzle chain across two act zones; single-space rooms get one main zone.
  const zoneWidth = twoZones ? 12 : width - 2;
  const zones: LayoutZone[] = twoZones
    ? [
        { id: 'gen-zone-1', label: 'Act I space', x: 1, y: 1, width: zoneWidth, height: height - 2, purpose: 'main_puzzle', expectedPlayerLoad: project.targetPlayerCount },
        { id: 'gen-zone-2', label: 'Act II space', x: width - 1 - zoneWidth, y: 1, width: zoneWidth, height: height - 2, purpose: 'finale', expectedPlayerLoad: project.targetPlayerCount },
      ]
    : [
        { id: 'gen-zone-1', label: 'Main play space', x: 1, y: 1, width: zoneWidth, height: height - 2, purpose: 'main_puzzle', expectedPlayerLoad: project.targetPlayerCount },
      ];

  const actTwoStart = twoZones ? Math.ceil(puzzles.length / 2) : puzzles.length;

  const elements: LayoutElement[] = [
    { id: 'gen-entry', type: 'door', label: 'Entry door', x: 0, y: height / 2 - 1, width: 1, height: 2, interactionIntensity: 'low', importance: 'high' },
    { id: 'gen-exit', type: 'exit', label: 'Exit', x: width - 1, y: height / 2 - 1, width: 1, height: 2, interactionIntensity: 'low', importance: 'critical' },
  ];

  const perZoneIndex = [0, 0];
  puzzles.forEach((puzzle, index) => {
    const zoneIdx = index >= actTwoStart ? 1 : 0;
    const zone = zones[Math.min(zoneIdx, zones.length - 1)];
    const slot = perZoneIndex[zoneIdx]++;
    const col = slot % 2;
    const row = Math.floor(slot / 2);

    elements.push({
      id: `gen-puzzle-${index + 1}`,
      type: 'puzzle_station',
      label: truncate(puzzle.title || `Puzzle ${index + 1}`, 40),
      x: zone.x + 1 + col * 5.5,
      y: zone.y + 1 + row * 4,
      width: 4,
      height: 2.5,
      zoneId: zone.id,
      interactionIntensity: 'medium',
      importance: index === puzzles.length - 1 ? 'critical' : 'high',
      notes: truncate([puzzle.required_props?.join(' · '), puzzle.safety_or_ops_notes].filter(Boolean).join(' — '), 180),
    });
  });

  return { project, zones, elements, report: null };
}
