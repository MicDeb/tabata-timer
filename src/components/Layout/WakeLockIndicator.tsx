

interface WakeLockIndicatorProps {
  isActive: boolean;
}

export function WakeLockIndicator({ isActive }: WakeLockIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-1 text-xs ${
        isActive ? 'text-green-400' : 'text-gray-600'
      }`}
      title={isActive ? 'Wake Lock aktywny — ekran nie wygaśnie' : 'Wake Lock nieaktywny'}
      aria-label={isActive ? 'Blokada ekranu aktywna' : 'Blokada ekranu nieaktywna'}
    >
      {isActive ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 018 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      )}
    </div>
  );
}
