// layout.ts — Layout on the unified spine (Phase 3).
//
// A layout-risk map is a room-scoped drawer (tool_key=layout_risk, scope=room). The room is a
// platform `experiences` record, resolved via the user's org membership; its venue is the parent
// `projects` record. On a brand-new map the project setup is seeded from the room's Story
// (experiences.title/theme/format/difficulty/duration/capacity) so it never starts blank.
// Replaces the retired per-user `layout_risk_projects` table.

import pb from './pocketbase';
import type { LayoutProject, LayoutRiskPayload } from '../types';

type Rec = Record<string, unknown>;

/** A room the signed-in user can map, plus its raw Story fields for seeding. */
export interface RoomOption {
  id: string; // experiences record id
  title: string;
  experience: Rec;
}

/** The user's venue + its rooms, resolved from org membership. */
export interface RoomContext {
  orgId: string;
  venueId: string;
  rooms: RoomOption[];
}

const ROOM_TYPES: LayoutProject['roomType'][] = ['linear', 'semi_linear', 'open_world', 'multi_room'];
const okRoomType = (v: unknown): LayoutProject['roomType'] => {
  const norm = typeof v === 'string' ? v.replace(/-/g, '_') : v;
  return ROOM_TYPES.includes(norm as LayoutProject['roomType']) ? (norm as LayoutProject['roomType']) : 'linear';
};

// Room difficulty (experiences.difficulty) → the tool's difficulty scale.
const DIFFICULTY_MAP: Record<string, LayoutProject['difficulty']> = {
  easy: 'family', medium: 'standard', hard: 'advanced', expert: 'expert',
};

// Room lifecycle (experiences.status) → the tool's build-stage scale.
const STATUS_TO_STAGE: Record<string, LayoutProject['buildStage']> = {
  draft: 'concept', review: 'prototype', approved: 'renovation', live: 'live_room_review', retired: 'concept',
};

/**
 * Resolve the venue + rooms for the signed-in user: the first project under their first active
 * org membership, and that project's non-retired experiences. Mirrors the Corporate Proposal
 * Generator's resolveVenue, extended to return the rooms (room-scoped tools pick one).
 */
export async function resolveRoomContext(): Promise<RoomContext | null> {
  if (!pb.authStore.isValid) return null;
  const uid = pb.authStore.record?.id;
  if (!uid) return null;

  const memberships = await pb.collection('memberships').getFullList({
    filter: `user = '${uid}' && status = 'active'`,
    requestKey: null,
  });
  for (const m of memberships) {
    const orgId = m.organization as string;
    const projects = await pb.collection('projects').getFullList({
      filter: `organization = '${orgId}'`,
      requestKey: null,
    });
    const venue = projects[0];
    if (!venue) continue;

    const exps = await pb.collection('experiences').getFullList({
      filter: `project = '${venue.id}' && status != 'retired'`,
      requestKey: null,
    });
    const rooms: RoomOption[] = exps.map((e) => ({
      id: e.id as string,
      title: (e.title as string) || 'Untitled Room',
      experience: e as Rec,
    }));
    return { orgId, venueId: venue.id, rooms };
  }
  return null;
}

/** Seed a fresh layout-risk map from a room's Story so it never starts blank. */
export function seedFromRoom(e: Rec): LayoutRiskPayload {
  const project: LayoutProject = {
    id: `project_${Date.now()}`,
    title: (e.title as string) ?? '',
    theme: (e.theme as string) || (e.premise as string) || '',
    roomType: okRoomType(e.format),
    targetPlayerCount: (e.capacity_max as number) || 6,
    durationMinutes: (e.duration_minutes as number) || 60,
    difficulty: DIFFICULTY_MAP[e.difficulty as string] ?? 'standard',
    buildStage: STATUS_TO_STAGE[e.status as string] ?? 'concept',
    roomWidth: 20,
    roomHeight: 16,
    unit: 'feet',
  };
  return { project, zones: [], elements: [], report: null };
}

/**
 * Load the room's layout-risk drawer, or a Story-seeded blank if none exists yet.
 * One drawer per room (tool_key=layout_risk, scope=room).
 */
export async function loadLayout(room: RoomOption): Promise<LayoutRiskPayload> {
  try {
    const rec = await pb.collection('drawers').getFirstListItem(
      `tool_key = 'layout_risk' && room = '${room.id}'`,
      { requestKey: null },
    );
    return rec.data as LayoutRiskPayload;
  } catch {
    return seedFromRoom(room.experience);
  }
}

/** Upsert the room's layout-risk drawer (one row per room). Returns the drawer record id. */
export async function saveLayout(ctx: RoomContext, roomId: string, payload: LayoutRiskPayload): Promise<string> {
  if (!pb.authStore.isValid) throw new Error('Must be signed in to save');

  const body = {
    tool_key: 'layout_risk',
    scope_type: 'room',
    organization: ctx.orgId,
    venue: ctx.venueId,
    room: roomId,
    title: payload.project.title || 'Untitled Layout',
    data: { ...payload },
    status: 'active',
  };

  let existingId: string | null = null;
  try {
    const existing = await pb.collection('drawers').getFirstListItem(
      `tool_key = 'layout_risk' && room = '${roomId}'`,
      { requestKey: null },
    );
    existingId = existing.id;
  } catch {
    existingId = null; // no drawer for this room yet
  }

  if (existingId) {
    await pb.collection('drawers').update(existingId, body, { requestKey: null });
    return existingId;
  }
  const created = await pb.collection('drawers').create({ ...body, version: 1 }, { requestKey: null });
  return created.id;
}
