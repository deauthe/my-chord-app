/**
 * Chord Detection and Analysis Utilities
 * Analyzes sets of notes to determine possible chord interpretations
 */

import { Note, ChordQuality } from '../types/chord';
import { 
  CHROMATIC_NOTES, 
  CHORD_INTERVALS, 
  getSemitoneDistance, 
  ENHARMONIC_MAP 
} from './music-theory';

export interface ChordInterpretation {
  id: string;
  name: string;
  root: Note;
  quality: ChordQuality;
  bassNote?: Note; // For slash chords
  inversion: number; // 0 = root position, 1 = first inversion, etc.
  confidence: number; // 0-1 score for how well this interpretation fits
  missingNotes: string[]; // Notes that should be in the chord but aren't
  extraNotes: string[]; // Notes that are in the input but not in the standard chord
  intervals: string[];
  description: string;
}

export interface ChordAnalysisResult {
  inputNotes: string[];
  normalizedNotes: string[]; // Sorted and deduplicated
  interpretations: ChordInterpretation[];
  bestInterpretation: ChordInterpretation | null;
}

/**
 * Main function to analyze a set of notes and return possible chord interpretations
 */
export function analyzeChord(inputNotes: string[]): ChordAnalysisResult {
  // Normalize and deduplicate notes
  const normalizedNotes = normalizeNotes(inputNotes);
  
  if (normalizedNotes.length < 2) {
    return {
      inputNotes,
      normalizedNotes,
      interpretations: [],
      bestInterpretation: null
    };
  }

  // Find all possible interpretations
  const interpretations = findAllInterpretations(normalizedNotes);
  
  // Sort by confidence score
  interpretations.sort((a, b) => b.confidence - a.confidence);
  
  // Remove duplicate interpretations (same name and root)
  const uniqueInterpretations = removeDuplicateInterpretations(interpretations);
  
  return {
    inputNotes,
    normalizedNotes,
    interpretations: uniqueInterpretations,
    bestInterpretation: uniqueInterpretations[0] || null
  };
}

/**
 * Normalize notes: convert to chromatic scale, remove duplicates, handle enharmonics
 */
function normalizeNotes(notes: string[]): string[] {
  const normalized = new Set<string>();
  
  for (const note of notes) {
    if (!note || note.trim() === '') continue;
    
    const cleanNote = note.trim();
    const chromaticNote = findChromaticEquivalent(cleanNote);
    if (chromaticNote) {
      normalized.add(chromaticNote);
    }
  }
  
  return Array.from(normalized).sort((a, b) => 
    CHROMATIC_NOTES.indexOf(a as Note) - CHROMATIC_NOTES.indexOf(b as Note)
  );
}

/**
 * Find the chromatic equivalent of a note (handling enharmonics)
 */
function findChromaticEquivalent(note: string): string | null {
  // Direct match
  if (CHROMATIC_NOTES.includes(note as Note)) {
    return note;
  }
  
  // Check enharmonic equivalents
  for (const [chromatic, enharmonics] of Object.entries(ENHARMONIC_MAP)) {
    if (enharmonics.includes(note)) {
      return chromatic;
    }
  }
  
  // Check if it's an enharmonic of a chromatic note
  for (const chromatic of CHROMATIC_NOTES) {
    if (ENHARMONIC_MAP[chromatic]?.includes(note)) {
      return chromatic;
    }
  }
  
  return null;
}

/**
 * Resolve a semitone offset from a root note to an actual note name.
 * E.g. resolveNoteName('C', 4) => 'E', resolveNoteName('D', 3) => 'F'
 */
function resolveNoteName(root: Note, semitones: number): string {
  const rootIndex = CHROMATIC_NOTES.indexOf(root);
  if (rootIndex === -1) return '?';
  const noteIndex = (rootIndex + semitones) % 12;
  return CHROMATIC_NOTES[noteIndex];
}

/**
 * Find all possible chord interpretations for a set of notes
 */
function findAllInterpretations(notes: string[]): ChordInterpretation[] {
  const interpretations: ChordInterpretation[] = [];
  
  // Try each note as a potential root
  for (let rootIndex = 0; rootIndex < notes.length; rootIndex++) {
    const root = notes[rootIndex] as Note;
    const rootInterpretations = analyzeWithRoot(notes, root, rootIndex);
    interpretations.push(...rootInterpretations);
  }
  
  // Try slash chord interpretations (different bass note)
  for (let bassIndex = 0; bassIndex < notes.length; bassIndex++) {
    const bassNote = notes[bassIndex] as Note;
    
    for (let rootIndex = 0; rootIndex < notes.length; rootIndex++) {
      if (rootIndex === bassIndex) continue;
      
      const root = notes[rootIndex] as Note;
      const slashInterpretations = analyzeSlashChord(notes, root, bassNote);
      interpretations.push(...slashInterpretations);
    }
  }
  
  return interpretations;
}

