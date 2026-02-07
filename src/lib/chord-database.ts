/**
 * Chord Database
 * 
 * Based on the chords-db project structure from https://github.com/tombatossals/chords-db
 * This provides a comprehensive database of guitar chords with fret positions and fingerings.
 */

export interface ChordPosition {
  frets: string;        // Fret positions for each string (e.g., "0320xx")
  fingers: string;      // Finger positions (e.g., "031000")
  barres?: number;      // Barre fret number
  capo?: boolean;       // Whether to show as capo
}

export interface ChordData {
  key: string;          // Root note (e.g., "C", "D", "F#")
  suffix: string;       // Chord type (e.g., "maj", "m", "7", "sus2")
  positions: ChordPosition[];
}

export interface ChordDatabase {
  [chordName: string]: ChordData;
}

/**
 * Guitar Chord Database
 * Based on chords-db structure with common chords
 */
export const guitarChords: ChordDatabase = {
  // C Major Chords
  'C': {
    key: 'C',
    suffix: '',
    positions: [{
      frets: '032010',
      fingers: '032010'
    }, {
      frets: 'x32010',
      fingers: 'x32010'
    }, {
      frets: 'x35553',
      fingers: 'x13421',
      barres: 3
    }]
  },
  'Cm': {
    key: 'C',
    suffix: 'm',
    positions: [{
      frets: 'x35543',
      fingers: 'x13421',
      barres: 3
    }, {
      frets: '810888',
      fingers: '210111',
      barres: 8
    }]
  },
  'C7': {
    key: 'C',
    suffix: '7',
    positions: [{
      frets: 'x32310',
      fingers: 'x32410'
    }, {
      frets: 'x35353',
      fingers: 'x13131',
      barres: 3
    }]
  },
  'Cmaj7': {
    key: 'C',
    suffix: 'maj7',
    positions: [{
      frets: 'x32000',
      fingers: 'x32000'
    }, {
      frets: 'x35453',
      fingers: 'x13241',
      barres: 3
    }]
  },
  'Csus2': {
    key: 'C',
    suffix: 'sus2',
    positions: [{
      frets: 'x30010',
      fingers: 'x30010'
    }, {
      frets: 'x35553',
      fingers: 'x13421',
      barres: 3
    }]
  },
  'Csus4': {
    key: 'C',
    suffix: 'sus4',
    positions: [{
      frets: 'x33010',
      fingers: 'x33010'
    }, {
      frets: 'x35563',
      fingers: 'x13421',
      barres: 3
    }]
  },

  // D Major Chords
  'D': {
    key: 'D',
    suffix: '',
    positions: [{
      frets: 'xx0232',
      fingers: 'xx0232'
    }, {
      frets: 'x54232',
      fingers: 'x43121'
    }, {
      frets: 'x57775',
      fingers: 'x13421',
      barres: 5
    }]
  },
  'Dm': {
    key: 'D',
    suffix: 'm',
    positions: [{
      frets: 'xx0231',
      fingers: 'xx0231'
    }, {
      frets: 'x55775',
      fingers: 'x13421',
      barres: 5
    }]
  },
  'D7': {
    key: 'D',
    suffix: '7',
    positions: [{
      frets: 'xx0212',
      fingers: 'xx0212'
    }, {
      frets: 'x54535',
      fingers: 'x13131',
      barres: 5
    }]
  },
  'Dmaj7': {
    key: 'D',
    suffix: 'maj7',
    positions: [{
      frets: 'xx0222',
      fingers: 'xx0222'
    }, {
      frets: 'x57675',
      fingers: 'x13421',
      barres: 5
    }]
  },
  'Dsus2': {
    key: 'D',
    suffix: 'sus2',
    positions: [{
      frets: 'xx0230',
      fingers: 'xx0230'
    }, {
      frets: 'x55775',
      fingers: 'x13421',
      barres: 5
    }]
  },
  'Dsus4': {
    key: 'D',
    suffix: 'sus4',
    positions: [{
      frets: 'xx0233',
      fingers: 'xx0233'
    }, {
      frets: 'x55785',
      fingers: 'x13421',
      barres: 5
    }]
  },

  // E Major Chords
  'E': {
    key: 'E',
    suffix: '',
    positions: [{
      frets: '022100',
      fingers: '023100'
    }, {
      frets: 'x79997',
      fingers: 'x13421',
      barres: 7
    }]
  },
  'Em': {
    key: 'E',
    suffix: 'm',
    positions: [{
      frets: '022000',
      fingers: '023000'
    }, {
      frets: 'x79987',
      fingers: 'x13421',
      barres: 7
    }]
  },
  'E7': {
    key: 'E',
    suffix: '7',
    positions: [{
      frets: '020100',
      fingers: '020100'
    }, {
      frets: 'x79797',
      fingers: 'x13131',
      barres: 7
    }]
  },
  'Emaj7': {
    key: 'E',
    suffix: 'maj7',
    positions: [{
      frets: '021100',
      fingers: '021100'
    }, {
      frets: 'x79897',
      fingers: 'x13421',
      barres: 7
    }]
  },
  'Esus2': {
    key: 'E',
    suffix: 'sus2',
    positions: [{
      frets: '022200',
      fingers: '023400'
    }, {
      frets: 'x79997',
      fingers: 'x13421',
      barres: 7
    }]
  },
  'Esus4': {
    key: 'E',
    suffix: 'sus4',
    positions: [{
      frets: '022200',
      fingers: '023400'
    }, {
      frets: 'x799a7',
      fingers: 'x13421',
      barres: 7
    }]
  },

  // F Major Chords
  'F': {
    key: 'F',
    suffix: '',
    positions: [{
      frets: '133211',
      fingers: '134211',
      barres: 1
    }, {
      frets: 'x81088',
      fingers: 'x21011',
      barres: 8
    }]
  },
  'Fm': {
    key: 'F',
    suffix: 'm',
    positions: [{
      frets: '133111',
      fingers: '134111',
      barres: 1
    }, {
      frets: 'x81078',
      fingers: 'x21011',
      barres: 8
    }]
  },
  'F7': {
    key: 'F',
    suffix: '7',
    positions: [{
      frets: '131211',
      fingers: '131211',
      barres: 1
    }, {
      frets: 'x81098',
      fingers: 'x21011',
      barres: 8
    }]
  },
  'Fmaj7': {
    key: 'F',
    suffix: 'maj7',
    positions: [{
      frets: '132211',
      fingers: '132211',
      barres: 1
    }, {
      frets: 'x810a8',
      fingers: 'x21011',
      barres: 8
    }]
  },
  'Fsus2': {
    key: 'F',
    suffix: 'sus2',
    positions: [{
      frets: '133011',
      fingers: '134011',
      barres: 1
    }, {
      frets: 'x81088',
      fingers: 'x21011',
      barres: 8
    }]
  },
  'Fsus4': {
    key: 'F',
    suffix: 'sus4',
    positions: [{
      frets: '133311',
      fingers: '134411',
      barres: 1
    }, {
      frets: 'x810b8',
      fingers: 'x21011',
      barres: 8
    }]
  },

  // G Major Chords
  'G': {
    key: 'G',
    suffix: '',
    positions: [{
      frets: '320003',
      fingers: '210003'
    }, {
      frets: '355433',
      fingers: '134211',
      barres: 3
    }]
  },
  'Gm': {
    key: 'G',
    suffix: 'm',
    positions: [{
      frets: '355333',
      fingers: '134111',
      barres: 3
    }, {
      frets: 'x10a888',
      fingers: 'x210111',
      barres: 10
    }]
  },
  'G7': {
    key: 'G',
    suffix: '7',
    positions: [{
      frets: '320001',
      fingers: '320001'
    }, {
      frets: '353433',
      fingers: '131211',
      barres: 3
    }]
  },
  'Gmaj7': {
    key: 'G',
    suffix: 'maj7',
    positions: [{
      frets: '320002',
      fingers: '320001'
    }, {
      frets: '354433',
      fingers: '132211',
      barres: 3
    }]
  },
  'Gsus2': {
    key: 'G',
    suffix: 'sus2',
    positions: [{
      frets: '300003',
      fingers: '300003'
    }, {
      frets: '355533',
      fingers: '134211',
      barres: 3
    }]
  },
  'Gsus4': {
    key: 'G',
    suffix: 'sus4',
    positions: [{
      frets: '330003',
      fingers: '320001'
    }, {
      frets: '355633',
      fingers: '134211',
      barres: 3
    }]
  },

  // A Major Chords
  'A': {
    key: 'A',
    suffix: '',
    positions: [{
      frets: 'x02220',
      fingers: 'x02340'
    }, {
      frets: '577655',
      fingers: '134211',
      barres: 5
    }]
  },
  'Am': {
    key: 'A',
    suffix: 'm',
    positions: [{
      frets: 'x02210',
      fingers: 'x02310'
    }, {
      frets: '577555',
      fingers: '134111',
      barres: 5
    }]
  },
  'A7': {
    key: 'A',
    suffix: '7',
    positions: [{
      frets: 'x02020',
      fingers: 'x02020'
    }, {
      frets: '575655',
      fingers: '131211',
      barres: 5
    }]
  },
  'Amaj7': {
    key: 'A',
    suffix: 'maj7',
    positions: [{
      frets: 'x02120',
      fingers: 'x02120'
    }, {
      frets: '576655',
      fingers: '132211',
      barres: 5
    }]
  },
  'Asus2': {
    key: 'A',
    suffix: 'sus2',
    positions: [{
      frets: 'x02200',
      fingers: 'x02300'
    }, {
      frets: '577755',
      fingers: '134211',
      barres: 5
    }]
  },
  'Asus4': {
    key: 'A',
    suffix: 'sus4',
    positions: [{
      frets: 'x02230',
      fingers: 'x02340'
    }, {
      frets: '577855',
      fingers: '134211',
      barres: 5
    }]
  },

  // B Major Chords
  'B': {
    key: 'B',
    suffix: '',
    positions: [{
      frets: 'x24442',
      fingers: 'x12341',
      barres: 2
    }, {
      frets: '799877',
      fingers: '134211',
      barres: 7
    }]
  },
  'Bm': {
    key: 'B',
    suffix: 'm',
    positions: [{
      frets: 'x24432',
      fingers: 'x12431',
      barres: 2
    }, {
      frets: '799777',
      fingers: '134111',
      barres: 7
    }]
  },
  'B7': {
    key: 'B',
    suffix: '7',
    positions: [{
      frets: 'x21202',
      fingers: 'x21202'
    }, {
      frets: '797877',
      fingers: '131211',
      barres: 7
    }]
  },
  'Bmaj7': {
    key: 'B',
    suffix: 'maj7',
    positions: [{
      frets: 'x24342',
      fingers: 'x13241',
      barres: 2
    }, {
      frets: '798877',
      fingers: '132211',
      barres: 7
    }]
  },
  'Bsus2': {
    key: 'B',
    suffix: 'sus2',
    positions: [{
      frets: 'x24422',
      fingers: 'x12341',
      barres: 2
    }, {
      frets: '799977',
      fingers: '134211',
      barres: 7
    }]
  },
  'Bsus4': {
    key: 'B',
    suffix: 'sus4',
    positions: [{
      frets: 'x24452',
      fingers: 'x12341',
      barres: 2
    }, {
      frets: '799a77',
      fingers: '134211',
      barres: 7
    }]
  }
};

