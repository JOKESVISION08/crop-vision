import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { FarmsView } from './components/FarmsView';
import { CameraCaptureView } from './components/CameraCaptureView';
import { AnalysisResultsView } from './components/AnalysisResultsView';
import { HistoryComparisonView } from './components/HistoryComparisonView';
import { CropGPTChatView } from './components/CropGPTChatView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { CamerasGatewayView } from './components/CamerasGatewayView';
import { AlertsView } from './components/AlertsView';
import { SettingsView } from './components/SettingsView';
import { ExpertReviewModal } from './components/ExpertReviewModal';
import {
  fetchFarms,
  createFarm,
  fetchCameras,
  createCamera,
  fetchHistory,
  fetchKnowledgeSources,
  fetchAlerts,
  acknowledgeAlert,
  fetchSettings,
  updateSettings,
} from './services/api';
import { Farm, Camera, Observation, KnowledgeSource, Alert, UserSettings } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    language: 'en',
    notifications_enabled: true,
    auto_capture_interval: 30,
  });
  const [loading, setLoading] = useState(true);
  const [expertModalOpen, setExpertModalOpen] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      try {
        const [fData, cData, kData, aData, sData] = await Promise.all([
          fetchFarms(),
          fetchCameras(),
          fetchKnowledgeSources(),
          fetchAlerts(),
          fetchSettings(),
        ]);
        setFarms(fData);
        if (fData.length > 0) {
          setSelectedFarmId(fData[0].farm_id);
          const history = await fetchHistory(fData[0].farm_id);
          setObservations(history);
        }
        setCameras(cData);
        setKnowledgeSources(kData);
        setAlerts(aData);
        setSettings(sData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // When selected farm changes, fetch its history
  useEffect(() => {
    if (selectedFarmId) {
      fetchHistory(selectedFarmId).then(history => {
        setObservations(history);
      });
    }
  }, [selectedFarmId]);

  const handleAddFarm = async (newFarm: Partial<Farm>) => {
    const created = await createFarm(newFarm);
    setFarms(prev => [...prev, created]);
    setSelectedFarmId(created.farm_id);
  };

  const handleAddCamera = async (newCam: Partial<Camera>) => {
    const created = await createCamera(newCam);
    setCameras(prev => [...prev, created]);
  };

  const handleUploadSuccess = (_res: any) => {
    // Refresh history
    fetchHistory(selectedFarmId).then(history => {
      setObservations(history);
    });
    fetchAlerts().then(a => setAlerts(a));
    setCurrentTab('analysis');
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    const updated = await acknowledgeAlert(alertId);
    setAlerts(prev => prev.map(a => a.alert_id === alertId ? updated : a));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
        <p className="text-sm font-medium tracking-wide">Loading CropGPT & CropVision AI Engine...</p>
      </div>
    );
  }

  const currentFarm = farms.find(f => f.farm_id === selectedFarmId) || farms[0];
  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        farms={farms}
        selectedFarmId={selectedFarmId}
        setSelectedFarmId={setSelectedFarmId}
        settings={settings}
        setSettings={setSettings}
        alertsCount={activeAlertsCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && currentFarm && (
          <Dashboard
            farm={currentFarm}
            observations={observations}
            alerts={alerts}
            setCurrentTab={setCurrentTab}
            settings={settings}
            onOpenExpertModal={() => setExpertModalOpen(true)}
          />
        )}

        {currentTab === 'farms' && (
          <FarmsView
            farms={farms}
            selectedFarmId={selectedFarmId}
            setSelectedFarmId={setSelectedFarmId}
            onAddFarm={handleAddFarm}
            settings={settings}
          />
        )}

        {currentTab === 'capture' && currentFarm && (
          <CameraCaptureView
            farm={currentFarm}
            onUploadSuccess={handleUploadSuccess}
            settings={settings}
          />
        )}

        {currentTab === 'analysis' && (
          <AnalysisResultsView
            observations={observations}
            setCurrentTab={setCurrentTab}
            settings={settings}
          />
        )}

        {currentTab === 'comparison' && (
          <HistoryComparisonView
            observations={observations}
            settings={settings}
          />
        )}

        {currentTab === 'chat' && currentFarm && (
          <CropGPTChatView
            farm={currentFarm}
            knowledgeSources={knowledgeSources}
            settings={settings}
          />
        )}

        {currentTab === 'knowledge' && (
          <KnowledgeBaseView
            knowledgeSources={knowledgeSources}
            settings={settings}
          />
        )}

        {currentTab === 'cameras' && (
          <CamerasGatewayView
            cameras={cameras}
            farms={farms}
            onAddCamera={handleAddCamera}
            settings={settings}
          />
        )}

        {currentTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            farms={farms}
            onAcknowledge={handleAcknowledgeAlert}
            settings={settings}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </main>

      {expertModalOpen && currentFarm && (
        <ExpertReviewModal
          farm={currentFarm}
          onClose={() => setExpertModalOpen(false)}
          settings={settings}
        />
      )}
    </div>
  );
}
