/**
 * ChordManager - Main interface that combines ChordService with persistent storage
 * 
 * This is the primary class that UI components interact with for chord CRUD.
 * Analysis functions (scales, extensions, roman numerals, etc.) are NOT wrapped here —
 * use the pure functions from music-theory.ts directly instead.
 */

import { ChordService } from './chord-service';
import { ChordStorage, chordStorage } from './chord-storage';
import { Chord, ChordQuality, Note, ChordSet } from '../types/chord';
import { transposeNote } from './music-theory';
import { v4 as uuidv4 } from 'uuid';

export class ChordManager {
  private chordService: ChordService;
  private storage: ChordStorage;
  private initialized: boolean = false;

  constructor() {
    this.chordService = new ChordService();
    this.storage = chordStorage;
  }

  /**
   * Initialize the chord manager and load existing data
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.storage.init();
      await this.loadChordsFromStorage();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize ChordManager:', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  // ─── Chord CRUD ──────────────────────────────────────────────────────────

  /**
   * Add a new chord (stores only root + quality)
   */
  async addChord(root: Note, quality: ChordQuality): Promise<Chord> {
    await this.ensureInitialized();
    
    const chord = this.chordService.addChord(root, quality);
    await this.storage.saveChord(chord);
    
    return chord;
  }

  /**
   * Get all chords
   */
  async getAllChords(): Promise<Chord[]> {
    await this.ensureInitialized();
    return this.chordService.getAllChords();
  }

  /**
   * Get chord by ID
   */
  async getChordById(id: string): Promise<Chord | undefined> {
    await this.ensureInitialized();
    return this.chordService.getChordById(id);
  }

  /**
   * Update a chord's root and/or quality
   */
  async updateChord(id: string, updates: Partial<Pick<Chord, 'root' | 'quality'>>): Promise<Chord> {
    await this.ensureInitialized();
    
    const chord = this.chordService.updateChord(id, updates);
    await this.storage.updateChord(chord);
    
    return chord;
  }

  /**
   * Delete a chord
   */
  async deleteChord(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    const success = this.chordService.deleteChord(id);
    if (success) {
      await this.storage.deleteChord(id);
    }
    
    return success;
  }

  /**
   * Search chords (delegates to ChordService which uses compute-based search)
   */
  async searchChords(query: string): Promise<Chord[]> {
    await this.ensureInitialized();
    return this.chordService.searchChords(query);
  }

  /**
   * Transpose a chord (creates a new chord at the transposed pitch)
   */
  async transposeChord(chordId: string, semitones: number): Promise<Chord> {
    await this.ensureInitialized();
    
    const chord = this.chordService.transposeChord(chordId, semitones);
    await this.storage.saveChord(chord);
    
    return chord;
  }

  // ─── Chord Set Management ────────────────────────────────────────────────

