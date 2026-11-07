import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, Trash2, AlertCircle, Video, ShieldAlert, SwitchCamera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface CameraCaptureProps {
  onImagesChange: (imageUrls: string[]) => void;
  initialImages?: string[];
  maxPhotos?: number;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onImagesChange,
  initialImages = [],
  maxPhotos = 5,
}) => {
  const { t } = useLanguage();
  const { token } = useAuth();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [capturedImages, setCapturedImages] = useState<string[]>(initialImages);

  const isSecure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Stop camera helper
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Start camera with getUserMedia
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setErrorMsg(null);
    setCapturedDataUrl(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('getUserMedia API is not supported on this browser.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) => console.error('Video play error:', err));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg(t.cameraPermissionError);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera device found on your device.');
      } else {
        // Fallback to basic video constraint without facingMode
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          setIsCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play();
          }
        } catch (fallbackErr: any) {
          setErrorMsg(fallbackErr.message || t.cameraPermissionError);
        }
      }
    }
  };

  // Switch between front and rear cameras
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Snap photo from video onto hidden canvas
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    // Export as high-quality JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedDataUrl(dataUrl);

    // Pause video to show still
    video.pause();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedDataUrl(null);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // Confirm photo and upload to backend storage
  const handleConfirm = async () => {
    if (!capturedDataUrl) return;

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/upload/camera-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageBase64: capturedDataUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo');
      }

      const updated = [...capturedImages, data.imageUrl];
      setCapturedImages(updated);
      onImagesChange(updated);

      setCapturedDataUrl(null);

      // If reached maximum photos, stop camera
      if (updated.length >= maxPhotos) {
        stopCamera();
      } else {
        if (videoRef.current) {
          videoRef.current.play();
        }
      }
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setErrorMsg(err.message || 'Failed to save photo');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove photo from list
  const handleRemoveImage = (indexToRemove: number) => {
    const updated = capturedImages.filter((_, idx) => idx !== indexToRemove);
    setCapturedImages(updated);
    onImagesChange(updated);
  };

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="bg-stone-50 text-stone-900 rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-stone-900 text-base">{t.cameraTitle}</h4>
          </div>
          <p className="text-xs text-stone-500 mt-1">{t.cameraSubtitle}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {capturedImages.length} / {maxPhotos} {t.photosCaptured}
          </span>
        </div>
      </div>

      {/* Security notice */}
      {!isSecure && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{t.cameraSecureContextNotice}</span>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-900">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Camera Viewfinder Area */}
      <div className="relative aspect-4/3 w-full max-w-lg mx-auto bg-stone-950 rounded-2xl overflow-hidden border border-stone-300 flex items-center justify-center shadow-inner">
        {/* Hidden Canvas for capture rendering */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live Video Feed */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover ${capturedDataUrl ? 'hidden' : 'block'}`}
        />

        {/* Captured Freeze-Frame Preview */}
        {capturedDataUrl && (
          <img
            src={capturedDataUrl}
            alt="Captured photo preview"
            className="w-full h-full object-cover"
          />
        )}

        {/* Idle overlay when camera is off */}
        {!isCameraActive && !capturedDataUrl && (
          <div className="text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-300">
              <Video className="w-8 h-8" />
            </div>
            <p className="text-xs text-stone-400 max-w-xs mx-auto">
              {t.cameraRequiredNotice}
            </p>
            <button
              type="button"
              onClick={() => startCamera()}
              disabled={capturedImages.length >= maxPhotos}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 mx-auto shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              {t.startCamera}
            </button>
          </div>
        )}

        {/* Live Controls Overlay */}
        {isCameraActive && !capturedDataUrl && (
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-4 px-4">
            <button
              type="button"
              onClick={toggleFacingMode}
              title={t.switchCamera}
              className="p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-200 backdrop-blur-md border border-stone-700 transition"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleCapture}
              className="w-14 h-14 rounded-full bg-white hover:bg-stone-200 border-4 border-stone-900 flex items-center justify-center shadow-2xl transition active:scale-90"
              title={t.capturePhoto}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 border border-white" />
            </button>

            <button
              type="button"
              onClick={stopCamera}
              className="px-3.5 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 text-xs backdrop-blur-md border border-stone-700 font-semibold"
            >
              {t.cancel}
            </button>
          </div>
        )}

        {/* Captured Preview Decision Controls */}
        {capturedDataUrl && (
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 px-4">
            <button
              type="button"
              onClick={handleRetake}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-stone-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              {t.retakePhoto}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition active:scale-95 disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t.loading}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t.confirmPhoto}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Captured Photos Gallery preview */}
      {capturedImages.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-stone-200">
          <div className="text-xs text-stone-600 font-bold">{t.photosCaptured}:</div>
          <div className="grid grid-cols-5 gap-2.5">
            {capturedImages.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-stone-300 group bg-stone-100 shadow-2xs"
              >
                <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute inset-0 bg-red-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4 text-red-300" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
