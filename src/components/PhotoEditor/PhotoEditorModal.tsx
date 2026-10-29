import React, { useState, useRef } from 'react';
import {
  X,
  Undo2,
  Redo2,
  Eye,
  RotateCcw,
  Check,
  Crop,
  Sliders,
  Palette,
  Sparkles,
  Type,
  Paintbrush,
  Download,
  Save,
  Loader2,
} from 'lucide-react';
import {
  DrawingPath,
  EditorState,
  GallerySettings,
  MarkupTool,
  MediaItem,
  TextLayer,
} from '../../types/gallery';
import {
  DEFAULT_ADJUSTMENTS,
  DEFAULT_EFFECTS,
  DEFAULT_TRANSFORM,
  HistoryManager,
  INITIAL_EDITOR_STATE,
} from '../../utils/editorLogic';
import { EditorCanvas, EditorCanvasHandle } from './EditorCanvas';
import { AdjustmentsPanel } from './AdjustmentsPanel';
import { FiltersPanel } from './FiltersPanel';
import { EffectsPanel } from './EffectsPanel';
import { CropTransformPanel } from './CropTransformPanel';
import { TextPanel } from './TextPanel';
import { MarkupPanel } from './MarkupPanel';
import { ACCENT_COLORS } from '../../utils/themeHelper';

interface Props {
  mediaItem: MediaItem;
  settings: GallerySettings;
  onClose: () => void;
  onSaveNew: (newItem: MediaItem) => void;
  onOverwrite: (updatedItem: MediaItem) => void;
}

type EditorTab = 'crop' | 'adjust' | 'filters' | 'effects' | 'text' | 'draw';

