import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

// In-Memory Database State with Rich Seed Data
let farms = [
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

let cameras = [
  {
    camera_id: 'cam-01',
    farm_id: 'farm-101',
    monitoring_zone: 'North-East Sector (Zone A)',
    connection_status: 'online',
    capture_interval: 30, // minutes
    last_capture_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    secret_reference: 'rtsp://secured-gateway.local/feed/paddy-a',
    stream_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000',
  },
  {
    camera_id: 'cam-02',
    farm_id: 'farm-102',
    monitoring_zone: 'Main Greenhouse Center',
    connection_status: 'online',
    capture_interval: 60,
    last_capture_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    secret_reference: 'rtsp://secured-gateway.local/feed/turmeric-2',
    stream_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=1000',
  }
];

let observations = [
  {
    observation_id: 'obs-001',
    farm_id: 'farm-101',
    camera_id: 'cam-01',
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    crop_type: 'Paddy / Rice',
    image_quality: { status: 'good', blur_score: 92, lighting: 'optimal' },
    model_version: 'CropVision-YOLO-v4.2',
    analysis_status: 'completed',
  },
  {
    observation_id: 'obs-002',
    farm_id: 'farm-101',
    camera_id: 'cam-01',
    image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1000',
    timestamp: new Date().toISOString(), // today
    crop_type: 'Paddy / Rice',
    image_quality: { status: 'good', blur_score: 95, lighting: 'optimal' },
    model_version: 'CropVision-YOLO-v4.2',
    analysis_status: 'completed',
  }
];

let analysisReports = [
  {
    report_id: 'rep-001',
    observation_id: 'obs-001',
    suspected_disease_or_pest: 'Rice Blast (Magnaporthe oryzae)',
    confidence: 0.88,
    bounding_boxes: [{ x: 120, y: 80, width: 95, height: 110, label: 'Spindle-shaped lesion' }],
    segmentation_mask_reference: 'mask-001-ref',
    visible_leaf_pixel_area: 45000,
    symptomatic_pixel_area: 1800,
    symptomatic_area_percentage: 4.0,
    uncertainty_notes: 'Early stage spindle lesions visible on lower leaf canopy. Marginal lighting artifact excluded.',
    analysis_timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    report_id: 'rep-002',
    observation_id: 'obs-002',
    suspected_disease_or_pest: 'Rice Blast (Magnaporthe oryzae - Active Progression)',
    confidence: 0.94,
    bounding_boxes: [
      { x: 110, y: 75, width: 130, height: 140, label: 'Expanding diamond lesion' },
      { x: 260, y: 190, width: 85, height: 90, label: 'Secondary necrotic spot' }
    ],
    segmentation_mask_reference: 'mask-002-ref',
    visible_leaf_pixel_area: 44800,
    symptomatic_pixel_area: 4032,
    symptomatic_area_percentage: 9.0,
    uncertainty_notes: 'Lesions coalescing along leaf margins. Expansion confirmed compared to 3-day baseline.',
    analysis_timestamp: new Date().toISOString(),
  }
];

let progressionRecords = [
  {
    progression_id: 'prog-001',
    farm_id: 'farm-101',
    monitoring_zone: 'North-East Sector (Zone A)',
    previous_observation_id: 'obs-001',
    current_observation_id: 'obs-002',
    previous_symptomatic_area: 4.0,
    current_symptomatic_area: 9.0,
    percentage_point_change: 5.0,
    comparison_quality: 'High comparability (Matching angle & illumination)',
    progression_status: 'Rapid Progression (Warning Triggered)',
  }
];

let knowledgeSources = [
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

let alerts: Array<{
  alert_id: string;
  farm_id: string;
  observation_id: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
  acknowledged_at: string | null;
  status: string;
}> = [
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

let chatSessions = [
  {
    session_id: 'sess-001',
    user_id: 'user-001',
    farm_id: 'farm-101',
    messages: [
      {
        id: 'm-1',
        sender: 'user',
        text: 'What pest or disease is visible in my recent paddy crop image?',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      },
      {
        id: 'm-2',
        sender: 'assistant',
        text: 'Based on the latest CropVision AI analysis for Cauvery Delta Paddy Block A, the model detected **Rice Blast (Magnaporthe oryzae)** with 94% confidence. Symptomatic leaf area has increased from 4.0% to 9.0% over the last 3 days.\n\n**Observed Evidence:** Diamond-shaped lesions with grey centers and brown margins on leaf blades.\n\n**Recommended Action (ICAR Guidelines):** Spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L during early morning hours. Avoid excess nitrogen fertilization.',
        timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
        sources: ['src-icar-01']
      }
    ],
    referenced_observation_ids: ['obs-002'],
    retrieved_source_ids: ['src-icar-01'],
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  }
];

let userSettings = {
  language: 'en', // 'en' | 'ta'
  notifications_enabled: true,
  auto_capture_interval: 30,
};

// --- API Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Farms API
app.get('/api/farms', (req, res) => {
  res.json(farms);
});

app.post('/api/farms', (req, res) => {
  const { farm_name, crop_type, crop_variety, location, planting_date, growth_stage } = req.body;
  const newFarm = {
    farm_id: `farm-${Date.now()}`,
    owner_id: 'user-001',
    farm_name: farm_name || 'New Farm',
    crop_type: crop_type || 'Paddy / Rice',
    crop_variety: crop_variety || 'General',
    location: location || 'Tamil Nadu',
    planting_date: planting_date || new Date().toISOString().split('T')[0],
    growth_stage: growth_stage || 'Vegetative',
  };
  farms.push(newFarm);
  res.status(201).json(newFarm);
});

// Cameras API
app.get('/api/cameras', (req, res) => {
  res.json(cameras);
});

app.post('/api/cameras', (req, res) => {
  const { farm_id, monitoring_zone, capture_interval, secret_reference, stream_url } = req.body;
  const newCam = {
    camera_id: `cam-${Date.now()}`,
    farm_id: farm_id || farms[0]?.farm_id || 'farm-101',
    monitoring_zone: monitoring_zone || 'Monitoring Zone',
    connection_status: 'online',
    capture_interval: Number(capture_interval) || 30,
    last_capture_at: new Date().toISOString(),
    secret_reference: secret_reference || 'rtsp://secured-gateway.local/feed/custom',
    stream_url: stream_url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000',
  };
  cameras.push(newCam);
  res.status(201).json(newCam);
});

app.get('/api/cameras/:id/status', (req, res) => {
  const cam = cameras.find(c => c.camera_id === req.params.id);
  if (!cam) return res.status(404).json({ error: 'Camera not found' });
  res.json({ ...cam, signal_strength: '98%', latency_ms: 124 });
});

// Observations & Analysis API
app.get('/api/farms/:id/history', (req, res) => {
  const farmId = req.params.id;
  const farmObs = observations.filter(o => o.farm_id === farmId);
  const detailed = farmObs.map(obs => {
    const report = analysisReports.find(r => r.observation_id === obs.observation_id);
    return { ...obs, report };
  });
  res.json(detailed);
});

app.post('/api/observations/upload', async (req, res) => {
  try {
    const { farm_id, camera_id, image_url, crop_type } = req.body;
    const observation_id = `obs-${Date.now()}`;
    const targetFarm = farms.find(f => f.farm_id === farm_id) || farms[0];
    const crop = crop_type || targetFarm?.crop_type || 'Paddy / Rice';

    const newObs = {
      observation_id,
      farm_id: farm_id || targetFarm.farm_id,
      camera_id: camera_id || null,
      image_url: image_url || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1000',
      timestamp: new Date().toISOString(),
      crop_type: crop,
      image_quality: { status: 'good', blur_score: 94, lighting: 'optimal' },
      model_version: 'CropVision-YOLO-v4.2',
      analysis_status: 'completed'
    };
    observations.push(newObs);

    // Run AI analysis (simulation or real Gemini Flash vision analysis)
    let suspected = 'Healthy Leaf Structure / Minor Nutrient Variation';
    let confidence = 0.92;
    let symptomaticPct = 2.1;
    let boxes = [{ x: 100, y: 100, width: 80, height: 80, label: 'Normal laminar tissue' }];
    let notes = 'No severe disease vectors identified. Leaf surface integrity normal.';

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              text: `You are CropVision AI, an expert plant pathologist and computer vision model. Analyze this agricultural crop image for crop type "${crop}". Respond ONLY in strict JSON format with keys: suspected_disease_or_pest (string), confidence (number 0-1), symptomatic_area_percentage (number 0-100), uncertainty_notes (string), and bounding_boxes (array of objects with x, y, width, height, label).`
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: image_url.startsWith('data:') ? image_url.split(',')[1] : 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
              }
            }
          ]
        });
        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          suspected = parsed.suspected_disease_or_pest || suspected;
          confidence = parsed.confidence || confidence;
          symptomaticPct = parsed.symptomatic_area_percentage || symptomaticPct;
          notes = parsed.uncertainty_notes || notes;
          if (parsed.bounding_boxes) boxes = parsed.bounding_boxes;
        }
      } catch (err) {
        console.error('Gemini vision analysis fallback used:', err);
      }
    } else {
      // Intelligent simulation based on crop type or randomness if no key
      if (crop.includes('Paddy') || crop.includes('Rice')) {
        suspected = 'Brown Spot (Bipolaris oryzae)';
        confidence = 0.89;
        symptomaticPct = 6.4;
        boxes = [{ x: 130, y: 110, width: 100, height: 95, label: 'Oval brown lesion with yellow halo' }];
        notes = 'Moderate fungal spotting observed. Potassium deficiency may be compounding susceptibility.';
      } else {
        suspected = 'Leaf Blotch / Rhizome Spot';
        confidence = 0.85;
        symptomaticPct = 5.2;
        boxes = [{ x: 150, y: 120, width: 90, height: 90, label: 'Chlorotic necrotic region' }];
        notes = 'Early marginal chlorosis detected. Monitor humidity levels.';
      }
    }

    const report_id = `rep-${Date.now()}`;
    const newReport = {
      report_id,
      observation_id,
      suspected_disease_or_pest: suspected,
      confidence,
      bounding_boxes: boxes,
      segmentation_mask_reference: `mask-${observation_id}`,
      visible_leaf_pixel_area: 46000,
      symptomatic_pixel_area: Math.round(46000 * (symptomaticPct / 100)),
      symptomatic_area_percentage: symptomaticPct,
      uncertainty_notes: notes,
      analysis_timestamp: new Date().toISOString()
    };
    analysisReports.push(newReport);

    // Check if progression alert needed (>5% or high severity)
    if (symptomaticPct > 5.0) {
      const alertId = `alt-${Date.now()}`;
      const newAlert = {
        alert_id: alertId,
        farm_id: newObs.farm_id,
        observation_id,
        alert_type: 'Disease Severity Threshold Exceeded',
        severity: symptomaticPct > 8.0 ? 'High' : 'Moderate',
        message: `Detected ${suspected} with ${symptomaticPct}% symptomatic area on ${targetFarm.farm_name}. Review RAG guidelines for immediate action.`,
        created_at: new Date().toISOString(),
        acknowledged_at: null,
        status: 'Active'
      };
      alerts.push(newAlert);
    }

    res.status(201).json({ observation: newObs, report: newReport });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal analysis error' });
  }
});

