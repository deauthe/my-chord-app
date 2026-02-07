/**
 * Chord Text Parser
 * 
 * Integrates the enhanced chord detection with the existing chord detection system
 * to provide better chord parsing from text content.
 * 
 * Uses lean chord identities (root, quality) — display names are computed on demand.
 */

import { enhancedChordDetection, ChordDetectionResult } from './enhanced-chord-detection';
import { Note, ChordQuality } from '../types/chord';
import { formatChordName } from './music-theory';
import { ChordDatabaseUtils } from './chord-database';

export interface ParsedChord {
  root: Note;
  quality: ChordQuality;
  name: string;
  position: {
    start: number;
    end: number;
  };
  confidence: number;
  originalText: string;
  alternatives: Array<{ root: Note; quality: ChordQuality; name: string }>;
}

export interface ChordParseResult {
  chords: ParsedChord[];
  text: string;
  totalChords: number;
  uniqueChords: string[];
}

/**
 * Parse chord symbols from text content
 */
export function parseChordText(
  text: string, 
  options: {
    includeVariations?: boolean;
    minConfidence?: number;
    maxAlternatives?: number;
  } = {}
): ChordParseResult {
  const {
    includeVariations = true,
    minConfidence = 0.7,
    maxAlternatives = 3
  } = options;

  const detectionResults = enhancedChordDetection.parseChordText(text, {
    includeVariations,
    minConfidence,
    maxAlternatives
  });

  const parsedChords: ParsedChord[] = [];
  const uniqueChords = new Set<string>();

  for (const result of detectionResults) {
    const chordName = result.name;
    const position = findChordPosition(text, chordName);
    
    if (position) {
      parsedChords.push({
        root: result.root,
        quality: result.quality,
        name: chordName,
        position,
        confidence: result.confidence,
        originalText: text.substring(position.start, position.end),
        alternatives: result.alternatives
      });

      uniqueChords.add(chordName);
    }
  }

  parsedChords.sort((a, b) => a.position.start - b.position.start);

  return {
    chords: parsedChords,
    text,
    totalChords: parsedChords.length,
    uniqueChords: Array.from(uniqueChords)
  };
}

/**
 * Find the position of a chord in text
 */
function findChordPosition(text: string, chordName: string): { start: number; end: number } | null {
  const lowerText = text.toLowerCase();
  const lowerChord = chordName.toLowerCase();

  let index = lowerText.indexOf(lowerChord);
  if (index !== -1) {
    return { start: index, end: index + chordName.length };
  }

  const bracketedChord = `[${chordName}]`;
  index = lowerText.indexOf(bracketedChord.toLowerCase());
  if (index !== -1) {
    return { start: index, end: index + bracketedChord.length };
  }

  const parenthesizedChord = `(${chordName})`;
  index = lowerText.indexOf(parenthesizedChord.toLowerCase());
  if (index !== -1) {
    return { start: index, end: index + parenthesizedChord.length };
  }

  return null;
}

/**
 * Parse chord symbols from tab content
 */
