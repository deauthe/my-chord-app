/**
 * ChordRenderer - Visual chord diagram renderer
 * 
 * Based on the chords-db structure, renders chord diagrams with fret positions and fingerings
 */

import React from 'react';
import { ChordData, ChordPosition, ChordDatabaseUtils } from '../../lib/chord-database';

interface ChordRendererProps {
  chordName: string;
  position?: number; // Which position to show (0-based index)
  showFingering?: boolean;
  showBarres?: boolean;
  className?: string;
}

export const ChordRenderer: React.FC<ChordRendererProps> = ({
  chordName,
  position = 0,
  showFingering = true,
  showBarres = true,
  className = ''
}) => {
  const chordData = ChordDatabaseUtils.getChord(chordName);
  
  if (!chordData) {
    return (
      <div className={`chord-renderer error ${className}`}>
        <div className="text-red-500 text-sm">Chord "{chordName}" not found</div>
      </div>
    );
  }

  const chordPosition = chordData.positions[position];
  if (!chordPosition) {
    return (
      <div className={`chord-renderer error ${className}`}>
        <div className="text-red-500 text-sm">Position {position} not available</div>
      </div>
    );
  }

  const { frets, fingers, barres, capo } = chordPosition;
  const strings = ['E', 'A', 'D', 'G', 'B', 'e']; // Standard guitar tuning
  const fretNumbers = frets.split('');

  return (
    <div className={`chord-renderer ${className}`}>
      {/* Chord Name */}
      <div className="chord-name text-center font-bold text-lg mb-2">
        {chordData.key}{chordData.suffix}
      </div>
      
      {/* Chord Diagram */}
      <div className="chord-diagram relative">
        {/* Fretboard */}
        <div className="fretboard relative w-32 h-40 mx-auto">
          {/* Strings (vertical lines) */}
          {strings.map((string, stringIndex) => (
            <div
              key={string}
              className="absolute w-px bg-gray-800"
              style={{
                left: `${(stringIndex * 20) + 10}px`,
                top: '20px',
                height: '120px'
              }}
            />
          ))}
          
          {/* Frets (horizontal lines) */}
          {[0, 1, 2, 3, 4].map((fret) => (
            <div
              key={fret}
              className="absolute h-px bg-gray-800"
              style={{
                left: '10px',
                top: `${20 + (fret * 24)}px`,
                width: '100px'
              }}
            />
          ))}
          
          {/* Fret Numbers */}
          {[1, 2, 3, 4].map((fret) => (
            <div
              key={fret}
              className="absolute text-xs text-gray-600"
              style={{
                left: '5px',
                top: `${32 + (fret * 24)}px`
              }}
            >
              {fret}
            </div>
          ))}
          
          {/* String Names */}
          {strings.map((string, stringIndex) => (
            <div
              key={string}
              className="absolute text-xs font-bold text-gray-800"
              style={{
                left: `${(stringIndex * 20) + 6}px`,
                top: '5px'
              }}
            >
              {string}
            </div>
          ))}
          
          {/* Fret Positions */}
          {fretNumbers.map((fret, stringIndex) => {
            if (fret === 'x' || fret === '0') return null;
            
            const fretNum = parseInt(fret);
            const fingerNum = fingers[stringIndex];
            
            return (
              <div
                key={`${stringIndex}-${fret}`}
                className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  left: `${(stringIndex * 20) + 4}px`,
                  top: `${20 + ((fretNum - 1) * 24) + 9}px`,
                  backgroundColor: fretNum === 0 ? '#ef4444' : '#3b82f6'
                }}
              >
                {showFingering && fingerNum !== '0' ? fingerNum : fretNum}
              </div>
            );
          })}
          
          {/* Barre */}
          {showBarres && barres && (
            <div
              className="absolute bg-blue-600 rounded"
              style={{
                left: `${10}px`,
                top: `${20 + ((barres - 1) * 24) + 9}px`,
                width: `${(strings.length - 1) * 20}px`,
                height: '6px'
              }}
            />
          )}
          
          {/* Capo Indicator */}
          {capo && (
            <div className="absolute text-xs text-blue-600 font-bold" style={{
              left: '110px',
              top: '10px'
            }}>
              Capo
            </div>
          )}
        </div>
        
        {/* Position Info */}
        <div className="text-center text-xs text-gray-600 mt-2">
          Position {position + 1} of {chordData.positions.length}
        </div>
      </div>
    </div>
  );
};

/**
 * ChordSelector - Component to select different chord positions
 */
interface ChordSelectorProps {
  chordName: string;
  selectedPosition: number;
  onPositionChange: (position: number) => void;
  className?: string;
}

export const ChordSelector: React.FC<ChordSelectorProps> = ({
  chordName,
  selectedPosition,
  onPositionChange,
  className = ''
}) => {
  const chordData = ChordDatabaseUtils.getChord(chordName);
  
  if (!chordData || chordData.positions.length <= 1) {
    return null;
  }

  return (
    <div className={`chord-selector ${className}`}>
      <div className="flex gap-2 justify-center">
        {chordData.positions.map((_, index) => (
          <button
            key={index}
            onClick={() => onPositionChange(index)}
            className={`px-3 py-1 text-sm rounded ${
              selectedPosition === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * ChordInfo - Component to display chord information
 */
interface ChordInfoProps {
  chordName: string;
  className?: string;
}

export const ChordInfo: React.FC<ChordInfoProps> = ({
  chordName,
  className = ''
}) => {
  const chordData = ChordDatabaseUtils.getChord(chordName);
  
  if (!chordData) {
    return (
      <div className={`chord-info error ${className}`}>
        <div className="text-red-500">Chord "{chordName}" not found</div>
      </div>
    );
  }

  const difficulty = ChordDatabaseUtils.getChordDifficulty(chordName);
  const similarChords = ChordDatabaseUtils.findSimilarChords(chordName);
  const { root, suffix } = ChordDatabaseUtils.parseChordName(chordName);

  return (
    <div className={`chord-info ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Root:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
            {root}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold">Type:</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
            {suffix || 'Major'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold">Difficulty:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
            difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {difficulty}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold">Positions:</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
            {chordData.positions.length}
          </span>
        </div>
        
        {similarChords.length > 0 && (
          <div>
            <span className="font-semibold">Similar chords:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {similarChords.slice(0, 5).map(similar => (
                <span
                  key={similar}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {similar}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
