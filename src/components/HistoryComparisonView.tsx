import React, { useState } from 'react';
import { ShieldCheck, TrendingUp, ArrowRight, Calendar, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Observation, ProgressionRecord, UserSettings } from '../types';
import { translations } from '../translations';

interface HistoryComparisonViewProps {
  observations: Observation[];
  settings: UserSettings;
}

export const HistoryComparisonView: React.FC<HistoryComparisonViewProps> = ({
  observations,
  settings,
}) => {
  const [prevObsId, setPrevObsId] = useState<string>(observations[0]?.observation_id || '');
  const [currObsId, setCurrObsId] = useState<string>(observations[observations.length - 1]?.observation_id || '');
  const [comparisonResult, setComparisonResult] = useState<ProgressionRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const t = translations[settings.language] || translations.en;

  const handleCompare = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/progression/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: 'farm-101',
          previous_observation_id: prevObsId,
          current_observation_id: currObsId,
        }),
      });
      const data = await res.json();
      setComparisonResult(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (observations.length >= 2) {
      handleCompare();
    }
  }, [observations]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.comparison}</h1>
        <p className="text-sm text-slate-500">Compare past and present crop observations to track symptom expansion or stabilization over time.</p>
      </div>

      {/* Selectors for comparison */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Baseline Observation</label>
          <select
            value={prevObsId}
            onChange={(e) => setPrevObsId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
          >
            {observations.map(o => (
              <option key={o.observation_id} value={o.observation_id}>
                {new Date(o.timestamp).toLocaleDateString()} — {o.report?.suspected_disease_or_pest || 'Scan'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Current Observation</label>
          <select
            value={currObsId}
            onChange={(e) => setCurrObsId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
          >
            {observations.map(o => (
              <option key={o.observation_id} value={o.observation_id}>
                {new Date(o.timestamp).toLocaleDateString()} — {o.report?.suspected_disease_or_pest || 'Scan'}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow transition flex items-center space-x-2"
          >
            <span>Run Progression Comparison</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Comparison Side-by-Side Results */}
      {comparisonResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Previous Image */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Previous Baseline</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                  {new Date(observations.find(o => o.observation_id === prevObsId)?.timestamp || '').toLocaleDateString()}
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 shadow-inner">
                <img
                  src={observations.find(o => o.observation_id === prevObsId)?.image_url}
                  alt="Previous Observation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-sm">
                <span className="text-slate-600">Symptomatic Area:</span>
                <span className="font-bold text-slate-800">{comparisonResult.previous_symptomatic_area}%</span>
              </div>
            </div>

            {/* Current Image */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 uppercase">Current Observation</span>
                <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-medium">
                  {new Date(observations.find(o => o.observation_id === currObsId)?.timestamp || '').toLocaleDateString()}
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 shadow-inner">
                <img
                  src={observations.find(o => o.observation_id === currObsId)?.image_url}
                  alt="Current Observation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 flex justify-between items-center text-sm">
                <span className="text-rose-900 font-medium">Symptomatic Area:</span>
                <span className="font-bold text-rose-700">{comparisonResult.current_symptomatic_area}%</span>
              </div>
            </div>
          </div>

          {/* Absolute Percentage-Point Difference & Status Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-700 p-3 rounded-2xl">
                <TrendingUp className="h-8 w-8 text-emerald-200" />
              </div>
              <div>
                <span className="text-xs text-emerald-300 uppercase font-semibold">Progression Analysis</span>
                <h3 className="text-xl font-bold">{comparisonResult.progression_status}</h3>
                <p className="text-xs text-emerald-200 mt-0.5">{comparisonResult.comparison_quality}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl text-center border border-white/10 shrink-0">
              <span className="text-xs text-emerald-300 block uppercase font-medium">Absolute Change</span>
              <span className={`text-2xl font-bold ${comparisonResult.percentage_point_change > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                {comparisonResult.percentage_point_change > 0 ? `+${comparisonResult.percentage_point_change}%` : `${comparisonResult.percentage_point_change}%`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
