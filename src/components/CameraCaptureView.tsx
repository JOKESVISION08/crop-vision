import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Farm, UserSettings } from '../types';
import { translations } from '../translations';

interface CameraCaptureViewProps {
  farm: Farm;
  onUploadSuccess: (result: any) => void;
  settings: UserSettings;
}

export const CameraCaptureView: React.FC<CameraCaptureViewProps> = ({
  farm,
  onUploadSuccess,
  settings,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [usingLiveCamera, setUsingLiveCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const t = translations[settings.language] || translations.en;

  const sampleImages = [
    { label: 'Paddy Leaf Spot Sample', url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1000' },
    { label: 'Healthy Paddy Canopy', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000' },
    { label: 'Turmeric Leaf Blotch', url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=1000' }
  ];

  useEffect(() => {
    if (usingLiveCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [usingLiveCamera, cameraStream]);

  const startLiveCamera = async () => {
    try {
      setUsingLiveCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera stream error:', err);
      alert('Unable to open camera. Please ensure camera permissions are allowed in your browser settings, or use Gallery Upload / Sample Images.');
      setUsingLiveCamera(false);
    }
  };

  const captureLivePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        stopLiveCamera();
        processAndAnalyzeImage(dataUrl);
      }
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setUsingLiveCamera(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        processAndAnalyzeImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAndAnalyzeImage = async (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setAnalyzing(true);
    try {
      const res = await fetch('/api/observations/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: farm.farm_id,
          image_url: imageUrl,
          crop_type: farm.crop_type,
        }),
      });
      const data = await res.json();
      setAnalyzing(false);
      onUploadSuccess(data);
    } catch (err) {
      console.error(err);
      setAnalyzing(false);
      alert('Analysis failed. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">{t.camera_capture}</h1>
        <p className="text-sm text-slate-500 mt-1">Capture high-resolution crop leaves or upload photos for instant CropVision AI diagnostics.</p>
      </div>

      {/* Farm & Crop Context Pill */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-sm">
        <div>
          <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block">Target Farm</span>
          <span className="font-bold text-emerald-900">{farm.farm_name} ({farm.crop_type} - {farm.crop_variety})</span>
        </div>
        <span className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full font-medium">
          {farm.growth_stage}
        </span>
      </div>

      {/* Main Capture / Preview Box */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-6">
        {usingLiveCamera ? (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-emerald-400 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Viewfinder Active</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                onClick={captureLivePhoto}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-full shadow-lg flex items-center space-x-2 transition transform active:scale-95 cursor-pointer"
              >
                <Camera className="h-5 w-5" />
                <span>Snap Photo & Start Analysis</span>
              </button>
              <button
                onClick={stopLiveCamera}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-5 py-3.5 rounded-full transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : analyzing ? (
          <div className="py-16 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Transmitting Pixels to Current Observation...</h3>
              <p className="text-xs text-slate-500">{t.loading_analysis}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Camera Viewfinder Trigger */}
              <button
                onClick={startLiveCamera}
                className="bg-emerald-50 hover:bg-emerald-100 border-2 border-dashed border-emerald-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition group cursor-pointer"
              >
                <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md group-hover:scale-105 transition mb-3">
                  <Camera className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-emerald-900 text-base">Phone Camera Capture</h3>
                <p className="text-xs text-emerald-700 mt-1">Open live camera viewfinder inside app</p>
              </button>

              {/* Gallery Upload Trigger */}
              <label className="bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition group cursor-pointer relative">
                <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-md group-hover:scale-105 transition mb-3">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">{t.upload_gallery}</h3>
                <p className="text-xs text-slate-500 mt-1">Upload JPEG, PNG or HEIC image from device</p>
                <input
                  type="file"
                  ref={galleryInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>

            {/* Quick Sample Selector */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-3 uppercase tracking-wide">Or test with verified sample images:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sampleImages.map((samp, idx) => (
                  <button
                    key={idx}
                    onClick={() => processAndAnalyzeImage(samp.url)}
                    className="flex items-center space-x-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-2.5 rounded-xl text-left transition group cursor-pointer"
                  >
                    <img src={samp.url} alt={samp.label} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-900 line-clamp-2">{samp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
