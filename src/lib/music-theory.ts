/**
 * Music Theory Utilities
 * Core music theory functions for chord analysis and transformation.
 * 
 * All functions are pure — no side effects, no stored state.
 * The compute functions (computeChordView, computeChordInContext) are the primary
 * way UI components derive display data from a chord's (root, quality) identity.
 */

import { Note, ChordQuality, ChordView, ChordInContext, Scale, RomanNumeral, ChordExtension, ChordSubstitution, ScaleCompatibility } from '../types/chord';

// ─── Constants ───────────────────────────────────────────────────────────────

// Note relationships and enharmonic equivalents
export const CHROMATIC_NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NOTES: Note[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const ENHARMONIC_MAP: Record<string, string[]> = {
  'C#': ['Db'],
  'Db': ['C#'],
  'D#': ['Eb'],
  'Eb': ['D#'],
  'F#': ['Gb'],
  'Gb': ['F#'],
  'G#': ['Ab'],
  'Ab': ['G#'],
  'A#': ['Bb'],
  'Bb': ['A#']
};

// Interval patterns
export const INTERVALS: Record<string, number> = {
  'P1': 0,   // Perfect Unison
  'm2': 1,   // Minor 2nd
  'M2': 2,   // Major 2nd
  'm3': 3,   // Minor 3rd
  'M3': 4,   // Major 3rd
  'P4': 5,   // Perfect 4th
  'TT': 6,   // Tritone
  'P5': 7,   // Perfect 5th
  'm6': 8,   // Minor 6th
  'M6': 9,   // Major 6th
  'm7': 10,  // Minor 7th
  'M7': 11,  // Major 7th
  'P8': 12   // Perfect Octave
};

// Chord quality definitions (intervals from root)
export const CHORD_INTERVALS: Record<ChordQuality, string[]> = {
  'major': ['1', '3', '5'],
  'minor': ['1', '♭3', '5'],
  'diminished': ['1', '♭3', '♭5'],
  'augmented': ['1', '3', '#5'],
  'major7': ['1', '3', '5', '7'],
  'minor7': ['1', '♭3', '5', '♭7'],
  'dominant7': ['1', '3', '5', '♭7'],
  'diminished7': ['1', '♭3', '♭5', '♭♭7'],
  'half-diminished7': ['1', '♭3', '♭5', '♭7'],
  'major9': ['1', '3', '5', '7', '9'],
  'minor9': ['1', '♭3', '5', '♭7', '9'],
  'dominant9': ['1', '3', '5', '♭7', '9'],
  'sus2': ['1', '2', '5'],
  'sus4': ['1', '4', '5'],
  'add9': ['1', '3', '5', '9'],
  'add11': ['1', '3', '5', '11'],
  'add13': ['1', '3', '5', '13']
};

// All chord qualities as an array (useful for iteration)
export const ALL_QUALITIES: ChordQuality[] = Object.keys(CHORD_INTERVALS) as ChordQuality[];

// Scale patterns (intervals)
export const SCALE_PATTERNS: Record<Scale, number[]> = {
  'major': [0, 2, 4, 5, 7, 9, 11],
  'natural_minor': [0, 2, 3, 5, 7, 8, 10],
  'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic_minor': [0, 2, 3, 5, 7, 9, 11],
  'dorian': [0, 2, 3, 5, 7, 9, 10],
  'phrygian': [0, 1, 3, 5, 7, 8, 10],
  'lydian': [0, 2, 4, 6, 7, 9, 11],
  'mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'locrian': [0, 1, 3, 5, 6, 8, 10],
  'pentatonic_major': [0, 2, 4, 7, 9],
  'pentatonic_minor': [0, 3, 5, 7, 10],
  'blues': [0, 3, 5, 6, 7, 10]
};

// Roman numeral patterns for major and minor keys
export const MAJOR_KEY_NUMERALS: RomanNumeral[] = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
export const MINOR_KEY_NUMERALS: RomanNumeral[] = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

// Quality suffix map for display names
const QUALITY_SUFFIX_MAP: Record<ChordQuality, string> = {
  'major': '',
  'minor': 'm',
  'diminished': '°',
  'augmented': '+',
  'major7': 'maj7',
  'minor7': 'm7',
  'dominant7': '7',
  'diminished7': '°7',
  'half-diminished7': 'ø7',
  'major9': 'maj9',
  'minor9': 'm9',
  'dominant9': '9',
  'sus2': 'sus2',
  'sus4': 'sus4',
  'add9': 'add9',
  'add11': 'add11',
  'add13': 'add13'
};

// Reverse map: suffix string → ChordQuality
const SUFFIX_TO_QUALITY: Record<string, ChordQuality> = {
  '': 'major',
  'm': 'minor',
  '°': 'diminished',
  'dim': 'diminished',
  '+': 'augmented',
  'aug': 'augmented',
  'maj7': 'major7',
  'm7': 'minor7',
  '7': 'dominant7',
  '°7': 'diminished7',
  'dim7': 'diminished7',
  'ø7': 'half-diminished7',
  'maj9': 'major9',
  'm9': 'minor9',
  '9': 'dominant9',
  'sus2': 'sus2',
  'sus4': 'sus4',
  'add9': 'add9',
  'add11': 'add11',
  'add13': 'add13'
};

// ─── Primary Compute Functions ───────────────────────────────────────────────

/**
 * Compute all derived chord data from (root, quality).
 * This is the primary function UI components should call.
 */
export function computeChordView(root: Note, quality: ChordQuality): ChordView {
  const notes = generateChordNotes(root, quality);
  const intervals = CHORD_INTERVALS[quality];
  const inversions = generateInversions(notes);
  const name = formatChordName(root, quality);

  return { name, notes, intervals, inversions };
}

/**
 * Compute chord data with key context (roman numeral, compatible scales).
 * Use when displaying a chord in the context of a specific key.
 */
export function computeChordInContext(
  root: Note,
  quality: ChordQuality,
  key: Note,
  isMinor: boolean = false
): ChordInContext {
  const view = computeChordView(root, quality);
  const romanNumeral = getRomanNumeral(root, quality, key, isMinor) || '';
  const compatibleScales = findCompatibleScales(view.notes);
  const scaleContext = compatibleScales
    .slice(0, 5)
    .map(comp => `${comp.key} ${comp.scale.replace('_', ' ')}`);

  return { ...view, romanNumeral, scaleContext };
}

/**
 * Generate display name for a chord: e.g., formatChordName('A', 'minor') → "Am"
 */
export function formatChordName(root: Note, quality: ChordQuality): string {
  return `${root}${QUALITY_SUFFIX_MAP[quality]}`;
}

/**
 * Parse a chord name string into (root, quality).
 * e.g., parseChordNameToIdentity("Am7") → { root: 'A', quality: 'minor7' }
 */
export function parseChordNameToIdentity(name: string): { root: Note; quality: ChordQuality } | null {
  // Match root note (with optional sharp/flat)
  const match = name.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return null;

  const rootStr = match[1];
  const suffix = match[2];

  // Normalize flat notation to match our Note type
  let root: Note;
  if (rootStr.includes('b') && rootStr.length === 2) {
    // Convert 'b' to proper flat: Ab, Bb, Db, Eb, Gb
    const flatNote = rootStr[0] + 'b';
    if (CHROMATIC_NOTES.includes(flatNote as Note) || FLAT_NOTES.includes(flatNote as Note)) {
      root = flatNote as Note;
    } else {
      return null;
    }
  } else if (CHROMATIC_NOTES.includes(rootStr as Note)) {
    root = rootStr as Note;
  } else {
    return null;
  }

  // Look up quality from suffix
  const quality = SUFFIX_TO_QUALITY[suffix];
  if (!quality) {
    // Try common alternate spellings
    if (suffix === 'min' || suffix === 'minor') return { root, quality: 'minor' };
    if (suffix === 'maj' || suffix === 'major') return { root, quality: 'major' };
    // Default: if suffix is empty or unrecognized, assume major
    if (suffix === '') return { root, quality: 'major' };
    return null;
  }

  return { root, quality };
}

/**
 * Reverse interval search: find all (root, quality) pairs that contain the given note.
 * e.g., findChordsByNote('E') → [{root:'E', quality:'major'}, {root:'C', quality:'major'}, {root:'A', quality:'minor'}, ...]
 */
export function findChordsByNote(note: Note): Array<{ root: Note; quality: ChordQuality }> {
  const results: Array<{ root: Note; quality: ChordQuality }> = [];

  for (const quality of ALL_QUALITIES) {
    const intervals = CHORD_INTERVALS[quality];
    for (const interval of intervals) {
      const semitones = intervalToSemitones(interval);
      // Invert: if note is at this interval from root, then root = note - semitones
      const root = transposeNote(note, -semitones);
      results.push({ root, quality });
    }
  }

  return results;
}

// ─── Core Music Theory Functions ─────────────────────────────────────────────

/**
 * Get the semitone distance between two notes
 */
export function getSemitoneDistance(note1: Note, note2: Note): number {
  const index1 = CHROMATIC_NOTES.indexOf(note1);
  const index2 = CHROMATIC_NOTES.indexOf(note2);
  return (index2 - index1 + 12) % 12;
}

/**
 * Transpose a note by a given number of semitones
 */
export function transposeNote(note: Note, semitones: number): Note {
  const index = CHROMATIC_NOTES.indexOf(note);
  if (index === -1) {
    // Handle flat notes by finding chromatic equivalent
    const flatIndex = FLAT_NOTES.indexOf(note);
    if (flatIndex === -1) return note; // Unknown note, return as-is
    const newIndex = (flatIndex + semitones + 120) % 12; // +120 to handle negative
    return CHROMATIC_NOTES[newIndex];
  }
  const newIndex = (index + semitones + 120) % 12; // +120 to safely handle negative semitones
  return CHROMATIC_NOTES[newIndex];
}

/**
 * Convert interval notation to semitones
 */
export function intervalToSemitones(interval: string): number {
  const mapping: Record<string, number> = {
    '1': 0, '♭2': 1, '2': 2, '♭3': 3, '3': 4, '4': 5,
    '#5': 8, '♭5': 6, '5': 7, '♭6': 8, '6': 9, '♭7': 10, '7': 11,
    '♭♭7': 9,
    '9': 14, '♭9': 13, '#9': 15, '11': 17, '#11': 18, '13': 21, '♭13': 20
  };
  return mapping[interval] || 0;
}

/**
 * Generate notes for a chord given root and quality
 */
export function generateChordNotes(root: Note, quality: ChordQuality): string[] {
  const intervals = CHORD_INTERVALS[quality];
  return intervals.map(interval => {
    const semitones = intervalToSemitones(interval);
    return transposeNote(root, semitones);
  });
}

/**
 * Generate all inversions of a chord
 */
export function generateInversions(notes: string[]): string[][] {
  const inversions: string[][] = [];
  
  for (let i = 0; i < notes.length; i++) {
    const inversion = [...notes.slice(i), ...notes.slice(0, i)];
    inversions.push(inversion);
  }
  
  return inversions;
}

/**
 * Get Roman numeral for a chord in a given key
 */
export function getRomanNumeral(chordRoot: Note, chordQuality: ChordQuality, key: Note, isMinorKey: boolean = false): string | null {
  const scaleNotes = generateScale(key, isMinorKey ? 'natural_minor' : 'major');
  const rootIndex = scaleNotes.findIndex(note => note === chordRoot);
  
  if (rootIndex === -1) return null;
  
  const numerals = isMinorKey ? MINOR_KEY_NUMERALS : MAJOR_KEY_NUMERALS;
  let numeral = numerals[rootIndex];
  
  // Adjust for chord quality variations
  if (chordQuality === 'major7' && numeral.toLowerCase() === numeral) {
    numeral = numeral.toUpperCase() + '7';
  } else if (chordQuality === 'minor7' && numeral.toUpperCase() === numeral) {
    numeral = numeral.toLowerCase() + '7';
  } else if (chordQuality === 'dominant7') {
    numeral = numeral + '7';
  }
  
  return numeral;
}

/**
 * Generate scale notes for a given key and scale type
 */
export function generateScale(key: Note, scale: Scale): Note[] {
  const pattern = SCALE_PATTERNS[scale];
  return pattern.map(semitones => transposeNote(key, semitones));
}

/**
 * Find compatible scales for a given chord (accepts note array)
 */
export function findCompatibleScales(chordNotes: string[]): ScaleCompatibility[] {
  const compatibilities: ScaleCompatibility[] = [];
  
  CHROMATIC_NOTES.forEach(key => {
    Object.entries(SCALE_PATTERNS).forEach(([scaleName, _pattern]) => {
      const scaleNotes = generateScale(key, scaleName as Scale);
      const commonTones = chordNotes.filter(note => scaleNotes.includes(note as Note));
      const compatibility = commonTones.length / chordNotes.length;
      
      if (compatibility >= 0.75) {
        compatibilities.push({
          scale: scaleName as Scale,
          key,
          compatibility,
          commonTones
        });
      }
    });
  });
  
  return compatibilities.sort((a, b) => b.compatibility - a.compatibility);
}

/**
 * Suggest chord extensions
 */
export function suggestChordExtensions(root: Note, currentQuality: ChordQuality): ChordExtension[] {
  const extensions: ChordExtension[] = [];
  
  if (currentQuality === 'major') {
    extensions.push({
      name: 'maj7',
      notes: generateChordNotes(root, 'major7'),
      intervals: CHORD_INTERVALS['major7']
    });
    extensions.push({
      name: 'add9',
      notes: generateChordNotes(root, 'add9'),
      intervals: CHORD_INTERVALS['add9']
    });
  } else if (currentQuality === 'minor') {
    extensions.push({
      name: 'm7',
      notes: generateChordNotes(root, 'minor7'),
      intervals: CHORD_INTERVALS['minor7']
    });
    extensions.push({
      name: 'add9',
      notes: generateChordNotes(root, 'add9'),
      intervals: CHORD_INTERVALS['add9']
    });
  }
  
  return extensions;
}

/**
 * Suggest chord substitutions
 */
export function suggestChordSubstitutions(root: Note, quality: ChordQuality): ChordSubstitution[] {
  const substitutions: ChordSubstitution[] = [];
  
  if (quality === 'major') {
    const relativeMinor = transposeNote(root, 9);
    substitutions.push({
      name: `${relativeMinor}m`,
      notes: generateChordNotes(relativeMinor as Note, 'minor'),
      reason: 'Relative minor - shares same notes'
    });
  } else if (quality === 'minor') {
    const relativeMajor = transposeNote(root, 3);
    substitutions.push({
      name: `${relativeMajor}`,
      notes: generateChordNotes(relativeMajor as Note, 'major'),
      reason: 'Relative major - shares same notes'
    });
  }
  
  return substitutions;
}

/**
 * Detect chord quality from notes
 */
export function detectChordQuality(notes: string[]): ChordQuality | null {
  if (notes.length < 3) return null;
  
  const sortedNotes = [...notes].sort((a, b) => 
    CHROMATIC_NOTES.indexOf(a as Note) - CHROMATIC_NOTES.indexOf(b as Note)
  );
  
  for (const [quality, intervals] of Object.entries(CHORD_INTERVALS)) {
    if (intervals.length === notes.length) {
      const expectedNotes = generateChordNotes(sortedNotes[0] as Note, quality as ChordQuality);
      if (expectedNotes.every(note => sortedNotes.includes(note))) {
        return quality as ChordQuality;
      }
    }
  }
  
  return null;
}