/**
 * Chord Database Utilities
 */
export class ChordDatabaseUtils {
  /**
   * Get chord data by name
   */
  static getChord(chordName: string): ChordData | null {
    return guitarChords[chordName] || null;
  }

  /**
   * Get all available chord names
   */
  static getAllChordNames(): string[] {
    return Object.keys(guitarChords);
  }

  /**
   * Search chords by root note
   */
  static getChordsByRoot(rootNote: string): ChordData[] {
    return Object.values(guitarChords).filter(chord => 
      chord.key === rootNote
    );
  }

  /**
   * Search chords by suffix (type)
   */
  static getChordsBySuffix(suffix: string): ChordData[] {
    return Object.values(guitarChords).filter(chord => 
      chord.suffix === suffix
    );
  }

  /**
   * Parse chord name and extract root note and suffix
   */
  static parseChordName(chordName: string): { root: string; suffix: string } {
    // Handle sharp/flat notes
    const sharpMatch = chordName.match(/^([A-G]#)(.*)$/);
    const flatMatch = chordName.match(/^([A-G]b)(.*)$/);
    
    if (sharpMatch) {
      return { root: sharpMatch[1], suffix: sharpMatch[2] };
    }
    
    if (flatMatch) {
      return { root: flatMatch[1], suffix: flatMatch[2] };
    }
    
    // Regular notes
    const match = chordName.match(/^([A-G])(.*)$/);
    if (match) {
      return { root: match[1], suffix: match[2] };
    }
    
    return { root: chordName, suffix: '' };
  }

  /**
   * Get chord variations (different positions)
   */
  static getChordVariations(chordName: string): ChordPosition[] {
    const chord = this.getChord(chordName);
    return chord ? chord.positions : [];
  }

  /**
   * Find similar chords (same root or same suffix)
   */
  static findSimilarChords(chordName: string): string[] {
    const { root, suffix } = this.parseChordName(chordName);
    const similar: string[] = [];
    
    // Find chords with same root
    const sameRoot = this.getChordsByRoot(root);
    sameRoot.forEach(chord => {
      const fullName = chord.key + chord.suffix;
      if (fullName !== chordName) {
        similar.push(fullName);
      }
    });
    
    // Find chords with same suffix
    const sameSuffix = this.getChordsBySuffix(suffix);
    sameSuffix.forEach(chord => {
      const fullName = chord.key + chord.suffix;
      if (fullName !== chordName && !similar.includes(fullName)) {
        similar.push(fullName);
      }
    });
    
    return similar;
  }

  /**
   * Validate chord name
   */
  static isValidChord(chordName: string): boolean {
    return chordName in guitarChords;
  }

  /**
   * Get chord difficulty based on positions
   */
  static getChordDifficulty(chordName: string): 'beginner' | 'intermediate' | 'advanced' {
    const chord = this.getChord(chordName);
    if (!chord) return 'beginner';
    
    const positions = chord.positions;
    if (positions.length === 0) return 'beginner';
    
    // Check for barre chords and complex fingerings
    const hasBarre = positions.some(pos => pos.barres);
    const hasComplexFingering = positions.some(pos => 
      pos.fingers.split('').some(finger => parseInt(finger) > 3)
    );
    
    if (hasBarre && hasComplexFingering) return 'advanced';
    if (hasBarre || hasComplexFingering) return 'intermediate';
    return 'beginner';
  }
}
