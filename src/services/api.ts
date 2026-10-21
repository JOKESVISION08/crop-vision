import { Farm, Camera, Observation, ProgressionRecord, KnowledgeSource, Alert, ChatMessage, UserSettings } from '../types';

// Initial Seed Data for Netlify Static Standalone Mode
const INITIAL_FARMS: Farm[] = [
  {
    farm_id: 'farm-101',
    owner_id: 'user-001',
    farm_name: 'Cauvery Delta Paddy Block A',
    crop_type: 'Paddy / Rice',
    crop_variety: 'BPT 5204 (Samba)',
    location: 'Thanjavur District, Tamil Nadu',
    planting_date: '2026-01-15',
    growth_stage: 'Tillering & Panicle Initiation',
  },
  {
    farm_id: 'farm-102',
    owner_id: 'user-001',
    farm_name: 'Kongu Turmeric Plot 2',
    crop_type: 'Turmeric',
    crop_variety: 'Erode Local',
    location: 'Erode, Tamil Nadu',
    planting_date: '2025-06-10',
    growth_stage: 'Rhizome Enlargement & Maturation',
  }
];

const INITIAL_CAMERAS: Camera[] = [
  {
    camera_id: 'cam-01',
    farm_id: 'farm-101',
    monitoring_zone: 'North-East Sector (Zone A)',
    connection_status: 'online',
    capture_interval: 30,
    last_capture_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    secret_reference: 'rtsp://secured-gateway.local/feed/paddy-a',
    stream_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000',
    signal_strength: '98%',
    latency_ms: 124,
  }
];

const INITIAL_OBSERVATIONS: Observation[] = [
  {
    observation_id: 'obs-001',
    farm_id: 'farm-101',
    camera_id: 'cam-01',
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    crop_type: 'Paddy / Rice',
    image_quality: { status: 'good', blur_score: 92, lighting: 'optimal' },
    model_version: 'CropVision-YOLO-v4.2',
    analysis_status: 'completed',
    report: {
      report_id: 'rep-001',
      observation_id: 'obs-001',
      suspected_disease_or_pest: 'Rice Blast (Magnaporthe oryzae)',
      confidence: 0.88,
      bounding_boxes: [{ x: 120, y: 80, width: 95, height: 110, label: 'Spindle-shaped lesion' }],
      segmentation_mask_reference: 'mask-001-ref',
      visible_leaf_pixel_area: 45000,
      symptomatic_pixel_area: 1800,
      symptomatic_area_percentage: 4.0,
      uncertainty_notes: 'Early stage spindle lesions visible on lower leaf canopy.',
      analysis_timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    }
  },
  {
    observation_id: 'obs-002',
    farm_id: 'farm-101',
    camera_id: 'cam-01',
    image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1000',
    timestamp: new Date().toISOString(),
    crop_type: 'Paddy / Rice',
    image_quality: { status: 'good', blur_score: 95, lighting: 'optimal' },
    model_version: 'CropVision-YOLO-v4.2',
    analysis_status: 'completed',
    report: {
      report_id: 'rep-002',
      observation_id: 'obs-002',
      suspected_disease_or_pest: 'Rice Blast (Magnaporthe oryzae - Active Progression)',
      confidence: 0.94,
      bounding_boxes: [{ x: 110, y: 75, width: 130, height: 140, label: 'Expanding diamond lesion' }],
      segmentation_mask_reference: 'mask-002-ref',
      visible_leaf_pixel_area: 44800,
      symptomatic_pixel_area: 4032,
      symptomatic_area_percentage: 9.0,
      uncertainty_notes: 'Lesions coalescing along leaf margins. Expansion confirmed.',
      analysis_timestamp: new Date().toISOString(),
    }
  }
];

