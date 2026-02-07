/**
 * Enhanced Chord Detection
 * 
 * Uses the chord database to provide better chord detection and parsing.
 * Returns lean chord identities (root, quality) plus display metadata in separate fields.
 */

import { ChordDatabaseUtils, ChordPosition } from './chord-database';
import { Note, ChordQuality } from '../types/chord';
import { parseChordNameToIdentity, formatChordName } from './music-theory';

export interface ChordDetectionResult {
  root: Note;
  quality: ChordQuality;
  name: string;
  confidence: number;
  position?: ChordPosition;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  alternatives: Array<{ root: Note; quality: ChordQuality; name: string }>;
}

export interface ChordParseOptions {
  includeVariations?: boolean;
  minConfidence?: number;
  maxAlternatives?: number;
}

/**
 * Enhanced Chord Detection Class
 */
export class EnhancedChordDetection {
  private static instance: EnhancedChordDetection;
  
  static getInstance(): EnhancedChordDetection {
    if (!this.instance) {
      this.instance = new EnhancedChordDetection();
    }
    return this.instance;
  }

  /**
   * Parse chord text and extract chord information
   */
  parseChordText(text: string, options: ChordParseOptions = {}): ChordDetectionResult[] {
    const {
      includeVariations = true,
      minConfidence = 0.7,
      maxAlternatives = 3
    } = options;

    const results: ChordDetectionResult[] = [];
    
    const chordPatterns = [
      /([A-G][#b]?)(maj7?|m7?|7|sus[24]|dim|aug|add\d+|maj\d+|m\d+)?/g,
      /\[([A-G][#b]?)(maj7?|m7?|7|sus[24]|dim|aug|add\d+|maj\d+|m\d+)?\]/g,
      /\(([A-G][#b]?)(maj7?|m7?|7|sus[24]|dim|aug|add\d+|maj\d+|m\d+)?\)/g
    ];

    for (const pattern of chordPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        const root = match[1];
        const suffix = match[2] || '';
        const chordName = root + suffix;

        if (ChordDatabaseUtils.isValidChord(chordName)) {
          const result = this.createChordResult(chordName, fullMatch);
          if (result && result.confidence >= minConfidence) {
            results.push(result);
          }
        } else {
          const alternatives = this.findChordAlternatives(chordName);
          for (const alt of alternatives.slice(0, maxAlternatives)) {
            const result = this.createChordResult(alt, fullMatch);
            if (result && result.confidence >= minConfidence) {
              results.push(result);
            }
          }
        }
      }
    }

    return this.deduplicateAndSort(results, maxAlternatives);
  }

  /**
   * Create a chord result from chord name
   */
  private createChordResult(chordName: string, originalText: string): ChordDetectionResult | null {
    const chordData = ChordDatabaseUtils.getChord(chordName);
    if (!chordData) return null;

    const parsed = parseChordNameToIdentity(chordName);
    if (!parsed) return null;

    const difficulty = ChordDatabaseUtils.getChordDifficulty(chordName);
    const similarChords = ChordDatabaseUtils.findSimilarChords(chordName);
    const confidence = this.calculateConfidence(chordName, originalText);

    const alternatives = similarChords.slice(0, 3).map(name => {
      const altParsed = parseChordNameToIdentity(name);
      return {
        root: altParsed?.root || parsed.root,
        quality: altParsed?.quality || parsed.quality,
        name
      };
    });

    return {
      root: parsed.root,
      quality: parsed.quality,
      name: formatChordName(parsed.root, parsed.quality),
      confidence,
      position: chordData.positions[0],
      difficulty,
      alternatives
    };
  }

  /**
   * Calculate confidence score for chord detection
   */
  private calculateConfidence(chordName: string, originalText: string): number {
    let confidence = 1.0;

    if (originalText.toLowerCase() === chordName.toLowerCase()) {
      return confidence;
    }

    if (originalText.toLowerCase().includes(chordName.toLowerCase())) {
      confidence *= 0.9;
    }

    const variations = this.getCommonVariations(chordName);
    if (variations.includes(originalText.toLowerCase())) {
      confidence *= 0.8;
    }

    const distance = this.levenshteinDistance(
      chordName.toLowerCase(), 
      originalText.toLowerCase()
    );
    if (distance > 0) {
      confidence *= Math.max(0.1, 1 - (distance / chordName.length));
    }

    return Math.max(0.1, confidence);
  }

  /**
   * Find chord alternatives for unknown chords
   */
  private findChordAlternatives(chordName: string): string[] {
    const { root } = ChordDatabaseUtils.parseChordName(chordName);
    const alternatives: string[] = [];

    const commonSuffixes = ['', 'm', '7', 'maj7', 'sus2', 'sus4'];
    for (const altSuffix of commonSuffixes) {
      const altChord = root + altSuffix;
      if (ChordDatabaseUtils.isValidChord(altChord)) {
        alternatives.push(altChord);
      }
    }

    return alternatives;
  }

  /**
   * Get common chord variations
   */
  private getCommonVariations(chordName: string): string[] {
    const variations: { [key: string]: string[] } = {
      'C': ['c', 'C major', 'C maj'],
      'Cm': ['c minor', 'c min', 'c-'],
      'C7': ['c dominant 7', 'c dom 7'],
      'Cmaj7': ['c major 7', 'c maj 7', 'cM7'],
      'Csus2': ['c suspended 2', 'c sus 2'],
      'Csus4': ['c suspended 4', 'c sus 4']
    };

    return variations[chordName] || [];
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Remove duplicates and sort results
   */
  private deduplicateAndSort(
    results: ChordDetectionResult[], 
    maxResults: number
  ): ChordDetectionResult[] {
    const seen = new Set<string>();
    const unique = results.filter(result => {
      const key = result.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxResults);
  }

  /**
   * Get chord suggestions based on context
   */
  getChordSuggestions(context: string, limit: number = 5): string[] {
    const allChords = ChordDatabaseUtils.getAllChordNames();
    const suggestions: { chord: string; score: number }[] = [];

    for (const chord of allChords) {
      let score = 0;
      
      if (context.toLowerCase().includes(chord.toLowerCase())) {
        score += 10;
      }

      const { root } = ChordDatabaseUtils.parseChordName(chord);
      if (context.toLowerCase().includes(root.toLowerCase())) {
        score += 5;
      }

      const similar = ChordDatabaseUtils.findSimilarChords(chord);
      for (const sim of similar) {
        if (context.toLowerCase().includes(sim.toLowerCase())) {
          score += 3;
        }
      }

      if (score > 0) {
        suggestions.push({ chord, score });
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.chord);
  }
}

// Export singleton instance
export const enhancedChordDetection = EnhancedChordDetection.getInstance();
