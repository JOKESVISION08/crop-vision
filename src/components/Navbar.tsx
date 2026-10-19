import React from 'react';
import { Sprout, Camera, Activity, MessageSquare, BookOpen, Video, Bell, Settings, Globe, ShieldCheck, Menu, X } from 'lucide-react';
import { Farm, UserSettings } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  farms: Farm[];
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  alertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  farms,
  selectedFarmId,
  setSelectedFarmId,
  settings,
  setSettings,
  alertsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const t = translations[settings.language] || translations.en;

  const toggleLanguage = () => {
    const newLang = settings.language === 'en' ? 'ta' : 'en';
    setSettings(prev => ({ ...prev, language: newLang }));
  };

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: Sprout },
    { id: 'capture', label: t.camera_capture, icon: Camera },
    { id: 'analysis', label: t.analysis, icon: Activity },
    { id: 'comparison', label: t.comparison, icon: ShieldCheck },
    { id: 'chat', label: t.chat, icon: MessageSquare },
    { id: 'knowledge', label: t.knowledge, icon: BookOpen },
    { id: 'cameras', label: t.cameras, icon: Video },
    { id: 'alerts', label: t.alerts, icon: Bell, badge: alertsCount },
    { id: 'farms', label: t.farms, icon: Sprout },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="bg-emerald-700 p-2 rounded-xl shadow-inner flex items-center justify-center">
              <Sprout className="h-6 w-6 text-emerald-200" />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-emerald-100">CropGPT + CropVision</span>
              <span className="hidden md:inline-block ml-2 text-xs bg-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full font-medium">AI Agri-Platform</span>
            </div>
          </div>

          {/* Farm Selector & Language Toggle & Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Farm Selector Dropdown */}
            <div className="flex items-center bg-emerald-800/80 rounded-lg px-3 py-1.5 border border-emerald-700">
              <span className="text-xs text-emerald-300 mr-2 font-medium">Farm:</span>
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="bg-transparent text-sm text-white font-semibold focus:outline-none cursor-pointer"
              >
                {farms.map(f => (
                  <option key={f.farm_id} value={f.farm_id} className="bg-emerald-900 text-white">
                    {f.farm_name} ({f.crop_type})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-200 transition border border-emerald-700"
              title="Switch Language / மொழிமாற்று"
            >
              <Globe className="h-4 w-4" />
              <span>{settings.language === 'en' ? 'தமிழ் (TA)' : 'English (EN)'}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="bg-emerald-800 p-1.5 rounded-lg text-xs font-medium text-emerald-200 border border-emerald-700"
            >
              {settings.language === 'en' ? 'TA' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-200 hover:bg-emerald-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Tab Bar */}
        <div className="hidden lg:flex space-x-1 overflow-x-auto py-2 border-t border-emerald-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap relative ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-200 hover:bg-emerald-800/60 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950 border-t border-emerald-800 px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 mb-2 border-b border-emerald-900">
            <label className="block text-xs text-emerald-400 mb-1">Select Farm:</label>
            <select
              value={selectedFarmId}
              onChange={(e) => {
                setSelectedFarmId(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="w-full bg-emerald-900 text-sm text-white font-semibold p-2 rounded-lg border border-emerald-800"
            >
              {farms.map(f => (
                <option key={f.farm_id} value={f.farm_id}>
                  {f.farm_name} ({f.crop_type})
                </option>
              ))}
            </select>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-300 hover:bg-emerald-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-emerald-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
