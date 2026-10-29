import React from 'react';
import {
  Sun,
  Contrast,
  Droplet,
  Gauge,
  Thermometer,
  Eye,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { Adjustments } from '../../types/gallery';

interface Props {
  adjustments: Adjustments;
  onChange: (updates: Partial<Adjustments>) => void;
  onReset: () => void;
}

export const AdjustmentsPanel: React.FC<Props> = ({ adjustments, onChange, onReset }) => {
  const sliders: Array<{
    key: keyof Adjustments;
    label: string;
    min: number;
    max: number;
    step: number;
    icon: React.ReactNode;
    unit?: string;
  }> = [
    { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, icon: <Sun className="w-3.5 h-3.5" /> },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, icon: <Contrast className="w-3.5 h-3.5" /> },
    { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, icon: <Droplet className="w-3.5 h-3.5" /> },
    { key: 'exposure', label: 'Exposure', min: -100, max: 100, step: 1, icon: <Gauge className="w-3.5 h-3.5" /> },
    { key: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1, icon: <Sun className="w-3.5 h-3.5" /> },
    { key: 'shadows', label: 'Shadows', min: -100, max: 100, step: 1, icon: <Contrast className="w-3.5 h-3.5" /> },
    { key: 'temperature', label: 'Warmth / Temp', min: -100, max: 100, step: 1, icon: <Thermometer className="w-3.5 h-3.5" /> },
    { key: 'tint', label: 'Tint (Green/Pink)', min: -100, max: 100, step: 1, icon: <Sliders className="w-3.5 h-3.5" /> },
    { key: 'sharpness', label: 'Sharpness', min: 0, max: 100, step: 1, icon: <Eye className="w-3.5 h-3.5" /> },
    { key: 'blur', label: 'Blur Soften', min: 0, max: 40, step: 1, icon: <Eye className="w-3.5 h-3.5" />, unit: 'px' },
    { key: 'vignette', label: 'Vignette', min: 0, max: 100, step: 1, icon: <Sun className="w-3.5 h-3.5" /> },
    { key: 'grain', label: 'Grain Texture', min: 0, max: 100, step: 1, icon: <Sliders className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-3 py-2 px-1 max-h-56 sm:max-h-64 overflow-y-auto">
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-neutral-800">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Photo Adjustments
        </span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
          aria-label="Reset adjustments"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
        {sliders.map(item => {
          const val = adjustments[item.key] as number;
          const isNonZero = val !== 0;

          return (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <span className="text-neutral-400">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <span
                  className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
                    isNonZero ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-neutral-500'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                  {item.unit || ''}
                </span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={val}
                onChange={e => onChange({ [item.key]: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label={item.label}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