/**
 * Analyze chord with a specific root note
 */
function analyzeWithRoot(notes: string[], root: Note, rootIndex: number): ChordInterpretation[] {
  const interpretations: ChordInterpretation[] = [];
  
  // Calculate intervals from root
  const intervals = calculateIntervals(notes, root);
  
  // Try to match against known chord qualities
  for (const [qualityName, standardIntervals] of Object.entries(CHORD_INTERVALS)) {
    const quality = qualityName as ChordQuality;
    const match = matchIntervals(intervals, standardIntervals, root);
    
    if (match.confidence > 0.3) { // Minimum confidence threshold
      // We cannot determine inversion from pitch classes alone — that requires
      // knowing which note is the bass (lowest sounding), which needs octave info.
      // So we always report 0 (unknown / root position assumed).
      const interpretation: ChordInterpretation = {
        id: `${root}-${quality}-${rootIndex}`,
        name: generateChordName(root, quality),
        root,
        quality,
        inversion: 0,
        confidence: match.confidence,
        missingNotes: match.missingNotes,
        extraNotes: match.extraNotes,
        intervals: standardIntervals,
        description: generateDescription(root, quality, 0, match)
      };
      
      interpretations.push(interpretation);
    }
  }
  
  return interpretations;
}

/**
 * Analyze slash chord (chord with different bass note)
 */
function analyzeSlashChord(notes: string[], root: Note, bassNote: Note): ChordInterpretation[] {
  const interpretations: ChordInterpretation[] = [];
  
  // Remove bass note from analysis to focus on upper structure
  const upperNotes = notes.filter(note => note !== bassNote);
  if (upperNotes.length < 2) return interpretations;
  
  // Analyze upper structure
  const intervals = calculateIntervals([root, ...upperNotes.filter(note => note !== root)], root);
  
  for (const [qualityName, standardIntervals] of Object.entries(CHORD_INTERVALS)) {
    const quality = qualityName as ChordQuality;
    const match = matchIntervals(intervals, standardIntervals, root);
    
    if (match.confidence > 0.4) { // Higher threshold for slash chords
      const interpretation: ChordInterpretation = {
        id: `${root}-${quality}-slash-${bassNote}`,
        name: `${generateChordName(root, quality)}/${bassNote}`,
        root,
        quality,
        bassNote,
        inversion: 0, // Slash chords are notated in root position
        confidence: match.confidence * 0.9, // Slight penalty for complexity
        missingNotes: match.missingNotes,
        extraNotes: match.extraNotes,
        intervals: standardIntervals,
        description: `${generateChordName(root, quality)} over ${bassNote} bass`
      };
      
      interpretations.push(interpretation);
    }
  }
  
  return interpretations;
}

/**
 * Calculate intervals from root note
 */
function calculateIntervals(notes: string[], root: Note): number[] {
  return notes
    .map(note => getSemitoneDistance(root, note as Note))
    .sort((a, b) => a - b);
}

/**
 * Match calculated intervals against standard chord intervals.
 * Root is needed to resolve interval labels to actual note names.
 */
function matchIntervals(
  actualIntervals: number[], 
  standardIntervals: string[],
  root?: Note
): {
  confidence: number;
  missingNotes: string[];
  extraNotes: string[];
} {
  const standardSemitones = standardIntervals.map(intervalToSemitones);
  
  let matches = 0;
  const missing: string[] = [];
  const extra: string[] = [];
  
  // Check how many standard intervals are present
  for (let i = 0; i < standardSemitones.length; i++) {
    if (actualIntervals.includes(standardSemitones[i])) {
      matches++;
    } else {
      // Show both the interval and the actual note name: e.g. "♭3 (Bb)"
      const label = root
        ? `${standardIntervals[i]} (${resolveNoteName(root, standardSemitones[i])})`
        : standardIntervals[i];
      missing.push(label);
    }
  }
  
  // Check for extra notes
  for (const interval of actualIntervals) {
    if (!standardSemitones.includes(interval)) {
      const intervalName = semitonesToInterval(interval);
      const label = root
        ? `${intervalName} (${resolveNoteName(root, interval)})`
        : intervalName;
      extra.push(label);
    }
  }
  
  // Calculate confidence score
  let confidence = 0;
  
  if (standardSemitones.length === 0) {
    confidence = 0;
  } else {
    // Base confidence on match ratio
    confidence = matches / standardSemitones.length;
    
    // Boost confidence for perfect matches
    if (matches === standardSemitones.length && extra.length === 0) {
      confidence = 1.0;
    }
    
    // Penalty for missing important intervals (3rd, 5th)
    const importantIntervals = [3, 4, 7]; // Minor 3rd, Major 3rd, Perfect 5th
    for (const important of importantIntervals) {
      if (standardSemitones.includes(important) && !actualIntervals.includes(important)) {
        confidence *= 0.7;
      }
    }
    
    // Small penalty for extra notes
    confidence *= Math.pow(0.95, extra.length);
  }
  
  return { confidence, missingNotes: missing, extraNotes: extra };
}

