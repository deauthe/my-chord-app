/**
 * ChordStorage - IndexedDB storage layer for chord persistence
 * 
 * Stores only the lean chord identity: { id, root, quality, createdAt, updatedAt }
 * All derived data (name, notes, intervals, inversions) is computed on demand via music-theory.ts.
 * 
 * Version 2 migrates from the old fat schema (name, key, notes, intervals, etc.)
 * to the lean schema (root, quality only).
 */

import { Chord, ChordSet, Note, ChordQuality } from '../types/chord';
import { parseChordNameToIdentity } from './music-theory';

const DB_NAME = 'ChordManagerDB';
const DB_VERSION = 2;
const CHORD_STORE = 'chords';
const CHORD_SET_STORE = 'chordSets';

export class ChordStorage {
  private db: IDBDatabase | null = null;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        const oldVersion = event.oldVersion;

        if (oldVersion < 1) {
          // Fresh install: create stores with lean schema
          const chordStore = db.createObjectStore(CHORD_STORE, { keyPath: 'id' });
          chordStore.createIndex('root', 'root', { unique: false });
          chordStore.createIndex('quality', 'quality', { unique: false });
          chordStore.createIndex('createdAt', 'createdAt', { unique: false });

          const chordSetStore = db.createObjectStore(CHORD_SET_STORE, { keyPath: 'id' });
          chordSetStore.createIndex('name', 'name', { unique: false });
          chordSetStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (oldVersion >= 1 && oldVersion < 2) {
          // Migration from v1 (fat schema) to v2 (lean schema)
          const chordStore = transaction.objectStore(CHORD_STORE);

          // Delete old indexes
          if (chordStore.indexNames.contains('name')) {
            chordStore.deleteIndex('name');
          }
          if (chordStore.indexNames.contains('key')) {
            chordStore.deleteIndex('key');
          }

          // Create new indexes
          if (!chordStore.indexNames.contains('root')) {
            chordStore.createIndex('root', 'root', { unique: false });
          }
          if (!chordStore.indexNames.contains('quality')) {
            chordStore.createIndex('quality', 'quality', { unique: false });
          }

          // Migrate existing records: extract root/quality, drop derived fields
          const getAllRequest = chordStore.getAll();
          getAllRequest.onsuccess = () => {
            const oldChords = getAllRequest.result;
            for (const oldChord of oldChords) {
              const migrated = migrateChordV1toV2(oldChord);
              chordStore.put(migrated);
            }
          };
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // ─── Chord CRUD ──────────────────────────────────────────────────────────

  /**
   * Save a chord to the database (lean: only id, root, quality, timestamps)
   */
  async saveChord(chord: Chord): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_STORE], 'readwrite');
      const store = transaction.objectStore(CHORD_STORE);
      
