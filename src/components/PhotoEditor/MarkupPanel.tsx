import React from 'react';
import {
  Paintbrush,
  Eraser,
  Highlighter,
  ArrowUpRight,
  Square,
  Circle,
  Minus,
  Trash2,
} from 'lucide-react';
import { MarkupTool } from '../../types/gallery';

interface Props {
  activeTool: MarkupTool;
  color: string;
  size: number;
  opacity: number;
  pathCount: number;
  onToolChange: (tool: MarkupTool) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onOpacityChange: (opacity: number) => void;
  onClearPaths: () => void;
}

export const MarkupPanel: React.FC<Props> = ({
  activeTool,
  color,
  size,
  opacity,
  pathCount,
  onToolChange,
  onColorChange,
  onSizeChange,
  onOpacityChange,
  onClearPaths,
}) => {
  const tools: Array<{ id: MarkupTool; label: string; icon: React.ReactNode }> = [
    { id: 'brush', label: 'Brush', icon: <Paintbrush className="w-3.5 h-3.5" /> },
    { id: 'marker', label: 'Marker', icon: <Highlighter className="w-3.5 h-3.5" /> },
    { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-3.5 h-3.5" /> },
    { id: 'arrow', label: 'Arrow', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
    { id: 'line', label: 'Line', icon: <Minus className="w-3.5 h-3.5" /> },
    { id: 'rect', label: 'Box', icon: <Square className="w-3.5 h-3.5" /> },
    { id: 'circle', label: 'Circle', icon: <Circle className="w-3.5 h-3.5" /> },
  ];

  const colors = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#10b981',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ffffff',
    '#000000',
  ];

  return (
    <div className="space-y-3 py-2 px-1 max-h-56 sm:max-h-64 overflow-y-auto">
      {/* Tools Row */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Draw & Markup ({pathCount} strokes)
        </span>
        {pathCount > 0 && (
          <button
            onClick={onClearPaths}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
            aria-label="Clear all drawings"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Drawing</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {tools.map(t => {
          const isSelected = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onToolChange(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Brush Size & Opacity */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Stroke Size</span>
            <span className="font-mono text-neutral-300">{size}px</span>
          </div>
          <input
            type="range"
            min="2"
            max="60"
            value={size}
            onChange={e => onSizeChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Brush size"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">Opacity</span>
            <span className="font-mono text-neutral-300">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={e => onOpacityChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Brush opacity"
          />
        </div>
      </div>

      {/* Color Swatches */}
      {activeTool !== 'eraser' && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] text-neutral-400">Color:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? 'border-white scale-110 shadow' : 'border-transparent'
                }`}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
