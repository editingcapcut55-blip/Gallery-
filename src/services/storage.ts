import { Album, GallerySettings, MediaItem } from '../types/gallery';
import { DEFAULT_GALLERY_SETTINGS, INITIAL_ALBUMS, INITIAL_MEDIA } from './initialMedia';

const DB_NAME = 'lumina_gallery_db';
const DB_VERSION = 1;
const STORE_MEDIA = 'media_items';
const STORE_ALBUMS = 'albums';
const STORE_SETTINGS = 'settings';

class GalleryStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isFallback = false;
  private memoryMedia: MediaItem[] = [];
  private memoryAlbums: Album[] = [];
  private memorySettings: GallerySettings = { ...DEFAULT_GALLERY_SETTINGS };

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isFallback = true;
      this.loadLocalStorage();
      return;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_MEDIA)) {
            db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_ALBUMS)) {
            db.createObjectStore(STORE_ALBUMS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
            db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('IndexedDB failed, switching to localStorage fallback.');
          this.isFallback = true;
          this.loadLocalStorage();
          resolve(null as any);
        };
      } catch (e) {
        console.warn('IndexedDB exception:', e);
        this.isFallback = true;
        this.loadLocalStorage();
        resolve(null as any);
      }
    });
  }

  private loadLocalStorage() {
    try {
      const savedMedia = localStorage.getItem('lumina_media');
      this.memoryMedia = savedMedia ? JSON.parse(savedMedia) : [...INITIAL_MEDIA];

      const savedAlbums = localStorage.getItem('lumina_albums');
      this.memoryAlbums = savedAlbums ? JSON.parse(savedAlbums) : [...INITIAL_ALBUMS];

      const savedSettings = localStorage.getItem('lumina_settings');
      this.memorySettings = savedSettings ? JSON.parse(savedSettings) : { ...DEFAULT_GALLERY_SETTINGS };
    } catch {
      this.memoryMedia = [...INITIAL_MEDIA];
      this.memoryAlbums = [...INITIAL_ALBUMS];
      this.memorySettings = { ...DEFAULT_GALLERY_SETTINGS };
    }
  }

  private syncLocalStorage() {
    try {
      localStorage.setItem('lumina_media', JSON.stringify(this.memoryMedia));
      localStorage.setItem('lumina_albums', JSON.stringify(this.memoryAlbums));
      localStorage.setItem('lumina_settings', JSON.stringify(this.memorySettings));
    } catch (e) {
      console.warn('localStorage sync quota:', e);
    }
  }

  public async getSettings(): Promise<GallerySettings> {
    if (this.isFallback || !this.dbPromise) {
      return this.memorySettings;
    }
    const db = await this.dbPromise;
    if (!db) return this.memorySettings;

    return new Promise(resolve => {
      try {
        const tx = db.transaction(STORE_SETTINGS, 'readonly');
        const store = tx.objectStore(STORE_SETTINGS);
        const req = store.get('gallery_settings');
        req.onsuccess = () => {
          if (req.result && req.result.value) {
            resolve({ ...DEFAULT_GALLERY_SETTINGS, ...req.result.value });
          } else {
            resolve({ ...DEFAULT_GALLERY_SETTINGS });
          }
        };
        req.onerror = () => resolve({ ...DEFAULT_GALLERY_SETTINGS });
      } catch {
        resolve({ ...DEFAULT_GALLERY_SETTINGS });
      }
    });
  }

  public async saveSettings(settings: GallerySettings): Promise<void> {
    this.memorySettings = settings;
    if (this.isFallback || !this.dbPromise) {
      this.syncLocalStorage();
      return;
    }
    const db = await this.dbPromise;
    if (!db) {
      this.syncLocalStorage();
      return;
    }

    return new Promise(resolve => {
      try {
        const tx = db.transaction(STORE_SETTINGS, 'readwrite');
        const store = tx.objectStore(STORE_SETTINGS);
        store.put({ key: 'gallery_settings', value: settings });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async getAlbums(): Promise<Album[]> {
    if (this.isFallback || !this.dbPromise) {
      return this.memoryAlbums.length > 0 ? this.memoryAlbums : [...INITIAL_ALBUMS];
    }
    const db = await this.dbPromise;
    if (!db) return [...INITIAL_ALBUMS];

    return new Promise(resolve => {
      try {
        const tx = db.transaction(STORE_ALBUMS, 'readonly');
        const store = tx.objectStore(STORE_ALBUMS);
        const req = store.getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            resolve(req.result);
          } else {
            // Seed initial albums
            this.seedInitialAlbums(db);
            resolve([...INITIAL_ALBUMS]);
          }
        };
        req.onerror = () => resolve([...INITIAL_ALBUMS]);
      } catch {
        resolve([...INITIAL_ALBUMS]);
      }
    });
  }

  private seedInitialAlbums(db: IDBDatabase) {
    try {
      const tx = db.transaction(STORE_ALBUMS, 'readwrite');
      const store = tx.objectStore(STORE_ALBUMS);
      INITIAL_ALBUMS.forEach(album => store.put(album));
    } catch (e) {
      console.warn('Seed albums err', e);
    }
  }

  public async saveAlbums(albums: Album[]): Promise<void> {
    this.memoryAlbums = albums;
    if (this.isFallback || !this.dbPromise) {
      this.syncLocalStorage();
      return;
    }
    const db = await this.dbPromise;
    if (!db) {
      this.syncLocalStorage();
      return;
    }

    return new Promise(resolve => {
      try {
        const tx = db.transaction(STORE_ALBUMS, 'readwrite');
        const store = tx.objectStore(STORE_ALBUMS);
        store.clear();
        albums.forEach(album => store.put(album));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async getMedia(): Promise<MediaItem[]> {
    if (this.isFallback || !this.dbPromise) {
      return this.memoryMedia.length > 0 ? this.memoryMedia : [...INITIAL_MEDIA];
    }
    const db = await this.dbPromise;
    if (!db) return [...INITIAL_MEDIA];

    return new Promise(resolve => {
      try {
        const tx = db.transaction(STORE_MEDIA, 'readonly');
        const store = tx.objectStore(STORE_MEDIA);
        const req = store.getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            resolve(req.result);
          } else {
            // Seed initial media
            this.seedInitialMedia(db);
            resolve([...INITIAL_MEDIA]);
          }
        };
        req.onerror = () => resolve([...INITIAL_MEDIA]);
      } catch {
        resolve([...INITIAL_MEDIA]);
      }
    });
  }

  private seedInitialMedia(db: IDBDatabase) {
    try {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      INITIAL_MEDIA.forEach(m => store.put(m));
    } catch (e) {
      console.warn('Seed media err', e);
    }
  }

  public async saveMediaItem(item: MediaItem): Promise<void> {
    this.memoryMedia = [item, ...this.memoryMedia.filter(m => m.id !== item.id)];
    if (this.isFallback || !this.dbPromise) {
      this.syncLocalStorage();
      return;
    }
    const db = await this.dbPromise;
    if (!db) return;

    return new Promise(resolve => {
      try {
        const tx = db.transaction(STORE_MEDIA, 'readwrite');
        const store = tx.objectStore(STORE_MEDIA);
        store.put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async deleteMediaItems(ids: string[]): Promise<void> {
    const idSet = new Set(ids);
    this.memoryMedia = this.memoryMedia.filter(m => !idSet.has(m.id));
    if (this.isFallback || !this.dbPromise) {
      this.syncLocalStorage();
      return;
    }
    const db = await this.dbPromise;
    if (!db) return;

    return new Promise(resolve => {
      try {
        const tx = db.transaction(STORE_MEDIA, 'readwrite');
        const store = tx.objectStore(STORE_MEDIA);
        ids.forEach(id => store.delete(id));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async resetAll(): Promise<void> {
    this.memoryMedia = [...INITIAL_MEDIA];
    this.memoryAlbums = [...INITIAL_ALBUMS];
    this.memorySettings = { ...DEFAULT_GALLERY_SETTINGS };
    try {
      localStorage.removeItem('lumina_media');
      localStorage.removeItem('lumina_albums');
      localStorage.removeItem('lumina_settings');
    } catch {}

    if (this.dbPromise) {
      const db = await this.dbPromise;
      if (db) {
        try {
          const tx = db.transaction([STORE_MEDIA, STORE_ALBUMS, STORE_SETTINGS], 'readwrite');
          tx.objectStore(STORE_MEDIA).clear();
          tx.objectStore(STORE_ALBUMS).clear();
          tx.objectStore(STORE_SETTINGS).clear();
          INITIAL_MEDIA.forEach(m => tx.objectStore(STORE_MEDIA).put(m));
          INITIAL_ALBUMS.forEach(a => tx.objectStore(STORE_ALBUMS).put(a));
          tx.objectStore(STORE_SETTINGS).put({ key: 'gallery_settings', value: DEFAULT_GALLERY_SETTINGS });
        } catch {}
      }
    }
  }
}

export const galleryStorage = new GalleryStorage();
