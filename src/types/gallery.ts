export type MediaType = 'image' | 'video';

export interface MediaMetadata {
  make?: string;
  model?: string;
  focalLength?: string;
  aperture?: string;
  iso?: number;
  shutterSpeed?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  orientation?: number;
  resolution?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  url: string; // Object URL or data URL
  thumbnailUrl: string;
  size: number; // in bytes
  width: number;
  height: number;
  mimeType: string;
  dateAdded: number; // timestamp ms
  dateModified: number;
  isFavorite: boolean;
  albumId: string;
  duration?: number; // for videos (seconds)
  metadata: MediaMetadata;
}

export type AlbumFrameShape = 'rounded' | 'squircle' | 'circle' | 'leaf' | 'badge' | 'square';

export interface Album {
  id: string;
  name: string;
  count: number;
  coverUrl: string;
  isCustom: boolean;
  isHidden: boolean;
  isFavorite: boolean;
  iconName: string;
  frameStyle: AlbumFrameShape;
  borderColor: string;
  borderThickness: number;
  borderRadius: number;
}

export type ThemeMode = 'dark' | 'amoled' | 'light' | 'custom';
export type AccentColor = 'emerald' | 'indigo' | 'violet' | 'rose' | 'amber' | 'cyan' | 'blue' | 'material-teal';
export type BackgroundStyle = 'pure' | 'subtle' | 'glass';
export type GridLayout = 'grid' | 'masonry' | 'list';

export interface GallerySettings {
  theme: ThemeMode;
  accent: AccentColor;
  customAccentHex?: string;
  backgroundStyle: BackgroundStyle;
  customBgHex?: string;
  columns: number; // 2, 3, 4, 5, 6
  gridSpacing: number; // 0, 2, 4, 8, 12, 16
  cornerRadius: number; // 0, 4, 8, 12, 16, 24
  cardBorder: boolean;
  cardShadow: boolean;
  cardShape: 'square' | 'rounded' | 'squircle';
  layout: GridLayout;
  showMetadataBadges: boolean;
  showDateHeaders: boolean;
  thumbnailSize: 'compact' | 'comfortable' | 'large';
  defaultSort: 'newest' | 'oldest' | 'name' | 'size' | 'type';
  // Album defaults
  albumFrameShape: AlbumFrameShape;
  albumBorderThickness: number;
  albumBorderRadius: number;
  albumBorderColor: string;
}

export type FilterCategory = 'natural' | 'cinematic' | 'vintage' | 'bw' | 'aesthetic' | 'portrait' | 'social';

export interface FilterPreset {
  id: string;
  name: string;
  category: FilterCategory;
  description: string;
  cssFilter: string;
  tint?: string;
  contrastAdj?: number;
  saturationAdj?: number;
  brightnessAdj?: number;
  sepiaAdj?: number;
  warmthAdj?: number;
}

export interface Adjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  temperature: number; // -100 to 100
  tint: number; // -100 to 100
  sharpness: number; // 0 to 100
  blur: number; // 0 to 50
  vignette: number; // 0 to 100
  grain: number; // 0 to 100
}

export interface Effects {
  glow: number; // 0 to 100
  filmGrain: number; // 0 to 100
  distortion: number; // -100 to 100 (fisheye / pinch)
  lightLeak: number; // 0 to 100
  duotone: string | null; // e.g., 'cyber' | 'sunset' | 'emerald' | null
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TransformState {
  cropRect: CropRect | null;
  cropAspect: 'free' | '1:1' | '4:5' | '16:9' | '9:16' | '4:3' | '3:2';
  rotation: number; // 0, 90, 180, 270
  fineAngle: number; // -45 to 45
  flipH: boolean;
  flipV: boolean;
  perspectiveX: number; // -30 to 30
  perspectiveY: number; // -30 to 30
}

export interface TextLayer {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  opacity: number;
  hasBg: boolean;
  bgColor: string;
  strokeColor: string;
  strokeWidth: number;
  shadow: boolean;
  letterSpacing: number;
  x: number; // relative 0-1
  y: number; // relative 0-1
  rotation: number; // degrees
}

export type MarkupTool = 'brush' | 'eraser' | 'marker' | 'arrow' | 'rect' | 'circle' | 'line';

export interface DrawingPath {
  id: string;
  tool: MarkupTool;
  color: string;
  size: number;
  opacity: number;
  points: Array<{ x: number; y: number }>; // relative 0-1
}

export interface EditorState {
  adjustments: Adjustments;
  filterId: string;
  filterIntensity: number; // 0 to 100
  effects: Effects;
  transform: TransformState;
  textLayers: TextLayer[];
  drawingPaths: DrawingPath[];
}
