import React, { useState } from 'react';
import { ShieldCheck, X, Send, Loader2 } from 'lucide-react';
import { Farm, UserSettings } from '../types';
import { translations } from '../translations';

interface ExpertReviewModalProps {
  farm: Farm;
  onClose: () => void;
  settings: UserSettings;
}

export const ExpertReviewModal: React.FC<ExpertReviewModalProps> = ({
  farm,
  onClose,
  settings,
}) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const t = translations[settings.language] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/expert-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: farm.farm_id,
          observation_id: 'obs-002',
          notes,
        }),
      });
      await res.json();
      setSubmitting(false);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{t.expert_review}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="bg-emerald-100 text-emerald-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Request Sent Successfully!</h3>
            <p className="text-xs text-slate-600">Your crop scan report has been forwarded to Tamil Nadu Agricultural University extension officers. Expect a response within 24 hours.</p>
            <button
              onClick={onClose}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-xs font-semibold shadow"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Submit your latest CropVision scan and AI diagnostic report for manual review by a certified plant pathologist or agricultural officer.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
              <div><span className="font-semibold text-slate-700">Farm:</span> {farm.farm_name}</div>
              <div><span className="font-semibold text-slate-700">Crop:</span> {farm.crop_type} ({farm.crop_variety})</div>
              <div><span className="font-semibold text-slate-700">Location:</span> {farm.location}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Symptoms or Farmer Notes</label>
              <textarea
                rows={3}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe weather conditions, spread rate, or specific leaf symptoms observed..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit for Expert Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
