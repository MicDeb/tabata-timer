import React from 'react';

interface ResponsiveLayoutProps {
  timerPanel: React.ReactNode;
  configPanel: React.ReactNode;
  isRunning: boolean;
}

export function ResponsiveLayout({ timerPanel, configPanel, isRunning }: ResponsiveLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Mobile: Stack vertically. Desktop: Side by side */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Timer Panel — main focus */}
          <div className="flex-1">
            {timerPanel}
          </div>

          {/* Config Panel — hidden/collapsed when running on mobile */}
          <div
            className={`lg:w-80 xl:w-96 transition-all duration-300 ${
              isRunning ? 'hidden lg:block' : 'block'
            }`}
          >
            {configPanel}
          </div>
        </div>
      </div>
    </div>
  );
}
