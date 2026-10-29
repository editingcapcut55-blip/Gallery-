import React, { useState } from 'react';
import {
  FolderPlus,
  FolderHeart,
  Eye,
  EyeOff,
  MoreVertical,
  Edit2,
  Trash2,
  Palette,
  Heart,
  Camera,
  Trees,
  User,
  Building,
  Smartphone,
  Folder,
  Layers,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { Album, AlbumFrameShape, GallerySettings, MediaItem } from '../types/gallery';
import { ACCENT_COLORS, getThemeClasses } from '../utils/themeHelper';

interface Props {
  albums: Album[];
  media: MediaItem[];
  settings: GallerySettings;
  onOpenAlbum: (albumId: string) => void;
  onCreateAlbum: (name: string) => void;
  onRenameAlbum: (albumId: string, newName: string) => void;
  onDeleteAlbum: (albumId: string) => void;
  onToggleFavoriteAlbum: (albumId: string) => void;
  onToggleHideAlbum: (albumId: string) => void;
  onUpdateAlbumCustomization: (albumId: string, updates: Partial<Album>) => void;
}

export const AlbumsView: React.FC<Props> = ({
  albums,
  media,
  settings,
  onOpenAlbum,
  onCreateAlbum,
  onRenameAlbum,
  onDeleteAlbum,
  onToggleFavoriteAlbum,
  onToggleHideAlbum,
  onUpdateAlbumCustomization,
}) => {
  const [showHidden, setShowHidden] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [customizingAlbum, setCustomizingAlbum] = useState<Album | null>(null);

  const theme = getThemeClasses(settings);
  const accent = ACCENT_COLORS[settings.accent] || ACCENT_COLORS.emerald;

  // Compute album counts dynamically based on actual media
  const albumsWithCounts = albums.map(alb => ({
    ...alb,
    count: media.filter(m => m.albumId === alb.id).length,
  }));

  const visibleAlbums = albumsWithCounts.filter(a => (showHidden ? a.isHidden : !a.isHidden));

  const getFrameClipStyle = (shape: AlbumFrameShape, radius: number) => {
    switch (shape) {
      case 'circle':
        return { borderRadius: '50%' };
      case 'squircle':
        return { borderRadius: '28%' };
      case 'leaf':
        return { borderRadius: `${radius * 2}px 4px ${radius * 2}px 4px` };
      case 'badge':
        return { borderRadius: `4px ${radius * 1.5}px 4px ${radius * 1.5}px` };
      case 'square':
        return { borderRadius: '0px' };
      case 'rounded':
      default:
        return { borderRadius: `${radius}px` };
    }
  };

  const getAlbumIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'camera':
        return <Camera className="w-5 h-5" />;
      case 'trees':
        return <Trees className="w-5 h-5" />;
      case 'user':
        return <User className="w-5 h-5" />;
      case 'building':
        return <Building className="w-5 h-5" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Folder className="w-5 h-5" />;
    }
  };

  return (
    <div className="px-4 sm:px-6 py-4 pb-28">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {showHidden ? 'Hidden Albums' : 'Albums & Folders'}
          </h2>
          <p className={`text-xs ${theme.subtextClass}`}>
            {showHidden
              ? 'Albums hidden from main gallery stream'
              : `${visibleAlbums.length} albums detected`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View Hidden */}
          <button
            onClick={() => setShowHidden(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showHidden
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : `${theme.surfaceClass} hover:opacity-80`
            }`}
            aria-label={showHidden ? 'Show Visible Albums' : 'View Hidden Albums'}
          >
            {showHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showHidden ? 'Normal' : 'Hidden'}</span>
          </button>

          {/* New Custom Album */}
          <button
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 ${accent.bg}`}
            aria-label="Create new album"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Album</span>
          </button>
        </div>
      </div>

      {/* Album Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {visibleAlbums.map(album => {
          const frameStyle = getFrameClipStyle(
            album.frameStyle || settings.albumFrameShape,
            album.borderRadius || settings.albumBorderRadius
          );

          return (
            <div
              key={album.id}
              onClick={() => onOpenAlbum(album.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter') onOpenAlbum(album.id);
              }}
              className={`group flex flex-col p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${theme.surfaceClass}`}
              aria-label={`Album ${album.name}, ${album.count} items`}
            >
              {/* Album Cover Thumbnail with Customized Frame */}
              <div
                style={{
                  ...frameStyle,
                  borderWidth: `${album.borderThickness || settings.albumBorderThickness}px`,
                  borderColor: album.borderColor || settings.albumBorderColor || '#10b981',
                }}
                className="relative aspect-square w-full overflow-hidden bg-neutral-900 border transition-all"
              >
                <img
                  src={
                    album.coverUrl ||
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=70'
                  }
                  alt={album.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Favorite Icon */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleFavoriteAlbum(album.id);
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
                    album.isFavorite
                      ? 'bg-rose-500 text-white'
                      : 'bg-black/40 text-white/70 opacity-0 group-hover:opacity-100 hover:text-white'
                  }`}
                  aria-label="Favorite album"
                >
                  <Heart className={`w-3.5 h-3.5 ${album.isFavorite ? 'fill-current' : ''}`} />
                </button>

                {/* Album Icon Badge */}
                <div className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white">
                  {getAlbumIcon(album.iconName || 'folder')}
                </div>
              </div>

              {/* Album Details & Controls */}
              <div className="mt-2.5 flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-1">
                  <h3 className="text-xs font-semibold truncate leading-tight">{album.name}</h3>
                  <p className={`text-[11px] ${theme.subtextClass}`}>{album.count} items</p>
                </div>

                {/* Album Actions */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setCustomizingAlbum(album);
                    }}
                    className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    title="Customize Album Frame & Style"
                    aria-label={`Customize album ${album.name}`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onToggleHideAlbum(album.id);
                    }}
                    className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    title={album.isHidden ? 'Restore Album' : 'Hide Album'}
                    aria-label={album.isHidden ? 'Unhide album' : 'Hide album'}
                  >
                    {album.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {album.isCustom && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Delete custom album "${album.name}"? Media files will not be deleted.`)) {
                          onDeleteAlbum(album.id);
                        }
                      }}
                      className="p-1 rounded-md hover:bg-neutral-800 text-rose-400"
                      title="Delete Album"
                      aria-label="Delete album"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 max-w-sm w-full text-white shadow-2xl">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              <span>Create New Album</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              App-created albums allow you to organize device photos and edited artwork offline.
            </p>
            <input
              type="text"
              placeholder="e.g. Travel 2024, Artwork, Favorites"
              value={newAlbumName}
              onChange={e => setNewAlbumName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm outline-none focus:border-emerald-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewAlbumName('');
                }}
                className="px-3 py-1.5 rounded-xl hover:bg-neutral-800 text-xs font-medium text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newAlbumName.trim()) {
                    onCreateAlbum(newAlbumName.trim());
                    setShowCreateModal(false);
                    setNewAlbumName('');
                  }
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white ${accent.bg}`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Album Customization Modal */}
      {customizingAlbum && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 max-w-md w-full text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>Customize Album: {customizingAlbum.name}</span>
              </h3>
              <button
                onClick={() => setCustomizingAlbum(null)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Frame Shape */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-2 text-neutral-300">
                  Album Frame Shape
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(['rounded', 'squircle', 'circle', 'leaf', 'badge'] as AlbumFrameShape[]).map(shape => (
                    <button
                      key={shape}
                      onClick={() =>
                        onUpdateAlbumCustomization(customizingAlbum.id, { frameStyle: shape })
                      }
                      className={`py-2 px-1 text-center rounded-xl border text-[11px] capitalize transition-all ${
                        customizingAlbum.frameStyle === shape
                          ? `${accent.bg} text-white border-transparent shadow`
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Thickness */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="font-semibold text-neutral-300">Border Thickness</label>
                  <span className="text-neutral-400">{customizingAlbum.borderThickness || 2}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={customizingAlbum.borderThickness ?? 2}
                  onChange={e =>
                    onUpdateAlbumCustomization(customizingAlbum.id, {
                      borderThickness: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Corner Radius */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="font-semibold text-neutral-300">Corner Radius</label>
                  <span className="text-neutral-400">{customizingAlbum.borderRadius ?? 16}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  step="2"
                  value={customizingAlbum.borderRadius ?? 16}
                  onChange={e =>
                    onUpdateAlbumCustomization(customizingAlbum.id, {
                      borderRadius: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Border Color */}
              <div>
                <label className="font-semibold block mb-2 text-neutral-300">Border Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#ffffff', '#64748b'].map(
                    c => (
                      <button
                        key={c}
                        onClick={() =>
                          onUpdateAlbumCustomization(customizingAlbum.id, { borderColor: c })
                        }
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          customizingAlbum.borderColor === c ? 'scale-110 border-white' : 'border-transparent'
                        }`}
                        aria-label={`Border color ${c}`}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Pick Cover from Library */}
              <div>
                <label className="font-semibold block mb-2 text-neutral-300">
                  Select Cover Image from Media
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                  {media
                    .filter(m => m.type === 'image')
                    .slice(0, 12)
                    .map(m => (
                      <img
                        key={m.id}
                        src={m.thumbnailUrl || m.url}
                        alt={m.name}
                        onClick={() =>
                          onUpdateAlbumCustomization(customizingAlbum.id, { coverUrl: m.url })
                        }
                        className={`aspect-square object-cover rounded-lg cursor-pointer border-2 transition-all hover:opacity-100 ${
                          customizingAlbum.coverUrl === m.url ? 'border-emerald-500 scale-95' : 'border-transparent opacity-75'
                        }`}
                      />
                    ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCustomizingAlbum(null)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold text-white ${accent.bg}`}
                >
                  Done Customizing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
