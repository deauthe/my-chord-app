/**
 * GuitarFretboardPicker - Interactive guitar fretboard for note selection
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Note } from '../../types/chord';

interface GuitarPosition {
  string: number;
  fret: number;
  note: Note;
}

interface GuitarFretboardPickerProps {
  selectedPositions: Set<string>; // Format: "string:fret" (e.g., "0:3" for 1st string 3rd fret)
  onPositionToggle: (position: GuitarPosition) => void;
  onClear?: () => void;
  className?: string;
}

// Standard tuning (from lowest to highest string)
const TUNING: Note[] = ['E', 'A', 'D', 'G', 'B', 'E'];
const STRING_NAMES = ['6th (Low E)', '5th (A)', '4th (D)', '3rd (G)', '2nd (B)', '1st (High E)'];

const CHROMATIC_NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const FRET_COUNT = 12; // Show first 12 frets + open strings

// Fret markers (like a real guitar)
const FRET_MARKERS = [3, 5, 7, 9, 12];
const DOUBLE_MARKERS = [12];

/**
 * Calculate the note at a specific string and fret
 */
function getNoteAtFret(stringIndex: number, fret: number): Note {
  const openNote = TUNING[stringIndex];
  const openNoteIndex = CHROMATIC_NOTES.indexOf(openNote);
  const noteIndex = (openNoteIndex + fret) % 12;
  return CHROMATIC_NOTES[noteIndex];
}

/**
 * Create position key for tracking selected positions
 */
function createPositionKey(stringIndex: number, fret: number): string {
  return `${stringIndex}:${fret}`;
}

/**
 * Parse position key back to string and fret
 */
function parsePositionKey(key: string): { string: number; fret: number } {
  const [string, fret] = key.split(':').map(Number);
  return { string, fret };
}