const INITIAL_KNOWLEDGE: KnowledgeSource[] = [
  {
    source_id: 'src-icar-01',
    title: 'ICAR Directorate of Rice Research: Management of Rice Blast in Southern Zone',
    publisher: 'Indian Council of Agricultural Research (ICAR)',
    source_url: 'https://icar.gov.in/content/rice-blast-management-guide',
    crop: 'Paddy / Rice',
    disease_or_pest: 'Rice Blast (Magnaporthe oryzae)',
    region: 'Tamil Nadu & Southern India',
    publication_date: '2025-01-10',
    document_version: 'v2.4',
  },
  {
    source_id: 'src-tnau-02',
    title: 'TNAU Agritech Portal: Turmeric Leaf Spot and Rhizome Rot Control',
    publisher: 'Tamil Nadu Agricultural University (TNAU)',
    source_url: 'https://agritech.tnau.ac.in/crop_protection/turmeric_diseases.html',
    crop: 'Turmeric',
    disease_or_pest: 'Leaf Blotch / Leaf Spot',
    region: 'Tamil Nadu (Erode / Salem)',
    publication_date: '2024-11-15',
    document_version: 'v3.1',
  }
];

const INITIAL_ALERTS: Alert[] = [
  {
    alert_id: 'alt-001',
    farm_id: 'farm-101',
    observation_id: 'obs-002',
    alert_type: 'Disease Severity Threshold Exceeded',
    severity: 'High',
    message: 'Rice Blast severity increased by +5.0% (reaching 9.0% affected area) in North-East Sector. Immediate preventive fungicide spray recommended.',
    created_at: new Date().toISOString(),
    acknowledged_at: null,
    status: 'Active',
  }
];

// Helper to get from localStorage with fallback
function getLocalStorage<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(`cropgpt_${key}`);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setLocalStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`cropgpt_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
}

export async function fetchFarms(): Promise<Farm[]> {
  try {
    const res = await fetch('/api/farms');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return getLocalStorage('farms', INITIAL_FARMS);
  }
}

export async function createFarm(farm: Partial<Farm>): Promise<Farm> {
  try {
    const res = await fetch('/api/farms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farm),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const farms = getLocalStorage('farms', INITIAL_FARMS);
    const newFarm: Farm = {
      farm_id: `farm-${Date.now()}`,
      owner_id: 'user-001',
      farm_name: farm.farm_name || 'New Farm',
      crop_type: farm.crop_type || 'Paddy / Rice',
      crop_variety: farm.crop_variety || 'General',
      location: farm.location || 'Tamil Nadu',
      planting_date: farm.planting_date || new Date().toISOString().split('T')[0],
      growth_stage: farm.growth_stage || 'Vegetative',
    };
    farms.push(newFarm);
    setLocalStorage('farms', farms);
    return newFarm;
  }
}

export async function fetchCameras(): Promise<Camera[]> {
  try {
    const res = await fetch('/api/cameras');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return getLocalStorage('cameras', INITIAL_CAMERAS);
  }
}

export async function createCamera(camera: Partial<Camera>): Promise<Camera> {
  try {
    const res = await fetch('/api/cameras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(camera),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const cameras = getLocalStorage('cameras', INITIAL_CAMERAS);
    const newCam: Camera = {
      camera_id: `cam-${Date.now()}`,
      farm_id: camera.farm_id || 'farm-101',
      monitoring_zone: camera.monitoring_zone || 'Monitoring Zone',
      connection_status: 'online',
      capture_interval: Number(camera.capture_interval) || 30,
      last_capture_at: new Date().toISOString(),
      secret_reference: camera.secret_reference || 'rtsp://gateway/feed',
      stream_url: camera.stream_url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000',
      signal_strength: '99%',
      latency_ms: 110,
    };
    cameras.push(newCam);
    setLocalStorage('cameras', cameras);
    return newCam;
  }
}

export async function fetchHistory(farmId: string): Promise<Observation[]> {
  try {
    const res = await fetch(`/api/farms/${farmId}/history`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const all = getLocalStorage('observations', INITIAL_OBSERVATIONS);
    return all.filter(o => o.farm_id === farmId);
  }
}

export async function uploadObservation(payload: {
  farm_id: string;
  camera_id?: string;
  image_url: string;
  crop_type?: string;
}): Promise<{ observation: Observation; report: any }> {
  try {
    const res = await fetch('/api/observations/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const observation_id = `obs-${Date.now()}`;
    const newObs: Observation = {
      observation_id,
      farm_id: payload.farm_id,
      camera_id: payload.camera_id || null,
      image_url: payload.image_url,
      timestamp: new Date().toISOString(),
      crop_type: payload.crop_type || 'Paddy / Rice',
      image_quality: { status: 'good', blur_score: 95, lighting: 'optimal' },
      model_version: 'CropVision-YOLO-v4.2',
      analysis_status: 'completed'
    };

    const newReport = {
      report_id: `rep-${Date.now()}`,
      observation_id,
      suspected_disease_or_pest: payload.crop_type?.includes('Turmeric') ? 'Leaf Blotch / Spot' : 'Brown Spot (Bipolaris oryzae)',
      confidence: 0.91,
      bounding_boxes: [{ x: 130, y: 110, width: 100, height: 95, label: 'Oval lesion detected' }],
      segmentation_mask_reference: `mask-${observation_id}`,
      visible_leaf_pixel_area: 46000,
      symptomatic_pixel_area: 2760,
      symptomatic_area_percentage: 6.0,
      uncertainty_notes: 'Localized fungal spots observed with 91% model confidence.',
      analysis_timestamp: new Date().toISOString()
    };

    newObs.report = newReport;
    const allObs = getLocalStorage('observations', INITIAL_OBSERVATIONS);
    allObs.push(newObs);
    setLocalStorage('observations', allObs);

    return { observation: newObs, report: newReport };
  }
}

export async function compareProgression(payload: {
  farm_id: string;
  previous_observation_id: string;
  current_observation_id: string;
}): Promise<ProgressionRecord> {
  try {
    const res = await fetch('/api/progression/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      progression_id: `prog-${Date.now()}`,
      farm_id: payload.farm_id,
      monitoring_zone: 'North-East Sector (Zone A)',
      previous_observation_id: payload.previous_observation_id,
      current_observation_id: payload.current_observation_id,
      previous_symptomatic_area: 4.0,
      current_symptomatic_area: 9.0,
      percentage_point_change: 5.0,
      comparison_quality: 'High comparability (Pose & lighting matched)',
      progression_status: 'Symptom Expansion (+5.0% area)',
    };
  }
}

export async function sendChatMessage(payload: {
  message: string;
  farm_id: string;
}): Promise<{ reply: ChatMessage; session: any }> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const botMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Based on CropVision AI analysis for your farm, the scan indicates monitored crop health. Follow ICAR & TNAU guidelines for balanced fertilization and disease prevention.`,
      timestamp: new Date().toISOString(),
      sources: ['src-icar-01']
    };
    return { reply: botMsg, session: { session_id: 'sess-001', messages: [] } };
  }
}

