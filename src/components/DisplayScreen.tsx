import React, { useState } from 'react';
import { Copy, Check, Delete } from 'lucide-react';
import { AngleMode, CalculatorMode } from '../types/calculator';
import { formatWithCommas } from '../utils/calculatorEngine';

interface DisplayScreenProps {
  expression: string;
  result: string;
  preview: string | null;
  error: string | null;
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  hasMemory: boolean;
  mode: CalculatorMode;
  onBackspace: () => void;
}

export const DisplayScreen: React.FC<DisplayScreenProps> = ({
  expression,
  result,
  preview,
  error,
  angleMode,
  onToggleAngleMode,
  hasMemory,
  mode,
  onBackspace,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = error ? expression : result || expression || '0';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Dynamic font sizing based on result length
  const displayVal = error ? error : (result ? formatWithCommas(result) : '0');
  const len = displayVal.length;
  let textClass = 'text-4xl md:text-5xl';
  if (len > 18) textClass = 'text-xl md:text-2xl';
  else if (len > 13) textClass = 'text-2xl md:text-3xl';
  else if (len > 9) textClass = 'text-3xl md:text-4xl';

  return (
    <div className="relative rounded-2xl bg-slate-900 border border-slate-800/80 p-4 md:p-5 shadow-inner flex flex-col justify-between min-h-[148px] overflow-hidden select-text">
      {/* Top telemetry and status flags */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/60 pb-2 mb-2">
        <div className="flex items-center gap-3">
          {mode === 'scientific' && (
            <button
              onClick={onToggleAngleMode}
              type="button"
              className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300 font-semibold transition-colors tracking-wide cursor-pointer text-[11px]"
              title="Click to toggle Degree / Radian mode"
            >
              {angleMode}
            </button>
          )}

          {hasMemory && (
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-semibold text-[11px]" title="Memory contains stored value">
              M
            </span>
          )}

          <span className="text-slate-400 uppercase tracking-wider text-[11px]">
            {mode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {expression && (
            <button
              onClick={onBackspace}
              type="button"
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              title="Backspace (Backspace key)"
            >
              <Delete className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
            title="Copy current value to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expression input stream */}
      <div className="min-h-[26px] text-right font-mono text-sm md:text-base text-slate-400 truncate tracking-wide px-1">
        {expression || '\u00A0'}
      </div>

      {/* Main output / result line with live calculation preview */}
      <div className="flex items-baseline justify-end gap-3 mt-1 px-1">
        {preview && !error && (
          <span className="text-xs md:text-sm font-mono text-amber-400/80 tabular-nums truncate">
            = {formatWithCommas(preview)}
          </span>
        )}
        <div
          className={`font-mono font-bold tracking-tight text-right tabular-nums transition-all ${textClass} ${
            error ? 'text-rose-400' : 'text-slate-100'
          }`}
        >
          {displayVal}
        </div>
      </div>
    </div>
  );
};
