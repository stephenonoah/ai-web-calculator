import React, { useState } from 'react';
import { Trash2, Copy, Download, Check, History } from 'lucide-react';
import { HistoryItem } from '../types/calculator';
import { formatWithCommas } from '../utils/calculatorEngine';
import { playKeyClick } from '../utils/audioFeedback';

interface HistoryTapeProps {
  items: HistoryItem[];
  onClear: () => void;
  onRecallResult: (res: string) => void;
  onRecallExpression: (expr: string) => void;
}

export const HistoryTape: React.FC<HistoryTapeProps> = ({
  items,
  onClear,
  onRecallResult,
  onRecallExpression,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyItem = (item: HistoryItem) => {
    navigator.clipboard.writeText(`${item.expression} = ${item.result}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportText = () => {
    if (items.length === 0) return;
    const content = items
      .map(
        (i) =>
          `[${new Date(i.timestamp).toLocaleTimeString()}] ${i.expression} = ${i.result}`
      )
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OmniCalc_Tape_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 shadow-sm">
      {/* Tape Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>Calculation Tape</span>
          {items.length > 0 && (
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
              {items.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {items.length > 0 && (
            <>
              <button
                onClick={handleExportText}
                type="button"
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Download history tape as text"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  playKeyClick('clear');
                  onClear();
                }}
                type="button"
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear tape"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 min-h-[160px] max-h-[360px] md:max-h-[500px]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
            <p>Your recent calculations will appear here on the tape.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-950 transition-all text-right"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyItem(item)}
                    type="button"
                    className="p-0.5 hover:text-slate-200"
                    title="Copy calculation"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      playKeyClick('num');
                      onRecallExpression(item.expression);
                    }}
                    type="button"
                    className="hover:text-amber-300 ml-1 text-[10px]"
                    title="Use this formula"
                  >
                    Use Formula
                  </button>
                </div>
              </div>

              {/* Expression */}
              <div
                onClick={() => {
                  playKeyClick('num');
                  onRecallExpression(item.expression);
                }}
                className="text-xs font-mono text-slate-400 truncate cursor-pointer hover:text-slate-200 transition-colors"
                title="Click to load expression"
              >
                {item.expression} =
              </div>

              {/* Result */}
              <div
                onClick={() => {
                  playKeyClick('num');
                  onRecallResult(item.result);
                }}
                className="text-base font-mono font-bold text-amber-400/90 truncate cursor-pointer hover:text-amber-300 transition-colors tabular-nums mt-0.5"
                title="Click to insert result into calculator"
              >
                {formatWithCommas(item.result)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
