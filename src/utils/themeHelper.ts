import { AccentColor, GallerySettings, ThemeMode } from '../types/gallery';

export const ACCENT_COLORS: Record<AccentColor, { name: string; hex: string; bg: string; text: string; ring: string }> = {
  emerald: {
    name: 'Emerald Green',
    hex: '#10b981',
    bg: 'bg-emerald-500',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500',
  },
  indigo: {
    name: 'Electric Indigo',
    hex: '#6366f1',
    bg: 'bg-indigo-500',
    text: 'text-indigo-400',
    ring: 'ring-indigo-500',
  },
  violet: {
    name: 'Royal Violet',
    hex: '#8b5cf6',
    bg: 'bg-violet-500',
    text: 'text-violet-400',
    ring: 'ring-violet-500',
  },
  rose: {
    name: 'Neon Rose',
    hex: '#f43f5e',
    bg: 'bg-rose-500',
    text: 'text-rose-400',
    ring: 'ring-rose-500',
  },
  amber: {
    name: 'Warm Amber',
    hex: '#f59e0b',
    bg: 'bg-amber-500',
    text: 'text-amber-400',
    ring: 'ring-amber-500',
  },
  cyan: {
    name: 'Cyber Cyan',
    hex: '#06b6d4',
    bg: 'bg-cyan-500',
    text: 'text-cyan-400',
    ring: 'ring-cyan-500',
  },
  blue: {
    name: 'Pixel Blue',
    hex: '#3b82f6',
    bg: 'bg-blue-500',
    text: 'text-blue-400',
    ring: 'ring-blue-500',
  },
  'material-teal': {
    name: 'Material You Teal',
    hex: '#14b8a6',
    bg: 'bg-teal-500',
    text: 'text-teal-400',
    ring: 'ring-teal-500',
  },
};

export function getThemeClasses(settings: GallerySettings) {
  const { theme, backgroundStyle } = settings;

  let bgClass = 'bg-black text-white';
  let surfaceClass = 'bg-neutral-900 border-neutral-800 text-white';
  let navClass = 'bg-black/90 border-neutral-800/80 text-white';
  let subtextClass = 'text-neutral-400';
  let borderClass = 'border-neutral-800';

  if (theme === 'light') {
    bgClass = 'bg-neutral-50 text-neutral-900';
    surfaceClass = 'bg-white border-neutral-200 text-neutral-900 shadow-sm';
    navClass = 'bg-white/95 border-neutral-200 text-neutral-900';
    subtextClass = 'text-neutral-500';
    borderClass = 'border-neutral-200';
  } else if (theme === 'dark') {
    bgClass = 'bg-slate-950 text-slate-100';
    surfaceClass = 'bg-slate-900 border-slate-800 text-slate-100';
    navClass = 'bg-slate-950/90 border-slate-800 text-slate-100';
    subtextClass = 'text-slate-400';
    borderClass = 'border-slate-800';
  } else if (theme === 'amoled') {
    // True Black
    bgClass = 'bg-black text-neutral-100';
    surfaceClass = 'bg-zinc-950 border-zinc-900 text-neutral-100';
    navClass = 'bg-black/95 border-zinc-900 text-neutral-100';
    subtextClass = 'text-zinc-500';
    borderClass = 'border-zinc-900';
  }

  if (backgroundStyle === 'glass') {
    surfaceClass += ' backdrop-blur-md bg-opacity-70';
    navClass += ' backdrop-blur-lg bg-opacity-80';
  }

  return {
    bgClass,
    surfaceClass,
    navClass,
    subtextClass,
    borderClass,
  };
}
