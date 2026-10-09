import { useState, useEffect, useCallback } from 'react';
import {
  AngleMode,
  CalculatorMode,
  HistoryItem,
  MemoryItem,
} from './types/calculator';
import {
  calculateExpression,
  formatCalculatorNumber,
  previewExpression,
} from './utils/calculatorEngine';
import { playKeyClick, setAudioMuted } from './utils/audioFeedback';
import { HeaderBar } from './components/HeaderBar';
import { DisplayScreen } from './components/DisplayScreen';
import { MemoryBar } from './components/MemoryBar';
import { StandardKeypad } from './components/StandardKeypad';
import { ScientificKeypad } from './components/ScientificKeypad';
import { ProgrammerView } from './components/ProgrammerView';
import { ConverterView } from './components/ConverterView';
import { FinancialView } from './components/FinancialView';
import { HistoryTape } from './components/HistoryTape';
import { ShortcutsModal } from './components/ShortcutsModal';

export default function App() {
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [justCalculated, setJustCalculated] = useState<boolean>(false);

  // Audio mute preference
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('omni_muted') === 'true';
    } catch {
      return false;
    }
  });

  // Calculation History
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('omni_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Memory Registers
  const [memoryList, setMemoryList] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('omni_memory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false);
  const [mobileTapeOpen, setMobileTapeOpen] = useState<boolean>(false);

  // Sync Audio Muted
  useEffect(() => {
    setAudioMuted(isMuted);
    try {
      localStorage.setItem('omni_muted', String(isMuted));
    } catch {
      // ignore
    }
  }, [isMuted]);

  // Persist History
  useEffect(() => {
    try {
      localStorage.setItem('omni_history', JSON.stringify(historyItems));
    } catch {
      // ignore
    }
  }, [historyItems]);

  // Persist Memory
  useEffect(() => {
    try {
      localStorage.setItem('omni_memory', JSON.stringify(memoryList));
    } catch {
      // ignore
    }
  }, [memoryList]);

  // Update live preview whenever expression or angleMode changes
  useEffect(() => {
    if (!expression || justCalculated) {
      setPreview(null);
      return;
    }
    const prev = previewExpression(expression, angleMode);
    setPreview(prev);
  }, [expression, angleMode, justCalculated]);

  // Core Calculator Handlers
  const handleDigit = useCallback(
    (digit: string) => {
      setError(null);
      if (justCalculated) {
        setExpression(digit === '.' ? '0.' : digit);
        setResult(digit === '.' ? '0.' : digit);
        setJustCalculated(false);
        return;
      }

      setExpression((prev) => {
        // Prevent duplicate decimal in current number segment
        if (digit === '.') {
          const segments = prev.split(/[\s+\−×÷*/%^()]/);
          const lastSeg = segments[segments.length - 1];
          if (lastSeg.includes('.')) return prev;
          if (!lastSeg) return prev + '0.';
        }
        return prev + digit;
      });
    },
    [justCalculated]
  );

  const handleOperator = useCallback(
    (op: string) => {
      setError(null);
      if (justCalculated) {
        setExpression(result + ' ' + op + ' ');
        setJustCalculated(false);
        return;
      }

      setExpression((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) {
          if (op === '−' || op === '-') return '-';
          return '0 ' + op + ' ';
        }
        // If last token was an operator, replace it
        if (/[\+\−×÷\*\/\^%]$/.test(trimmed)) {
          return trimmed.slice(0, -1).trim() + ' ' + op + ' ';
        }
        return trimmed + ' ' + op + ' ';
      });
    },
    [justCalculated, result]
  );

  const handleEquals = useCallback(() => {
    if (!expression.trim()) return;

    const { result: val, error: err } = calculateExpression(expression, angleMode);
    if (err || Number.isNaN(val)) {
      setError(err || 'Syntax Error');
      playKeyClick('error');
      return;
    }

    const formattedRes = formatCalculatorNumber(val);
    setResult(formattedRes);
    setError(null);
    setJustCalculated(true);

    // Save to history tape
    const newItem: HistoryItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      expression: expression.trim(),
      result: formattedRes,
      timestamp: Date.now(),
      mode,
    };
    setHistoryItems((prev) => [newItem, ...prev.slice(0, 49)]);
  }, [expression, angleMode, mode]);

  const handleClear = useCallback(() => {
    setExpression('');
    setResult('0');
    setPreview(null);
    setError(null);
    setJustCalculated(false);
  }, []);

  const handleBackspace = useCallback(() => {
    setError(null);
    if (justCalculated) {
      setExpression('');
      setResult('0');
      setJustCalculated(false);
      return;
    }
    setExpression((prev) => {
      const trimmed = prev.trimEnd();
      if (trimmed.length <= 1) return '';
      // If trailing space operator
      if (trimmed.endsWith(' ')) {
        return trimmed.slice(0, -1);
      }
      return trimmed.slice(0, -1);
    });
  }, [justCalculated]);

  const handleToggleSign = useCallback(() => {
    setError(null);
    if (justCalculated) {
      const num = parseFloat(result);
      if (!Number.isNaN(num)) {
        const toggled = formatCalculatorNumber(-num);
        setResult(toggled);
        setExpression(toggled);
      }
      return;
    }

    setExpression((prev) => {
      if (!prev.trim()) return '-';
      // If starts with negative sign, flip it
      if (prev.startsWith('-(') && prev.endsWith(')')) {
        return prev.slice(2, -1);
      }
      return `-(${prev})`;
    });
  }, [justCalculated, result]);

  const handlePercentage = useCallback(() => {
    setError(null);
    if (justCalculated) {
      const val = parseFloat(result) / 100;
      const res = formatCalculatorNumber(val);
      setResult(res);
      setExpression(res);
      return;
    }
    setExpression((prev) => (prev ? prev + ' % ' : ''));
  }, [justCalculated, result]);

  const handleFunction = useCallback(
    (fn: string) => {
      setError(null);
      if (fn === 'reciprocal') {
        if (justCalculated || (!expression && result !== '0')) {
          setExpression(`1 / (${result})`);
        } else {
          setExpression((prev) => `1 / (${prev || '0'})`);
        }
        setJustCalculated(false);
        return;
      }

      if (fn === 'square') {
        if (justCalculated) {
          setExpression(`(${result}) ^ 2`);
        } else {
          setExpression((prev) => (prev ? `(${prev}) ^ 2` : '0 ^ 2'));
        }
        setJustCalculated(false);
        return;
      }

      if (fn === 'sqrt') {
        if (justCalculated) {
          setExpression(`sqrt(${result})`);
        } else {
          setExpression((prev) => `sqrt(${prev || '0'})`);
        }
        setJustCalculated(false);
        return;
      }

      if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'ln', 'log', 'abs', 'exp', 'fact'].includes(fn)) {
        if (justCalculated) {
          setExpression(`${fn}(${result})`);
          setJustCalculated(false);
        } else {
          setExpression((prev) => (prev ? `${prev}${fn}(` : `${fn}(`));
        }
        return;
      }

      if (fn === 'pow10') {
        if (justCalculated) {
          setExpression(`10 ^ (${result})`);
        } else {
          setExpression((prev) => (prev ? `10 ^ (${prev})` : `10 ^ `));
        }
        setJustCalculated(false);
        return;
      }
    },
    [justCalculated, result, expression]
  );

  const handleConstant = useCallback(
    (c: string) => {
      setError(null);
      if (justCalculated) {
        setExpression(c);
        setJustCalculated(false);
        return;
      }
      setExpression((prev) => prev + c);
    },
    [justCalculated]
  );

  const handleParenthesis = useCallback(
    (p: '(' | ')') => {
      setError(null);
      if (justCalculated) {
        setExpression(p);
        setJustCalculated(false);
        return;
      }
      setExpression((prev) => prev + p);
    },
    [justCalculated]
  );

  // Memory Handlers
  const currentNumericResult = parseFloat(result) || 0;

  const handleMemoryClear = () => {
    setMemoryList([]);
  };

  const handleMemoryRecall = () => {
    if (memoryList.length > 0) {
      const lastVal = memoryList[0].value;
      if (justCalculated) {
        setExpression(lastVal);
        setResult(lastVal);
        setJustCalculated(false);
      } else {
        setExpression((prev) => prev + lastVal);
      }
    }
  };

  const handleMemoryAdd = () => {
    const active = currentNumericResult;
    const existing = memoryList.length > 0 ? parseFloat(memoryList[0].value) || 0 : 0;
    const updated = formatCalculatorNumber(existing + active);
    const newEntry: MemoryItem = {
      id: `${Date.now()}`,
      value: updated,
      timestamp: Date.now(),
    };
    setMemoryList([newEntry, ...memoryList.slice(1)]);
  };

  const handleMemorySubtract = () => {
    const active = currentNumericResult;
    const existing = memoryList.length > 0 ? parseFloat(memoryList[0].value) || 0 : 0;
    const updated = formatCalculatorNumber(existing - active);
    const newEntry: MemoryItem = {
      id: `${Date.now()}`,
      value: updated,
      timestamp: Date.now(),
    };
    setMemoryList([newEntry, ...memoryList.slice(1)]);
  };

  const handleMemoryStore = () => {
    const formatted = formatCalculatorNumber(currentNumericResult);
    const newEntry: MemoryItem = {
      id: `${Date.now()}`,
      value: formatted,
      timestamp: Date.now(),
    };
    setMemoryList([newEntry, ...memoryList]);
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing into an input field or select dropdown
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ignore modifier combinations like Ctrl+C / Ctrl+V / Cmd+R
      if (e.metaKey || (e.ctrlKey && e.key.toLowerCase() !== 'm' && e.key.toLowerCase() !== 'r')) {
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        playKeyClick('num');
        handleDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        playKeyClick('num');
        handleDigit('.');
      } else if (key === '+') {
        e.preventDefault();
        playKeyClick('op');
        handleOperator('+');
      } else if (key === '-') {
        e.preventDefault();
        playKeyClick('op');
        handleOperator('−');
      } else if (key === '*') {
        e.preventDefault();
        playKeyClick('op');
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        playKeyClick('op');
        handleOperator('÷');
      } else if (key === '^') {
        e.preventDefault();
        playKeyClick('op');
        handleOperator('^');
      } else if (key === '%') {
        e.preventDefault();
        playKeyClick('op');
        handleOperator('%');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        playKeyClick('equals');
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        playKeyClick('clear');
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        playKeyClick('clear');
        handleClear();
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        playKeyClick('num');
        handleParenthesis(key);
      } else if (key === 'p' || key === 'P') {
        e.preventDefault();
        playKeyClick('num');
        handleConstant('π');
      } else if (key === 'e' || key === 'E') {
        e.preventDefault();
        playKeyClick('num');
        handleConstant('e');
      } else if (key === 's' || key === 'S') {
        e.preventDefault();
        playKeyClick('op');
        handleFunction('sin');
      } else if (key === 'c' || key === 'C') {
        e.preventDefault();
        playKeyClick('op');
        handleFunction('cos');
      } else if (key === 't' || key === 'T') {
        e.preventDefault();
        playKeyClick('op');
        handleFunction('tan');
      } else if (key === 'l' || key === 'L') {
        e.preventDefault();
        playKeyClick('op');
        handleFunction('ln');
      } else if (key === 'r' || key === 'R') {
        e.preventDefault();
        playKeyClick('op');
        handleFunction('sqrt');
      } else if (key === '!') {
        e.preventDefault();
        playKeyClick('op');
        handleFunction('fact');
      } else if (key === '?') {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleOperator,
    handleEquals,
    handleBackspace,
    handleClear,
    handleParenthesis,
    handleConstant,
    handleFunction,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Header */}
      <HeaderBar
        currentMode={mode}
        onSelectMode={setMode}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col">
        {/* Dynamic Asymmetric Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Calculator Instrument (cols 1..7 or 1..8) */}
          <div
            className={`space-y-4 ${
              mode === 'programmer' || mode === 'converter' || mode === 'financial'
                ? 'lg:col-span-8'
                : 'lg:col-span-7'
            }`}
          >
            {/* Display screen is shown in Standard and Scientific modes */}
            {(mode === 'standard' || mode === 'scientific') && (
              <>
                <DisplayScreen
                  expression={expression}
                  result={result}
                  preview={preview}
                  error={error}
                  angleMode={angleMode}
                  onToggleAngleMode={() =>
                    setAngleMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))
                  }
                  hasMemory={memoryList.length > 0}
                  mode={mode}
                  onBackspace={handleBackspace}
                />

                <MemoryBar
                  memoryList={memoryList}
                  onMemoryClear={handleMemoryClear}
                  onMemoryRecall={handleMemoryRecall}
                  onMemoryAdd={handleMemoryAdd}
                  onMemorySubtract={handleMemorySubtract}
                  onMemoryStore={handleMemoryStore}
                />
              </>
            )}

            {/* Keypad or View specific content */}
            {mode === 'standard' && (
              <StandardKeypad
                onDigit={handleDigit}
                onOperator={handleOperator}
                onEquals={handleEquals}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onToggleSign={handleToggleSign}
                onPercentage={handlePercentage}
                onFunction={handleFunction}
              />
            )}

            {mode === 'scientific' && (
              <ScientificKeypad
                angleMode={angleMode}
                onToggleAngleMode={() =>
                  setAngleMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))
                }
                onDigit={handleDigit}
                onOperator={handleOperator}
                onEquals={handleEquals}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onToggleSign={handleToggleSign}
                onScientificFunc={handleFunction}
                onConstant={handleConstant}
                onParenthesis={handleParenthesis}
              />
            )}

            {mode === 'programmer' && <ProgrammerView />}

            {mode === 'converter' && <ConverterView />}

            {mode === 'financial' && <FinancialView />}
          </div>

          {/* Right Column: Interactive Calculation Tape & Fast Telemetry (cols 8..12 or 9..12) */}
          <div
            className={`space-y-4 ${
              mode === 'programmer' || mode === 'converter' || mode === 'financial'
                ? 'lg:col-span-4'
                : 'lg:col-span-5'
            }`}
          >
            {/* Calculation Tape Card */}
            <div className="h-full">
              <HistoryTape
                items={historyItems}
                onClear={() => setHistoryItems([])}
                onRecallResult={(r) => {
                  setResult(r);
                  setExpression(r);
                  setJustCalculated(true);
                }}
                onRecallExpression={(exp) => {
                  setExpression(exp);
                  setJustCalculated(false);
                }}
              />
            </div>

            {/* Quick Math Constants reference card */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="text-xs text-slate-400 font-medium">Quick Constants Reference</div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  onClick={() => {
                    playKeyClick('num');
                    handleConstant('π');
                  }}
                  type="button"
                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-colors cursor-pointer text-left"
                >
                  <div className="text-amber-400 font-bold">π (Pi)</div>
                  <div className="text-slate-400 text-[11px] truncate">3.14159265</div>
                </button>
                <button
                  onClick={() => {
                    playKeyClick('num');
                    handleConstant('e');
                  }}
                  type="button"
                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-colors cursor-pointer text-left"
                >
                  <div className="text-amber-400 font-bold">e (Euler)</div>
                  <div className="text-slate-400 text-[11px] truncate">2.71828182</div>
                </button>
                <button
                  onClick={() => {
                    playKeyClick('num');
                    handleConstant('φ');
                  }}
                  type="button"
                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-colors cursor-pointer text-left"
                >
                  <div className="text-amber-400 font-bold">φ (Phi)</div>
                  <div className="text-slate-400 text-[11px] truncate">1.61803398</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 py-4 px-4 md:px-8 text-center text-xs text-slate-400 font-mono">
        OmniCalc · High-Precision Mathematical Computing Engine
      </footer>

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
