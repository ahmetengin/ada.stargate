
import React, { useEffect, useRef, useState } from 'react';
import { X, ScanLine, CameraOff, UserSquare2, CreditCard, Focus, MoveDown } from 'lucide-react';

interface ScanResult { type: 'PASSPORT' | 'CARD'; data: any; }
interface PassportScannerProps { isOpen: boolean; onClose: () => void; onScanComplete: (result: ScanResult) => void; }

export const PassportScanner: React.FC<PassportScannerProps> = ({ isOpen, onClose, onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing...');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'PASSPORT' | 'CARD'>('PASSPORT');
  const [focusDistance, setFocusDistance] = useState(50);

  useEffect(() => {
    if (isOpen) { setError(null); startCamera(); } else { stopCamera(); }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setScanning(true);
      let p = 0;
      const interval = setInterval(() => {
        p += 2; setProgress(p); setFocusDistance(Math.max(10, 50 - p/2));
        if (p < 40) setStatusText("Fiziksel Odaklanma..."); else if (p < 80) setStatusText("MRZ Verisi Okunuyor..."); else setStatusText("Doğrulanıyor...");
        if (p >= 100) {
          clearInterval(interval);
          onScanComplete({ type: mode, data: { name: "AHMET ENGIN", id: "U12345678" } });
        }
      }, 50);
    } catch (err) { setError("Kamera erişimi reddedildi."); setScanning(false); }
  };

  const stopCamera = () => { stream?.getTracks().forEach(t => t.stop()); setStream(null); setScanning(false); setProgress(0); };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col font-mono text-white">
      <div className="p-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2"><ScanLine className="text-emerald-500" /><span className="text-sm font-bold uppercase">Ada Identity Scanner</span></div>
        <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full"><X size={20}/></button>
      </div>
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {error ? <div className="text-center p-8 border border-red-500/50 rounded-xl bg-red-500/10"><CameraOff className="mx-auto mb-4 text-red-500"/><p>{error}</p></div> : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="relative w-72 h-48 border-2 border-emerald-500/50 rounded-xl flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
              <div className="text-[10px] uppercase font-bold text-emerald-500">{mode} HİZALAYIN</div>
              <div className="absolute top-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981] animate-bounce"></div>
            </div>
          </>
        )}
      </div>
      <div className="p-8 bg-zinc-900 border-t border-white/10">
          <div className="flex justify-between text-[10px] mb-2 font-bold text-zinc-500"><span>SCANNING CONFIDENCE</span><span>{progress}%</span></div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${progress}%` }}></div></div>
      </div>
    </div>
  );
};
