/**
 * ScaleExplorer Component - Explore compatible scales and modes for a chord
 * 
 * Computes chord notes from (root, quality) via computeChordView(),
 * then finds compatible scales via findCompatibleScales().
 */

import React, { useState, useMemo } from 'react';
import { Chord, ScaleCompatibility, Note, Scale } from '../../types/chord';
import { computeChordView, findCompatibleScales, generateScale } from '../../lib/music-theory';

interface ScaleExplorerProps {
  chord: Chord;
  className?: string;
}

interface ScaleInfo {
  name: string;
  notes: Note[];
  compatibility: number;
  commonTones: string[];
  description: string;
  mood: string;
}

export const ScaleExplorer: React.FC<ScaleExplorerProps> = ({
  chord,
  className = ''
}) => {
  const [selectedScale, setSelectedScale] = useState<ScaleInfo | null>(null);
  const [sortBy, setSortBy] = useState<'compatibility' | 'alphabetical'>('compatibility');
  const [filterMinCompatibility, setFilterMinCompatibility] = useState(0.5);

  // Compute chord view and compatible scales
  const view = useMemo(() => computeChordView(chord.root, chord.quality), [chord.root, chord.quality]);
  const scaleCompatibilities = useMemo(() => findCompatibleScales(view.notes), [view.notes]);

  // Auto-select most compatible scale on first render or chord change
  useMemo(() => {
    if (scaleCompatibilities.length > 0) {
      const topScale = scaleCompatibilities[0];
      const scaleNotes = generateScale(topScale.key, topScale.scale);
      setSelectedScale({
        name: `${topScale.key} ${formatScaleName(topScale.scale)}`,
        notes: scaleNotes,
        compatibility: topScale.compatibility,
        commonTones: topScale.commonTones,
        description: getScaleDescription(topScale.scale),
        mood: getScaleMood(topScale.scale)
      });
    }
  }, [scaleCompatibilities]);

  const getFilteredAndSortedScales = (): ScaleCompatibility[] => {
    let filtered = scaleCompatibilities.filter(scale => 
      scale.compatibility >= filterMinCompatibility
    );

    if (sortBy === 'alphabetical') {
      filtered = filtered.sort((a, b) => 
        `${a.key} ${a.scale}`.localeCompare(`${b.key} ${b.scale}`)
      );
    } else {
      filtered = filtered.sort((a, b) => b.compatibility - a.compatibility);
    }

    return filtered;
  };

  const selectScale = (scaleComp: ScaleCompatibility) => {
    const scaleNotes = generateScale(scaleComp.key, scaleComp.scale);
    setSelectedScale({
      name: `${scaleComp.key} ${formatScaleName(scaleComp.scale)}`,
      notes: scaleNotes,
      compatibility: scaleComp.compatibility,
      commonTones: scaleComp.commonTones,
      description: getScaleDescription(scaleComp.scale),
      mood: getScaleMood(scaleComp.scale)
    });
  };

  const renderScaleCard = (scaleComp: ScaleCompatibility, isSelected: boolean = false) => {
    const compatibilityPercentage = Math.round(scaleComp.compatibility * 100);
    
    return (
      <div
        key={`${scaleComp.key}-${scaleComp.scale}`}
        onClick={() => selectScale(scaleComp)}
        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {scaleComp.key} {formatScaleName(scaleComp.scale)}
          </h4>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              compatibilityPercentage >= 90
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : compatibilityPercentage >= 75
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {compatibilityPercentage}%
            </span>
          </div>
        </div>
        
        <div className="mb-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Mood: <span className="font-medium">{getScaleMood(scaleComp.scale)}</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {scaleComp.commonTones.map((note, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderSelectedScale = () => {
    if (!selectedScale) return null;

    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {selectedScale.name}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Scale Notes
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedScale.notes.map((note, index) => (
                <span
                  key={index}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    selectedScale.commonTones.includes(note)
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {note}
                </span>
              ))}
            </div>
            
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Compatibility: 
              </span>
              <span className="ml-2 text-lg font-bold text-blue-600 dark:text-blue-400">
                {Math.round(selectedScale.compatibility * 100)}%
              </span>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mood: 
              </span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {selectedScale.mood}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Description
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {selectedScale.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Scale Explorer
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Discover scales and modes compatible with <strong>{view.name}</strong>
        </p>
      </div>

      {/* Selected Scale Display */}
      {selectedScale && (
        <div className="mb-6">
          {renderSelectedScale()}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'compatibility' | 'alphabetical')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="compatibility">Compatibility</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Min compatibility:
          </label>
          <select
            value={filterMinCompatibility}
            onChange={(e) => setFilterMinCompatibility(parseFloat(e.target.value))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value={0}>0%</option>
            <option value={0.25}>25%</option>
            <option value={0.5}>50%</option>
            <option value={0.75}>75%</option>
            <option value={0.9}>90%</option>
          </select>
        </div>
      </div>

      {/* Scale Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredAndSortedScales().map((scaleComp) => (
          renderScaleCard(
            scaleComp, 
            selectedScale?.name === `${scaleComp.key} ${formatScaleName(scaleComp.scale)}`
          )
        ))}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Tip:</strong> Green notes in the scale display are common tones with your chord. 
          Higher compatibility percentages mean more chord tones are found in the scale.
        </p>
      </div>
    </div>
  );
};

// Helper functions
function formatScaleName(scale: Scale): string {
  const nameMap: Record<Scale, string> = {
    'major': 'Major',
    'natural_minor': 'Natural Minor',
    'harmonic_minor': 'Harmonic Minor',
    'melodic_minor': 'Melodic Minor',
    'dorian': 'Dorian',
    'phrygian': 'Phrygian',
    'lydian': 'Lydian',
    'mixolydian': 'Mixolydian',
    'locrian': 'Locrian',
    'pentatonic_major': 'Pentatonic Major',
    'pentatonic_minor': 'Pentatonic Minor',
    'blues': 'Blues'
  };
  return nameMap[scale] || scale;
}

function getScaleDescription(scale: Scale): string {
  const descriptions: Record<Scale, string> = {
    'major': 'The most common Western scale, bright and happy sounding.',
    'natural_minor': 'The relative minor scale, darker and more melancholic.',
    'harmonic_minor': 'Minor scale with raised 7th, exotic and dramatic sound.',
    'melodic_minor': 'Minor scale with raised 6th and 7th ascending, smooth melodic motion.',
    'dorian': 'Natural minor with raised 6th, jazzy and sophisticated.',
    'phrygian': 'Natural minor with lowered 2nd, Spanish and mysterious.',
    'lydian': 'Major scale with raised 4th, dreamy and ethereal.',
    'mixolydian': 'Major scale with lowered 7th, bluesy and rock-oriented.',
    'locrian': 'Diminished mode, unstable and rarely used as tonic.',
    'pentatonic_major': 'Five-note scale, simple and universally pleasing.',
    'pentatonic_minor': 'Five-note minor scale, bluesy and expressive.',
    'blues': 'Six-note scale with blue notes, essential for blues and jazz.'
  };
  return descriptions[scale] || 'A musical scale with unique characteristics.';
}

function getScaleMood(scale: Scale): string {
  const moods: Record<Scale, string> = {
    'major': 'Happy, Bright',
    'natural_minor': 'Sad, Dark',
    'harmonic_minor': 'Exotic, Dramatic',
    'melodic_minor': 'Smooth, Jazzy',
    'dorian': 'Sophisticated, Cool',
    'phrygian': 'Mysterious, Spanish',
    'lydian': 'Dreamy, Ethereal',
    'mixolydian': 'Bluesy, Groovy',
    'locrian': 'Unstable, Tense',
    'pentatonic_major': 'Simple, Folk-like',
    'pentatonic_minor': 'Bluesy, Soulful',
    'blues': 'Gritty, Expressive'
  };
  return moods[scale] || 'Unique';
}
