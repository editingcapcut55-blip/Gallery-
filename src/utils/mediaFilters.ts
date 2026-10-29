import { MediaItem } from '../types/gallery';

export type SortOption = 'newest' | 'oldest' | 'name' | 'size' | 'type';
export type FilterType = 'all' | 'photos' | 'videos' | 'favorites';

export function filterAndSortMedia(
  items: MediaItem[],
  options: {
    query?: string;
    filterType?: FilterType;
    albumId?: string | null;
    sort?: SortOption;
  }
): MediaItem[] {
  const { query = '', filterType = 'all', albumId = null, sort = 'newest' } = options;

  let result = items.slice();

  // Filter by album if specified
  if (albumId) {
    result = result.filter(item => item.albumId === albumId);
  }

  // Filter by type
  if (filterType === 'photos') {
    result = result.filter(item => item.type === 'image');
  } else if (filterType === 'videos') {
    result = result.filter(item => item.type === 'video');
  } else if (filterType === 'favorites') {
    result = result.filter(item => item.isFavorite);
  }

  // Filter by search query
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter(item => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchMake = item.metadata.make?.toLowerCase().includes(q) ?? false;
      const matchModel = item.metadata.model?.toLowerCase().includes(q) ?? false;
      const matchLocation = item.metadata.locationName?.toLowerCase().includes(q) ?? false;
      const matchMime = item.mimeType.toLowerCase().includes(q);
      return matchName || matchMake || matchModel || matchLocation || matchMime;
    });
  }

  // Sort
  result.sort((a, b) => {
    switch (sort) {
      case 'newest':
        return b.dateAdded - a.dateAdded;
      case 'oldest':
        return a.dateAdded - b.dateAdded;
      case 'name':
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      case 'size':
        return b.size - a.size;
      case 'type': {
        const typeCmp = a.type.localeCompare(b.type);
        return typeCmp !== 0 ? typeCmp : b.dateAdded - a.dateAdded;
      }
      default:
        return b.dateAdded - a.dateAdded;
    }
  });

  return result;
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatDate(timestamp: number, format: 'short' | 'full' = 'full'): string {
  const date = new Date(timestamp);
  if (format === 'short') {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
