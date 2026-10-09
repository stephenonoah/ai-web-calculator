import React from 'react';
import { Volume2, VolumeX, Keyboard } from 'lucide-react';
import { CalculatorMode } from '../types/calculator';
import { playKeyClick } from '../utils/audioFeedback';

interface HeaderBarProps {
  currentMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenShortcuts: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentMode,
  onSelectMode,
  isMuted,
  onToggleMute,
  onOpenShortcuts,
}) => {
  const modes: { id: CalculatorMode; label: string }[] = [
    { id: 'standard', label: 'Standard' },
    { id: 'scientific', label: 'Scientific' },
    { id: 'programmer', label: 'Programmer' },
    { id: 'converter', label: 'Converter' },
    { id: 'financial', label: 'Financial' },
  ];

  return (
    <header className="flex items-center justify-between gap-8 px-4 md:px-8 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <span className="font-mono text-lg md:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
          OmniCalc
        </span>
      </div>

      {/* Zone 2: Mode Navigation (4-5 single-line links/controls) */}
      <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto py-1 scrollbar-none">
        {modes.map((m) => {
          const active = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                playKeyClick('toggle');
                onSelectMode(m.id);
              }}
              type="button"
              className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                active
                  ? 'bg-slate-800 text-amber-400 font-semibold shadow-xs ring-1 ring-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action cluster */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleMute}
          type="button"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute key clicks' : 'Mute key clicks'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          onClick={onOpenShortcuts}
          type="button"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Shortcuts</span>
        </button>
      </div>
    </header>
  );
};
