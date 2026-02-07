/**
 * ChordEntry Component - Form for adding and editing chords
 * 
 * Works with lean Chord type (root, quality only).
 * Preview is computed on-the-fly via formatChordName().
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Note, ChordQuality, Chord } from '../../types/chord';
import { chordManager } from '../../lib/chord-manager';
import { formatChordName } from '../../lib/music-theory';

interface ChordEntryProps {
  chord?: Chord;
  onSave?: (chord: Chord) => void;
  onCancel?: () => void;
  className?: string;
}

const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHORD_QUALITIES: { value: ChordQuality; label: string }[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'diminished', label: 'Diminished' },
  { value: 'augmented', label: 'Augmented' },
  { value: 'major7', label: 'Major 7th' },
  { value: 'minor7', label: 'Minor 7th' },
  { value: 'dominant7', label: 'Dominant 7th' },
  { value: 'diminished7', label: 'Diminished 7th' },
  { value: 'half-diminished7', label: 'Half Diminished 7th' },
  { value: 'major9', label: 'Major 9th' },
  { value: 'minor9', label: 'Minor 9th' },
  { value: 'dominant9', label: 'Dominant 9th' },
  { value: 'sus2', label: 'Suspended 2nd' },
  { value: 'sus4', label: 'Suspended 4th' },
  { value: 'add9', label: 'Add 9' },
  { value: 'add11', label: 'Add 11' },
  { value: 'add13', label: 'Add 13' }
];

export const ChordEntry: React.FC<ChordEntryProps> = ({
  chord,
  onSave,
  onCancel,
  className = ''
}) => {
  const [root, setRoot] = useState<Note>(chord?.root || 'C');
  const [quality, setQuality] = useState<ChordQuality>(chord?.quality || 'major');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chord) {
      setRoot(chord.root);
      setQuality(chord.quality);
    }
  }, [chord]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let savedChord: Chord;

      if (chord) {
        // Update existing chord
        savedChord = await chordManager.updateChord(chord.id, { root, quality });
      } else {
        // Create new chord
        savedChord = await chordManager.addChord(root, quality);
      }

      onSave?.(savedChord);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save chord');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (chord) {
      setRoot(chord.root);
      setQuality(chord.quality);
    } else {
      setRoot('C');
      setQuality('major');
    }
    setError(null);
    onCancel?.();
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {chord ? 'Edit Chord' : 'Add New Chord'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Root Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Root Note
          </label>
          <select
            value={root}
            onChange={(e) => setRoot(e.target.value as Note)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isLoading}
          >
            {NOTES.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>

        {/* Chord Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quality
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as ChordQuality)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isLoading}
          >
            {CHORD_QUALITIES.map((qual) => (
              <option key={qual.value} value={qual.value}>
                {qual.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</h4>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {formatChordName(root, quality)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          onClick={handleCancel}
          variant="outline"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : chord ? 'Update Chord' : 'Add Chord'}
        </Button>
      </div>
    </div>
  );
};
