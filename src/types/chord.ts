/**
 * Chord Manager Types
 * 
 * Core principle: A chord's identity is (root, quality).
 * Everything else — name, notes, intervals, inversions — is computed on demand.
 * Context-dependent data (roman numerals, scale compatibility) is never stored.
 */

// ─── Stored Types (persisted in IndexedDB) ───────────────────────────────────

/**
 * The minimal chord identity. This is what gets stored.
 * All derived data (name, notes, intervals, inversions) is computed via music-theory.ts.
 */
export type Chord = {
  id: string;
  root: Note;
  quality: ChordQuality;
  createdAt: Date;
  updatedAt: Date;
};

// ─── Computed Types (never stored, always derived) ───────────────────────────

/**
 * Pure derivation from (root, quality). Computed via computeChordView().
 */
export type ChordView = {
  name: string;           // e.g., "Am"
  notes: string[];        // e.g., ["A", "C", "E"]
  intervals: string[];    // e.g., ["1", "♭3", "5"]
  inversions: string[][]; // e.g., [["A","C","E"], ["C","E","A"], ["E","A","C"]]
};

/**
 * Context-dependent view. Requires a key to compute roman numeral and scale context.
 * Computed via computeChordInContext().
 */
export type ChordInContext = ChordView & {
  romanNumeral: string;
  scaleContext: string[];
};

// ─── Enums & Primitives ──────────────────────────────────────────────────────

export type ChordQuality = 
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'major7'
  | 'minor7'
  | 'dominant7'
  | 'diminished7'
  | 'half-diminished7'
  | 'major9'
  | 'minor9'
  | 'dominant9'
  | 'sus2'
  | 'sus4'
  | 'add9'
  | 'add11'
  | 'add13';

export type Note = 
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' 
  | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type Scale = 
  | 'major'
  | 'natural_minor'
  | 'harmonic_minor'
  | 'melodic_minor'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'locrian'
  | 'pentatonic_major'
  | 'pentatonic_minor'
  | 'blues';

export type RomanNumeral = 
  | 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°'
  | 'i' | 'ii°' | 'III' | 'iv' | 'v' | 'VI' | 'VII';

// ─── Collection & Analysis Types ─────────────────────────────────────────────

export interface ChordSet {
  id: string;
  name: string;
  description?: string;
  chordIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChordExtension {
  name: string;
  notes: string[];
  intervals: string[];
}

export interface ChordSubstitution {
  name: string;
  notes: string[];
  reason: string;
}

export interface ScaleCompatibility {
  scale: Scale;
  key: Note;
  compatibility: number; // 0-1 score
  commonTones: string[];
}
