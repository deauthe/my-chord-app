/**
 * ChordViewer Component - Displays detailed chord information
 * 
 * All display data is computed on demand from chord.root and chord.quality
 * via computeChordView() and the analysis functions in music-theory.ts.
 */

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Chord, ChordExtension, ChordSubstitution, ScaleCompatibility } from '../../types/chord';
import {
  computeChordView,
  findCompatibleScales,
  suggestChordExtensions,
  suggestChordSubstitutions
} from '../../lib/music-theory';

interface ChordViewerProps {
  chord: Chord;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const ChordViewer: React.FC<ChordViewerProps> = ({
  chord,
  onEdit,
  onDelete,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'inversions' | 'extensions' | 'substitutions' | 'scales'>('info');

  // Compute all derived data from (root, quality)
  const view = useMemo(() => computeChordView(chord.root, chord.quality), [chord.root, chord.quality]);
  const extensions = useMemo(() => suggestChordExtensions(chord.root, chord.quality), [chord.root, chord.quality]);
  const substitutions = useMemo(() => suggestChordSubstitutions(chord.root, chord.quality), [chord.root, chord.quality]);
  const compatibleScales = useMemo(() => findCompatibleScales(view.notes), [view.notes]);

  const renderTabButton = (tab: typeof activeTab, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const renderInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h4>
          <div className="flex flex-wrap gap-2">
            {view.notes.map((note, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Intervals</h4>
          <div className="flex flex-wrap gap-2">
            {view.intervals.map((interval, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium"
              >
                {interval}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Identity</h4>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
            Root: {chord.root}
          </span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
            Quality: {chord.quality}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <span className="font-medium">Created:</span> {chord.createdAt.toLocaleDateString()}
        </div>
        <div>
          <span className="font-medium">Updated:</span> {chord.updatedAt.toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  const renderInversions = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Inversions</h4>
      <div className="grid gap-3">
        {view.inversions.map((inversion, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
          >
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                {index === 0 ? 'Root Position' : `${getInversionName(index)} Inversion`}
              </span>
            </div>
            <div className="flex gap-2">
              {inversion.map((note, noteIndex) => (
                <span
                  key={noteIndex}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExtensions = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested Extensions</h4>
      {extensions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No extensions available</p>
      ) : (
        <div className="grid gap-3">
          {extensions.map((extension, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
            >
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {extension.name}
                </span>
              </div>
              <div className="flex gap-2">
                {extension.notes.map((note, noteIndex) => (
                  <span
                    key={noteIndex}
                    className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSubstitutions = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested Substitutions</h4>
      {substitutions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No substitutions available</p>
      ) : (
        <div className="grid gap-3">
          {substitutions.map((substitution, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {substitution.name}
                </span>
                <div className="flex gap-2">
                  {substitution.notes.map((note, noteIndex) => (
                    <span
                      key={noteIndex}
                      className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-sm"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {substitution.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderScales = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Compatible Scales</h4>
      {compatibleScales.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No compatible scales found</p>
      ) : (
        <div className="grid gap-3">
          {compatibleScales.slice(0, 8).map((scale, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
            >
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {scale.key} {scale.scale.replace('_', ' ')}
                </span>
                <div className="mt-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Compatibility: {Math.round(scale.compatibility * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                {scale.commonTones.map((note, noteIndex) => (
                  <span
                    key={noteIndex}
                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {view.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {chord.root} {chord.quality}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button onClick={onEdit} variant="outline" size="sm">
              Edit
            </Button>
          )}
          {onDelete && (
            <Button onClick={onDelete} variant="outline" size="sm">
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {renderTabButton('info', 'Info')}
        {renderTabButton('inversions', 'Inversions')}
        {renderTabButton('extensions', 'Extensions')}
        {renderTabButton('substitutions', 'Substitutions')}
        {renderTabButton('scales', 'Scales')}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'info' && renderInfo()}
        {activeTab === 'inversions' && renderInversions()}
        {activeTab === 'extensions' && renderExtensions()}
        {activeTab === 'substitutions' && renderSubstitutions()}
        {activeTab === 'scales' && renderScales()}
      </div>
    </div>
  );
};

function getInversionName(index: number): string {
  const names = ['First', 'Second', 'Third', 'Fourth'];
  return names[index - 1] || `${index}th`;
}
