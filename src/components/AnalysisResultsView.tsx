import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertTriangle, Eye, CheckCircle2, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Observation, UserSettings } from '../types';
import { translations } from '../translations';

interface AnalysisResultsViewProps {
  observations: Observation[];
  setCurrentTab: (tab: string) => void;
  settings: UserSettings;
}

export const AnalysisResultsView: React.FC<AnalysisResultsViewProps> = ({
  observations,
  setCurrentTab,
  settings,
}) => {
  const [selectedObsId, setSelectedObsId] = useState<string>(observations[observations.length - 1]?.observation_id || '');
  const [showOverlay, setShowOverlay] = useState(true);

  // Automatically select the latest observation when observations change (e.g. newly transmitted snap)
  useEffect(() => {
    if (observations.length > 0) {
      const latest = observations[observations.length - 1];
      if (latest) {
        setSelectedObsId(latest.observation_id);
      }
    }
  }, [observations]);

  const t = translations[settings.language] || translations.en;
  const currentObs = observations.find(o => o.observation_id === selectedObsId) || observations[observations.length - 1];
  const report = currentObs?.report;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.analysis}</h1>
          <p className="text-sm text-slate-500">Detailed computer vision metrics, bounding boxes, and symptomatic area estimation.</p>
        </div>

        {/* Observation Selector */}
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Scan Date:</span>
          <select
            value={selectedObsId}
            onChange={(e) => setSelectedObsId(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {observations.map(o => (
              <option key={o.observation_id} value={o.observation_id}>
                {new Date(o.timestamp).toLocaleString()} ({o.crop_type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentObs && report ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image & Bounding Box / Segmentation Overlay Panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center">
                <Eye className="h-5 w-5 text-emerald-600 mr-2" />
                <span>Segmentation & Bounding Box Overlay</span>
              </h2>
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                  showOverlay ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {showOverlay ? 'Hide Overlays' : 'Show Overlays'}
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-inner">
              <img src={currentObs.image_url} alt="Crop Scan" className="w-full h-full object-cover" />

              {/* Simulated Bounding Box Overlays */}
              {showOverlay && report.bounding_boxes && report.bounding_boxes.map((box, idx) => (
                <div
                  key={idx}
                  className="absolute border-2 border-rose-500 bg-rose-500/10 rounded pointer-events-none flex flex-col justify-between p-1 shadow-lg"
                  style={{
                    left: `${20 + idx * 25}%`,
                    top: `${25 + idx * 15}%`,
                    width: `${box.width || 120}px`,
                    height: `${box.height || 110}px`,
                  }}
                >
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded w-max shadow">
                    {box.label || report.suspected_disease_or_pest}
                  </span>
                </div>
              ))}

              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg">
                Model: {currentObs.model_version} • Confidence: {Math.round(report.confidence * 100)}%
              </div>
            </div>

            {/* Pixel Area Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <div>
                <span className="text-[11px] text-slate-500 uppercase block font-medium">Visible Leaf Area</span>
                <span className="text-base font-bold text-slate-800">{report.visible_leaf_pixel_area.toLocaleString()} px²</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase block font-medium">Symptomatic Pixels</span>
                <span className="text-base font-bold text-rose-600">{report.symptomatic_pixel_area.toLocaleString()} px²</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase block font-medium">Symptomatic Area %</span>
                <span className="text-base font-bold text-rose-700">{report.symptomatic_area_percentage}%</span>
              </div>
            </div>
          </div>

          {/* 4-Tier Structured Explanation Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Suspected Diagnosis</span>
                <h3 className="text-lg font-bold text-rose-700 mt-0.5">{report.suspected_disease_or_pest}</h3>
              </div>

              {/* 4 Tiers */}
              <div className="space-y-3 text-xs">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-0.5">🟢 Observed Evidence:</span>
                  <p className="text-emerald-800 leading-relaxed">{report.uncertainty_notes}</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <span className="font-bold text-blue-900 block mb-0.5">🔵 Estimated Metrics:</span>
                  <p className="text-blue-800">Symptom severity estimated at {report.symptomatic_area_percentage}% of canopy leaf surface with {Math.round(report.confidence * 100)}% model certainty.</p>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-900 block mb-0.5">🟠 Possible Causes:</span>
                  <p className="text-amber-800">High relative humidity, excessive nitrogen fertilization, or spore dispersal via wind currents.</p>
                </div>

                <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                  <span className="font-bold text-teal-900 block mb-0.5">🟣 Recommended Action:</span>
                  <p className="text-teal-800">Apply recommended systemic fungicide per ICAR / TNAU guidelines. Compare with previous observations to verify progression.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex space-x-2">
              <button
                onClick={() => setCurrentTab('comparison')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow transition flex items-center justify-center space-x-1"
              >
                <span>Past vs Present</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
              <button
                onClick={() => setCurrentTab('chat')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition"
              >
                Ask CropGPT
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-md">
          <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" />
          <p>No analysis reports found for this observation.</p>
        </div>
      )}
    </div>
  );
};