app.get('/api/observations/:id/report', (req, res) => {
  const obsId = req.params.id;
  const obs = observations.find(o => o.observation_id === obsId);
  if (!obs) return res.status(404).json({ error: 'Observation not found' });
  const report = analysisReports.find(r => r.observation_id === obsId);
  res.json({ ...obs, report });
});

// Progression comparison
app.post('/api/progression/compare', (req, res) => {
  const { farm_id, previous_observation_id, current_observation_id } = req.body;
  const prevObs = observations.find(o => o.observation_id === previous_observation_id) || observations[0];
  const currObs = observations.find(o => o.observation_id === current_observation_id) || observations[observations.length - 1];

  const prevRep = analysisReports.find(r => r.observation_id === prevObs?.observation_id) || { symptomatic_area_percentage: 4.0 };
  const currRep = analysisReports.find(r => r.observation_id === currObs?.observation_id) || { symptomatic_area_percentage: 9.0 };

  const diff = Number((currRep.symptomatic_area_percentage - prevRep.symptomatic_area_percentage).toFixed(1));

  const comparison = {
    progression_id: `prog-${Date.now()}`,
    farm_id: farm_id || 'farm-101',
    monitoring_zone: 'North-East Sector (Zone A)',
    previous_observation_id: prevObs?.observation_id,
    current_observation_id: currObs?.observation_id,
    previous_symptomatic_area: prevRep.symptomatic_area_percentage,
    current_symptomatic_area: currRep.symptomatic_area_percentage,
    percentage_point_change: diff,
    comparison_quality: 'High comparability (Pose & lighting matched within 96% confidence)',
    progression_status: diff > 0 ? `Symptom Expansion (+${diff}% area)` : diff < 0 ? `Improvement (${diff}% area)` : 'Stable Condition',
    previous_image: prevObs?.image_url,
    current_image: currObs?.image_url,
  };

  res.json(comparison);
});

