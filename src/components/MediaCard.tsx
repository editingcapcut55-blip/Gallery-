import React from 'react';
import { Play, Heart, Check, Film, FileImage } from 'lucide-react';
import { GallerySettings, MediaItem } from '../types/gallery';
import { formatBytes, formatDuration } from '../utils/mediaFilters';
import { ACCENT_COLORS } from '../utils/themeHelper';

interface Props {
  item: MediaItem;
  settings: GallerySettings;
  isSelected: boolean;
  isSelectMode: boolean;
  onClick: () => void;
  onToggleSelect: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const MediaCard: React.FC<Props> = ({
  item,
  settings,
  isSelected,
  isSelectMode,
  onClick,
  onToggleSelect,
  onToggleFavorite,
}) => {
  const accent = ACCENT_COLORS[settings.accent] || ACCENT_COLORS.emerald;

  // Compute dynamic styling from user settings
  const borderRadius = `${settings.cornerRadius}px`;
  const borderStyle = settings.cardBorder
    ? settings.theme === 'light'
      ? 'border border-neutral-300'
      : 'border border-neutral-800'
    : '';
  const shadowStyle = settings.cardShadow ? 'shadow-md shadow-black/40' : '';

  const shapeClass =
    settings.cardShape === 'squircle'
      ? 'rounded-[22%]'
      : settings.cardShape === 'square'
      ? 'rounded-none'
      : '';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        borderRadius: settings.cardShape === 'squircle' ? undefined : borderRadius,
      }}
      className={`group relative overflow-hidden cursor-pointer select-none aspect-square transition-transform active:scale-[0.98] ${borderStyle} ${shadowStyle} ${shapeClass} ${
        isSelected ? 'ring-3 ring-emerald-500 scale-[0.98]' : ''
      }`}
      aria-label={`${item.name}, ${item.type === 'video' ? 'video' : 'photo'}, ${formatBytes(item.size)}`}
    >
      {/* Thumbnail Image */}
      <img
        src={item.thumbnailUrl || item.url}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={e => {
          // Fallback if image fails to load
          const target = e.currentTarget;
          target.src =
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=60';
        }}
      />

      {/* Dim overlay when selected */}
      {isSelected && <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px]" />}

      {/* Selection Checkbox */}
      {(isSelectMode || isSelected) && (
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleSelect(e);
          }}
          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            isSelected
              ? `${accent.bg} text-white shadow-md ring-2 ring-white/60`
              : 'bg-black/50 text-white/70 hover:bg-black/80'
          }`}
          aria-label={isSelected ? `Deselect ${item.name}` : `Select ${item.name}`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>
      )}

      {/* Top Right Favorite Button */}
      <button
        onClick={e => {
          e.stopPropagation();
          onToggleFavorite(e);
        }}
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-md transition-all ${
          item.isFavorite
            ? 'bg-rose-500/90 text-white shadow-sm'
            : 'bg-black/40 text-white/70 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-black/70'
        }`}
        aria-label={item.isFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
      >
        <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Bottom Metadata Badges */}
      {settings.showMetadataBadges && (
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none text-[10px] font-medium text-white drop-shadow-md">
          {item.type === 'video' ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>{item.duration ? formatDuration(item.duration) : 'Video'}</span>
            </span>
          ) : (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm truncate max-w-[80%]">
              {item.name.replace(/\.[^/.]+$/, '')}
            </span>
          )}

          <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
            {formatBytes(item.size)}
          </span>
        </div>
      )}
    </div>
  );
};
