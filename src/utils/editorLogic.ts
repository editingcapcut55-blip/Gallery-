import { Adjustments, EditorState, Effects, FilterPreset, TransformState } from '../types/gallery';

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  temperature: 0,
  tint: 0,
  sharpness: 0,
  blur: 0,
  vignette: 0,
  grain: 0,
};

export const DEFAULT_EFFECTS: Effects = {
  glow: 0,
  filmGrain: 0,
  distortion: 0,
  lightLeak: 0,
  duotone: null,
};

export const DEFAULT_TRANSFORM: TransformState = {
  cropRect: null,
  cropAspect: 'free',
  rotation: 0,
  fineAngle: 0,
  flipH: false,
  flipV: false,
  perspectiveX: 0,
  perspectiveY: 0,
};

export const INITIAL_EDITOR_STATE: EditorState = {
  adjustments: { ...DEFAULT_ADJUSTMENTS },
  filterId: 'none',
  filterIntensity: 100,
  effects: { ...DEFAULT_EFFECTS },
  transform: { ...DEFAULT_TRANSFORM },
  textLayers: [],
  drawingPaths: [],
};

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'none',
    name: 'Original',
    category: 'natural',
    description: 'No filter applied',
    cssFilter: 'none',
  },
  // Natural
  {
    id: 'nat_warmth',
    name: 'Warm Sun',
    category: 'natural',
    description: 'Gentle golden natural warmth',
    cssFilter: 'brightness(1.05) saturate(1.15) sepia(0.12)',
    warmthAdj: 20,
    saturationAdj: 15,
  },
  {
    id: 'nat_clarity',
    name: 'Crisp Air',
    category: 'natural',
    description: 'Sharp clean daylight contrast',
    cssFilter: 'contrast(1.12) brightness(1.02) saturate(1.08)',
    contrastAdj: 15,
  },
  {
    id: 'nat_lush',
    name: 'Lush Green',
    category: 'natural',
    description: 'Rich organic botanical greens',
    cssFilter: 'saturate(1.25) contrast(1.08) hue-rotate(-5deg)',
    saturationAdj: 25,
  },

  // Cinematic
  {
    id: 'cine_teal_orange',
    name: 'Teal & Gold',
    category: 'cinematic',
    description: 'Blockbuster color-grade tone',
    cssFilter: 'contrast(1.2) saturate(1.2) hue-rotate(5deg) sepia(0.15)',
    contrastAdj: 20,
    warmthAdj: 15,
  },
  {
    id: 'cine_moody',
    name: 'Nordic Noir',
    category: 'cinematic',
    description: 'Muted shadows and cool highlights',
    cssFilter: 'contrast(1.25) saturate(0.8) brightness(0.95) hue-rotate(185deg) sepia(0.1)',
    contrastAdj: 25,
    saturationAdj: -20,
  },
  {
    id: 'cine_tokyo',
    name: 'Cyberpunk',
    category: 'cinematic',
    description: 'Neon magenta and deep cyan contrast',
    cssFilter: 'contrast(1.3) saturate(1.35) hue-rotate(290deg) brightness(0.98)',
    contrastAdj: 30,
    saturationAdj: 35,
  },

  // Vintage
  {
    id: 'vint_sepia',
    name: '1890 Sepia',
    category: 'vintage',
    description: 'Classic antique archival tone',
    cssFilter: 'sepia(0.75) contrast(1.1) brightness(0.95)',
    sepiaAdj: 75,
  },
  {
    id: 'vint_polaroid',
    name: 'Retro 70s',
    category: 'vintage',
    description: 'Warm faded instant film vibes',
    cssFilter: 'contrast(1.08) brightness(1.1) saturate(1.2) sepia(0.25)',
    warmthAdj: 30,
  },
  {
    id: 'vint_fade',
    name: 'Sun Bleach',
    category: 'vintage',
    description: 'Low-contrast nostalgic matte finish',
    cssFilter: 'contrast(0.88) brightness(1.12) saturate(0.85) sepia(0.15)',
    contrastAdj: -15,
  },

  // Black and White
  {
    id: 'bw_classic',
    name: 'Mono Clean',
    category: 'bw',
    description: 'Balanced silver monochrome',
    cssFilter: 'grayscale(1) contrast(1.1)',
  },
  {
    id: 'bw_dramatic',
    name: 'High Contrast',
    category: 'bw',
    description: 'Deep ink shadows & bright peaks',
    cssFilter: 'grayscale(1) contrast(1.5) brightness(0.95)',
    contrastAdj: 50,
  },
  {
    id: 'bw_matte',
    name: 'Silky B&W',
    category: 'bw',
    description: 'Soft tonal transitions and fine grain',
    cssFilter: 'grayscale(1) contrast(0.95) brightness(1.05)',
  },

  // Aesthetic
  {
    id: 'aes_pastel',
    name: 'Dream Pastel',
    category: 'aesthetic',
    description: 'Soft dreamy highlights with airy tones',
    cssFilter: 'brightness(1.12) contrast(0.92) saturate(1.15)',
  },
  {
    id: 'aes_golden',
    name: 'Golden Hour',
    category: 'aesthetic',
    description: 'Late afternoon sunset radiance',
    cssFilter: 'sepia(0.3) saturate(1.3) brightness(1.08) hue-rotate(-10deg)',
    warmthAdj: 45,
  },
  {
    id: 'aes_cyber',
    name: 'Vaporwave',
    category: 'aesthetic',
    description: 'Electric violet and neon turquoise',
    cssFilter: 'contrast(1.2) saturate(1.4) hue-rotate(320deg)',
  },

  // Portrait
  {
    id: 'port_smooth',
    name: 'Soft Glow',
    category: 'portrait',
    description: 'Flattering portrait radiance',
    cssFilter: 'brightness(1.04) contrast(0.98) saturate(1.06)',
  },
  {
    id: 'port_warm',
    name: 'Studio Amber',
    category: 'portrait',
    description: 'Rich warm flattering skin tones',
    cssFilter: 'sepia(0.18) saturate(1.15) contrast(1.05)',
  },

  // Social
  {
    id: 'soc_vivid',
    name: 'Pop Vivid',
    category: 'social',
    description: 'Punchy saturated colors made to pop',
    cssFilter: 'saturate(1.45) contrast(1.18) brightness(1.02)',
    saturationAdj: 45,
  },
  {
    id: 'soc_clean',
    name: 'Influencer',
    category: 'social',
    description: 'Bright clean whites and crisp details',
    cssFilter: 'brightness(1.15) contrast(1.05) saturate(1.1)',
  },
];

