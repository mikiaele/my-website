import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
  title?: string;
  idealFacingMode?: 'user' | 'environment';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  title,
  idealFacingMode = 'environment',
}) => {
  const { t } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(idealFacingMode);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Check available video devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Initialize camera stream
  const startCamera = async (mode: 'user' | 'environment') => {
    setIsLoading(true);
    setError(null);

    // Stop existing stream if running
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(t.cameraNotFound);
      setIsLoading(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
      setIsLoading(false);
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(t.cameraAccessDenied);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError(t.cameraNotFound);
      } else {
        // Try fallback without strict facingMode
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play().catch(() => {});
          }
          setIsLoading(false);
          return;
        } catch {
          setError(t.cameraStartError + ' ' + (err.message || ''));
        }
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Capture snapshot from video feed
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Use video native aspect ratio
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Mirror image if front camera is used for selfie/profile
    if (facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);

    // Stop stream during preview to save battery
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const toggleCameraDirection = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Fallback to local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCapturedImage(result);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-700" />
            <h3 className="font-semibold text-slate-800 text-sm md:text-base">
              {title || t.cameraTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            title={t.closeCamera}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Preview */}
        <div className="relative bg-slate-950 aspect-4/3 flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {error ? (
                <div className="p-6 text-center text-white max-w-sm">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-200 mb-4">{error}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    {t.orUploadFile}
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-white text-sm">
                      <RefreshCw className="w-6 h-6 animate-spin mr-2 text-emerald-400" />
                      Loading camera...
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Hidden canvas for snapshot rendering */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          {capturedImage ? (
            <div className="flex w-full items-center justify-between gap-3">
              <button
                type="button"
                onClick={retakePhoto}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                {t.retake}
              </button>
              <button
                type="button"
                onClick={confirmPhoto}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {t.usePhoto}
              </button>
            </div>
          ) : (
            <>
              {/* Fallback to upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                title={t.orUploadFile}
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">{t.orUploadFile}</span>
              </button>

              {/* Shutter Capture Button */}
              {!error && (
                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={isLoading}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition-all mx-auto cursor-pointer border-4 border-emerald-100"
                  title={t.capturePhoto}
                >
                  <Camera className="w-6 h-6" />
                </button>
              )}

              {/* Camera Switcher (front/back) */}
              {(hasMultipleCameras || facingMode) && !error ? (
                <button
                  type="button"
                  onClick={toggleCameraDirection}
                  className="p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  title={t.switchCamera}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.switchCamera}</span>
                </button>
              ) : (
                <div className="w-10" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
