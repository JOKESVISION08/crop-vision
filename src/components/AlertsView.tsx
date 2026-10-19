import React from 'react';
import { AlertTriangle, CheckCircle2, Bell, Clock, ShieldCheck } from 'lucide-react';
import { Alert, Farm, UserSettings } from '../types';
import { translations } from '../translations';

interface AlertsViewProps {
  alerts: Alert[];
  farms: Farm[];
  onAcknowledge: (alertId: string) => void;
  settings: UserSettings;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  farms,
  onAcknowledge,
  settings,
}) => {
  const t = translations[settings.language] || translations.en;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.alerts}</h1>
        <p className="text-sm text-slate-500">Automated severity alerts, pest detection warnings, and camera health notifications.</p>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => {
          const farmObj = farms.find(f => f.farm_id === alert.farm_id);
          const isActive = alert.status === 'Active';
          return (
            <div
              key={alert.alert_id}
              className={`bg-white rounded-2xl p-6 shadow-md border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isActive ? 'border-rose-300 ring-2 ring-rose-500/10 bg-rose-50/20' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-2xl shrink-0 ${
                  isActive ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{farmObj?.farm_name || 'Farm'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      alert.severity === 'High' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {alert.severity} Severity
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{alert.alert_type}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto flex justify-end">
                {isActive ? (
                  <button
                    onClick={() => onAcknowledge(alert.alert_id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t.acknowledge}</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-600" />
                    {t.acknowledged}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-md">
            <Bell className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p>No active alerts or notifications. All crops are currently stable.</p>
          </div>
        )}
      </div>
    </div>
  );
};
