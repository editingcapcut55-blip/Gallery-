import React from 'react';
import { Image, FolderHeart, Heart, Sparkles, Sliders } from 'lucide-react';
import { GallerySettings } from '../types/gallery';
import { ACCENT_COLORS, getThemeClasses } from '../utils/themeHelper';

export type MainTab = 'photos' | 'albums' | 'favorites' | 'studio' | 'customization';

interface Props {
  settings: GallerySettings;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

export const BottomNav: React.FC<Props> = ({ settings, activeTab, onTabChange }) => {
  const theme = getThemeClasses(settings);
  const accent = ACCENT_COLORS[settings.accent] || ACCENT_COLORS.emerald;

  const tabs: Array<{ id: MainTab; label: string; icon: React.ReactNode }> = [
    { id: 'photos', label: 'Photos', icon: <Image className="w-5 h-5" /> },
    { id: 'albums', label: 'Albums', icon: <FolderHeart className="w-5 h-5" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-5 h-5" /> },
    { id: 'studio', label: 'Editor Studio', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'customization', label: 'Themes', icon: <Sliders className="w-5 h-5" /> },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-30 border-t ${theme.navClass} py-1.5 px-3 select-none transition-colors duration-200`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? `${accent.text} font-semibold scale-105` : `${theme.subtextClass} hover:opacity-100`
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? `${accent.bg}/15` : 'bg-transparent'
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
