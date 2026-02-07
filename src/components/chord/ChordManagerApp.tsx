/**
 * ChordManagerApp - Main chord management interface
 * 
 * All display data is computed from chord.root and chord.quality via music-theory.ts.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { ChordEntry } from './ChordEntry';
import { ChordViewer } from './ChordViewer';
import { RomanNumeralConverter } from './RomanNumeralConverter';
import { ScaleExplorer } from './ScaleExplorer';
import { Chord, ChordSet } from '../../types/chord';
import { chordManager } from '../../lib/chord-manager';
import { formatChordName, computeChordView } from '../../lib/music-theory';

type View = 'library' | 'add-chord' | 'chord-detail' | 'roman-numeral' | 'scale-explorer' | 'sets';

export const ChordManagerApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('library');
  const [chords, setChords] = useState<Chord[]>([]);
  const [chordSets, setChordSets] = useState<ChordSet[]>([]);
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const [editingChord, setEditingChord] = useState<Chord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ chordCount: 0, chordSetCount: 0 });

  useEffect(() => {
    initializeChordManager();
  }, []);

  const initializeChordManager = async () => {
    setIsLoading(true);
    try {
      await chordManager.init();
      await loadData();
    } catch (error) {
      console.error('Failed to initialize chord manager:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [allChords, allSets, statsData] = await Promise.all([
        chordManager.getAllChords(),
        chordManager.getAllChordSets(),
        chordManager.getStats()
      ]);
      
      setChords(allChords);
      setChordSets(allSets);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleChordSave = async (_chord: Chord) => {
    await loadData();
    setCurrentView('library');
    setEditingChord(null);
  };

  const handleChordDelete = async (chordId: string) => {
    try {
      await chordManager.deleteChord(chordId);
      await loadData();
      
      if (selectedChord?.id === chordId) {
        setSelectedChord(null);
        setCurrentView('library');
      }
    } catch (error) {
      console.error('Failed to delete chord:', error);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = await chordManager.searchChords(term);
      setChords(results);
    } else {
      await loadData();
    }
  };

  const getFilteredChords = () => {
    if (!searchTerm.trim()) return chords;
    const lowerSearch = searchTerm.toLowerCase();
    return chords.filter(chord => {
      const name = formatChordName(chord.root, chord.quality);
      const view = computeChordView(chord.root, chord.quality);
      return (
        name.toLowerCase().includes(lowerSearch) ||
        chord.root.toLowerCase().includes(lowerSearch) ||
        chord.quality.toLowerCase().includes(lowerSearch) ||
        view.notes.some(note => note.toLowerCase().includes(lowerSearch))
      );
    });
  };

  const renderNavigation = () => (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chord Manager
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentView('library')}
              variant={currentView === 'library' ? 'default' : 'outline'}
              size="sm"
            >
              Library
            </Button>
            <Button
              onClick={() => setCurrentView('add-chord')}
              variant={currentView === 'add-chord' ? 'default' : 'outline'}
              size="sm"
            >
              Add Chord
            </Button>
            <Button
              onClick={() => setCurrentView('sets')}
              variant={currentView === 'sets' ? 'default' : 'outline'}
              size="sm"
            >
              Chord Sets
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stats.chordCount} chords, {stats.chordSetCount} sets
          </div>
        </div>
      </div>
    </nav>
  );

  const renderLibrary = () => (
    <div className="p-6">
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search chords..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Chord Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {getFilteredChords().map((chord) => {
            const view = computeChordView(chord.root, chord.quality);
            return (
              <div
                key={chord.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedChord(chord);
                  setCurrentView('chord-detail');
                }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {view.name}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Root: {chord.root} &middot; {chord.quality}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {view.notes.map((note, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {note}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChord(chord);
                      setCurrentView('add-chord');
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChord(chord);
                      setCurrentView('roman-numeral');
                    }}
                  >
                    Roman
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChord(chord);
                      setCurrentView('scale-explorer');
                    }}
                  >
                    Scales
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {getFilteredChords().length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchTerm ? 'No chords found matching your search.' : 'No chords yet. Add your first chord!'}
          </p>
          <Button
            onClick={() => setCurrentView('add-chord')}
            className="mt-4"
          >
            Add Chord
          </Button>
        </div>
      )}
    </div>
  );

  const renderChordDetail = () => {
    if (!selectedChord) return null;
    
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button
            onClick={() => setCurrentView('library')}
            variant="outline"
          >
            &larr; Back to Library
          </Button>
        </div>
        
        <div className="grid gap-6">
          <ChordViewer
            chord={selectedChord}
            onEdit={() => {
              setEditingChord(selectedChord);
              setCurrentView('add-chord');
            }}
            onDelete={() => handleChordDelete(selectedChord.id)}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RomanNumeralConverter chord={selectedChord} />
            <ScaleExplorer chord={selectedChord} />
          </div>
        </div>
      </div>
    );
  };

  const renderAddChord = () => (
    <div className="p-6">
      <div className="mb-4">
        <Button
          onClick={() => {
            setCurrentView('library');
            setEditingChord(null);
          }}
          variant="outline"
        >
          &larr; Back to Library
        </Button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <ChordEntry
          chord={editingChord || undefined}
          onSave={handleChordSave}
          onCancel={() => {
            setCurrentView('library');
            setEditingChord(null);
          }}
        />
      </div>
    </div>
  );

  const renderRomanNumeral = () => {
    if (!selectedChord) return null;
    
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button
            onClick={() => setCurrentView('chord-detail')}
            variant="outline"
          >
            &larr; Back to Chord
          </Button>
        </div>
        
        <RomanNumeralConverter chord={selectedChord} />
      </div>
    );
  };

  const renderScaleExplorer = () => {
    if (!selectedChord) return null;
    
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button
            onClick={() => setCurrentView('chord-detail')}
            variant="outline"
          >
            &larr; Back to Chord
          </Button>
        </div>
        
        <ScaleExplorer chord={selectedChord} />
      </div>
    );
  };

  const renderChordSets = () => (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Chord Sets
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Organize your chords into collections for projects, songs, or progressions.
        </p>
      </div>

      {chordSets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            No chord sets yet. Create your first collection!
          </p>
          <Button onClick={() => {}}>
            Create Chord Set
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chordSets.map((set) => (
            <div
              key={set.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {set.name}
              </h3>
              {set.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {set.description}
                </p>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {set.chordIds.length} chords
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  View
                </Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {renderNavigation()}
      
      <main>
        {currentView === 'library' && renderLibrary()}
        {currentView === 'add-chord' && renderAddChord()}
        {currentView === 'chord-detail' && renderChordDetail()}
        {currentView === 'roman-numeral' && renderRomanNumeral()}
        {currentView === 'scale-explorer' && renderScaleExplorer()}
        {currentView === 'sets' && renderChordSets()}
      </main>
    </div>
  );
};
