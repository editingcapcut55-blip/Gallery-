import React, { useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  FolderPlus,
  CheckSquare,
  ArrowUpDown,
  Camera,
  X,
  ShieldCheck,
  Palette,
  Image as ImageIcon,
  Film,
  Heart,
} from 'lucide-react';
import { GallerySettings } from '../types/gallery';
import { FilterType, SortOption } from '../utils/mediaFilters';
import { ACCENT_COLORS, getThemeClasses } from '../utils/themeHelper';

interface Props {
  settings: GallerySettings;
  query: string;
  onQueryChange: (q: string) => void;
  filterType: FilterType;
  onFilterChange: (t: FilterType) => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  isSelectMode: boolean;
  onToggleSelectMode: () => void;
  selectedCount: number;
  onOpenCustomizer: () => void;
  onOpenPermissionInfo: () => void;
  onImportFiles: (files: FileList | null) => void;
}

export const Navbar: React.FC<Props> = ({
  settings,
  query,
  onQueryChange,
  filterType,
  onFilterChange,
  sort,
  onSortChange,
  isSelectMode,
  onToggleSelectMode,
  selectedCount,
  onOpenCustomizer,
  onOpenPermissionInfo,
  onImportFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const theme = getThemeClasses(settings);
  const accent = ACCENT_COLORS[settings.accent] || ACCENT_COLORS.emerald;

  const filterTabs: Array<{ id: FilterType; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'All Media', icon: null },
    { id: 'photos', label: 'Photos', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'videos', label: 'Videos', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className={`sticky top-0 z-30 px-3 sm:px-5 py-2.5 border-b ${theme.navClass} transition-colors duration-200`}>
      {/* Hidden file inputs for real device media access */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={e => onImportFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => onImportFiles(e.target.files)}
      />

      <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
        {/* App Title & Branding */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base text-white shadow-md ${accent.bg}`}
          >
            L
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight leading-tight flex items-center gap-1">
              <span>Lumina</span>
              <span className="text-[10px] font-normal px-1 py-0.2 rounded bg-neutral-800/80 text-neutral-300 border border-neutral-700/50">
                Gallery
              </span>
            </h1>
            <p className={`text-[10px] ${theme.subtextClass} leading-none hidden sm:block`}>
              Offline MediaStore
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs sm:max-w-md relative min-w-[110px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Search..."
            aria-label="Search media library"
            className={`w-full pl-8 pr-7 py-1 text-xs sm:text-sm rounded-full border outline-none transition-all ${
              settings.theme === 'light'
                ? 'bg-neutral-100 border-neutral-300 text-neutral-900 focus:bg-white'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-100 focus:bg-neutral-800'
            }`}
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Import Real Device Media */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 ${accent.bg}`}
            title="Import Photos or Videos from Device Storage"
            aria-label="Import Media"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Import</span>
          </button>

          {/* Quick Camera Snapshot */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${theme.surfaceClass} hover:opacity-80`}
            title="Take Photo with Device Camera"
            aria-label="Take Photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          {/* Select Mode */}
          <button
            onClick={onToggleSelectMode}
            className={`p-1.5 sm:px-2 rounded-lg text-xs font-medium border transition-colors ${
              isSelectMode
                ? `${accent.bg} text-white border-transparent`
                : `${theme.surfaceClass} hover:opacity-80`
            }`}
            title="Multi-Select Media"
            aria-label={isSelectMode ? `Selected ${selectedCount}` : 'Select items'}
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          {/* Scoped Storage / Privacy Info */}
          <button
            onClick={onOpenPermissionInfo}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${theme.surfaceClass} hover:opacity-80`}
            title="Android Scoped Storage & Offline Privacy Info"
            aria-label="Storage and Privacy Info"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* Customization / Theme */}
          <button
            onClick={onOpenCustomizer}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${theme.surfaceClass} hover:opacity-80`}
            title="Customize Gallery Appearance & Themes"
            aria-label="Customize Gallery Appearance"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Sort Selector */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-inherit/40 overflow-x-auto no-scrollbar">
        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 py-0.5">
          {filterTabs.map(tab => {
            const active = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  active
                    ? `${accent.bg} text-white shadow-sm`
                    : settings.theme === 'light'
                    ? 'bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300'
                    : 'bg-neutral-800/70 text-neutral-300 hover:bg-neutral-800'
                }`}
                aria-pressed={active}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Selector Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={sort}
            onChange={e => onSortChange(e.target.value as SortOption)}
            aria-label="Sort media by"
            className={`text-xs px-2 py-1 rounded-md border outline-none cursor-pointer ${
              settings.theme === 'light'
                ? 'bg-neutral-100 border-neutral-300 text-neutral-800'
                : 'bg-neutral-900 border-neutral-800 text-neutral-200'
            }`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">File Name</option>
            <option value="size">Largest Size</option>
            <option value="type">Media Type</option>
          </select>
        </div>
      </div>
    </nav>
  );
};