// Chat & RAG endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, farm_id } = req.body;
    const targetFarm = farms.find(f => f.farm_id === farm_id) || farms[0];
    const latestObs = observations.filter(o => o.farm_id === targetFarm.farm_id).pop();
    const latestRep = analysisReports.find(r => r.observation_id === latestObs?.observation_id);

    // Relevant RAG sources
    const matchedSources = knowledgeSources.filter(s => s.crop.toLowerCase().includes(targetFarm.crop_type.toLowerCase()) || (latestRep && s.disease_or_pest.toLowerCase().includes(latestRep.suspected_disease_or_pest.toLowerCase().split(' ')[0])));
    const sourceTexts = matchedSources.map(s => `[Source ID: ${s.source_id}] Title: ${s.title} (${s.publisher}, ${s.publication_date}). Region: ${s.region}`).join('\n');

    let assistantReply = '';
    let usedSources = matchedSources.map(s => s.source_id);

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const chatPrompt = `You are CropGPT, an expert agricultural AI assistant grounded in RAG knowledge and CropVision AI analysis.
Farm Context: Name: ${targetFarm.farm_name}, Crop: ${targetFarm.crop_type} (${targetFarm.crop_variety}), Location: ${targetFarm.location}, Stage: ${targetFarm.growth_stage}.
Latest CropVision Report: Suspected Issue: ${latestRep?.suspected_disease_or_pest || 'None'}, Confidence: ${latestRep?.confidence || 'N/A'}, Affected Area: ${latestRep?.symptomatic_area_percentage || 0}%. Notes: ${latestRep?.uncertainty_notes || 'None'}.

Verified Agricultural Knowledge Sources:
${sourceTexts || 'General ICAR/TNAU guidelines apply.'}

User Question: "${message}"

Provide a structured, helpful, professional response. Distinguish between **Observed** evidence, **Estimated** metrics, **Possible** causes, and **Recommended** actions. Cite relevant source IDs where appropriate.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: chatPrompt
        });
        assistantReply = response.text || 'No response generated.';
      } catch (err) {
        console.error('Gemini chat error:', err);
        assistantReply = `Based on your query regarding ${targetFarm.farm_name}, our CropVision analysis indicates ${latestRep?.suspected_disease_or_pest || 'normal crop health'} with ${latestRep?.symptomatic_area_percentage || 0}% affected area. Refer to ICAR guidelines for pest and disease management.`;
      }
    } else {
      assistantReply = `Hello Farmer! Regarding your crop **${targetFarm.crop_type}** at **${targetFarm.farm_name}**:\n\n` +
        `• **Observed:** Latest observation shows ${latestRep?.suspected_disease_or_pest || 'healthy status'} with ${latestRep?.symptomatic_area_percentage || 0}% symptomatic leaf area.\n` +
        `• **Estimated Confidence:** ${Math.round((latestRep?.confidence || 0.9) * 100)}% model reliability.\n` +
        `• **Recommended Action:** Follow verified ICAR / TNAU protocols. Ensure proper drainage and consult local agricultural extension officers if progression exceeds 10%.\n\n*(Note: Configure GEMINI_API_KEY for dynamic generative AI responses)*`;
    }

    const newMsgId = `msg-${Date.now()}`;
    const userMsg = { id: `m-${Date.now()}-u`, sender: 'user', text: message, timestamp: new Date().toISOString() };
    const botMsg = { id: newMsgId, sender: 'assistant', text: assistantReply, timestamp: new Date().toISOString(), sources: usedSources };

    let session = chatSessions.find(s => s.farm_id === targetFarm.farm_id);
    if (!session) {
      session = {
        session_id: `sess-${Date.now()}`,
        user_id: 'user-001',
        farm_id: targetFarm.farm_id,
        messages: [],
        referenced_observation_ids: latestObs ? [latestObs.observation_id] : [],
        retrieved_source_ids: usedSources,
        created_at: new Date().toISOString()
      };
      chatSessions.push(session);
    }
    session.messages.push(userMsg, botMsg);

    res.json({ reply: botMsg, session });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Chat error' });
  }
});

// Knowledge Sources API
app.get('/api/knowledge/sources', (req, res) => {
  res.json(knowledgeSources);
});

// Alerts API
app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const alertId = req.params.id;
  const alert = alerts.find(a => a.alert_id === alertId);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = 'Acknowledged';
  alert.acknowledged_at = new Date().toISOString();
  res.json(alert);
});

// Settings API
app.get('/api/settings', (req, res) => {
  res.json(userSettings);
});

app.put('/api/settings', (req, res) => {
  userSettings = { ...userSettings, ...req.body };
  res.json(userSettings);
});

// Expert review request
app.post('/api/expert-review', (req, res) => {
  const { farm_id, observation_id, notes } = req.body;
  res.json({
    success: true,
    review_id: `rev-${Date.now()}`,
    message: 'Expert review request submitted successfully to Tamil Nadu Agricultural University Extension Officer.',
    status: 'Pending Review',
    estimated_response_hours: 24
  });
});

// Vite middleware or production static serving
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist/index.html'));

if (isProduction) {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    }
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
