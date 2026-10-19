export interface Farm {
  farm_id: string;
  owner_id: string;
  farm_name: string;
  crop_type: string;
  crop_variety: string;
  location: string;
  planting_date: string;
  growth_stage: string;
}

export interface Camera {
  camera_id: string;
  farm_id: string;
  monitoring_zone: string;
  connection_status: 'online' | 'offline' | 'reconnecting';
  capture_interval: number;
  last_capture_at: string;
  secret_reference: string;
  stream_url: string;
  signal_strength?: string;
  latency_ms?: number;
}

export interface Observation {
  observation_id: string;
  farm_id: string;
  camera_id: string | null;
  image_url: string;
  timestamp: string;
  crop_type: string;
  image_quality: {
    status: 'good' | 'blurry' | 'poor_lighting';
    blur_score: number;
    lighting: string;
  };
  model_version: string;
  analysis_status: 'pending' | 'completed' | 'failed';
  report?: AnalysisReport;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface AnalysisReport {
  report_id: string;
  observation_id: string;
  suspected_disease_or_pest: string;
  confidence: number;
  bounding_boxes: BoundingBox[];
  segmentation_mask_reference: string;
  visible_leaf_pixel_area: number;
  symptomatic_pixel_area: number;
  symptomatic_area_percentage: number;
  uncertainty_notes: string;
  analysis_timestamp: string;
}

export interface ProgressionRecord {
  progression_id: string;
  farm_id: string;
  monitoring_zone: string;
  previous_observation_id: string;
  current_observation_id: string;
  previous_symptomatic_area: number;
  current_symptomatic_area: number;
  percentage_point_change: number;
  comparison_quality: string;
  progression_status: string;
  previous_image?: string;
  current_image?: string;
}

export interface KnowledgeSource {
  source_id: string;
  title: string;
  publisher: string;
  source_url: string;
  crop: string;
  disease_or_pest: string;
  region: string;
  publication_date: string;
  document_version: string;
}

export interface Alert {
  alert_id: string;
  farm_id: string;
  observation_id: string;
  alert_type: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  message: string;
  created_at: string;
  acknowledged_at: string | null;
  status: 'Active' | 'Acknowledged';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
}

export interface UserSettings {
  language: 'en' | 'ta';
  notifications_enabled: boolean;
  auto_capture_interval: number;
}
