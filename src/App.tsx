import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AndroidStatusHeader } from './components/AndroidStatusHeader';
import { Navbar } from './components/Navbar';
import { BottomNav, MainTab } from './components/BottomNav';
import { MediaGrid } from './components/MediaGrid';
import { FullScreenViewer } from './components/FullScreenViewer';
import { AlbumsView } from './components/AlbumsView';
import { PhotoEditorModal } from './components/PhotoEditor/PhotoEditorModal';
import { CustomizationModal } from './components/CustomizationModal';
import { AndroidPermissionModal } from './components/AndroidPermissionModal';
import { Album, GallerySettings, MediaItem } from './types/gallery';
import { galleryStorage } from './services/storage';
import { DEFAULT_GALLERY_SETTINGS, INITIAL_ALBUMS, INITIAL_MEDIA } from './services/initialMedia';
import { FilterType, SortOption, filterAndSortMedia } from './utils/mediaFilters';
import { getThemeClasses } from './utils/themeHelper';
import { ArrowLeft, Sparkles, FolderOpen, ImagePlus } from 'lucide-react';

export default function App() {
  // Main Data States
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [settings, setSettings] = useState<GallerySettings>(DEFAULT_GALLERY_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Navigation & Filtering States
  const [activeTab, setActiveTab] = useState<MainTab>('photos');
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Selection Mode State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Viewer & Editor Modal States
  const [fullscreenItem, setFullscreenItem] = useState<MediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Customizer & Permission Modals
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // Drag-and-drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Load persistent storage on start
  useEffect(() => {
    async function loadData() {
      try {
        const [savedMedia, savedAlbums, savedSettings] = await Promise.all([
          galleryStorage.getMedia(),
          galleryStorage.getAlbums(),
          galleryStorage.getSettings(),
        ]);
        setMedia(savedMedia);
        setAlbums(savedAlbums);
        setSettings(savedSettings);
        setSort(savedSettings.defaultSort || 'newest');
      } catch (e) {
        console.error('Storage initialization failed', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // Sync settings update to storage
  const handleUpdateSettings = (updates: Partial<GallerySettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      galleryStorage.saveSettings(next);
      return next;
    });
  };

  // Reset Appearance
  const handleResetAppearance = () => {
    handleUpdateSettings({
      theme: 'amoled',
      accent: 'emerald',
      backgroundStyle: 'pure',
      columns: 3,
      gridSpacing: 4,
      cornerRadius: 12,
      cardBorder: false,
      cardShadow: false,
      cardShape: 'rounded',
      layout: 'grid',
      showMetadataBadges: true,
      showDateHeaders: true,
    });
  };

  // Reset All Data
  const handleResetAll = async () => {
    await galleryStorage.resetAll();
    setMedia([...INITIAL_MEDIA]);
    setAlbums([...INITIAL_ALBUMS]);
    setSettings({ ...DEFAULT_GALLERY_SETTINGS });
    setIsCustomizerOpen(false);
  };

  // Media Operations
  const handleToggleFavorite = async (id: string) => {
    setMedia(prev => {
      const updated = prev.map(m => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
      const target = updated.find(m => m.id === id);
      if (target) galleryStorage.saveMediaItem(target);
      return updated;
    });
  };

  const handleDeleteMedia = async (id: string) => {
    await galleryStorage.deleteMediaItems([id]);
    setMedia(prev => prev.filter(m => m.id !== id));
    if (fullscreenItem && fullscreenItem.id === id) {
      setFullscreenItem(null);
    }
  };

  const handleRenameMedia = async (id: string, newName: string) => {
    setMedia(prev => {
      const updated = prev.map(m => (m.id === id ? { ...m, name: newName } : m));
      const target = updated.find(m => m.id === id);
      if (target) galleryStorage.saveMediaItem(target);
      return updated;
    });
    if (fullscreenItem && fullscreenItem.id === id) {
      setFullscreenItem(prev => (prev ? { ...prev, name: newName } : null));
    }
  };

  // Selection mode operations
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} selected items from your gallery?`)) {
      const idsToDelete = Array.from(selectedIds);
      await galleryStorage.deleteMediaItems(idsToDelete);
      setMedia(prev => prev.filter(m => !selectedIds.has(m.id)));
      setSelectedIds(new Set());
      setIsSelectMode(false);
    }
  };

  const handleFavoriteSelected = () => {
    setMedia(prev => {
      const updated = prev.map(m => {
        if (selectedIds.has(m.id)) {
          const item = { ...m, isFavorite: true };
          galleryStorage.saveMediaItem(item);
          return item;
        }
        return m;
      });
      return updated;
    });
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const handleShareSelected = async () => {
    const selectedItems = media.filter(m => selectedIds.has(m.id));
    if (selectedItems.length === 0) return;

    if (navigator.share && selectedItems.length === 1) {
      try {
        await navigator.share({
          title: selectedItems[0].name,
          url: selectedItems[0].url,
        });
      } catch {}
    } else {
      // Trigger batch downloads
      selectedItems.forEach((item, i) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = item.url;
          a.download = item.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, i * 300);
      });
    }
  };

  const handleMoveToAlbum = (albumId: string) => {
    setMedia(prev => {
      const updated = prev.map(m => {
        if (selectedIds.has(m.id)) {
          const item = { ...m, albumId };
          galleryStorage.saveMediaItem(item);
          return item;
        }
        return m;
      });
      return updated;
    });
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  // Real Device Media Import
  const handleImportFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: MediaItem[] = [];
    const files = Array.from(fileList);

    files.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isImage && !isVideo) return;

      const url = URL.createObjectURL(file);
      const targetAlbum = selectedAlbumId || 'camera';

      const newItem: MediaItem = {
        id: `device_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        url: url,
        thumbnailUrl: url,
        size: file.size,
        width: 1920,
        height: 1080,
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        dateAdded: file.lastModified || Date.now(),
        dateModified: file.lastModified || Date.now(),
        isFavorite: false,
        albumId: targetAlbum,
        duration: isVideo ? 10 : undefined,
        metadata: {
          make: 'Android Device',
          model: 'Local Storage Media',
          locationName: 'On-Device Storage',
          resolution: `${file.name.endsWith('.png') ? 'PNG' : 'Standard'} Media`,
        },
      };

      newItems.push(newItem);
      galleryStorage.saveMediaItem(newItem);
    });

    if (newItems.length > 0) {
      setMedia(prev => [...newItems, ...prev]);
    }
  };

  // Album Management
  const handleCreateAlbum = (name: string) => {
    const newAlbum: Album = {
      id: `alb_${Date.now()}`,
      name,
      count: 0,
      coverUrl:
        media[0]?.thumbnailUrl ||
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=70',
      isCustom: true,
      isHidden: false,
      isFavorite: false,
      iconName: 'folder',
      frameStyle: settings.albumFrameShape,
      borderColor: settings.albumBorderColor,
      borderThickness: settings.albumBorderThickness,
      borderRadius: settings.albumBorderRadius,
    };
    const updated = [newAlbum, ...albums];
    setAlbums(updated);
    galleryStorage.saveAlbums(updated);
  };

  const handleRenameAlbum = (albumId: string, newName: string) => {
    const updated = albums.map(a => (a.id === albumId ? { ...a, name: newName } : a));
    setAlbums(updated);
    galleryStorage.saveAlbums(updated);
  };

  const handleDeleteAlbum = (albumId: string) => {
    const updated = albums.filter(a => a.id !== albumId);
    setAlbums(updated);
    galleryStorage.saveAlbums(updated);
    if (selectedAlbumId === albumId) setSelectedAlbumId(null);
  };

  const handleToggleFavoriteAlbum = (albumId: string) => {
    const updated = albums.map(a => (a.id === albumId ? { ...a, isFavorite: !a.isFavorite } : a));
    setAlbums(updated);
    galleryStorage.saveAlbums(updated);
  };

  const handleToggleHideAlbum = (albumId: string) => {
    const updated = albums.map(a => (a.id === albumId ? { ...a, isHidden: !a.isHidden } : a));
    setAlbums(updated);
    galleryStorage.saveAlbums(updated);
  };

  const handleUpdateAlbumCustomization = (albumId: string, updates: Partial<Album>) => {
    const updated = albums.map(a => (a.id === albumId ? { ...a, ...updates } : a));
    setAlbums(updated);
    galleryStorage.saveAlbums(updated);
  };

  const handleSetAsAlbumCover = (albumId: string, coverUrl: string) => {
    handleUpdateAlbumCustomization(albumId, { coverUrl });
  };

  // Photo Editor Handlers
  const handleSaveNewEditedPhoto = (newItem: MediaItem) => {
    galleryStorage.saveMediaItem(newItem);
    setMedia(prev => [newItem, ...prev]);
    setFullscreenItem(newItem);
  };

  const handleOverwriteEditedPhoto = (updatedItem: MediaItem) => {
    galleryStorage.saveMediaItem(updatedItem);
    setMedia(prev => prev.map(m => (m.id === updatedItem.id ? updatedItem : m)));
    setFullscreenItem(updatedItem);
  };

  // Filter & Sort Logic
  const filteredMedia = useMemo(() => {
    let effectiveFilter = filterType;
    if (activeTab === 'favorites') {
      effectiveFilter = 'favorites';
    }

    return filterAndSortMedia(media, {
      query,
      filterType: effectiveFilter,
      albumId: selectedAlbumId,
      sort,
    });
  }, [media, query, filterType, selectedAlbumId, sort, activeTab]);

  const totalBytes = useMemo(() => media.reduce((acc, m) => acc + m.size, 0), [media]);

  const selectedAlbum = useMemo(
    () => (selectedAlbumId ? albums.find(a => a.id === selectedAlbumId) : null),
    [selectedAlbumId, albums]
  );

  const themeClasses = getThemeClasses(settings);

  // Quick action from BottomNav
  const handleBottomTabChange = (tab: MainTab) => {
    if (tab === 'customization') {
      setIsCustomizerOpen(true);
      return;
    }
    if (tab === 'studio') {
      // Open editor on the first photo or most recent
      const firstImage = media.find(m => m.type === 'image');
      if (firstImage) {
        setEditingItem(firstImage);
      }
      return;
    }
    setSelectedAlbumId(null);
    setActiveTab(tab);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${themeClasses.bgClass}`}
      onDragOver={e => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={e => {
        e.preventDefault();
        setIsDraggingOver(false);
        handleImportFiles(e.dataTransfer.files);
      }}
    >
      {/* Android Status Bar */}
      <AndroidStatusHeader settings={settings} />

      {/* Main App Bar / Navbar */}
      <Navbar
        settings={settings}
        query={query}
        onQueryChange={setQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        sort={sort}
        onSortChange={setSort}
        isSelectMode={isSelectMode}
        onToggleSelectMode={() => {
          setIsSelectMode(prev => !prev);
          setSelectedIds(new Set());
        }}
        selectedCount={selectedIds.size}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenPermissionInfo={() => setIsPermissionModalOpen(true)}
        onImportFiles={handleImportFiles}
      />

      {/* Selected Album Breadcrumb Banner */}
      {selectedAlbum && (
        <div className="px-4 py-2.5 bg-neutral-900/70 border-b border-neutral-800 flex items-center justify-between text-xs backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedAlbumId(null)}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              aria-label="Back to all albums"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold">{selectedAlbum.name}</span>
            <span className={`text-[11px] ${themeClasses.subtextClass}`}>
              ({filteredMedia.length} items)
            </span>
          </div>

          <button
            onClick={() => setSelectedAlbumId(null)}
            className="text-[11px] text-emerald-400 hover:underline"
          >
            View All Media
          </button>
        </div>
      )}

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-40 bg-emerald-950/80 backdrop-blur-sm border-4 border-dashed border-emerald-400 flex flex-col items-center justify-center pointer-events-none text-white">
          <ImagePlus className="w-16 h-16 text-emerald-400 animate-bounce mb-3" />
          <h2 className="text-xl font-bold">Drop Photos & Videos Here</h2>
          <p className="text-sm text-emerald-200 mt-1">
            Files will be securely imported to your device gallery offline
          </p>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'albums' && !selectedAlbumId ? (
          <AlbumsView
            albums={albums}
            media={media}
            settings={settings}
            onOpenAlbum={albId => setSelectedAlbumId(albId)}
            onCreateAlbum={handleCreateAlbum}
            onRenameAlbum={handleRenameAlbum}
            onDeleteAlbum={handleDeleteAlbum}
            onToggleFavoriteAlbum={handleToggleFavoriteAlbum}
            onToggleHideAlbum={handleToggleHideAlbum}
            onUpdateAlbumCustomization={handleUpdateAlbumCustomization}
          />
        ) : (
          <MediaGrid
            media={filteredMedia}
            albums={albums}
            settings={settings}
            selectedIds={selectedIds}
            isSelectMode={isSelectMode}
            onItemClick={item => setFullscreenItem(item)}
            onToggleSelect={handleToggleSelect}
            onToggleFavorite={handleToggleFavorite}
            onDeleteSelected={handleDeleteSelected}
            onFavoriteSelected={handleFavoriteSelected}
            onShareSelected={handleShareSelected}
            onClearSelection={() => setSelectedIds(new Set())}
            onMoveToAlbum={handleMoveToAlbum}
            onImportTrigger={() => {
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (fileInput) fileInput.click();
            }}
          />
        )}
      </main>

      {/* Full Screen Photo & Video Viewer */}
      {fullscreenItem && (
        <FullScreenViewer
          item={fullscreenItem}
          allItems={filteredMedia}
          albums={albums}
          settings={settings}
          onClose={() => setFullscreenItem(null)}
          onNavigate={item => setFullscreenItem(item)}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDeleteMedia}
          onRename={handleRenameMedia}
          onEdit={item => {
            setFullscreenItem(null);
            setEditingItem(item);
          }}
          onSetAsAlbumCover={handleSetAsAlbumCover}
        />
      )}

      {/* Non-Destructive Photo Editor Modal */}
      {editingItem && (
        <PhotoEditorModal
          mediaItem={editingItem}
          settings={settings}
          onClose={() => setEditingItem(null)}
          onSaveNew={handleSaveNewEditedPhoto}
          onOverwrite={handleOverwriteEditedPhoto}
        />
      )}

      {/* Extreme UI Personalization & Themes Modal */}
      <CustomizationModal
        settings={settings}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onResetAppearance={handleResetAppearance}
        onResetAll={handleResetAll}
      />

      {/* Android Scoped Storage & Offline Privacy Modal */}
      <AndroidPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        totalMediaBytes={totalBytes}
        totalMediaCount={media.length}
      />

      {/* Bottom Android Navigation Bar */}
      <BottomNav
        settings={settings}
        activeTab={activeTab}
        onTabChange={handleBottomTabChange}
      />
    </div>
  );
}
