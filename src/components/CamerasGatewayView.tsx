import React, { useState } from 'react';
import { Video, Wifi, Clock, ShieldCheck, Plus, RefreshCcw, AlertCircle, Camera } from 'lucide-react';
import { Camera as CameraType, Farm, UserSettings } from '../types';
import { translations } from '../translations';

interface CamerasGatewayViewProps {
  cameras: CameraType[];
  farms: Farm[];
  onAddCamera: (cam: Partial<CameraType>) => void;
  settings: UserSettings;
}

export const CamerasGatewayView: React.FC<CamerasGatewayViewProps> = ({
  cameras,
  farms,
  onAddCamera,
  settings,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    farm_id: farms[0]?.farm_id || 'farm-101',
    monitoring_zone: 'South Sector (Zone B)',
    capture_interval: 30,
    secret_reference: 'rtsp://secured-gateway.local/feed/zone-b',
    stream_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000',
  });

  const t = translations[settings.language] || translations.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCamera(formData);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.cameras}</h1>
          <p className="text-sm text-slate-500">Secure RTSP camera gateway for automated scheduled crop surveillance and frame capture.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Register IP Camera</span>
        </button>
      </div>

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cameras.map((cam) => {
          const farmObj = farms.find(f => f.farm_id === cam.farm_id);
          const isOnline = cam.connection_status === 'online';
          return (
            <div key={cam.camera_id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{cam.monitoring_zone}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {isOnline ? t.online : t.offline}
                  </span>
                </div>

                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 shadow-inner">
                  <img src={cam.stream_url} alt="Camera Feed" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs text-white font-medium bg-black/40 backdrop-blur-md px-2 py-1 rounded flex items-center space-x-1">
                      <Wifi className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                      <span>Signal: {cam.signal_strength || '98%'} • Latency: {cam.latency_ms || 120}ms</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Assigned Farm</span>
                    <span className="font-bold text-slate-800">{farmObj?.farm_name || 'Farm'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Capture Interval</span>
                    <span className="font-bold text-slate-800 flex items-center mt-0.5">
                      <Clock className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                      Every {cam.capture_interval} mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Last Captured: {new Date(cam.last_capture_at).toLocaleTimeString()}</span>
                <button
                  onClick={() => alert(`Triggering manual capture for ${cam.monitoring_zone}...`)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  <span>Capture Now</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Register Supported IP Camera (RTSP Gateway)</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Farm</label>
                <select
                  value={formData.farm_id}
                  onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                >
                  {farms.map(f => (
                    <option key={f.farm_id} value={f.farm_id}>{f.farm_name} ({f.crop_type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monitoring Zone Name</label>
                <input
                  type="text"
                  required
                  value={formData.monitoring_zone}
                  onChange={(e) => setFormData({ ...formData, monitoring_zone: e.target.value })}
                  placeholder="e.g. North Sector (Zone A)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Secure RTSP Stream Reference / Gateway URL</label>
                <input
                  type="text"
                  required
                  value={formData.secret_reference}
                  onChange={(e) => setFormData({ ...formData, secret_reference: e.target.value })}
                  placeholder="rtsp://gateway.local/feed/stream1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Capture Interval (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={formData.capture_interval}
                  onChange={(e) => setFormData({ ...formData, capture_interval: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md"
                >
                  Connect Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
