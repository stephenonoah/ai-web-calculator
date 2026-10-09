import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 - 9', desc: 'Enter numeric digits' },
    { key: '.', desc: 'Decimal point' },
    { key: '+ - * /', desc: 'Arithmetic operations' },
    { key: 'Enter or =', desc: 'Calculate evaluation' },
    { key: 'Backspace', desc: 'Delete last character' },
    { key: 'Escape', desc: 'All Clear (AC)' },
    { key: '( and )', desc: 'Parentheses grouping' },
    { key: '^', desc: 'Exponentiation (xʸ)' },
    { key: '%', desc: 'Percentage / Modulo' },
    { key: 'p', desc: 'Insert Pi constant (π)' },
    { key: 'e', desc: "Insert Euler's constant (e)" },
    { key: 's / c / t', desc: 'sin / cos / tan functions' },
    { key: 'l', desc: 'Natural logarithm (ln)' },
    { key: 'r', desc: 'Square root (√)' },
    { key: '!', desc: 'Factorial (n!)' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-y-auto pr-1">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
            >
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-amber-300 font-semibold border border-slate-700/80 shadow-xs">
                {s.key}
              </kbd>
              <span className="text-slate-300">{s.desc}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
