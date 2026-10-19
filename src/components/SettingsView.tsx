import React, { useState } from 'react';
import { Settings, Globe, Bell, Clock, CheckCircle2 } from 'lucide-react';
import { UserSettings } from '../types';
import { translations } from '../translations';

interface SettingsViewProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  setSettings,
}) => {
  const [saved, setSaved] = useState(false);
  const t = translations[settings.language] || translations.en;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      setSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-3">
        <div className="bg-emerald-700 p-2.5 rounded-2xl text-white shadow">
          <Settings className="h-6 w-6 text-emerald-200" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.settings}</h1>
          <p className="text-sm text-slate-500">Configure language preference, alerts, and camera capture intervals.</p>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-6">
        {/* Language Preference */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center">
            <Globe className="h-4 w-4 mr-2 text-emerald-600" />
            Language Preference / மொழி
          </label>
          <p className="text-xs text-slate-500 mb-2">Select your preferred language for the CropGPT and CropVision interface.</p>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value as 'en' | 'ta' })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none"
          >
            <option value="en">English (EN)</option>
            <option value="ta">தமிழ் (Tamil - TA)</option>
          </select>
        </div>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <span className="text-sm font-bold text-slate-800 block flex items-center">
              <Bell className="h-4 w-4 mr-2 text-emerald-600" />
              Automated Alerts & Push Notifications
            </span>
            <p className="text-xs text-slate-500">Receive instant push or in-app alerts when crop disease severity exceeds threshold.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications_enabled}
            onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
          />
        </div>

        {/* Auto Capture Interval */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-emerald-600" />
            Default IP Camera Capture Interval
          </label>
          <p className="text-xs text-slate-500 mb-2">Configure how frequently connected RTSP cameras capture and analyze frames.</p>
          <select
            value={settings.auto_capture_interval}
            onChange={(e) => setSettings({ ...settings, auto_capture_interval: Number(e.target.value) })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none"
          >
            <option value={15}>Every 15 Minutes</option>
            <option value={30}>Every 30 Minutes</option>
            <option value={60}>Every 1 Hour</option>
            <option value={120}>Every 2 Hours</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow transition"
          >
            {t.save_changes}
          </button>
        </div>
      </form>
    </div>
  );
};
