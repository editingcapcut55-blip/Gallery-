import React from 'react';
import { Sparkles, Sun, Eye, Film, RotateCcw } from 'lucide-react';
import { Effects } from '../../types/gallery';
import { DEFAULT_EFFECTS } from '../../utils/editorLogic';

interface Props {
  effects: Effects;
  onChange: (updates: Partial<Effects>) => void;
  onReset: () => void;
}

export const EffectsPanel: React.FC<Props> = ({ effects, onChange, onReset }) => {
  const duotoneOptions: Array<{ id: string | null; label: string; preview: string }> = [
    { id: null, label: 'None', preview: 'bg-neutral-800' },
    { id: 'cyber', label: 'Cyberpunk', preview: 'bg-gradient-to-r from-fuchsia-600 to-cyan-500' },
    { id: 'sunset', label: 'Sunset Glow', preview: 'bg-gradient-to-r from-amber-500 to-rose-600' },
    { id: 'matrix', label: 'Emerald Matrix', preview: 'bg-gradient-to-r from-emerald-600 to-lime-500' },
    { id: 'noir_blue', label: 'Midnight Blue', preview: 'bg-gradient-to-r from-slate-900 to-blue-500' },
  ];

  return (
    <div className="space-y-4 py-2 px-1 max-h-56 sm:max-h-64 overflow-y-auto">
      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Atmosphere & Visual Effects
        </span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
          aria-label="Reset effects"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Glow / Bloom */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Glow / Bloom</span>
            </span>
            <span className="font-mono text-[11px] text-neutral-400">{effects.glow}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={effects.glow}
            onChange={e => onChange({ glow: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Glow"
          />
        </div>

        {/* Film Grain */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Film className="w-3.5 h-3.5 text-neutral-400" />
              <span>Vintage Film Grain</span>
            </span>
            <span className="font-mono text-[11px] text-neutral-400">{effects.filmGrain}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={effects.filmGrain}
            onChange={e => onChange({ filmGrain: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Film Grain"
          />
        </div>

        {/* Light Leak */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Sun className="w-3.5 h-3.5 text-orange-400" />
              <span>Light Leak Flare</span>
            </span>
            <span className="font-mono text-[11px] text-neutral-400">{effects.lightLeak}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={effects.lightLeak}
            onChange={e => onChange({ lightLeak: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Light Leak"
          />
        </div>

        {/* Fisheye / Lens Distortion */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lens Curvature (Fisheye)</span>
            </span>
            <span className="font-mono text-[11px] text-neutral-400">{effects.distortion}%</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={effects.distortion}
            onChange={e => onChange({ distortion: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Distortion"
          />
        </div>
      </div>

      {/* Duotone Presets */}
      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-2">
          Duotone Color Wash
        </label>
        <div className="grid grid-cols-5 gap-2">
          {duotoneOptions.map(opt => {
            const isSelected = effects.duotone === opt.id;
            return (
              <button
                key={opt.label}
                onClick={() => onChange({ duotone: opt.id })}
                className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg shadow-inner ${opt.preview}`} />
                <span className={`text-[10px] leading-tight ${isSelected ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
