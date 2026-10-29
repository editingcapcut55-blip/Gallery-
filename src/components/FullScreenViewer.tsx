import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Heart,
  Share2,
  Trash2,
  Info,
  Edit3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  MapPin,
  Calendar,
  HardDrive,
  Camera,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { Album, GallerySettings, MediaItem } from '../types/gallery';
import { formatBytes, formatDate, formatDuration } from '../utils/mediaFilters';
import { ACCENT_COLORS } from '../utils/themeHelper';

interface Props {
  item: MediaItem;
  allItems: MediaItem[];
  albums: Album[];
  settings: GallerySettings;
  onClose: () => void;
  onNavigate: (item: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onEdit: (item: MediaItem) => void;
  onSetAsAlbumCover: (albumId: string, coverUrl: string) => void;
}

export const FullScreenViewer: React.FC<Props> = ({
  item,
  allItems,
  albums,
  settings,
  onClose,
  onNavigate,
  onToggleFavorite,
  onDelete,
  onRename,
  onEdit,
  onSetAsAlbumCover,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newNameInput, setNewNameInput] = useState(item.name);
  const [showAlbumCoverModal, setShowAlbumCoverModal] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const accent = ACCENT_COLORS[settings.accent] || ACCENT_COLORS.emerald;

  const currentIndex = allItems.findIndex(m => m.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allItems.length - 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(allItems[currentIndex - 1]);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(allItems[currentIndex + 1]);
      if (e.key === 'r') handleRotate();
      if (e.key === 'i') setShowInfo(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasPrev, hasNext, allItems]);

  // Reset zoom & rotation when media changes
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
    setNewNameInput(item.name);
    setIsPlayingVideo(false);
  }, [item.id]);

  const handleDoubleTap = () => {
    setZoomLevel(prev => (prev === 1 ? 2.5 : 1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: `Photo from Lumina Gallery: ${item.name}`,
          url: item.url,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      // Fallback: trigger download
      const a = document.createElement('a');
      a.href = item.url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlayingVideo(true);
    } else {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
            aria-label="Back to gallery"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-sm font-semibold truncate max-w-[200px] sm:max-w-md">{item.name}</h2>
            <p className="text-[11px] text-neutral-400">
              {formatDate(item.dateAdded, 'full')} • {formatBytes(item.size)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.type === 'image' && (
            <>
              {/* Zoom Controls */}
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 4))}
                className="p-2 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
                className="p-2 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>

              {/* Rotate */}
              <button
                onClick={handleRotate}
                className="p-2 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md"
                aria-label="Rotate image 90 degrees"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(prev => !prev)}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              showInfo ? `${accent.bg} text-white` : 'bg-black/40 hover:bg-black/80 text-white'
            }`}
            aria-label="View EXIF Metadata"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => setShowControls(prev => !prev)}
        onDoubleClick={handleDoubleTap}
      >
        {item.type === 'video' ? (
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={item.url}
              controls
              playsInline
              className="max-h-[85vh] max-w-full object-contain"
              onPlay={() => setIsPlayingVideo(true)}
              onPause={() => setIsPlayingVideo(false)}
            />
          </div>
        ) : (
          <div
            className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={item.url}
              alt={item.name}
              className="max-h-[85vh] max-w-full object-contain select-none pointer-events-none"
            />
          </div>
        )}

        {/* Previous Button */}
        {hasPrev && (
          <button
            onClick={e => {
              e.stopPropagation();
              onNavigate(allItems[currentIndex - 1]);
            }}
            className={`absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-opacity ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Previous media"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {hasNext && (
          <button
            onClick={e => {
              e.stopPropagation();
              onNavigate(allItems[currentIndex + 1]);
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-opacity ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Next media"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Bar Actions */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 px-6 py-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-around transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-neutral-300 hover:text-white"
          aria-label="Share media"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-[10px]">Share</span>
        </button>

        {/* Edit in Photo Editor (for images) */}
        {item.type === 'image' && (
          <button
            onClick={() => onEdit(item)}
            className={`flex flex-col items-center gap-1 ${accent.text} font-semibold hover:opacity-90`}
            aria-label="Edit in Photo Editor"
          >
            <div className={`p-2 rounded-full ${accent.bg} text-white shadow-lg`}>
              <Edit3 className="w-5 h-5" />
            </div>
            <span className="text-[10px]">Edit Photo</span>
          </button>
        )}

        {/* Favorite */}
        <button
          onClick={() => onToggleFavorite(item.id)}
          className={`flex flex-col items-center gap-1 ${
            item.isFavorite ? 'text-rose-500' : 'text-neutral-300 hover:text-white'
          }`}
          aria-label={item.isFavorite ? 'Unfavorite' : 'Favorite'}
        >
          <Heart className={`w-5 h-5 ${item.isFavorite ? 'fill-current' : ''}`} />
          <span className="text-[10px]">{item.isFavorite ? 'Favorited' : 'Favorite'}</span>
        </button>

        {/* Rename */}
        <button
          onClick={() => setShowRenameModal(true)}
          className="flex flex-col items-center gap-1 text-neutral-300 hover:text-white"
          aria-label="Rename media"
        >
          <Edit3 className="w-5 h-5 opacity-75" />
          <span className="text-[10px]">Rename</span>
        </button>

        {/* Delete */}
        <button
          onClick={() => {
            if (confirm(`Delete "${item.name}" from your gallery?`)) {
              onDelete(item.id);
            }
          }}
          className="flex flex-col items-center gap-1 text-rose-400 hover:text-rose-300"
          aria-label="Delete media"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px]">Delete</span>
        </button>
      </div>

      {/* EXIF Info Drawer */}
      {showInfo && (
        <div className="absolute right-0 top-0 bottom-0 z-30 w-full sm:w-96 bg-neutral-950/95 border-l border-neutral-800 p-5 overflow-y-auto backdrop-blur-xl animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Media Details & EXIF</span>
            </h3>
            <button
              onClick={() => setShowInfo(false)}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* File Info */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                File Details
              </h4>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">File Name:</span>
                  <span className="font-medium text-white truncate max-w-[180px]">{item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Resolution:</span>
                  <span className="font-medium text-white">
                    {item.width} × {item.height} px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">File Size:</span>
                  <span className="font-medium text-white">{formatBytes(item.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Format:</span>
                  <span className="font-medium text-white">{item.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Date Taken:</span>
                  <span className="font-medium text-white">{formatDate(item.dateAdded, 'full')}</span>
                </div>
              </div>
            </div>

            {/* Camera & Optics EXIF */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Camera & Shot Settings
              </h4>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Device:</span>
                  <span className="font-medium text-white">
                    {item.metadata.make || 'Android Device'} {item.metadata.model || ''}
                  </span>
                </div>
                {item.metadata.focalLength && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Focal Length:</span>
                    <span className="font-medium text-white">{item.metadata.focalLength}</span>
                  </div>
                )}
                {item.metadata.aperture && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Aperture:</span>
                    <span className="font-medium text-white">{item.metadata.aperture}</span>
                  </div>
                )}
                {item.metadata.iso && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">ISO Speed:</span>
                    <span className="font-medium text-white">ISO {item.metadata.iso}</span>
                  </div>
                )}
                {item.metadata.shutterSpeed && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Shutter:</span>
                    <span className="font-medium text-white">{item.metadata.shutterSpeed}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {item.metadata.locationName && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  Location Metadata
                </h4>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{item.metadata.locationName}</span>
                  </div>
                  {item.metadata.latitude && item.metadata.longitude && (
                    <div className="text-[11px] text-neutral-400">
                      Coordinates: {item.metadata.latitude.toFixed(4)}°, {item.metadata.longitude.toFixed(4)}°
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Action: Set as Album Cover */}
            <div className="pt-2">
              <button
                onClick={() => setShowAlbumCoverModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                aria-label="Set as album cover"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Use as Album Cover</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 max-w-sm w-full text-white shadow-2xl">
            <h3 className="text-sm font-semibold mb-3">Rename Media</h3>
            <input
              type="text"
              value={newNameInput}
              onChange={e => setNewNameInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm outline-none focus:border-emerald-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-3 py-1.5 rounded-xl hover:bg-neutral-800 text-xs font-medium text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newNameInput.trim()) {
                    onRename(item.id, newNameInput.trim());
                    setShowRenameModal(false);
                  }
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white ${accent.bg}`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set as Album Cover Modal */}
      {showAlbumCoverModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 max-w-sm w-full text-white shadow-2xl">
            <h3 className="text-sm font-semibold mb-2">Select Album</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Choose an album to set this image as its cover thumbnail:
            </p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto mb-4">
              {albums.map(alb => (
                <button
                  key={alb.id}
                  onClick={() => {
                    onSetAsAlbumCover(alb.id, item.url);
                    setShowAlbumCoverModal(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center justify-between text-xs"
                >
                  <span className="font-medium">{alb.name}</span>
                  <span className="text-[10px] text-neutral-500">{alb.count} items</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAlbumCoverModal(false)}
              className="w-full py-2 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