      const request = store.put({
        id: chord.id,
        root: chord.root,
        quality: chord.quality,
        createdAt: chord.createdAt.toISOString(),
        updatedAt: chord.updatedAt.toISOString()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to save chord: ${request.error}`));
    });
  }

  /**
   * Get a chord by ID
   */
  async getChord(id: string): Promise<Chord | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_STORE], 'readonly');
      const store = transaction.objectStore(CHORD_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(hydrateChord(result));
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error(`Failed to get chord: ${request.error}`));
    });
  }

  /**
   * Get all chords
   */
  async getAllChords(): Promise<Chord[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_STORE], 'readonly');
      const store = transaction.objectStore(CHORD_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const chords = request.result.map(hydrateChord);
        resolve(chords);
      };

      request.onerror = () => reject(new Error(`Failed to get all chords: ${request.error}`));
    });
  }

  /**
   * Get chords by root note
   */
  async getChordsByRoot(root: Note): Promise<Chord[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_STORE], 'readonly');
      const store = transaction.objectStore(CHORD_STORE);
      const index = store.index('root');
      const request = index.getAll(root);

      request.onsuccess = () => {
        const chords = request.result.map(hydrateChord);
        resolve(chords);
      };

      request.onerror = () => reject(new Error(`Failed to get chords by root: ${request.error}`));
    });
  }

  /**
   * Get chords by quality
   */
  async getChordsByQuality(quality: ChordQuality): Promise<Chord[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_STORE], 'readonly');
      const store = transaction.objectStore(CHORD_STORE);
      const index = store.index('quality');
      const request = index.getAll(quality);

      request.onsuccess = () => {
        const chords = request.result.map(hydrateChord);
        resolve(chords);
      };

      request.onerror = () => reject(new Error(`Failed to get chords by quality: ${request.error}`));
    });
  }

  /**
   * Update a chord
   */
  async updateChord(chord: Chord): Promise<void> {
    return this.saveChord(chord);
  }

  /**
   * Delete a chord
   */
  async deleteChord(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_STORE], 'readwrite');
      const store = transaction.objectStore(CHORD_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete chord: ${request.error}`));
    });
  }

  // ─── Chord Set CRUD ──────────────────────────────────────────────────────

  /**
   * Save a chord set
   */
  async saveChordSet(chordSet: ChordSet): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_SET_STORE], 'readwrite');
      const store = transaction.objectStore(CHORD_SET_STORE);
      
      const request = store.put({
        ...chordSet,
        createdAt: chordSet.createdAt.toISOString(),
        updatedAt: chordSet.updatedAt.toISOString()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to save chord set: ${request.error}`));
    });
  }

  /**
   * Get a chord set by ID
   */
  async getChordSet(id: string): Promise<ChordSet | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_SET_STORE], 'readonly');
      const store = transaction.objectStore(CHORD_SET_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            ...result,
            createdAt: new Date(result.createdAt),
            updatedAt: new Date(result.updatedAt)
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error(`Failed to get chord set: ${request.error}`));
    });
  }

  /**
   * Get all chord sets
   */
  async getAllChordSets(): Promise<ChordSet[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_SET_STORE], 'readonly');
      const store = transaction.objectStore(CHORD_SET_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const chordSets = request.result.map((set: any) => ({
          ...set,
          createdAt: new Date(set.createdAt),
          updatedAt: new Date(set.updatedAt)
        }));
        resolve(chordSets);
      };

      request.onerror = () => reject(new Error(`Failed to get all chord sets: ${request.error}`));
    });
  }

  /**
   * Delete a chord set
   */
  async deleteChordSet(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_SET_STORE], 'readwrite');
      const store = transaction.objectStore(CHORD_SET_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete chord set: ${request.error}`));
    });
  }

  // ─── Utility ─────────────────────────────────────────────────────────────

  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_STORE, CHORD_SET_STORE], 'readwrite');
      
      const chordStore = transaction.objectStore(CHORD_STORE);
      const chordSetStore = transaction.objectStore(CHORD_SET_STORE);
      
      const clearChords = chordStore.clear();
      const clearChordSets = chordSetStore.clear();

      let completed = 0;
      const checkCompletion = () => {
        completed++;
        if (completed === 2) resolve();
      };

      clearChords.onsuccess = checkCompletion;
      clearChordSets.onsuccess = checkCompletion;
      
      clearChords.onerror = () => reject(new Error(`Failed to clear chords: ${clearChords.error}`));
      clearChordSets.onerror = () => reject(new Error(`Failed to clear chord sets: ${clearChordSets.error}`));
    });
  }

  async getStats(): Promise<{ chordCount: number; chordSetCount: number }> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHORD_STORE, CHORD_SET_STORE], 'readonly');
      
      const chordStore = transaction.objectStore(CHORD_STORE);
      const chordSetStore = transaction.objectStore(CHORD_SET_STORE);
      
      const chordCountRequest = chordStore.count();
      const chordSetCountRequest = chordSetStore.count();

      let chordCount = 0;
      let chordSetCount = 0;
      let completed = 0;

      const checkCompletion = () => {
        completed++;
        if (completed === 2) {
          resolve({ chordCount, chordSetCount });
        }
      };

      chordCountRequest.onsuccess = () => {
        chordCount = chordCountRequest.result;
        checkCompletion();
      };

      chordSetCountRequest.onsuccess = () => {
        chordSetCount = chordSetCountRequest.result;
        checkCompletion();
      };

      chordCountRequest.onerror = () => reject(new Error(`Failed to get chord count: ${chordCountRequest.error}`));
      chordSetCountRequest.onerror = () => reject(new Error(`Failed to get chord set count: ${chordSetCountRequest.error}`));
    });
  }

  async exportData(): Promise<{ chords: Chord[]; chordSets: ChordSet[] }> {
    const chords = await this.getAllChords();
    const chordSets = await this.getAllChordSets();
    return { chords, chordSets };
  }

  async importData(data: { chords: Chord[]; chordSets: ChordSet[] }): Promise<void> {
    await this.clearAllData();

    for (const chord of data.chords) {
      await this.saveChord(chord);
    }

    for (const chordSet of data.chordSets) {
      await this.saveChordSet(chordSet);
    }
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Hydrate a raw IndexedDB record into a typed Chord */
function hydrateChord(record: any): Chord {
  return {
    id: record.id,
    root: record.root,
    quality: record.quality,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt)
  };
}

/** Migrate a v1 (fat) chord record to v2 (lean) format */
function migrateChordV1toV2(oldRecord: any): any {
  let root: Note = oldRecord.root || 'C';
  let quality: ChordQuality = oldRecord.quality || 'major';

  // If old record has a name but no root/quality, parse them
  if (oldRecord.name && !oldRecord.root) {
    const parsed = parseChordNameToIdentity(oldRecord.name);
    if (parsed) {
      root = parsed.root;
      quality = parsed.quality;
    } else if (oldRecord.notes && oldRecord.notes.length > 0) {
      // Fallback: use first note as root
      root = oldRecord.notes[0] as Note;
    }
  }

  return {
    id: oldRecord.id,
    root,
    quality,
    createdAt: oldRecord.createdAt,
    updatedAt: oldRecord.updatedAt
  };
}

// Singleton instance
export const chordStorage = new ChordStorage();
