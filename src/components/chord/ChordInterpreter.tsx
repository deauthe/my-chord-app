/**
 * ChordInterpreter - Modular component for analyzing and displaying chord interpretations
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { analyzeChord, ChordInterpretation } from '../../lib/chord-detection';

interface ChordInterpreterProps {
  selectedNotes: Set<string>;
  onChordSelect: (interpretation: ChordInterpretation) => void;
  selectedInterpretation?: ChordInterpretation | null;
  className?: string;
}

export const ChordInterpreter: React.FC<ChordInterpreterProps> = ({
  selectedNotes,
  onChordSelect,
  selectedInterpretation,
  className = ''
}) => {
  const [interpretations, setInterpretations] = useState<ChordInterpretation[]>([]);
  const [showAllInterpretations, setShowAllInterpretations] = useState(false);

  useEffect(() => {
    analyzeCurrentChord();
  }, [selectedNotes]);

  const analyzeCurrentChord = () => {
    const notes = Array.from(selectedNotes);
    if (notes.length < 2) {
      setInterpretations([]);
      return;
    }

    const analysis = analyzeChord(notes);
    setInterpretations(analysis.interpretations);
  };

  const renderEmptyState = () => {
    if (selectedNotes.size === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🎵</div>
          <p>Select notes to see chord analysis</p>
        </div>
      );
    }

    if (selectedNotes.size === 1) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🎵</div>
          <p>Select at least 2 notes to analyze chord</p>
          <p className="text-sm mt-1">Currently selected: {Array.from(selectedNotes)[0]}</p>
        </div>
      );
    }

    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-2">❓</div>
        <p>No standard chord matches found</p>
        <p className="text-sm mt-1">Try a different combination of notes</p>
      </div>
    );
  };

  const renderInterpretations = () => {
    if (interpretations.length === 0) {
      return renderEmptyState();
    }

    const topInterpretations = showAllInterpretations 
      ? interpretations 
      : interpretations.slice(0, 5);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chord Interpretations ({interpretations.length})
          </h4>
          {interpretations.length > 5 && (
            <Button
              onClick={() => setShowAllInterpretations(!showAllInterpretations)}
              variant="outline"
              size="sm"
            >
              {showAllInterpretations ? 'Show Less' : 'Show All'}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {topInterpretations.map((interpretation, index) => (
            <div
              key={interpretation.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedInterpretation?.id === interpretation.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => onChordSelect(interpretation)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {interpretation.name}
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      Best Match
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    interpretation.confidence > 0.8
                      ? 'text-green-600 dark:text-green-400'
                      : interpretation.confidence > 0.6
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.round(interpretation.confidence * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {interpretation.description}
              </p>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Root:</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    {interpretation.root}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Quality:</span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                    {interpretation.quality}
                  </span>
                </div>

                {interpretation.inversion > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Inversion:</span>
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">
                      {interpretation.inversion}
                    </span>
                  </div>
                )}

                {interpretation.bassNote && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Bass:</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                      {interpretation.bassNote}
                    </span>
                  </div>
                )}
              </div>

              {(interpretation.missingNotes.length > 0 || interpretation.extraNotes.length > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-4 text-xs">
                    {interpretation.missingNotes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-red-600 dark:text-red-400">Missing:</span>
                        <div className="flex gap-1">
                          {interpretation.missingNotes.map((note, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded"
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {interpretation.extraNotes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">Extra:</span>
                        <div className="flex gap-1">
                          {interpretation.extraNotes.map((note, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded"
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalysisStats = () => {
    if (selectedNotes.size < 2) return null;

    const notes = Array.from(selectedNotes).sort();
    const noteCount = selectedNotes.size;
    const interpretationCount = interpretations.length;
    const bestConfidence = interpretations[0]?.confidence || 0;

    return (
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Analysis Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Notes:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{noteCount}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Interpretations:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{interpretationCount}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Best Match:</span>
            <span className={`ml-2 font-medium ${
              bestConfidence > 0.8
                ? 'text-green-600 dark:text-green-400'
                : bestConfidence > 0.6
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {Math.round(bestConfidence * 100)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Input:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {notes.join(', ')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Chord Analysis
        </h3>
        
        {renderAnalysisStats()}
        
        <div className="min-h-[200px]">
          {renderInterpretations()}
        </div>
      </div>
    </div>
  );
};