export const PhotoEditorModal: React.FC<Props> = ({
  mediaItem,
  settings,
  onClose,
  onSaveNew,
  onOverwrite,
}) => {
  const canvasRef = useRef<EditorCanvasHandle>(null);
  const accent = ACCENT_COLORS[settings.accent] || ACCENT_COLORS.emerald;

  // History Stack Manager
  const historyManagerRef = useRef(new HistoryManager<EditorState>({ ...INITIAL_EDITOR_STATE }));
  const [editorState, setEditorState] = useState<EditorState>({ ...INITIAL_EDITOR_STATE });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<EditorTab>('adjust');

  // Text Layer state
  const [activeTextId, setActiveTextId] = useState<string | null>(null);

  // Drawing state
  const [markupTool, setMarkupTool] = useState<MarkupTool>('brush');
  const [markupColor, setMarkupColor] = useState('#ef4444');
  const [markupSize, setMarkupSize] = useState(12);
  const [markupOpacity, setMarkupOpacity] = useState(1.0);

  // Comparison & Export Modal
  const [isComparing, setIsComparing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveMode, setSaveMode] = useState<'new' | 'overwrite'>('new');
  const [exportFormat, setExportFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [exportQuality, setExportQuality] = useState(0.92);
  const [isExporting, setIsExporting] = useState(false);

  // Helper to commit new state with undo history
  const updateState = (updater: (prev: EditorState) => EditorState, pushHistory = true) => {
    setEditorState(prev => {
      const next = updater(prev);
      if (pushHistory) {
        historyManagerRef.current.push(next);
        setCanUndo(historyManagerRef.current.canUndo);
        setCanRedo(historyManagerRef.current.canRedo);
      }
      return next;
    });
  };

  const handleUndo = () => {
    const prev = historyManagerRef.current.undo();
    if (prev) {
      setEditorState({ ...prev });
      setCanUndo(historyManagerRef.current.canUndo);
      setCanRedo(historyManagerRef.current.canRedo);
    }
  };

  const handleRedo = () => {
    const next = historyManagerRef.current.redo();
    if (next) {
      setEditorState({ ...next });
      setCanUndo(historyManagerRef.current.canUndo);
      setCanRedo(historyManagerRef.current.canRedo);
    }
  };

  const handleResetAll = () => {
    if (confirm('Reset all adjustments, filters, text and drawing on this image?')) {
      const fresh = { ...INITIAL_EDITOR_STATE };
      historyManagerRef.current.reset(fresh);
      setEditorState(fresh);
      setCanUndo(false);
      setCanRedo(false);
    }
  };

  // Text layer handlers
  const handleAddTextLayer = () => {
    const newLayer: TextLayer = {
      id: `text_${Date.now()}`,
      text: 'Add Caption',
      font: 'Inter, sans-serif',
      size: 36,
      color: '#ffffff',
      bold: true,
      italic: false,
      align: 'center',
      opacity: 1,
      hasBg: true,
      bgColor: 'rgba(0,0,0,0.7)',
      strokeColor: '#000000',
      strokeWidth: 0,
      shadow: true,
      letterSpacing: 1,
      x: 0.5,
      y: 0.5,
      rotation: 0,
    };
    updateState(prev => ({
      ...prev,
      textLayers: [...prev.textLayers, newLayer],
    }));
    setActiveTextId(newLayer.id);
  };

  const handleUpdateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    updateState(prev => ({
      ...prev,
      textLayers: prev.textLayers.map(l => (l.id === id ? { ...l, ...updates } : l)),
    }));
  };

  const handleDeleteTextLayer = (id: string) => {
    updateState(prev => ({
      ...prev,
      textLayers: prev.textLayers.filter(l => l.id !== id),
    }));
    if (activeTextId === id) setActiveTextId(null);
  };

  // Drawing markup handler
  const handleAddDrawingPath = (path: DrawingPath) => {
    updateState(prev => ({
      ...prev,
      drawingPaths: [...prev.drawingPaths, path],
    }));
  };

  // Export and Save Execution
  const handleConfirmSave = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      const blob = await canvasRef.current.exportToBlob(exportFormat, exportQuality);
      const newUrl = URL.createObjectURL(blob);
      const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';

      if (saveMode === 'overwrite') {
        const updated: MediaItem = {
          ...mediaItem,
          url: newUrl,
          thumbnailUrl: newUrl,
          size: blob.size,
          mimeType: exportFormat,
          dateModified: Date.now(),
        };
        onOverwrite(updated);
      } else {
        const rawName = mediaItem.name.replace(/\.[^/.]+$/, '');
        const newItem: MediaItem = {
          id: `edit_${Date.now()}`,
          name: `${rawName}_edited.${ext}`,
          type: 'image',
          url: newUrl,
          thumbnailUrl: newUrl,
          size: blob.size,
          width: mediaItem.width,
          height: mediaItem.height,
          mimeType: exportFormat,
          dateAdded: Date.now(),
          dateModified: Date.now(),
          isFavorite: false,
          albumId: mediaItem.albumId,
          metadata: {
            ...mediaItem.metadata,
            model: `${mediaItem.metadata.model || 'Android'} (Lumina Studio Edited)`,
          },
        };
        onSaveNew(newItem);
      }

      setIsExporting(false);
      setShowSaveDialog(false);
      onClose();
    } catch (e) {
      console.error('Export error', e);
      setIsExporting(false);
      alert('Could not export image. Please try again.');
    }
  };

  const tabs: Array<{ id: EditorTab; label: string; icon: React.ReactNode }> = [
    { id: 'adjust', label: 'Adjust', icon: <Sliders className="w-4 h-4" /> },
    { id: 'filters', label: 'Filters', icon: <Palette className="w-4 h-4" /> },
    { id: 'crop', label: 'Crop', icon: <Crop className="w-4 h-4" /> },
    { id: 'effects', label: 'Effects', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
    { id: 'draw', label: 'Markup', icon: <Paintbrush className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top Action Bar */}
      <div className="px-4 py-3 border-b border-neutral-900 bg-neutral-950 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
            aria-label="Cancel editing"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold truncate max-w-[140px] sm:max-w-xs">
            Edit {mediaItem.name}
          </span>
        </div>

        {/* Undo, Redo, Compare, Reset, Save */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo ? 'hover:bg-neutral-800 text-neutral-200' : 'text-neutral-600 opacity-40 cursor-not-allowed'
            }`}
            aria-label="Undo edit"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo ? 'hover:bg-neutral-800 text-neutral-200' : 'text-neutral-600 opacity-40 cursor-not-allowed'
            }`}
            aria-label="Redo edit"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Hold to Compare */}
          <button
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onMouseLeave={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors ${
              isComparing
                ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white'
            }`}
            title="Press and hold to compare with original photo"
            aria-label="Compare original"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleResetAll}
            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
            title="Reset All Edits"
            aria-label="Reset all edits"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save / Export Button */}
          <button
            onClick={() => setShowSaveDialog(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-md active:scale-95 transition-transform ${accent.bg}`}
            aria-label="Save photo edits"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <EditorCanvas
        ref={canvasRef}
        imageUrl={mediaItem.url}
        editorState={editorState}
        activeTab={activeTab}
        activeTextLayerId={activeTextId}
        markupTool={markupTool}
        markupColor={markupColor}
        markupSize={markupSize}
        markupOpacity={markupOpacity}
        isComparingOriginal={isComparing}
        onSelectTextLayer={setActiveTextId}
        onUpdateTextLayerPos={(id, x, y) => handleUpdateTextLayer(id, { x, y })}
        onAddDrawingPath={handleAddDrawingPath}
      />

      {/* Bottom Tool Panels & Tab Navigation */}
      <div className="z-20 bg-neutral-950 border-t border-neutral-900">
        {/* Dynamic Tool Content */}
        <div className="max-w-2xl mx-auto px-4 pt-1">
          {activeTab === 'adjust' && (
            <AdjustmentsPanel
              adjustments={editorState.adjustments}
              onChange={updates =>
                updateState(prev => ({
                  ...prev,
                  adjustments: { ...prev.adjustments, ...updates },
                }))
              }
              onReset={() =>
                updateState(prev => ({
                  ...prev,
                  adjustments: { ...DEFAULT_ADJUSTMENTS },
                }))
              }
            />
          )}

          {activeTab === 'filters' && (
            <FiltersPanel
              activeFilterId={editorState.filterId}
              intensity={editorState.filterIntensity}
              sampleImageUrl={mediaItem.thumbnailUrl || mediaItem.url}
              onSelectFilter={id => updateState(prev => ({ ...prev, filterId: id }))}
              onIntensityChange={intensity =>
                updateState(prev => ({ ...prev, filterIntensity: intensity }))
              }
            />
          )}

          {activeTab === 'crop' && (
            <CropTransformPanel
              transform={editorState.transform}
              onChange={updates =>
                updateState(prev => ({
                  ...prev,
                  transform: { ...prev.transform, ...updates },
                }))
              }
              onReset={() =>
                updateState(prev => ({
                  ...prev,
                  transform: { ...DEFAULT_TRANSFORM },
                }))
              }
            />
          )}

          {activeTab === 'effects' && (
            <EffectsPanel
              effects={editorState.effects}
              onChange={updates =>
                updateState(prev => ({
                  ...prev,
                  effects: { ...prev.effects, ...updates },
                }))
              }
              onReset={() =>
                updateState(prev => ({
                  ...prev,
                  effects: { ...DEFAULT_EFFECTS },
                }))
              }
            />
          )}

          {activeTab === 'text' && (
            <TextPanel
              layers={editorState.textLayers}
              activeLayerId={activeTextId}
              onSelectLayer={setActiveTextId}
              onAddLayer={handleAddTextLayer}
              onUpdateLayer={handleUpdateTextLayer}
              onDeleteLayer={handleDeleteTextLayer}
            />
          )}

          {activeTab === 'draw' && (
            <MarkupPanel
              activeTool={markupTool}
              color={markupColor}
              size={markupSize}
              opacity={markupOpacity}
              pathCount={editorState.drawingPaths.length}
              onToolChange={setMarkupTool}
              onColorChange={setMarkupColor}
              onSizeChange={setMarkupSize}
              onOpacityChange={setMarkupOpacity}
              onClearPaths={() => updateState(prev => ({ ...prev, drawingPaths: [] }))}
            />
          )}
        </div>

        {/* Tab Switcher Bar */}
        <div className="flex items-center justify-around py-2 border-t border-neutral-900/80 max-w-lg mx-auto">
          {tabs.map(tab => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isTabActive ? `${accent.text} font-semibold scale-105` : 'text-neutral-400 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-full ${isTabActive ? `${accent.bg}/20` : 'bg-transparent'}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save / Export Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 max-w-sm w-full text-white shadow-2xl">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Save & Export Photo</span>
            </h3>

            {/* Save Mode */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-neutral-300 block">Save Destination</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setSaveMode('new')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    saveMode === 'new'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                  }`}
                >
                  <div className="font-semibold text-white">Save as Copy</div>
                  <div className="text-[10px] text-neutral-400">Preserves original</div>
                </button>

                <button
                  onClick={() => setSaveMode('overwrite')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    saveMode === 'overwrite'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                  }`}
                >
                  <div className="font-semibold text-white">Overwrite</div>
                  <div className="text-[10px] text-neutral-400">Updates existing</div>
                </button>
              </div>
            </div>

            {/* Export Format */}
            <div className="space-y-1.5 mb-4 text-xs">
              <label className="font-medium text-neutral-300 block">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/jpeg', label: 'JPEG' },
                  { id: 'image/png', label: 'PNG' },
                  { id: 'image/webp', label: 'WebP' },
                ].map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => setExportFormat(fmt.id as any)}
                    className={`py-1.5 rounded-lg border text-center transition-all ${
                      exportFormat === fmt.id
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Quality */}
            <div className="space-y-1.5 mb-5 text-xs">
              <div className="flex justify-between">
                <label className="font-medium text-neutral-300">Quality</label>
                <span className="font-mono text-emerald-400 font-semibold">
                  {Math.round(exportQuality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.0"
                step="0.05"
                value={exportQuality}
                onChange={e => setExportQuality(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                disabled={isExporting}
                className="px-3 py-1.5 rounded-xl hover:bg-neutral-800 text-xs font-medium text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={isExporting}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white ${accent.bg}`}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
