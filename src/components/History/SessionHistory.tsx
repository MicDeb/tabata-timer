import { useState } from 'react';
import type { SessionEntry } from '../../types/workout';
import { formatTime } from '../../utils/timeUtils';

interface SessionHistoryProps {
  history: SessionEntry[];
  onClear: () => void;
}

export function SessionHistory({ history, onClear }: SessionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (confirmClear) {
      onClear();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary text-sm py-2 px-3 flex items-center gap-2"
        aria-label="Historia sesji"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Historia
        {history.length > 0 && (
          <span className="bg-gray-600 text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsOpen(false)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">Historia sesji</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Zamknij"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Brak historii sesji.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry: SessionEntry) => {
                    const date = new Date(entry.date);
                    const dateStr = date.toLocaleDateString('pl-PL');
                    const timeStr = date.toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={entry.id}
                        className="bg-gray-800 rounded-lg p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-white">{entry.modeName}</div>
                          <div className="text-xs text-gray-500">
                            {dateStr} {timeStr}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-mono text-white">
                            {formatTime(entry.durationSeconds)}
                          </div>
                          {entry.completedRounds > 0 && (
                            <div className="text-xs text-gray-500">{entry.completedRounds} rund</div>
                          )}
                          <div
                            className={`text-xs font-semibold mt-0.5 ${
                              entry.finished ? 'text-green-400' : 'text-yellow-400'
                            }`}
                          >
                            {entry.finished ? 'Ukończono' : 'Przerwano'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="p-4 border-t border-gray-700">
                {confirmClear ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-400">Na pewno wyczyścić historię?</span>
                    <div className="flex gap-2">
                      <button onClick={handleClear} className="btn-danger text-sm py-1 px-3">
                        Tak
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="btn-secondary text-sm py-1 px-3"
                      >
                        Nie
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleClear} className="btn-danger w-full text-sm">
                    Wyczyść historię
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
