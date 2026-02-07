/**
 * EnhancedChordForm - Supports both direct chord selection and note-based input
 * 
 * Uses formatChordName() from music-theory.ts for preview display.
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { NoteChordBuilder } from './NoteChordBuilder';
import { Note, ChordQuality } from '../../types/chord';
import { ChordInterpretation } from '../../lib/chord-detection';
import { formatChordName } from '../../lib/music-theory';

interface EnhancedChordFormProps {
  sectionKey: Note;
  sectionIsMinor: boolean;
  onSave: (data: { root: Note; quality: ChordQuality; measure?: number }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const CHORD_QUALITIES: { value: ChordQuality; label: string }[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'dominant7', label: '7' },
  { value: 'major7', label: 'maj7' },
  { value: 'minor7', label: 'm7' },
  { value: 'diminished', label: 'dim' },
  { value: 'augmented', label: 'aug' },
  { value: 'sus2', label: 'sus2' },
  { value: 'sus4', label: 'sus4' },
  { value: 'add9', label: 'add9' },
  { value: 'diminished7', label: 'dim7' },
  { value: 'half-diminished7', label: 'ø7' },
  { value: 'major9', label: 'maj9' },
  { value: 'minor9', label: 'm9' },
  { value: 'dominant9', label: '9' },
  { value: 'add11', label: 'add11' },
  { value: 'add13', label: 'add13' }
];

type InputMode = 'direct' | 'notes';

export const EnhancedChordForm: React.FC<EnhancedChordFormProps> = ({
  sectionKey,
  sectionIsMinor,
  onSave,
  onCancel,
  isLoading
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('direct');
  const [directFormData, setDirectFormData] = useState({
    root: sectionKey,
    quality: 'major' as ChordQuality,
    measure: undefined as number | undefined
  });

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(directFormData);
  };

  const handleNoteBasedChordSelect = (interpretation: ChordInterpretation) => {
    onSave({
      root: interpretation.root,
      quality: interpretation.quality,
      measure: directFormData.measure
    });
  };

  const renderModeSelector = () => (
    <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <button
        type="button"
        onClick={() => setInputMode('direct')}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          inputMode === 'direct'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Direct Selection
      </button>
      <button
        type="button"
        onClick={() => setInputMode('notes')}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          inputMode === 'notes'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Build from Notes
      </button>
    </div>
  );

  const renderDirectForm = () => (
    <form onSubmit={handleDirectSubmit} className="space-y-4">
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
          Section Context
        </h4>
        <p className="text-blue-700 dark:text-blue-400">
          {sectionKey} {sectionIsMinor ? 'minor' : 'major'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Root Note
          </label>
          <select
            value={directFormData.root}
            onChange={(e) => setDirectFormData(prev => ({ ...prev, root: e.target.value as Note }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {NOTES.map((note) => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quality
          </label>
          <select
            value={directFormData.quality}
            onChange={(e) => setDirectFormData(prev => ({ ...prev, quality: e.target.value as ChordQuality }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CHORD_QUALITIES.map((quality) => (
              <option key={quality.value} value={quality.value}>
                {quality.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Measure (optional)
        </label>
        <input
          type="number"
          min="1"
          value={directFormData.measure || ''}
          onChange={(e) => setDirectFormData(prev => ({ 
            ...prev, 
            measure: e.target.value ? parseInt(e.target.value) : undefined 
          }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional measure number"
        />
      </div>

      {/* Preview */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preview</h5>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {formatChordName(directFormData.root, directFormData.quality)}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" onClick={onCancel} variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Chord'}
        </Button>
      </div>
    </form>
  );

  const renderNoteBasedForm = () => (
    <div className="space-y-4">
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
          Section Context
        </h4>
        <p className="text-blue-700 dark:text-blue-400">
          {sectionKey} {sectionIsMinor ? 'minor' : 'major'}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Select the notes you hear in the chord
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Measure (optional)
        </label>
        <input
          type="number"
          min="1"
          value={directFormData.measure || ''}
          onChange={(e) => setDirectFormData(prev => ({ 
            ...prev, 
            measure: e.target.value ? parseInt(e.target.value) : undefined 
          }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional measure number"
        />
      </div>

      <NoteChordBuilder
        onChordSelect={handleNoteBasedChordSelect}
        onCancel={onCancel}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Chord to Section
        </h3>

        {renderModeSelector()}

        {inputMode === 'direct' && renderDirectForm()}
        {inputMode === 'notes' && renderNoteBasedForm()}
      </div>
    </div>
  );
};