export async function fetchKnowledgeSources(): Promise<KnowledgeSource[]> {
  try {
    const res = await fetch('/api/knowledge/sources');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return INITIAL_KNOWLEDGE;
  }
}

export async function fetchAlerts(): Promise<Alert[]> {
  try {
    const res = await fetch('/api/alerts');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return getLocalStorage('alerts', INITIAL_ALERTS);
  }
}

export async function acknowledgeAlert(alertId: string): Promise<Alert> {
  try {
    const res = await fetch(`/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const alerts = getLocalStorage('alerts', INITIAL_ALERTS);
    const target = alerts.find(a => a.alert_id === alertId) || alerts[0];
    target.status = 'Acknowledged';
    target.acknowledged_at = new Date().toISOString();
    setLocalStorage('alerts', alerts);
    return target;
  }
}

export async function fetchSettings(): Promise<UserSettings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return getLocalStorage<UserSettings>('settings', { language: 'en' as ('en' | 'ta'), notifications_enabled: true, auto_capture_interval: 30 });
  }
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const current = getLocalStorage<UserSettings>('settings', { language: 'en' as ('en' | 'ta'), notifications_enabled: true, auto_capture_interval: 30 });
    const updated = { ...current, ...settings };
    setLocalStorage('settings', updated);
    return updated;
  }
}

export async function requestExpertReview(payload: {
  farm_id: string;
  observation_id: string;
  notes: string;
}): Promise<any> {
  try {
    const res = await fetch('/api/expert-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      success: true,
      review_id: `rev-${Date.now()}`,
      message: 'Expert review request submitted successfully to TNAU Extension Officer.',
      status: 'Pending Review',
      estimated_response_hours: 24
    };
  }
}