  async createChordSet(name: string, description?: string): Promise<ChordSet> {
    await this.ensureInitialized();
    
    const chordSet: ChordSet = {
      id: uuidv4(),
      name,
      description,
      chordIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.storage.saveChordSet(chordSet);
    return chordSet;
  }

  async getAllChordSets(): Promise<ChordSet[]> {
    await this.ensureInitialized();
    return this.storage.getAllChordSets();
  }

  async getChordSet(id: string): Promise<ChordSet | null> {
    await this.ensureInitialized();
    return this.storage.getChordSet(id);
  }

  async addChordToSet(chordSetId: string, chordId: string): Promise<ChordSet> {
    await this.ensureInitialized();
    
    const chordSet = await this.storage.getChordSet(chordSetId);
    if (!chordSet) {
      throw new Error(`Chord set with id ${chordSetId} not found`);
    }

    if (!chordSet.chordIds.includes(chordId)) {
      chordSet.chordIds.push(chordId);
      chordSet.updatedAt = new Date();
      await this.storage.saveChordSet(chordSet);
    }

    return chordSet;
  }

  async removeChordFromSet(chordSetId: string, chordId: string): Promise<ChordSet> {
    await this.ensureInitialized();
    
    const chordSet = await this.storage.getChordSet(chordSetId);
    if (!chordSet) {
      throw new Error(`Chord set with id ${chordSetId} not found`);
    }

    const index = chordSet.chordIds.indexOf(chordId);
    if (index > -1) {
      chordSet.chordIds.splice(index, 1);
      chordSet.updatedAt = new Date();
      await this.storage.saveChordSet(chordSet);
    }

    return chordSet;
  }

  async getChordsInSet(chordSetId: string): Promise<Chord[]> {
    await this.ensureInitialized();
    
    const chordSet = await this.storage.getChordSet(chordSetId);
    if (!chordSet) return [];

    const chords: Chord[] = [];
    for (const chordId of chordSet.chordIds) {
      const chord = this.chordService.getChordById(chordId);
      if (chord) {
        chords.push(chord);
      }
    }

    return chords;
  }

  async deleteChordSet(id: string): Promise<boolean> {
    await this.ensureInitialized();
    
    try {
      await this.storage.deleteChordSet(id);
      return true;
    } catch (error) {
      console.error('Failed to delete chord set:', error);
      return false;
    }
  }

  // ─── Progression Templates ───────────────────────────────────────────────

  /**
   * Create common chord progressions as a chord set
   */
  async createProgressionSet(key: Note, progressionName: string): Promise<ChordSet> {
    await this.ensureInitialized();

    const progressions: Record<string, { name: string; chords: Array<{ root: Note; quality: ChordQuality }> }> = {
      'I-V-vi-IV': {
        name: 'I-V-vi-IV Progression',
        chords: [
          { root: key, quality: 'major' },
          { root: transposeNote(key, 7), quality: 'major' },
          { root: transposeNote(key, 9), quality: 'minor' },
          { root: transposeNote(key, 5), quality: 'major' }
        ]
      },
      'ii-V-I': {
        name: 'ii-V-I Jazz Progression',
        chords: [
          { root: transposeNote(key, 2), quality: 'minor7' },
          { root: transposeNote(key, 7), quality: 'dominant7' },
          { root: key, quality: 'major7' }
        ]
      }
    };

    const progression = progressions[progressionName];
    if (!progression) {
      throw new Error(`Unknown progression: ${progressionName}`);
    }

    const chordSet = await this.createChordSet(
      `${key} ${progression.name}`,
      `${progression.name} in the key of ${key}`
    );

    for (const chordSpec of progression.chords) {
      const chord = await this.addChord(chordSpec.root, chordSpec.quality);
      await this.addChordToSet(chordSet.id, chord.id);
    }

    return chordSet;
  }

  // ─── Import / Export ─────────────────────────────────────────────────────

  async exportData(): Promise<string> {
    await this.ensureInitialized();
    const data = await this.storage.exportData();
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<{ chordsImported: number; chordSetsImported: number }> {
    await this.ensureInitialized();
    
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.chords || !Array.isArray(data.chords)) {
        throw new Error('Invalid data format: chords array missing');
      }
      if (!data.chordSets || !Array.isArray(data.chordSets)) {
        throw new Error('Invalid data format: chordSets array missing');
      }

      await this.storage.importData(data);
      await this.loadChordsFromStorage();

      return {
        chordsImported: data.chords.length,
        chordSetsImported: data.chordSets.length
      };
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  // ─── Utility ─────────────────────────────────────────────────────────────

  async getStats(): Promise<{ chordCount: number; chordSetCount: number }> {
    await this.ensureInitialized();
    return this.storage.getStats();
  }

  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    this.chordService.clear();
    await this.storage.clearAllData();
  }

  private async loadChordsFromStorage(): Promise<void> {
    const chords = await this.storage.getAllChords();
    this.chordService.clear();
    for (const chord of chords) {
      this.chordService.setChord(chord);
    }
  }

  close(): void {
    this.storage.close();
    this.initialized = false;
  }
}

// Singleton instance
export const chordManager = new ChordManager();
