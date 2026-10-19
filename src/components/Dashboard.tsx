import React from 'react';
import { Camera, MessageSquare, Activity, AlertTriangle, ShieldCheck, TrendingUp, Calendar, MapPin, ArrowRight, CheckCircle2, Sparkles, Video } from 'lucide-react';
import { Farm, Observation, Alert, UserSettings } from '../types';
import { translations } from '../translations';

interface DashboardProps {
  farm: Farm;
  observations: Observation[];
  alerts: Alert[];
  setCurrentTab: (tab: string) => void;
  settings: UserSettings;
  onOpenExpertModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  farm,
  observations,
  alerts,
  setCurrentTab,
  settings,
  onOpenExpertModal,
}) => {
  const t = translations[settings.language] || translations.en;
  const latestObs = observations[observations.length - 1];
  const latestReport = latestObs?.report;
  const farmAlerts = alerts.filter(a => a.farm_id === farm?.farm_id && a.status === 'Active');

  return (
    <div className="space-y-6 pb-12">
      {/* Farm Banner & Overview Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-no-repeat bg-cover pointer-events-none" style={{ backgroundImage: `url(${latestObs?.image_url || ''})` }}></div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <MapPin className="h-4 w-4" />
                <span>{farm?.location || 'Tamil Nadu, India'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{farm?.farm_name || 'My Farm'}</h1>
              <p className="text-emerald-200 text-sm mt-1">
                Crop: <span className="font-semibold text-white">{farm?.crop_type}</span> ({farm?.crop_variety}) • Stage: <span className="font-semibold text-white">{farm?.growth_stage}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentTab('capture')}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition transform active:scale-95"
              >
                <Camera className="h-5 w-5" />
                <span>{t.take_photo}</span>
              </button>
              <button
                onClick={() => setCurrentTab('chat')}
                className="bg-teal-700 hover:bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition border border-teal-600"
              >
                <MessageSquare className="h-5 w-5 text-emerald-300" />
                <span>CropGPT</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-emerald-300 block">Planting Date</span>
              <span className="font-bold text-white flex items-center mt-0.5">
                <Calendar className="h-4 w-4 mr-1 text-emerald-300" />
                {farm?.planting_date || '2026-01-15'}
              </span>
            </div>
            <div>
              <span className="text-emerald-300 block">Total Observations</span>
              <span className="font-bold text-white flex items-center mt-0.5">
                <Activity className="h-4 w-4 mr-1 text-emerald-300" />
                {observations.length} Scans recorded
              </span>
            </div>
            <div>
              <span className="text-emerald-300 block">Active Status</span>
              <span className="font-bold text-emerald-200 flex items-center mt-0.5">
                <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-400" />
                Normal Monitoring
              </span>
            </div>
            <div>
              <span className="text-emerald-300 block">Active Alerts</span>
              <span className={`font-bold flex items-center mt-0.5 ${farmAlerts.length > 0 ? 'text-rose-300' : 'text-emerald-200'}`}>
                <AlertTriangle className="h-4 w-4 mr-1" />
                {farmAlerts.length} Unresolved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts Banner if any */}
      {farmAlerts.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl shadow-md flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-rose-900">Crop Health Alert Triggered</h2>
              <p className="text-xs text-rose-700 mt-0.5">{farmAlerts[0].message}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('alerts')}
            className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-medium shrink-0 ml-2"
          >
            View Alerts
          </button>
        </div>
      )}

      {/* Grid: Latest Observation Report & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Observation Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <Activity className="h-5 w-5 text-emerald-600 mr-2" />
                {t.latest_observation}
              </h2>
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                {latestObs ? new Date(latestObs.timestamp).toLocaleDateString() : 'No scans yet'}
              </span>
            </div>

            {latestObs && latestReport ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative rounded-xl overflow-hidden shadow-inner group aspect-video bg-slate-900">
                  <img src={latestObs.image_url} alt="Crop Scan" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs text-white font-medium bg-black/40 backdrop-blur-md px-2 py-1 rounded">
                      Model: {latestObs.model_version}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.suspected_issue}</span>
                    <h3 className="text-base font-bold text-rose-700">{latestReport.suspected_disease_or_pest}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">{t.confidence}</span>
                      <span className="text-sm font-bold text-slate-800">{Math.round(latestReport.confidence * 100)}%</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 block">{t.symptomatic_area}</span>
                      <span className="text-sm font-bold text-rose-600">{latestReport.symptomatic_area_percentage}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                    <span className="font-semibold text-emerald-900 block mb-0.5">CropVision AI Summary:</span>
                    {latestReport.uncertainty_notes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Camera className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No crop observations uploaded yet. Capture your first photo to begin AI analysis.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentTab('analysis')}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
            >
              <span>View full analysis report & bounding boxes</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
            <button
              onClick={() => setCurrentTab('comparison')}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium"
            >
              Compare Past vs Present
            </button>
          </div>
        </div>

        {/* Quick Tools & CropGPT Ask Card */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4" />
              <span>CropGPT Conversational AI</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ask RAG-Grounded Questions</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Get evidence-backed answers referencing ICAR guidelines, TNAU plant pathology research, and historical crop observations.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => setCurrentTab('chat')}
                className="w-full text-left bg-emerald-800/80 hover:bg-emerald-700 p-2.5 rounded-xl text-xs text-emerald-100 transition border border-emerald-700 flex items-center justify-between"
              >
                <span>"What pest or disease is visible?"</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-300" />
              </button>
              <button
                onClick={() => setCurrentTab('chat')}
                className="w-full text-left bg-emerald-800/80 hover:bg-emerald-700 p-2.5 rounded-xl text-xs text-emerald-100 transition border border-emerald-700 flex items-center justify-between"
              >
                <span>"Is the affected leaf area increasing?"</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-300" />
              </button>
              <button
                onClick={() => setCurrentTab('chat')}
                className="w-full text-left bg-emerald-800/80 hover:bg-emerald-700 p-2.5 rounded-xl text-xs text-emerald-100 transition border border-emerald-700 flex items-center justify-between"
              >
                <span>"What ICAR treatment is recommended?"</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-300" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-800 flex items-center justify-between">
            <button
              onClick={onOpenExpertModal}
              className="text-xs text-emerald-300 hover:text-white underline font-medium"
            >
              Request Agronomist Expert Review
            </button>
            <button
              onClick={() => setCurrentTab('cameras')}
              className="text-xs bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1"
            >
              <Video className="h-3.5 w-3.5" />
              <span>IP Cameras</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
