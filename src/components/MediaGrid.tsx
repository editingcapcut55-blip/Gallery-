import React, { useMemo } from 'react';
import {
  Trash2,
  Heart,
  Share2,
  X,
  UploadCloud,
  FileImage,
  FolderInput,
  FolderCheck,
} from 'lucide-react';
import { Album, GallerySettings, MediaItem } from '../types/gallery';
import { MediaCard } from './MediaCard';
import { formatDate, formatBytes } from '../utils/mediaFilters';
import { ACCENT_COLORS, getThemeClasses } from '../utils/themeHelper';

interface Props {
  media: MediaItem[];
  albums: Album[];
  settings: GallerySettings;
  selectedIds: Set<string>;
  isSelectMode: boolean;
  onItemClick: (item: MediaItem) => void;
  onToggleSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteSelected: () => void;
  onFavoriteSelected: () => void;
  onShareSelected: () => void;
  onClearSelection: () => void;
  onMoveToAlbum: (albumId: string) => void;
  onImportTrigger: () => void;
}

export const MediaGrid: React.FC<Props> = ({
  media,
  albums,
  settings,
  selectedIds,
  isSelectMode,
  onItemClick,
  onToggleSelect,
  onToggleFavorite,
  onDeleteSelected,
  onFavoriteSelected,
  onShareSelected,
  onClearSelection,
  onMoveToAlbum,
  onImportTrigger,
}) => {
  const theme = getThemeClasses(settings);
  const accent = ACCENT_COLORS[settings.accent] || ACCENT_COLORS.emerald;

  // Group media by relative period if showDateHeaders is true
  const groupedMedia = useMemo(() => {
    if (!settings.showDateHeaders) {
      return [{ title: null, items: media }];
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfWeek = startOfToday - 6 * 86400000;

    const groups: Record<string, MediaItem[]> = {};

    media.forEach(item => {
      let key = '';
      if (item.dateAdded >= startOfToday) {
        key = 'Today';
      } else if (item.dateAdded >= startOfYesterday) {
        key = 'Yesterday';
      } else if (item.dateAdded >= startOfWeek) {
        key = 'This Week';
      } else {
        const d = new Date(item.dateAdded);
        key = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups).map(([title, items]) => ({
      title,
      items,
    }));
  }, [media, settings.showDateHeaders]);

  // Determine grid columns classes
  const getColClass = (cols: number) => {
    switch (cols) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      default:
        return 'grid-cols-3';
    }
  };

  const isList = settings.layout === 'list';

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-800/60 flex items-center justify-center text-neutral-400 mb-4 border border-neutral-700/50">
          <UploadCloud className="w-8 h-8 opacity-80" />
        </div>
        <h3 className="text-base font-semibold mb-1">No media found</h3>
        <p className={`text-xs max-w-sm mb-5 ${theme.subtextClass}`}>
          No photos or videos matched your search or filter. Import photos from your device storage or take a photo.
        </p>
        <button
          onClick={onImportTrigger}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md active:scale-95 transition-transform ${accent.bg}`}
          aria-label="Import device photos"
        >
          <FolderInput className="w-4 h-4" />
          <span>Import Device Photos</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
      {/* Floating Multi-Select Action Bar */}
      {isSelectMode && selectedIds.size > 0 && (
        <div className="sticky top-20 z-20 mx-4 my-2 p-2.5 rounded-2xl bg-neutral-900/95 border border-neutral-700 text-white shadow-2xl flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2 pl-2">
            <span className="text-xs font-semibold">{selectedIds.size} selected</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onFavoriteSelected}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-400 hover:text-rose-300 transition-colors"
              title="Favorite Selected"
              aria-label="Favorite selected items"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={onShareSelected}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
              title="Share / Save Selected"
              aria-label="Share selected items"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Move to Album Dropdown */}
            {albums.length > 0 && (
              <select
                onChange={e => {
                  if (e.target.value) {
                    onMoveToAlbum(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-xs py-1.5 px-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 outline-none cursor-pointer"
                aria-label="Move to album"
                defaultValue=""
              >
                <option value="" disabled>
                  Move to Album...
                </option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onDeleteSelected}
              className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors"
              title="Delete Selected"
              aria-label="Delete selected items"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClearSelection}
              className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              title="Clear Selection"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grid or List of Media */}
      <div className="px-3 sm:px-5">
        {groupedMedia.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-4">
            {group.title && (
              <h2 className={`text-xs font-semibold uppercase tracking-wider py-2 sticky top-14 z-10 ${theme.bgClass} opacity-90`}>
                {group.title}
              </h2>
            )}

            {isList ? (
              // List View Mode
              <div className="flex flex-col gap-2">
                {group.items.map(item => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onItemClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter') onItemClick(item);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-xl border ${theme.surfaceClass} cursor-pointer transition-colors hover:opacity-90 ${
                        isSelected ? 'ring-2 ring-emerald-500' : ''
                      }`}
                    >
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{item.name}</div>
                        <div className={`text-[10px] ${theme.subtextClass}`}>
                          {formatBytes(item.size)} • {item.width}×{item.height} • {formatDate(item.dateAdded, 'short')}
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className="p-2 rounded-full hover:bg-neutral-700/40 text-neutral-400"
                        aria-label="Toggle favorite"
                      >
                        <Heart className={`w-4 h-4 ${item.isFavorite ? 'text-rose-500 fill-current' : ''}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Fast Grid Mode
              <div
                style={{
                  gap: `${settings.gridSpacing}px`,
                }}
                className={`grid ${getColClass(settings.columns)}`}
              >
                {group.items.map(item => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    settings={settings}
                    isSelected={selectedIds.has(item.id)}
                    isSelectMode={isSelectMode}
                    onClick={() => {
                      if (isSelectMode) {
                        onToggleSelect(item.id);
                      } else {
                        onItemClick(item);
                      }
                    }}
                    onToggleSelect={() => onToggleSelect(item.id)}
                    onToggleFavorite={() => onToggleFavorite(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
