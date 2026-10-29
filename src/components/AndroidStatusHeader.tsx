import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Sparkles } from 'lucide-react';
import { GallerySettings } from '../types/gallery';

interface Props {
  settings: GallerySettings;
}

export const AndroidStatusHeader: React.FC<Props> = ({ settings }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isLight = settings.theme === 'light';

  return (
    <header className={`w-full px-4 pt-1.5 pb-1 flex items-center justify-between text-xs select-none ${
      isLight ? 'text-neutral-700' : 'text-neutral-400'
    }`}>
      <div className="flex items-center gap-1.5 font-medium tracking-tight">
        <span>{timeStr || '10:00'}</span>
        <span className="text-[10px] opacity-75 hidden sm:inline">| Android API 34</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
          <span>Offline Ready</span>
        </span>
        <Wifi className="w-3.5 h-3.5 opacity-90" aria-label="Connected" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px]">98%</span>
          <Battery className="w-3.5 h-3.5 opacity-90 fill-current" aria-label="Battery 98%" />
        </div>
      </div>
    </header>
  );
};