/**
 * Convert interval string to semitones
 */
function intervalToSemitones(interval: string): number {
  const mapping: Record<string, number> = {
    '1': 0, '♭2': 1, '2': 2, '♭3': 3, '3': 4, '4': 5,
    '♭5': 6, '5': 7, '♭6': 8, '6': 9, '♭7': 10, '7': 11,
    '9': 14, '♭9': 13, '#9': 15, '11': 17, '#11': 18, '13': 21, '♭13': 20
  };
  return mapping[interval] || 0;
}

/**
 * Convert semitones back to interval string
 */
function semitonesToInterval(semitones: number): string {
  const mapping: Record<number, string> = {
    0: '1', 1: '♭2', 2: '2', 3: '♭3', 4: '3', 5: '4',
    6: '♭5', 7: '5', 8: '♭6', 9: '6', 10: '♭7', 11: '7',
    13: '♭9', 14: '9', 15: '#9', 17: '11', 18: '#11', 20: '♭13', 21: '13'
  };
  return mapping[semitones] || `+${semitones}`;
}

/**
 * Generate chord name from root and quality
 */
function generateChordName(root: Note, quality: ChordQuality): string {
  const qualityMap: Record<ChordQuality, string> = {
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

  return `${root}${qualityMap[quality]}`;
}

/**
 * Generate human-readable description
 */
function generateDescription(
  root: Note, 
  quality: ChordQuality, 
  inversion: number,
  match: { confidence: number; missingNotes: string[]; extraNotes: string[] }
): string {
  let desc = generateChordName(root, quality);
  
  if (inversion > 0) {
    const inversionNames = ['', '1st inversion', '2nd inversion', '3rd inversion'];
    desc += ` (${inversionNames[inversion] || `${inversion}th inversion`})`;
  }
  
  if (match.missingNotes.length > 0) {
    desc += ` [missing: ${match.missingNotes.join(', ')}]`;
  }
  
  if (match.extraNotes.length > 0) {
    desc += ` [extra: ${match.extraNotes.join(', ')}]`;
  }
  
  return desc;
}

/**
 * Remove duplicate interpretations with same name and root
 */
function removeDuplicateInterpretations(interpretations: ChordInterpretation[]): ChordInterpretation[] {
  const seen = new Set<string>();
  const unique: ChordInterpretation[] = [];
  
  for (const interpretation of interpretations) {
    const key = `${interpretation.name}-${interpretation.bassNote || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(interpretation);
    } else {
      // If we've seen this interpretation before, keep the one with higher confidence
      const existingIndex = unique.findIndex(interp => 
        `${interp.name}-${interp.bassNote || ''}` === key
      );
      if (existingIndex >= 0 && interpretation.confidence > unique[existingIndex].confidence) {
        unique[existingIndex] = interpretation;
      }
    }
  }
  
  return unique;
}

/**
 * Quick chord detection for simple cases (returns best match only)
 */
export function quickDetectChord(notes: string[]): ChordInterpretation | null {
  const analysis = analyzeChord(notes);
  return analysis.bestInterpretation;
}

/**
 * Get chord suggestions for incomplete chord entry
 */
export function getChordSuggestions(notes: string[], minConfidence: number = 0.5): ChordInterpretation[] {
  const analysis = analyzeChord(notes);
  return analysis.interpretations.filter(interp => interp.confidence >= minConfidence);
}

/**
 * Check if a set of notes forms a valid chord
 */
export function isValidChord(notes: string[], minConfidence: number = 0.6): boolean {
  const best = quickDetectChord(notes);
  return best !== null && best.confidence >= minConfidence;
}
