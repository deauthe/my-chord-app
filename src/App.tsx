import { useState } from 'react';
import NavigationSidebar from './components/layout/NavigationSidebar';
import { ChordManagerApp } from './components/chord/ChordManagerApp';
import { NoteChordBuilder } from './components/chord/NoteChordBuilder';
import { ChordViewer } from './components/chord/ChordViewer';
import { ScaleExplorer } from './components/chord/ScaleExplorer';
import { RomanNumeralConverter } from './components/chord/RomanNumeralConverter';
import { Chord, Note, ChordQuality } from './types/chord';
import { ChordInterpretation } from './lib/chord-detection';

export type AppView = 'chords' | 'identify' | 'scales' | 'roman-numerals';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('chords');

  // Shared state: when a chord is identified/selected in any view, it can be inspected
  const [inspectedChord, setInspectedChord] = useState<Chord | null>(null);

  const handleChordIdentified = (interpretation: ChordInterpretation) => {
    const chord: Chord = {
      id: `temp-${Date.now()}`,
      root: interpretation.root,
      quality: interpretation.quality,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setInspectedChord(chord);
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'chords':
        return <ChordManagerApp />;

      case 'identify':
        return (
          <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Chord Identifier
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select notes on the piano or guitar and see what chord they form
              </p>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <NoteChordBuilder
                onChordSelect={handleChordIdentified}
                onCancel={() => setCurrentView('chords')}
              />

              {inspectedChord && (
                <div className="mt-6 space-y-6">
                  <ChordViewer chord={inspectedChord} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RomanNumeralConverter chord={inspectedChord} />
                    <ScaleExplorer chord={inspectedChord} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'scales':
        return (
          <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Scale Explorer
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pick a chord to explore its compatible scales and modes
              </p>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <ScaleChordPicker
                onChordPicked={(root, quality) => {
                  setInspectedChord({
                    id: `temp-${Date.now()}`,
                    root,
                    quality,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  });
                }}
              />
              {inspectedChord && (
                <div className="mt-6">
                  <ScaleExplorer chord={inspectedChord} />
                </div>
              )}
            </div>
          </div>
        );

      case 'roman-numerals':
        return (
          <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Roman Numeral Analysis
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Understand how a chord functions in different keys
              </p>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <ScaleChordPicker
                onChordPicked={(root, quality) => {
                  setInspectedChord({
                    id: `temp-${Date.now()}`,
                    root,
                    quality,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  });
                }}
              />
              {inspectedChord && (
                <div className="mt-6">
                  <RomanNumeralConverter chord={inspectedChord} />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <ChordManagerApp />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <NavigationSidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 flex flex-col min-w-0">
        {renderMainContent()}
      </main>
    </div>
  );
}

/**
 * Quick chord picker for standalone Scale Explorer / Roman Numeral views.
 * Just root + quality selectors — no persistence, no library.
 */
function ScaleChordPicker({
  onChordPicked,
}: {
  onChordPicked: (root: Note, quality: ChordQuality) => void;
}) {
  const roots: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const qualities: ChordQuality[] = [
    'major', 'minor', 'diminished', 'augmented',
    'dominant7', 'major7', 'minor7', 'diminished7', 'half-diminished7',
    'major9', 'minor9', 'dominant9',
    'sus2', 'sus4', 'add9', 'add11', 'add13',
  ];

  const [root, setRoot] = useState<Note>('C');
  const [quality, setQuality] = useState<ChordQuality>('major');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Root</label>
          <div className="flex flex-wrap gap-1">
            {roots.map((n) => (
              <button
                key={n}
                onClick={() => setRoot(n)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  root === n
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quality</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as ChordQuality)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
          >
            {qualities.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onChordPicked(root, quality)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Explore
        </button>
      </div>
    </div>
  );
}

export default App;
