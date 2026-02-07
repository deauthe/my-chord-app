/**
 * ChordService - Core service for chord CRUD operations
 * 
 * Stores only the lean chord identity: (root, quality).
 * All derived data is computed on demand via music-theory.ts.
 * Analysis functions (scales, extensions, substitutions) live in music-theory.ts as pure functions.
 */

import { v4 as uuidv4 } from 'uuid';
import { Chord, Note, ChordQuality } from '../types/chord';
import { formatChordName, findChordsByNote, computeChordView, transposeNote } from './music-theory';

export class ChordService {
  private chords: Map<string, Chord> = new Map();

  /**
   * Add a new chord by specifying root and quality
   */
  addChord(root: Note, quality: ChordQuality): Chord {
    const id = uuidv4();
    const now = new Date();

    const chord: Chord = {
      id,
      root,
      quality,
      createdAt: now,
      updatedAt: now
    };

    this.chords.set(id, chord);
    return chord;
  }

  /**
   * Get all chords
   */
  getAllChords(): Chord[] {
    return Array.from(this.chords.values());
  }

  /**
   * Get chord by ID
   */
  getChordById(id: string): Chord | undefined {
    return this.chords.get(id);
  }

  /**
   * Update an existing chord
   */
  updateChord(id: string, updates: Partial<Pick<Chord, 'root' | 'quality'>>): Chord {
    const chord = this.chords.get(id);
    if (!chord) {
      throw new Error(`Chord with id ${id} not found`);
    }

    const updatedChord: Chord = {
      ...chord,
      ...updates,
      updatedAt: new Date()
    };

    this.chords.set(id, updatedChord);
    return updatedChord;
  }

  /**
   * Delete a chord
   */
  deleteChord(id: string): boolean {
    return this.chords.delete(id);
  }

  /**
   * Search chords by query string.
   * Matches against computed name, root note, quality, and notes (via reverse interval search).
   */
  searchChords(query: string): Chord[] {
    const lowerQuery = query.toLowerCase();
    const allChords = this.getAllChords();

    // Build a set of (root, quality) pairs that contain the queried note
    const noteMatchSet = new Set<string>();
    // Check if query is a single note name
    const noteNames = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
    const matchedNote = noteNames.find(n => n.toLowerCase() === lowerQuery);
    if (matchedNote) {
      const chordsByNote = findChordsByNote(matchedNote as Note);
      for (const { root, quality } of chordsByNote) {
        noteMatchSet.add(`${root}-${quality}`);
      }
    }

    return allChords.filter(chord => {
      const name = formatChordName(chord.root, chord.quality);
      // Match by name
      if (name.toLowerCase().includes(lowerQuery)) return true;
      // Match by root
      if (chord.root.toLowerCase().includes(lowerQuery)) return true;
      // Match by quality
      if (chord.quality.toLowerCase().includes(lowerQuery)) return true;
      // Match by note containment (reverse search)
      if (noteMatchSet.has(`${chord.root}-${chord.quality}`)) return true;
      return false;
    });
  }

  /**
   * Transpose a chord to a new pitch. Creates a new chord.
   */
  transposeChord(chordId: string, semitones: number): Chord {
    const chord = this.chords.get(chordId);
    if (!chord) {
      throw new Error(`Chord with id ${chordId} not found`);
    }

    const newRoot = transposeNote(chord.root, semitones);
    return this.addChord(newRoot, chord.quality);
  }

  /**
   * Set a chord directly (used for loading from storage)
   */
  setChord(chord: Chord): void {
    this.chords.set(chord.id, chord);
  }

  /**
   * Clear all chords from memory
   */
  clear(): void {
    this.chords.clear();
  }

  /**
   * Export chords to JSON
   */
  exportChords(): string {
    return JSON.stringify(this.getAllChords(), null, 2);
  }

  /**
   * Import chords from JSON
   */
  importChords(jsonData: string): number {
    try {
      const chords = JSON.parse(jsonData) as Chord[];
      let importedCount = 0;
      
      chords.forEach(chord => {
        if (chord.id && chord.root && chord.quality) {
          this.chords.set(chord.id, chord);
          importedCount++;
        }
      });
      
      return importedCount;
    } catch {
      throw new Error('Invalid chord data format');
    }
  }
}
