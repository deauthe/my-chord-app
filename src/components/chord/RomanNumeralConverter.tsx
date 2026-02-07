/**
 * RomanNumeralConverter Component - Shows chord's Roman numeral in different keys
 * 
 * All analysis is computed synchronously from chord.root and chord.quality
 * via getRomanNumeral() and findCompatibleScales() from music-theory.ts.
 */

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Chord, Note } from '../../types/chord';
import { computeChordView, getRomanNumeral, findCompatibleScales } from '../../lib/music-theory';

interface RomanNumeralConverterProps {
  chord: Chord;
  className?: string;
}

interface KeyAnalysis {
  key: Note;
  romanNumeral: string;
  isNaturalFit: boolean;
  description: string;
}

const KEYS: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const RomanNumeralConverter: React.FC<RomanNumeralConverterProps> = ({
  chord,
  className = ''
}) => {
  const [selectedKey, setSelectedKey] = useState<Note>('C');
  const [showAllKeys, setShowAllKeys] = useState(false);

  // Compute chord view and key analyses
  const view = useMemo(() => computeChordView(chord.root, chord.quality), [chord.root, chord.quality]);
  const compatibleScales = useMemo(() => findCompatibleScales(view.notes), [view.notes]);

  const keyAnalyses = useMemo(() => {
    return KEYS.map((key) => {
      const romanNumeral = getRomanNumeral(chord.root, chord.quality, key, false) || '?';
      const isNaturalFit = compatibleScales.some(scale => 
        scale.key === key && 
        (scale.scale === 'major' || scale.scale === 'natural_minor') &&
        scale.compatibility > 0.8
      );
      const description = generateDescription(romanNumeral, isNaturalFit);

      return { key, romanNumeral, isNaturalFit, description };
    });
  }, [chord.root, chord.quality, compatibleScales]);

  const getVisibleAnalyses = () => {
    if (showAllKeys) return keyAnalyses;
    
    const naturalFits = keyAnalyses.filter(a => a.isNaturalFit);
    const currentKeyAnalysis = keyAnalyses.find(a => a.key === selectedKey);
    const others = keyAnalyses.filter(a => !a.isNaturalFit && a.key !== selectedKey).slice(0, 3);
    
    const visible = [...naturalFits];
    if (currentKeyAnalysis && !naturalFits.includes(currentKeyAnalysis)) {
      visible.push(currentKeyAnalysis);
    }
    visible.push(...others);
    
    return visible.slice(0, 8);
  };

  const renderKeyAnalysis = (analysis: KeyAnalysis, isSelected: boolean = false) => (
    <div
      key={analysis.key}
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
          : analysis.isNaturalFit
          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:border-green-300'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300'
      }`}
      onClick={() => setSelectedKey(analysis.key)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            {analysis.key}
          </span>
          <span className={`text-xl font-bold ${
            analysis.isNaturalFit
              ? 'text-green-700 dark:text-green-300'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {analysis.romanNumeral}
          </span>
        </div>
        {analysis.isNaturalFit && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
            Natural
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {analysis.description}
      </p>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Roman Numeral Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          See how <strong>{view.name}</strong> functions in different keys
        </p>
      </div>

      {/* Key Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Focus Key
        </label>
        <div className="flex flex-wrap gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedKey === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Current Key Analysis */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          In Key of {selectedKey}
        </h4>
        {keyAnalyses.find(a => a.key === selectedKey) && 
          renderKeyAnalysis(keyAnalyses.find(a => a.key === selectedKey)!, true)
        }
      </div>

      {/* All Keys Analysis */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Keys
          </h4>
          <Button
            onClick={() => setShowAllKeys(!showAllKeys)}
            variant="outline"
            size="sm"
          >
            {showAllKeys ? 'Show Less' : 'Show All'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {getVisibleAnalyses().map((analysis) => 
            analysis.key !== selectedKey && renderKeyAnalysis(analysis)
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Legend
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Natural fit - chord belongs to key</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Chromatic - chord outside key</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateDescription(romanNumeral: string, isNaturalFit: boolean): string {
  if (romanNumeral === '?') {
    return 'Chord does not fit naturally in this key';
  }

  const descriptions: Record<string, string> = {
    'I': 'Tonic - Home chord, stable and resolved',
    'ii': 'Supertonic - Often leads to V, pre-dominant function',
    'iii': 'Mediant - Connects I and vi, tonic substitute',
    'IV': 'Subdominant - Pre-dominant, creates tension to resolve',
    'V': 'Dominant - Strong pull back to I, creates tension',
    'vi': 'Submediant - Relative minor, deceptive resolution',
    'vii°': 'Leading tone - Strong tendency to resolve to I',
    'i': 'Tonic minor - Home chord in minor key',
    'ii°': 'Supertonic diminished - Pre-dominant in minor',
    'III': 'Mediant major - Relative major in minor key',
    'iv': 'Subdominant minor - Pre-dominant in minor key',
    'v': 'Dominant minor - Less strong than major V',
    'VI': 'Submediant major - Common in minor progressions',
    'VII': 'Subtonic - Leading to i in minor keys'
  };

  const baseDescription = descriptions[romanNumeral] || 'Special chord function';
  const fitDescription = isNaturalFit ? '' : ' (chromatic - outside key)';
  
  return baseDescription + fitDescription;
}