export const GuitarFretboardPicker: React.FC<GuitarFretboardPickerProps> = ({
  selectedPositions,
  onPositionToggle,
  onClear,
  className = ''
}) => {

  const renderFretboard = () => (
    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
        Guitar Fretboard
      </h3>
      
              <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Fret numbers and markers */}
          <div className="flex mb-2">
            <div className="w-20 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
              String
            </div>
            <div className="w-12 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
              Open
            </div>
            {Array.from({ length: FRET_COUNT }, (_, i) => (
              <div key={i + 1} className="w-12 text-center text-xs font-medium text-gray-600 dark:text-gray-400 relative">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Main fret marker row */}
          <div className="flex mb-1">
            <div className="w-20"></div>
            <div className="w-12"></div>
            {Array.from({ length: FRET_COUNT }, (_, i) => (
              <div key={i + 1} className="w-12 flex justify-center items-center h-8 relative">
                {FRET_MARKERS.includes(i + 1) && (
                  <div className="flex items-center justify-center">
                    {DOUBLE_MARKERS.includes(i + 1) ? (
                      <div className="flex flex-col gap-1">
                        <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600 rounded-full shadow-lg border-2 border-amber-800 dark:border-amber-300"></div>
                        <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600 rounded-full shadow-lg border-2 border-amber-800 dark:border-amber-300"></div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600 rounded-full shadow-lg border-2 border-amber-800 dark:border-amber-300"></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Side fret markers */}
          <div className="flex mb-2 border-t border-amber-200 dark:border-amber-800 pt-1">
            <div className="w-20 text-xs text-center text-amber-700 dark:text-amber-400 font-medium">
              Side Markers
            </div>
            <div className="w-12"></div>
            {Array.from({ length: FRET_COUNT }, (_, i) => (
              <div key={i + 1} className="w-12 flex justify-center items-center h-4">
                {FRET_MARKERS.includes(i + 1) && (
                  <div className="flex items-center justify-center">
                    {DOUBLE_MARKERS.includes(i + 1) ? (
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-amber-600 dark:bg-amber-500 rounded-full border border-amber-700 dark:border-amber-400"></div>
                        <div className="w-2 h-2 bg-amber-600 dark:bg-amber-500 rounded-full border border-amber-700 dark:border-amber-400"></div>
                      </div>
                    ) : (
                      <div className="w-2.5 h-2.5 bg-amber-600 dark:bg-amber-500 rounded-full border border-amber-700 dark:border-amber-400"></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Strings and frets */}
          {TUNING.map((openNote, stringIndex) => (
            <div key={stringIndex} className="flex mb-1 items-center">
              {/* String label */}
              <div className="w-20 text-xs text-gray-600 dark:text-gray-400 font-medium text-right pr-2">
                {STRING_NAMES[stringIndex]}
              </div>
              
              {/* String line and fret positions */}
              <div className="flex items-center relative">
                {/* String line - with gradient for more realistic look */}
                <div 
                  className="absolute left-0 right-0 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 shadow-sm" 
                  style={{ 
                    height: stringIndex < 2 ? '2px' : stringIndex < 4 ? '3px' : '4px', // Realistic string thickness
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    borderRadius: '2px'
                  }}
                />
                
                {/* Fret wire indicators */}
                {Array.from({ length: FRET_COUNT }, (_, fret) => (
                  <div
                    key={`fret-wire-${fret + 1}`}
                    className="absolute bg-gray-600 dark:bg-gray-300"
                    style={{
                      left: `${(fret + 1) * 48 + 36}px`, // Position between fret areas
                      width: '3px',
                      height: '36px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 1,
                      opacity: 0.8,
                      borderRadius: '1px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  />
                ))}
                
                {/* Nut (fret 0 wire) */}
                <div
                  className="absolute bg-gray-800 dark:bg-gray-200"
                  style={{
                    left: '36px',
                    width: '4px',
                    height: '40px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    borderRadius: '2px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                />
                
                {/* Open string */}
                <div className="w-12 flex justify-center relative z-10">
                  <button
                    onClick={() => onPositionToggle({ 
                      string: stringIndex, 
                      fret: 0, 
                      note: openNote 
                    })}
                    className={`w-8 h-8 rounded-full border-2 transition-all text-xs font-bold shadow-sm ${
                      selectedPositions.has(createPositionKey(stringIndex, 0))
                        ? 'bg-blue-500 border-blue-600 text-white shadow-lg transform scale-110'
                        : 'bg-white dark:bg-gray-100 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-800 hover:bg-blue-50 dark:hover:bg-blue-100 hover:border-blue-400 hover:scale-105'
                    }`}
                  >
                    {openNote}
                  </button>
                </div>
                
                {/* Frets */}
                {Array.from({ length: FRET_COUNT }, (_, fret) => {
                  const note = getNoteAtFret(stringIndex, fret + 1);
                  const positionKey = createPositionKey(stringIndex, fret + 1);
                  const isMarkedFret = FRET_MARKERS.includes(fret + 1);
                  
                  return (
                    <div key={fret} className="w-12 flex justify-center relative z-10">
                      <button
                        onClick={() => onPositionToggle({ 
                          string: stringIndex, 
                          fret: fret + 1, 
                          note 
                        })}
                        className={`w-8 h-8 rounded-full border-2 transition-all text-xs font-bold shadow-sm ${
                          selectedPositions.has(positionKey)
                            ? 'bg-blue-500 border-blue-600 text-white shadow-lg transform scale-110'
                            : isMarkedFret
                            ? 'bg-amber-50 dark:bg-amber-100 border-amber-300 dark:border-amber-400 text-gray-900 dark:text-gray-800 hover:bg-blue-50 dark:hover:bg-blue-100 hover:border-blue-400 hover:scale-105'
                            : 'bg-white dark:bg-gray-100 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-800 hover:bg-blue-50 dark:hover:bg-blue-100 hover:border-blue-400 hover:scale-105'
                        }`}
                      >
                        {note}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tuning and marker info */}
      <div className="mt-4 text-center space-y-1">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Standard Tuning: E-A-D-G-B-E (low to high)
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Fret markers at 3rd, 5th, 7th, 9th, and 12th frets (like a real guitar)
        </p>
      </div>

      {/* Clear Button */}
      {onClear && selectedPositions.size > 0 && (
        <div className="mt-4 text-center">
          <Button onClick={onClear} variant="outline" size="sm">
            Clear All Positions
          </Button>
        </div>
      )}
    </div>
  );

  const getSelectedNotes = (): string[] => {
    const notes = new Set<string>();
    selectedPositions.forEach(positionKey => {
      const { string, fret } = parsePositionKey(positionKey);
      const note = getNoteAtFret(string, fret);
      notes.add(note);
    });
    return Array.from(notes).sort((a, b) => 
      CHROMATIC_NOTES.indexOf(a as Note) - CHROMATIC_NOTES.indexOf(b as Note)
    );
  };

  const renderSelectedNotes = () => {
    if (selectedPositions.size === 0) return null;

    const notes = getSelectedNotes();

    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          Selected Notes ({notes.length} unique from {selectedPositions.size} positions)
        </h4>
        <div className="flex flex-wrap gap-2">
          {notes.map((note) => (
            <span
              key={note}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderSelectedPositions = () => {
    if (selectedPositions.size === 0) return null;

    const positions = Array.from(selectedPositions).map(positionKey => {
      const { string, fret } = parsePositionKey(positionKey);
      const note = getNoteAtFret(string, fret);
      return { string, fret, note };
    }).sort((a, b) => {
      if (a.string !== b.string) return a.string - b.string;
      return a.fret - b.fret;
    });

    return (
      <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800 mt-4">
        <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
          Selected Positions ({selectedPositions.size})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs text-green-700 dark:text-green-400">
          {positions.map(({ string, fret, note }, index) => (
            <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-800/50 rounded">
              <span className="font-bold">{note}</span>
              {' '}
              <span className="text-green-600 dark:text-green-400">
                {STRING_NAMES[string].split(' ')[0]}/{fret === 0 ? 'open' : `${fret}fr`}
              </span>
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {renderFretboard()}
      {renderSelectedNotes()}
      {renderSelectedPositions()}
    </div>
  );
};

export type { GuitarPosition };
