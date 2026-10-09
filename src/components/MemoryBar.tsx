import React from 'react';
import { MemoryItem } from '../types/calculator';
import { playKeyClick } from '../utils/audioFeedback';

interface MemoryBarProps {
  memoryList: MemoryItem[];
  onMemoryClear: () => void;
  onMemoryRecall: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onMemoryStore: () => void;
  onSelectMemoryValue?: (val: string) => void;
}

export const MemoryBar: React.FC<MemoryBarProps> = ({
  memoryList,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryStore,
}) => {
  const hasMemory = memoryList.length > 0;

  const btnClass = (active: boolean) =>
    `flex-1 py-1.5 text-xs font-mono font-medium rounded-lg transition-all text-center select-none ${
      active
        ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 cursor-pointer shadow-xs'
        : 'bg-slate-900/40 text-slate-400 cursor-not-allowed'
    }`;

  return (
    <div className="flex items-center gap-1.5 py-1">
      <button
        onClick={() => {
          if (hasMemory) {
            playKeyClick('clear');
            onMemoryClear();
          }
        }}
        disabled={!hasMemory}
        className={btnClass(hasMemory)}
        title="Clear Memory (MC)"
        type="button"
      >
        MC
      </button>

      <button
        onClick={() => {
          if (hasMemory) {
            playKeyClick('num');
            onMemoryRecall();
          }
        }}
        disabled={!hasMemory}
        className={btnClass(hasMemory)}
        title="Recall Memory (MR)"
        type="button"
      >
        MR
      </button>

      <button
        onClick={() => {
          playKeyClick('op');
          onMemoryAdd();
        }}
        className={btnClass(true)}
        title="Add current result to Memory (M+)"
        type="button"
      >
        M+
      </button>

      <button
        onClick={() => {
          playKeyClick('op');
          onMemorySubtract();
        }}
        className={btnClass(true)}
        title="Subtract current result from Memory (M-)"
        type="button"
      >
        M-
      </button>

      <button
        onClick={() => {
          playKeyClick('op');
          onMemoryStore();
        }}
        className={btnClass(true)}
        title="Store current result to Memory (MS)"
        type="button"
      >
        MS
      </button>
    </div>
  );
};
