/**
 * PianoKeyPicker - Modular piano interface for note selection
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Note } from '../../types/chord';

interface PianoKeyPickerProps {
  selectedNotes: Set<string>;
  onNoteToggle: (note: Note) => void;
  onClear?: () => void;
  className?: string;
}

// Piano key layout
const WHITE_KEYS: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS: { note: Note; position: number }[] = [
  { note: 'C#', position: 1 },
  { note: 'D#', position: 2 },
  { note: 'F#', position: 4 },
  { note: 'G#', position: 5 },
  { note: 'A#', position: 6 }
];

const ALL_NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const PianoKeyPicker: React.FC<PianoKeyPickerProps> = ({
  selectedNotes,
  onNoteToggle,
  onClear,
  className = ''
}) => {

  const renderPiano = () => (
    <div className="relative bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
        Piano Keys
      </h3>
      
      {/* Piano Keys */}
      <div className="relative mx-auto" style={{ width: '420px', height: '120px' }}>
        {/* White Keys */}
        {WHITE_KEYS.map((note, index) => (
          <button
            key={note}
            onClick={() => onNoteToggle(note)}
            className={`absolute border border-gray-300 dark:border-gray-600 rounded-b-md transition-all duration-150 ${
              selectedNotes.has(note)
                ? 'bg-blue-500 text-white shadow-lg transform scale-95'
                : 'bg-white dark:bg-gray-100 hover:bg-gray-50 dark:hover:bg-gray-200 text-gray-900'
            }`}
            style={{
              left: `${index * 60}px`,
              width: '58px',
              height: '120px',
              zIndex: 1
            }}
          >
            <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium">
              {note}
            </span>
          </button>
        ))}

        {/* Black Keys */}
        {BLACK_KEYS.map(({ note, position }) => (
          <button
            key={note}
            onClick={() => onNoteToggle(note)}
            className={`absolute border border-gray-400 dark:border-gray-500 rounded-b-md transition-all duration-150 ${
              selectedNotes.has(note)
                ? 'bg-blue-600 text-white shadow-lg transform scale-95'
                : 'bg-gray-800 dark:bg-gray-900 hover:bg-gray-700 dark:hover:bg-gray-700 text-white'
            }`}
            style={{
              left: `${position * 60 - 20}px`,
              width: '40px',
              height: '80px',
              zIndex: 2
            }}
          >
            <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium">
              {note}
            </span>
          </button>
        ))}
      </div>

      {/* Note Buttons (Alternative Interface) */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or click note buttons:
        </h4>
        <div className="flex flex-wrap gap-2">
          {ALL_NOTES.map((note) => (
            <button
              key={note}
              onClick={() => onNoteToggle(note)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedNotes.has(note)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      {onClear && selectedNotes.size > 0 && (
        <div className="mt-4 text-center">
          <Button onClick={onClear} variant="outline" size="sm">
            Clear All Notes
          </Button>
        </div>
      )}
    </div>
  );

  const renderSelectedNotes = () => {
    if (selectedNotes.size === 0) return null;

    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          Selected Notes ({selectedNotes.size})
        </h4>
        <div className="flex flex-wrap gap-2">
          {Array.from(selectedNotes).sort((a, b) => 
            ALL_NOTES.indexOf(a as Note) - ALL_NOTES.indexOf(b as Note)
          ).map((note) => (
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

  return (
    <div className={className}>
      {renderPiano()}
      {renderSelectedNotes()}
    </div>
  );
};
