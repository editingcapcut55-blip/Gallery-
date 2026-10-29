import React from 'react';
import {
  Type,
  Plus,
  Trash2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
} from 'lucide-react';
import { TextLayer } from '../../types/gallery';

interface Props {
  layers: TextLayer[];
  activeLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onAddLayer: () => void;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  onDeleteLayer: (id: string) => void;
}

export const TextPanel: React.FC<Props> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onUpdateLayer,
  onDeleteLayer,
}) => {
  const activeLayer = layers.find(l => l.id === activeLayerId);

  const fonts = [
    { name: 'Roboto', font: 'Roboto, sans-serif' },
    { name: 'Inter', font: 'Inter, sans-serif' },
    { name: 'Playfair', font: '"Playfair Display", serif' },
    { name: 'Cinzel', font: 'Cinzel, serif' },
    { name: 'Bebas Neue', font: '"Bebas Neue", sans-serif' },
    { name: 'Montserrat', font: 'Montserrat, sans-serif' },
    { name: 'Caveat (Hand)', font: 'Caveat, cursive' },
    { name: 'Pacifico', font: 'Pacifico, cursive' },
    { name: 'JetBrains', font: '"JetBrains Mono", monospace' },
  ];

  const colors = ['#ffffff', '#000000', '#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#06b6d4', '#8b5cf6'];

  return (
    <div className="space-y-3 py-2 px-1 max-h-56 sm:max-h-64 overflow-y-auto">
      {/* Header and Add Layer */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Text Overlays ({layers.length})
        </span>
        <button
          onClick={onAddLayer}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 active:scale-95"
          aria-label="Add text layer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Text</span>
        </button>
      </div>

      {/* Layer selector pills if multiple */}
      {layers.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {layers.map((layer, idx) => (
            <button
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium truncate max-w-[120px] transition-all ${
                activeLayerId === layer.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {layer.text || `Text ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Active Layer Editor */}
      {activeLayer ? (
        <div className="space-y-3 text-xs pt-1">
          {/* Text Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={activeLayer.text}
              onChange={e => onUpdateLayer(activeLayer.id, { text: e.target.value })}
              placeholder="Enter photo caption or text..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs outline-none focus:border-emerald-500"
              aria-label="Edit text content"
            />
            <button
              onClick={() => onDeleteLayer(activeLayer.id)}
              className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
              title="Delete text layer"
              aria-label="Delete text layer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Font Picker */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
              Typography Font
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {fonts.map(f => (
                <button
                  key={f.name}
                  onClick={() => onUpdateLayer(activeLayer.id, { font: f.font })}
                  style={{ fontFamily: f.font }}
                  className={`px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap transition-colors ${
                    activeLayer.font === f.font
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size & Letter Spacing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-400">Size</span>
                <span className="font-mono text-neutral-300">{activeLayer.size}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="96"
                value={activeLayer.size}
                onChange={e => onUpdateLayer(activeLayer.id, { size: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Font size"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-400">Spacing</span>
                <span className="font-mono text-neutral-300">{activeLayer.letterSpacing}px</span>
              </div>
              <input
                type="range"
                min="-2"
                max="10"
                value={activeLayer.letterSpacing}
                onChange={e =>
                  onUpdateLayer(activeLayer.id, { letterSpacing: parseInt(e.target.value) })
                }
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Letter spacing"
              />
            </div>
          </div>

          {/* Text Style Controls (Bold, Italic, Align, Pill BG, Stroke, Shadow) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onUpdateLayer(activeLayer.id, { bold: !activeLayer.bold })}
              className={`p-1.5 rounded-lg border ${
                activeLayer.bold
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400'
              }`}
              title="Bold"
              aria-label="Bold text"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              onClick={() => onUpdateLayer(activeLayer.id, { italic: !activeLayer.italic })}
              className={`p-1.5 rounded-lg border ${
                activeLayer.italic
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400'
              }`}
              title="Italic"
              aria-label="Italic text"
            >
              <Italic className="w-4 h-4" />
            </button>

            <button
              onClick={() => onUpdateLayer(activeLayer.id, { align: 'left' })}
              className={`p-1.5 rounded-lg border ${
                activeLayer.align === 'left'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400'
              }`}
              aria-label="Align left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateLayer(activeLayer.id, { align: 'center' })}
              className={`p-1.5 rounded-lg border ${
                activeLayer.align === 'center'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400'
              }`}
              aria-label="Align center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateLayer(activeLayer.id, { align: 'right' })}
              className={`p-1.5 rounded-lg border ${
                activeLayer.align === 'right'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400'
              }`}
              aria-label="Align right"
            >
              <AlignRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onUpdateLayer(activeLayer.id, { hasBg: !activeLayer.hasBg })}
              className={`px-2 py-1 rounded-lg border text-[11px] font-medium ${
                activeLayer.hasBg
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400'
              }`}
              aria-label="Toggle background pill"
            >
              Pill BG
            </button>

            <button
              onClick={() => onUpdateLayer(activeLayer.id, { shadow: !activeLayer.shadow })}
              className={`px-2 py-1 rounded-lg border text-[11px] font-medium ${
                activeLayer.shadow
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400'
              }`}
              aria-label="Toggle text shadow"
            >
              Shadow
            </button>
          </div>

          {/* Color palette */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-neutral-400">Color:</span>
            <div className="flex items-center gap-1.5">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => onUpdateLayer(activeLayer.id, { color: c })}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    activeLayer.color === c ? 'border-white scale-110 shadow' : 'border-transparent'
                  }`}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-neutral-500">
          Click "Add Text" to place captions, watermarks, or typography on this photo.
        </div>
      )}
    </div>
  );
};