export function buildCssFilterString(
  adj: Adjustments,
  filterId: string,
  filterIntensity: number
): string {
  const parts: string[] = [];

  // Brightness: -100 to 100 -> 0.0 to 2.0 (1.0 default)
  const bVal = 1 + adj.brightness / 100;
  if (Math.abs(adj.brightness) > 0.5) parts.push(`brightness(${bVal.toFixed(2)})`);

  // Contrast: -100 to 100 -> 0.0 to 2.0
  const cVal = 1 + adj.contrast / 100;
  if (Math.abs(adj.contrast) > 0.5) parts.push(`contrast(${cVal.toFixed(2)})`);

  // Saturation: -100 to 100 -> 0.0 to 2.5
  const sVal = adj.saturation >= 0 ? 1 + (adj.saturation / 100) * 1.5 : 1 + adj.saturation / 100;
  if (Math.abs(adj.saturation) > 0.5) parts.push(`saturate(${Math.max(0, sVal).toFixed(2)})`);

  // Blur: 0 to 50px
  if (adj.blur > 0) parts.push(`blur(${adj.blur.toFixed(1)}px)`);

  // Sepia/Temperature:
  if (adj.temperature > 0) {
    const sep = (adj.temperature / 100) * 0.45;
    parts.push(`sepia(${sep.toFixed(2)})`);
  } else if (adj.temperature < 0) {
    // Cool: slight hue shift
    const hue = (adj.temperature / 100) * 20;
    parts.push(`hue-rotate(${hue.toFixed(0)}deg)`);
  }

  // Hue Tint:
  if (Math.abs(adj.tint) > 0.5) {
    const tintHue = (adj.tint / 100) * 45;
    parts.push(`hue-rotate(${tintHue.toFixed(0)}deg)`);
  }

  // Combine with filter preset if active
  const preset = FILTER_PRESETS.find(p => p.id === filterId);
  if (preset && preset.id !== 'none' && preset.cssFilter !== 'none') {
    if (filterIntensity >= 95) {
      parts.push(preset.cssFilter);
    } else if (filterIntensity > 0) {
      // Scale filter effect by intensity
      parts.push(preset.cssFilter);
      // We will handle fractional intensity via canvas layer opacity when rendering
    }
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

export class HistoryManager<T> {
  private past: T[] = [];
  private present: T;
  private future: T[] = [];
  private maxHistory: number;

  constructor(initialPresent: T, maxHistory = 30) {
    this.present = initialPresent;
    this.maxHistory = maxHistory;
  }

  public get state(): T {
    return this.present;
  }

  public get canUndo(): boolean {
    return this.past.length > 0;
  }

  public get canRedo(): boolean {
    return this.future.length > 0;
  }

  public push(newState: T): void {
    this.past.push(this.present);
    if (this.past.length > this.maxHistory) {
      this.past.shift();
    }
    this.present = newState;
    this.future = [];
  }

  public undo(): T | null {
    if (!this.canUndo) return null;
    const previous = this.past.pop()!;
    this.future.unshift(this.present);
    this.present = previous;
    return this.present;
  }

  public redo(): T | null {
    if (!this.canRedo) return null;
    const next = this.future.shift()!;
    this.past.push(this.present);
    this.present = next;
    return this.present;
  }

  public reset(newState: T): void {
    this.past = [];
    this.future = [];
    this.present = newState;
  }
}
