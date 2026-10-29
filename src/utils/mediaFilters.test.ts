import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortMedia, formatBytes, formatDuration } from './mediaFilters';
import { MediaItem } from '../types/gallery';

const mockItems: MediaItem[] = [
  {
    id: '1',
    name: 'IMG_2024_Sunset.jpg',
    type: 'image',
    url: 'test1.jpg',
    thumbnailUrl: 'test1.jpg',
    size: 2048000, // ~2 MB
    width: 3840,
    height: 2160,
    mimeType: 'image/jpeg',
    dateAdded: 1700000000000,
    dateModified: 1700000000000,
    isFavorite: true,
    albumId: 'camera',
    metadata: { make: 'Google', model: 'Pixel 8 Pro', locationName: 'Kyoto, Japan' },
  },
  {
    id: '2',
    name: 'VID_2024_Waves.mp4',
    type: 'video',
    url: 'test2.mp4',
    thumbnailUrl: 'test2_thumb.jpg',
    size: 15728640, // 15 MB
    width: 1920,
    height: 1080,
    mimeType: 'video/mp4',
    dateAdded: 1710000000000,
    dateModified: 1710000000000,
    isFavorite: false,
    albumId: 'camera',
    duration: 45,
    metadata: { make: 'Samsung', model: 'Galaxy S24', locationName: 'Bali' },
  },
  {
    id: '3',
    name: 'Screenshot_Receipt.png',
    type: 'image',
    url: 'test3.png',
    thumbnailUrl: 'test3.png',
    size: 512000,
    width: 1080,
    height: 2400,
    mimeType: 'image/png',
    dateAdded: 1690000000000,
    dateModified: 1690000000000,
    isFavorite: false,
    albumId: 'screenshots',
    metadata: {},
  },
];

test('filterAndSortMedia filters by photos only', () => {
  const result = filterAndSortMedia(mockItems, { filterType: 'photos' });
  assert.equal(result.length, 2);
  assert.ok(result.every(item => item.type === 'image'));
});

test('filterAndSortMedia filters by favorites only', () => {
  const result = filterAndSortMedia(mockItems, { filterType: 'favorites' });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '1');
});

test('filterAndSortMedia searches by location and device model', () => {
  const byLocation = filterAndSortMedia(mockItems, { query: 'kyoto' });
  assert.equal(byLocation.length, 1);
  assert.equal(byLocation[0].id, '1');

  const byModel = filterAndSortMedia(mockItems, { query: 'Galaxy' });
  assert.equal(byModel.length, 1);
  assert.equal(byModel[0].id, '2');
});

test('filterAndSortMedia sorts by newest and by size', () => {
  const newest = filterAndSortMedia(mockItems, { sort: 'newest' });
  assert.equal(newest[0].id, '2'); // 1710000000000
  assert.equal(newest[2].id, '3'); // 1690000000000

  const bySize = filterAndSortMedia(mockItems, { sort: 'size' });
  assert.equal(bySize[0].id, '2'); // 15MB
  assert.equal(bySize[1].id, '1'); // 2MB
  assert.equal(bySize[2].id, '3'); // 512KB
});

test('formatBytes formats file sizes correctly', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(2097152), '2 MB');
});

test('formatDuration formats mm:ss correctly', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(120), '2:00');
});
