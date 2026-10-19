import { Farm, Camera, Observation, ProgressionRecord, KnowledgeSource, Alert, ChatMessage, UserSettings } from '../types';

export async function fetchFarms(): Promise<Farm[]> {
  const res = await fetch('/api/farms');
  return res.json();
}

export async function createFarm(farm: Partial<Farm>): Promise<Farm> {
  const res = await fetch('/api/farms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(farm),
  });
  return res.json();
}

export async function fetchCameras(): Promise<Camera[]> {
  const res = await fetch('/api/cameras');
  return res.json();
}

export async function createCamera(camera: Partial<Camera>): Promise<Camera> {
  const res = await fetch('/api/cameras', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(camera),
  });
  return res.json();
}

export async function fetchHistory(farmId: string): Promise<Observation[]> {
  const res = await fetch(`/api/farms/${farmId}/history`);
  return res.json();
}

export async function uploadObservation(payload: {
  farm_id: string;
  camera_id?: string;
  image_url: string;
  crop_type?: string;
}): Promise<{ observation: Observation; report: any }> {
  const res = await fetch('/api/observations/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function compareProgression(payload: {
  farm_id: string;
  previous_observation_id: string;
  current_observation_id: string;
}): Promise<ProgressionRecord> {
  const res = await fetch('/api/progression/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function sendChatMessage(payload: {
  message: string;
  farm_id: string;
}): Promise<{ reply: ChatMessage; session: any }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchKnowledgeSources(): Promise<KnowledgeSource[]> {
  const res = await fetch('/api/knowledge/sources');
  return res.json();
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch('/api/alerts');
  return res.json();
}

export async function acknowledgeAlert(alertId: string): Promise<Alert> {
  const res = await fetch(`/api/alerts/${alertId}/acknowledge`, {
    method: 'POST',
  });
  return res.json();
}

export async function fetchSettings(): Promise<UserSettings> {
  const res = await fetch('/api/settings');
  return res.json();
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function requestExpertReview(payload: {
  farm_id: string;
  observation_id: string;
  notes: string;
}): Promise<any> {
  const res = await fetch('/api/expert-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