export function parseTabChords(tabContent: string): ChordParseResult {
  const chordPatterns = [
    /([A-G][#b]?)(maj7?|m7?|7|sus[24]|dim|aug|add\d+|maj\d+|m\d+)?/g,
    /\[([A-G][#b]?)(maj7?|m7?|7|sus[24]|dim|aug|add\d+|maj\d+|m\d+)?\]/g,
    /\(([A-G][#b]?)(maj7?|m7?|7|sus[24]|dim|aug|add\d+|maj\d+|m\d+)?\)/g
  ];

  let allMatches: Array<{ match: string; index: number }> = [];

  for (const pattern of chordPatterns) {
    let match;
    while ((match = pattern.exec(tabContent)) !== null) {
      allMatches.push({
        match: match[0],
        index: match.index
      });
    }
  }

  const uniqueMatches = allMatches
    .filter((item, index, arr) => 
      arr.findIndex(other => other.index === item.index) === index
    )
    .sort((a, b) => a.index - b.index);

  const parsedChords: ParsedChord[] = [];
  const uniqueChords = new Set<string>();

  for (const { match, index } of uniqueMatches) {
    const detectionResults = enhancedChordDetection.parseChordText(match, {
      includeVariations: false,
      minConfidence: 0.8,
      maxAlternatives: 1
    });

    if (detectionResults.length > 0) {
      const result = detectionResults[0];
      parsedChords.push({
        root: result.root,
        quality: result.quality,
        name: result.name,
        position: {
          start: index,
          end: index + match.length
        },
        confidence: result.confidence,
        originalText: match,
        alternatives: result.alternatives
      });

      uniqueChords.add(result.name);
    }
  }

  return {
    chords: parsedChords,
    text: tabContent,
    totalChords: parsedChords.length,
    uniqueChords: Array.from(uniqueChords)
  };
}

/**
 * Analyze chord progression from parsed chords
 */
export interface ChordProgressionAnalysis {
  progression: string[];
  key: string | null;
  romanNumerals: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  commonProgressions: string[];
}

export function analyzeChordProgression(chords: ParsedChord[]): ChordProgressionAnalysis {
  const progression = chords.map(parsed => parsed.name);
  
  const key = analyzeKey(progression);
  
  const romanNumerals = progression.map(chord => 
    chordToRomanNumeral(chord, key)
  );
  
  const difficulty = assessProgressionDifficulty(chords);
  
  const commonProgressions = findCommonProgressions(progression);

  return {
    progression,
    key,
    romanNumerals,
    difficulty,
    commonProgressions
  };
}

/**
 * Analyze the key of a chord progression (simplified)
 */
function analyzeKey(progression: string[]): string | null {
  const rootCounts: { [key: string]: number } = {};
  
  for (const chord of progression) {
    const root = chord.match(/^([A-G][#b]?)/)?.[1];
    if (root) {
      rootCounts[root] = (rootCounts[root] || 0) + 1;
    }
  }
  
  const mostCommon = Object.entries(rootCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return mostCommon ? mostCommon[0] : null;
}

/**
 * Convert chord to roman numeral
 */
function chordToRomanNumeral(chord: string, key: string | null): string {
  if (!key) return chord;
  
  const root = chord.match(/^([A-G][#b]?)/)?.[1];
  if (!root) return chord;
  
  const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const keyIndex = scale.indexOf(key);
  const rootIndex = scale.indexOf(root);
  
  if (keyIndex === -1 || rootIndex === -1) return chord;
  
  const interval = (rootIndex - keyIndex + 7) % 7;
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  
  let numeral = romanNumerals[interval];
  
  if (chord.includes('m') && !chord.includes('maj')) {
    numeral = numeral.toLowerCase();
  }
  
  return numeral;
}

/**
 * Assess the difficulty of a chord progression
 * Uses the guitar chord database to determine difficulty from chord names.
 */
function assessProgressionDifficulty(chords: ParsedChord[]): 'beginner' | 'intermediate' | 'advanced' {
  const difficultyScores = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3
  };
  
  let totalScore = 0;
  for (const parsed of chords) {
    const chordName = parsed.name;
    const difficulty = ChordDatabaseUtils.getChordDifficulty(chordName);
    totalScore += difficultyScores[difficulty];
  }
  
  const averageScore = totalScore / chords.length;
  
  if (averageScore <= 1.3) return 'beginner';
  if (averageScore <= 2.3) return 'intermediate';
  return 'advanced';
}

/**
 * Find common chord progressions
 */
function findCommonProgressions(progression: string[]): string[] {
  const commonProgressions = [
    ['C', 'Am', 'F', 'G'],
    ['C', 'F', 'G', 'C'],
    ['Am', 'F', 'C', 'G'],
    ['C', 'G', 'Am', 'F'],
    ['F', 'G', 'Em', 'Am'],
  ];
  
  const found: string[] = [];
  
  for (const common of commonProgressions) {
    if (progression.length >= common.length) {
      for (let i = 0; i <= progression.length - common.length; i++) {
        const slice = progression.slice(i, i + common.length);
        if (arraysEqual(slice, common)) {
          found.push(common.join(' - '));
        }
      }
    }
  }
  
  return found;
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

/**
 * Get chord suggestions based on context
 */
export function getChordSuggestions(context: string, limit: number = 5): string[] {
  return enhancedChordDetection.getChordSuggestions(context, limit);
}

/**
 * Validate chord name
 */
export function isValidChordName(chordName: string): boolean {
  const results = enhancedChordDetection.parseChordText(chordName, {
    includeVariations: false,
    minConfidence: 0.9,
    maxAlternatives: 1
  });
  
  return results.length > 0 && results[0].confidence >= 0.9;
}
