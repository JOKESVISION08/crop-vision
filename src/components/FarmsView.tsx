import React, { useState } from 'react';
import { Sprout, MapPin, Calendar, Plus, CheckCircle, ArrowRight } from 'lucide-react';
import { Farm, UserSettings } from '../types';
import { translations } from '../translations';

interface FarmsViewProps {
  farms: Farm[];
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  onAddFarm: (farm: Partial<Farm>) => void;
  settings: UserSettings;
}

export const FarmsView: React.FC<FarmsViewProps> = ({
  farms,
  selectedFarmId,
  setSelectedFarmId,
  onAddFarm,
  settings,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    farm_name: '',
    crop_type: 'Paddy / Rice',
    crop_variety: 'BPT 5204 (Samba)',
    location: 'Thanjavur, Tamil Nadu',
    planting_date: new Date().toISOString().split('T')[0],
    growth_stage: 'Tillering',
  });

  const t = translations[settings.language] || translations.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFarm(formData);
    setShowAddModal(false);
    setFormData({
      farm_name: '',
      crop_type: 'Paddy / Rice',
      crop_variety: 'BPT 5204',
      location: 'Tamil Nadu',
      planting_date: new Date().toISOString().split('T')[0],
      growth_stage: 'Vegetative',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.farms}</h1>
          <p className="text-sm text-slate-500">Manage your farm plots, crop varieties, and monitoring zones.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Farm</span>
        </button>
      </div>

      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map((farm) => {
          const isSelected = farm.farm_id === selectedFarmId;
          return (
            <div
              key={farm.farm_id}
              className={`bg-white rounded-2xl p-6 shadow-md border transition relative ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              {isSelected && (
                <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                  <span>Active Farm</span>
                </span>
              )}

              <div className="flex items-start space-x-4">
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <Sprout className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{farm.farm_name}</h3>
                  <div className="flex items-center space-x-1 text-slate-500 text-xs mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{farm.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Crop Type</span>
                  <span className="font-bold text-slate-800">{farm.crop_type}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Variety</span>
                  <span className="font-bold text-slate-800">{farm.crop_variety}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Planting Date</span>
                  <span className="font-bold text-slate-800 flex items-center mt-0.5">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    {farm.planting_date}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Growth Stage</span>
                  <span className="font-bold text-emerald-700">{farm.growth_stage}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                {!isSelected ? (
                  <button
                    onClick={() => setSelectedFarmId(farm.farm_id)}
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
                  >
                    <span>Switch to this farm</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold">Currently Active in Dashboard</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Farm Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Add New Farm Plot</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Farm / Plot Name</label>
                <input
                  type="text"
                  required
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  placeholder="e.g. Kavery North Block 3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Type</label>
                  <select
                    value={formData.crop_type}
                    onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="Paddy / Rice">Paddy / Rice</option>
                    <option value="Turmeric">Turmeric</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Banana">Banana</option>
                    <option value="Tomato">Tomato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Variety</label>
                  <input
                    type="text"
                    required
                    value={formData.crop_variety}
                    onChange={(e) => setFormData({ ...formData, crop_variety: e.target.value })}
                    placeholder="e.g. BPT 5204"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / District</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Thanjavur, Tamil Nadu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Planting Date</label>
                  <input
                    type="date"
                    required
                    value={formData.planting_date}
                    onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Growth Stage</label>
                  <input
                    type="text"
                    required
                    value={formData.growth_stage}
                    onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                    placeholder="e.g. Tillering"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
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
                  Save Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
