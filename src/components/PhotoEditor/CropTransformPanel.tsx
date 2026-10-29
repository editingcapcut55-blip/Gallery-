import React from 'react';
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  Square,
  Smartphone,
  Tv,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { TransformState } from '../../types/gallery';

interface Props {
  transform: TransformState;
  onChange: (updates: Partial<TransformState>) => void;
  onReset: () => void;
}

export const CropTransformPanel: React.FC<Props> = ({ transform, onChange, onReset }) => {
  const aspectRatios: Array<{
    id: TransformState['cropAspect'];
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'free', label: 'Free', icon: <Maximize className="w-3.5 h-3.5" /> },
    { id: '1:1', label: '1:1 Sq', icon: <Square className="w-3.5 h-3.5" /> },
    { id: '4:5', label: '4:5 Post', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: '9:16', label: '9:16 Story', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: '16:9', label: '16:9 Wide', icon: <Tv className="w-3.5 h-3.5" /> },
    { id: '4:3', label: '4:3', icon: <Tv className="w-3.5 h-3.5" /> },
    { id: '3:2', label: '3:2 Photo', icon: <Tv className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4 py-2 px-1 max-h-56 sm:max-h-64 overflow-y-auto">
      {/* Top transform actions */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Crop, Rotate & Straighten
        </span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
          aria-label="Reset transform"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Aspect Ratio Presets */}
      <div>
        <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
          Aspect Ratio Crop
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {aspectRatios.map(item => {
            const isSelected = transform.cropAspect === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange({ cropAspect: item.id })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rotation & Flip Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onChange({ rotation: (transform.rotation + 90) % 360 })}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-200"
          aria-label="Rotate 90 degrees"
        >
          <RotateCw className="w-4 h-4 text-emerald-400" />
          <span>Rotate 90° ({transform.rotation}°)</span>
        </button>

        <button
          onClick={() => onChange({ flipH: !transform.flipH })}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
            transform.flipH
              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
              : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200'
          }`}
          aria-label="Flip horizontal"
        >
          <FlipHorizontal className="w-4 h-4" />
          <span>Flip H</span>
        </button>

        <button
          onClick={() => onChange({ flipV: !transform.flipV })}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
            transform.flipV
              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
              : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200'
          }`}
          aria-label="Flip vertical"
        >
          <FlipVertical className="w-4 h-4" />
          <span>Flip V</span>
        </button>
      </div>

      {/* Fine Angle Straighten */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fine Straighten Angle</span>
          </span>
          <span className="font-mono text-[11px] text-emerald-400">{transform.fineAngle}°</span>
        </div>
        <input
          type="range"
          min="-45"
          max="45"
          step="0.5"
          value={transform.fineAngle}
          onChange={e => onChange({ fineAngle: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          aria-label="Straighten angle"
        />
      </div>

      {/* Perspective Skew Correction */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Perspective X</span>
            <span className="text-[11px] font-mono text-neutral-400">{transform.perspectiveX}</span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            value={transform.perspectiveX}
            onChange={e => onChange({ perspectiveX: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Perspective X"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Perspective Y</span>
            <span className="text-[11px] font-mono text-neutral-400">{transform.perspectiveY}</span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            value={transform.perspectiveY}
            onChange={e => onChange({ perspectiveY: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Perspective Y"
          />
        </div>
      </div>
    </div>
  );
};
