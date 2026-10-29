import React from 'react';
import {
  X,
  Palette,
  Sliders,
  Grid,
  Square,
  Sparkles,
  RotateCcw,
  Check,
  Smartphone,
  Eye,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import {
  AccentColor,
  AlbumFrameShape,
  BackgroundStyle,
  GallerySettings,
  GridLayout,
  ThemeMode,
} from '../types/gallery';
import { ACCENT_COLORS } from '../utils/themeHelper';
import { DEFAULT_GALLERY_SETTINGS } from '../services/initialMedia';

interface Props {
  settings: GallerySettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (updates: Partial<GallerySettings>) => void;
  onResetAppearance: () => void;
  onResetAll: () => void;
}

export const CustomizationModal: React.FC<Props> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
  onResetAppearance,
  onResetAll,
}) => {
  if (!isOpen) return null;

  const currentAccent = ACCENT_COLORS[settings.accent] || ACCENT_COLORS.emerald;

  const themes: Array<{ id: ThemeMode; label: string; desc: string; preview: string }> = [
    {
      id: 'amoled',
      label: 'AMOLED Black',
      desc: 'True #000000 pitch black for OLED battery saving & high contrast',
      preview: 'bg-black border-neutral-800 text-white',
    },
    {
      id: 'dark',
      label: 'Slate Dark',
      desc: 'Modern deep slate blue for low-light browsing',
      preview: 'bg-slate-950 border-slate-800 text-slate-100',
    },
    {
      id: 'light',
      label: 'Clean Light',
      desc: 'Crisp bright daylight theme with clear borders',
      preview: 'bg-white border-neutral-300 text-neutral-900',
    },
  ];

  const backgroundStyles: Array<{ id: BackgroundStyle; label: string }> = [
    { id: 'pure', label: 'Solid Pure' },
    { id: 'subtle', label: 'Soft Tint' },
    { id: 'glass', label: 'Frosted Glass' },
  ];

  const layoutModes: Array<{ id: GridLayout; label: string }> = [
    { id: 'grid', label: 'Standard Grid' },
    { id: 'masonry', label: 'Adaptive' },
    { id: 'list', label: 'List View' },
  ];

  const cardShapes: Array<{ id: GallerySettings['cardShape']; label: string }> = [
    { id: 'rounded', label: 'Smooth Rounded' },
    { id: 'squircle', label: 'Android Squircle' },
    { id: 'square', label: 'Sharp Square' },
  ];

  const albumShapes: AlbumFrameShape[] = ['squircle', 'rounded', 'circle', 'leaf', 'badge'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white shadow-md ${currentAccent.bg}`}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Gallery Personalization</h2>
              <p className="text-[11px] text-neutral-400">Extreme UI & Theme Customization</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
            aria-label="Close customization"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Section 1: Themes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Theme & Palette
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {themes.map(t => {
                const isSelected = settings.theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onUpdateSettings({ theme: t.id })}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-neutral-900 shadow-md'
                        : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="font-semibold text-white">{t.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-tight mb-2.5">{t.desc}</p>
                    <div className={`w-full h-4 rounded-md border ${t.preview}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Accent Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              System Accent Color
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {Object.entries(ACCENT_COLORS).map(([key, item]) => {
                const isSelected = settings.accent === key;
                return (
                  <button
                    key={key}
                    onClick={() => onUpdateSettings({ accent: key as AccentColor })}
                    className="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-neutral-900 transition-colors"
                    aria-label={`Select ${item.name}`}
                  >
                    <div
                      style={{ backgroundColor: item.hex }}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform ${
                        isSelected ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <span className="text-[9px] text-neutral-400 truncate w-full text-center">
                      {item.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Background Texture Style */}
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Background Style
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {backgroundStyles.map(b => (
                <button
                  key={b.id}
                  onClick={() => onUpdateSettings({ backgroundStyle: b.id })}
                  className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                    settings.backgroundStyle === b.id
                      ? `${currentAccent.bg} text-white border-transparent shadow`
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Photo Grid Columns & Layout */}
          <div className="space-y-3 pt-2 border-t border-neutral-900">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Photo Grid & Layout
            </h3>

            {/* Layout switch */}
            <div className="grid grid-cols-3 gap-2">
              {layoutModes.map(m => (
                <button
                  key={m.id}
                  onClick={() => onUpdateSettings({ layout: m.id })}
                  className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                    settings.layout === m.id
                      ? `${currentAccent.bg} text-white border-transparent shadow`
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Columns Slider (2 - 6) */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-400">Number of Columns</span>
                <span className="font-mono text-emerald-400 font-semibold">{settings.columns} Columns</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={settings.columns}
                onChange={e => onUpdateSettings({ columns: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Grid columns"
              />
            </div>

            {/* Grid Spacing Slider (0 - 16px) */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-400">Grid Spacing</span>
                <span className="font-mono text-emerald-400 font-semibold">{settings.gridSpacing}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                step="2"
                value={settings.gridSpacing}
                onChange={e => onUpdateSettings({ gridSpacing: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Grid spacing"
              />
            </div>
          </div>

          {/* Section 5: Media Card Corners & Shapes */}
          <div className="space-y-3 pt-2 border-t border-neutral-900">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Media Cards & Badges
            </h3>

            {/* Shape selection */}
            <div className="grid grid-cols-3 gap-2">
              {cardShapes.map(s => (
                <button
                  key={s.id}
                  onClick={() => onUpdateSettings({ cardShape: s.id })}
                  className={`py-2 px-2.5 rounded-xl border text-center font-medium transition-all ${
                    settings.cardShape === s.id
                      ? `${currentAccent.bg} text-white border-transparent shadow`
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Corner Radius Slider (0 - 24px) */}
            {settings.cardShape !== 'square' && (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Corner Radius</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {settings.cornerRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="2"
                  value={settings.cornerRadius}
                  onChange={e => onUpdateSettings({ cornerRadius: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  aria-label="Corner radius"
                />
              </div>
            )}

            {/* Toggles: Borders, Shadows, Badges, Date Headers */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cardBorder}
                  onChange={e => onUpdateSettings({ cardBorder: e.target.checked })}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
                <span className="text-neutral-300">Card Borders</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cardShadow}
                  onChange={e => onUpdateSettings({ cardShadow: e.target.checked })}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
                <span className="text-neutral-300">Card Shadows</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showMetadataBadges}
                  onChange={e => onUpdateSettings({ showMetadataBadges: e.target.checked })}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
                <span className="text-neutral-300">Metadata Badges</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showDateHeaders}
                  onChange={e => onUpdateSettings({ showDateHeaders: e.target.checked })}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
                <span className="text-neutral-300">Date Headers</span>
              </label>
            </div>
          </div>

          {/* Section 6: Album Customization Defaults */}
          <div className="space-y-3 pt-2 border-t border-neutral-900">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Album Icon Frames
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {albumShapes.map(sh => (
                <button
                  key={sh}
                  onClick={() => onUpdateSettings({ albumFrameShape: sh })}
                  className={`py-2 px-1 rounded-xl border text-center capitalize transition-all ${
                    settings.albumFrameShape === sh
                      ? `${currentAccent.bg} text-white border-transparent shadow`
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                  }`}
                >
                  {sh}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Buttons */}
          <div className="pt-4 border-t border-neutral-900 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (confirm('Reset gallery appearance settings to defaults?')) {
                  onResetAppearance();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Appearance</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset all gallery data, albums, and appearance?')) {
                  onResetAll();
                }
              }}
              className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs transition-colors"
            >
              Reset All Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl text-xs font-semibold text-white shadow-md active:scale-95 transition-transform ${currentAccent.bg}`}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
