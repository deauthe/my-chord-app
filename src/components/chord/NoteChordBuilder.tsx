/**
 * NoteChordBuilder - Interactive chord builder using modular instrument pickers
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { PianoKeyPicker } from './PianoKeyPicker';
import { GuitarFretboardPicker, GuitarPosition } from './GuitarFretboardPicker';
import { ChordInterpreter } from './ChordInterpreter';
import { Note } from '../../types/chord';
import { ChordInterpretation } from '../../lib/chord-detection';

interface NoteChordBuilderProps {
  onChordSelect: (interpretation: ChordInterpretation) => void;
  onCancel: () => void;
  initialNotes?: string[];
  className?: string;
}

type InstrumentType = 'piano' | 'guitar';

export const NoteChordBuilder: React.FC<NoteChordBuilderProps> = ({
  onChordSelect,
  onCancel,
  initialNotes = [],
  className = ''
}) => {
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('piano');
  
  // Piano state: track selected notes
  const [selectedPianoNotes, setSelectedPianoNotes] = useState<Set<string>>(
    new Set(initialNotes)
  );
  
  // Guitar state: track selected positions
  const [selectedGuitarPositions, setSelectedGuitarPositions] = useState<Set<string>>(
    new Set()
  );
  
  const [selectedInterpretation, setSelectedInterpretation] = useState<ChordInterpretation | null>(null);

  const togglePianoNote = (note: Note) => {
    const newNotes = new Set(selectedPianoNotes);
    if (newNotes.has(note)) {
      newNotes.delete(note);
    } else {
      newNotes.add(note);
    }
    setSelectedPianoNotes(newNotes);
    setSelectedInterpretation(null);
  };

  const toggleGuitarPosition = (position: GuitarPosition) => {
    const positionKey = `${position.string}:${position.fret}`;
    const newPositions = new Set(selectedGuitarPositions);
    if (newPositions.has(positionKey)) {
      newPositions.delete(positionKey);
    } else {
      newPositions.add(positionKey);
    }
    setSelectedGuitarPositions(newPositions);
    setSelectedInterpretation(null);
  };



  // Get the actual notes for chord analysis based on current instrument
  const getSelectedNotesForAnalysis = (): Set<string> => {
    if (selectedInstrument === 'piano') {
      return selectedPianoNotes;
    } else {
      // Convert guitar positions to notes
      const notes = new Set<string>();
      selectedGuitarPositions.forEach(positionKey => {
        const [string, fret] = positionKey.split(':').map(Number);
        const tuning: Note[] = ['E', 'A', 'D', 'G', 'B', 'E'];
        const chromatic: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const openNote = tuning[string];
        const openNoteIndex = chromatic.indexOf(openNote);
        const noteIndex = (openNoteIndex + fret) % 12;
        const note = chromatic[noteIndex];
        notes.add(note);
      });
      return notes;
    }
  };

  const handleChordSelect = (interpretation: ChordInterpretation) => {
    setSelectedInterpretation(interpretation);
  };

  const handleConfirmChord = () => {
    if (selectedInterpretation) {
      onChordSelect(selectedInterpretation);
    }
  };

  const handleInstrumentChange = (instrument: InstrumentType) => {
    if (instrument === selectedInstrument) return;
    
    // Reset interpretation when switching instruments
    setSelectedInterpretation(null);
    setSelectedInstrument(instrument);
  };

  const renderInstrumentSelector = () => (
    <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <button
        onClick={() => handleInstrumentChange('piano')}
        className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          selectedInstrument === 'piano'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <span className="text-xl">🎹</span>
        Piano
      </button>
      <button
        onClick={() => handleInstrumentChange('guitar')}
        className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          selectedInstrument === 'guitar'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <span className="text-xl">🎸</span>
        Guitar
      </button>
    </div>
  );

  const renderInstrumentPicker = () => {
    if (selectedInstrument === 'piano') {
      return (
        <PianoKeyPicker
          selectedNotes={selectedPianoNotes}
          onNoteToggle={togglePianoNote}
          onClear={() => {
            setSelectedPianoNotes(new Set());
            setSelectedInterpretation(null);
          }}
        />
      );
    } else {
      return (
        <GuitarFretboardPicker
          selectedPositions={selectedGuitarPositions}
          onPositionToggle={toggleGuitarPosition}
          onClear={() => {
            setSelectedGuitarPositions(new Set());
            setSelectedInterpretation(null);
          }}
        />
      );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Instrument Selector */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Choose Your Instrument
        </h3>
        {renderInstrumentSelector()}
      </div>

      {/* Instrument Picker */}
      {renderInstrumentPicker()}

      {/* Chord Analysis */}
      <ChordInterpreter
        selectedNotes={getSelectedNotesForAnalysis()}
        onChordSelect={handleChordSelect}
        selectedInterpretation={selectedInterpretation}
      />

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button
          onClick={handleConfirmChord}
          disabled={!selectedInterpretation}
        >
          Use Selected Chord
        </Button>
      </div>
    </div>
  );
};
