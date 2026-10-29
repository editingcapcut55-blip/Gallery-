import React, { useState } from 'react';
import { FilterCategory, FilterPreset } from '../../types/gallery';
import { FILTER_PRESETS } from '../../utils/editorLogic';

interface Props {
  activeFilterId: string;
  intensity: number;
  sampleImageUrl: string;
  onSelectFilter: (id: string) => void;
  onIntensityChange: (intensity: number) => void;
}

export const FiltersPanel: React.FC<Props> = ({
  activeFilterId,
  intensity,
  sampleImageUrl,
  onSelectFilter,
  onIntensityChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory | 'all'>('all');

  const categories: Array<{ id: FilterCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'natural', label: 'Natural' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'bw', label: 'B & W' },
    { id: 'aesthetic', label: 'Aesthetic' },
    { id: 'portrait', label: 'Portrait' },
    { id: 'social', label: 'Social' },
  ];

  const filteredPresets =
    selectedCategory === 'all'
      ? FILTER_PRESETS
      : FILTER_PRESETS.filter(p => p.id === 'none' || p.category === selectedCategory);

  return (
    <div className="space-y-3 py-2 px-1">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Preset Scroll Row */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
        {filteredPresets.map(preset => {
          const isSelected = activeFilterId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectFilter(preset.id)}
              className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                  : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800'
              }`}
              aria-label={`Apply filter ${preset.name}`}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-950 relative shadow-sm">
                <img
                  src={sampleImageUrl}
                  alt={preset.name}
                  style={{
                    filter: preset.cssFilter !== 'none' ? preset.cssFilter : undefined,
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`text-[11px] font-medium leading-none ${isSelected ? 'text-emerald-400 font-semibold' : 'text-neutral-300'}`}>
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Intensity Slider (when active filter isn't 'none') */}
      {activeFilterId !== 'none' && (
        <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-3">
          <span className="text-xs text-neutral-400 whitespace-nowrap">Filter Intensity</span>
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={e => onIntensityChange(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Filter Intensity"
          />
          <span className="text-xs font-mono font-semibold text-emerald-400 min-w-[36px] text-right">
            {intensity}%
          </span>
        </div>
      )}
    </div>
  );
};
