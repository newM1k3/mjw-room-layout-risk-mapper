import PocketBase from 'pocketbase';
import type { LayoutProject, LayoutZone, LayoutElement, RiskReport } from '../types';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'https://immersive-kit.pockethost.io');

export interface LayoutRiskPayload {
  project: LayoutProject;
  zones: LayoutZone[];
  elements: LayoutElement[];
  report: RiskReport | null;
}

export interface SavedProjectMeta {
  id: string;          // PocketBase record ID
  externalId: string;  // LayoutProject.id
  title: string;
  savedAt: string;     // ISO string
  payload: LayoutRiskPayload;
}

export async function saveProject(payload: LayoutRiskPayload): Promise<string> {
  if (!pb.authStore.isValid) {
    throw new Error('Must be signed in to save projects');
  }

  const userId = pb.authStore.record?.id ?? '';
  const projectId = payload.project.id;

  // Upsert: if a record with this external_id already exists, update it
  try {
    const existing = await pb.collection('layout_risk_projects').getFirstListItem(
      `external_id = "${projectId}" && user_id = "${userId}"`,
      { requestKey: null }
    );
    await pb.collection('layout_risk_projects').update(existing.id, { payload });
    return existing.id;
  } catch {
    // No existing record — create new
    const record = await pb.collection('layout_risk_projects').create({
      external_id: projectId,
      user_id: userId,
      payload,
      archived: false,
    });
    return record.id;
  }
}

export async function loadProjects(): Promise<SavedProjectMeta[]> {
  if (!pb.authStore.isValid) return [];

  const userId = pb.authStore.record?.id ?? '';

  try {
    const records = await pb.collection('layout_risk_projects').getList(1, 20, {
      filter: `user_id = "${userId}" && (archived = false || archived = null)`,
      sort: '-updated',
      requestKey: null,
    });

    return records.items.map((r) => ({
      id: r.id,
      externalId: r['external_id'] as string,
      title: (r['payload'] as LayoutRiskPayload)?.project?.title ?? 'Untitled Project',
      savedAt: r['updated'] as string,
      payload: r['payload'] as LayoutRiskPayload,
    }));
  } catch {
    return [];
  }
}
