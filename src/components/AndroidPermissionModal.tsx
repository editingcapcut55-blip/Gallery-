import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  HardDrive,
  Lock,
  Smartphone,
  CheckCircle2,
  X,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { formatBytes } from '../utils/mediaFilters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  totalMediaBytes: number;
  totalMediaCount: number;
}

export const AndroidPermissionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  totalMediaBytes,
  totalMediaCount,
}) => {
  const [deviceStorageEstimate, setDeviceStorageEstimate] = useState<{
    quota: number;
    usage: number;
  } | null>(null);

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(est => {
        if (est.quota && est.usage) {
          setDeviceStorageEstimate({ quota: est.quota, usage: est.usage });
        }
      });
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Android MediaStore & Privacy</h2>
              <p className="text-[11px] text-neutral-400">Offline-First Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Storage Meter */}
          <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Device Storage Allocation</span>
              </span>
              <span className="font-mono text-emerald-400 font-semibold">
                {formatBytes(totalMediaBytes)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {totalMediaCount} photos and videos cached offline on device IndexedDB.
            </p>
            {deviceStorageEstimate && (
              <div className="pt-1">
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (deviceStorageEstimate.usage / deviceStorageEstimate.quota) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <span>Used: {formatBytes(deviceStorageEstimate.usage)}</span>
                  <span>Quota: {formatBytes(deviceStorageEstimate.quota)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Android Scoped Storage Guidelines */}
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Android Platform Compliance
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-neutral-200">
                    Scoped Storage & MediaStore (Android 10 - 15)
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                    Lumina Gallery uses Android's modern Scoped Storage sandbox. It requests access strictly to media files (images and videos) via MediaStore and HTML5 file pickers without accessing your private documents or system directories.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-neutral-200">100% Offline-First (No Cloud Upload)</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                    Your photos and videos are rendered and edited completely on your device with hardware-accelerated Canvas 2D and IndexedDB. No images are sent to any remote server.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-neutral-200">
                    Minimum Supported Version: Android 7.0 (API 24)
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                    Supports Android 7.0 (Nougat) through modern Android 14/15 with runtime media permission separation (READ_MEDIA_IMAGES and READ_MEDIA_VIDEO).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
