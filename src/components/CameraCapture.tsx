import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Camera, RefreshCw, Check, AlertTriangle, SwitchCamera, Loader2 } from 'lucide-react';

interface CameraCaptureProps {
  onPhotoConfirmed: (permanentImageUrl: string) => void;
  existingPhotoUrl?: string;
  onClearPhoto?: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoConfirmed,
  existingPhotoUrl,
  onClearPhoto,
}) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<'idle' | 'streaming' | 'preview'>('idle');
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isUploading, setIsUploading] = useState(false);

  // Stop camera stream cleanly
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const startCamera = async (chosenFacingMode: 'environment' | 'user' = facingMode) => {
    stopStream();
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(t('cameraUnavailable'));
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: chosenFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setMode('streaming');
    } catch (err: unknown) {
      console.error('[Camera Error]:', err);
      const isDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      setErrorMessage(isDenied ? t('cameraAccessDenied') : t('cameraUnavailable'));
      stopStream();
      setMode('idle');
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    setCapturedDataUrl(dataUrl);
    stopStream();
    setMode('preview');
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    startCamera(facingMode);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleConfirmPhoto = async () => {
    if (!capturedDataUrl) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const authToken = localStorage.getItem('mela_session_token');
      const res = await fetch('/api/upload-camera-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken || ''}`,
        },
        body: JSON.stringify({ imageBase64: capturedDataUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save photo permanently');
      }

      const data = await res.json();
      onPhotoConfirmed(data.url);
      setMode('idle');
    } catch (err: unknown) {
      console.error('[Upload Photo Error]:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Error storing photo permanently.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // If photo is already confirmed and available
  if (existingPhotoUrl && mode === 'idle') {
    return (
      <div className="space-y-3">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 shadow-sm">
          <img
            src={existingPhotoUrl}
            alt="Confirmed Product"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (onClearPhoto) onClearPhoto();
              startCamera();
            }}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('retakePhoto')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
            <button
              type="button"
              onClick={() => startCamera()}
              className="mt-1.5 text-emerald-800 font-bold underline"
            >
              Try Again / እንደገና ሞክር
            </button>
          </div>
        </div>
      )}

      {mode === 'idle' && (
        <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 shadow-2xs">
            <Camera className="w-6 h-6" />
          </div>

          <h4 className="text-sm font-bold text-slate-800 mb-1">{t('takePhoto')}</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
            {t('cameraRequiredNote')}
          </p>

          <button
            type="button"
            onClick={() => startCamera()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{t('capturePhoto')}</span>
          </button>
        </div>
      )}

      {mode === 'streaming' && (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-700 flex flex-col justify-between">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Camera Controls Overlay */}
          <div className="absolute top-3 right-3 z-10">
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
              title={t('switchCamera')}
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>

          {/* Shutter Button */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
            <button
              type="button"
              onClick={() => {
                stopStream();
                setMode('idle');
              }}
              className="px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium hover:bg-black/80"
            >
              {t('cancel')}
            </button>

            <button
              type="button"
              onClick={takePhoto}
              className="w-14 h-14 rounded-full border-4 border-white bg-emerald-600 hover:bg-emerald-500 shadow-xl flex items-center justify-center text-white active:scale-90 transition-transform"
              aria-label={t('capturePhoto')}
            >
              <div className="w-6 h-6 rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}

      {mode === 'preview' && capturedDataUrl && (
        <div className="space-y-3">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 shadow-md">
            <img
              src={capturedDataUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRetake}
              disabled={isUploading}
              className="flex-1 py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('retakePhoto')}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmPhoto}
              disabled={isUploading}
              className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50 active:scale-95"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('confirmPhoto')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
