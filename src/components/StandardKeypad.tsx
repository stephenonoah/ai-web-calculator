import React from 'react';
import { Delete } from 'lucide-react';
import { playKeyClick } from '../utils/audioFeedback';

interface StandardKeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onEquals: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  onPercentage: () => void;
  onFunction: (fn: string) => void;
}

export const StandardKeypad: React.FC<StandardKeypadProps> = ({
  onDigit,
  onOperator,
  onEquals,
  onClear,
  onBackspace,
  onToggleSign,
  onPercentage,
  onFunction,
}) => {
  const handleDigit = (d: string) => {
    playKeyClick('num');
    onDigit(d);
  };

  const handleOp = (op: string) => {
    playKeyClick('op');
    onOperator(op);
  };

  const handleEq = () => {
    playKeyClick('equals');
    onEquals();
  };

  const handleClear = () => {
    playKeyClick('clear');
    onClear();
  };

  const handleFn = (fn: string) => {
    playKeyClick('op');
    onFunction(fn);
  };

  // Tactile button styling
  const numBtn =
    'h-12 md:h-14 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.97] transition-all font-mono text-xl md:text-2xl font-medium shadow-xs border border-slate-700/50 flex items-center justify-center select-none cursor-pointer';

  const opBtn =
    'h-12 md:h-14 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 active:scale-[0.97] transition-all font-mono text-xl md:text-2xl font-semibold shadow-xs border border-amber-500/30 flex items-center justify-center select-none cursor-pointer';

  const funcBtn =
    'h-12 md:h-14 rounded-xl bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 active:scale-[0.97] transition-all font-mono text-base md:text-lg font-medium shadow-xs border border-slate-700/40 flex items-center justify-center select-none cursor-pointer';

  const eqBtn =
    'h-12 md:h-14 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-[0.97] transition-all font-mono text-2xl font-bold shadow-md shadow-amber-500/20 border border-amber-400 flex items-center justify-center select-none cursor-pointer';

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-2.5">
      {/* Row 0: Helper quick math */}
      <button
        onClick={() => handleFn('reciprocal')}
        type="button"
        className={funcBtn}
        title="Reciprocal (1/x)"
      >
        1/x
      </button>
      <button
        onClick={() => handleFn('square')}
        type="button"
        className={funcBtn}
        title="Square (x²)"
      >
        x²
      </button>
      <button
        onClick={() => handleFn('sqrt')}
        type="button"
        className={funcBtn}
        title="Square Root (√x)"
      >
        √x
      </button>
      <button
        onClick={() => handleOp('÷')}
        type="button"
        className={opBtn}
        title="Divide (/)"
      >
        ÷
      </button>

      {/* Row 1: AC, ±, %, × */}
      <button
        onClick={handleClear}
        type="button"
        className={`${funcBtn} text-rose-400 hover:text-rose-300`}
        title="Clear All (Escape)"
      >
        AC
      </button>
      <button
        onClick={() => {
          playKeyClick('toggle');
          onToggleSign();
        }}
        type="button"
        className={funcBtn}
        title="Plus / Minus (±)"
      >
        ±
      </button>
      <button
        onClick={() => {
          playKeyClick('op');
          onPercentage();
        }}
        type="button"
        className={funcBtn}
        title="Percentage (%)"
      >
        %
      </button>
      <button
        onClick={() => handleOp('×')}
        type="button"
        className={opBtn}
        title="Multiply (*)"
      >
        ×
      </button>

      {/* Row 2: 7, 8, 9, − */}
      <button onClick={() => handleDigit('7')} type="button" className={numBtn}>
        7
      </button>
      <button onClick={() => handleDigit('8')} type="button" className={numBtn}>
        8
      </button>
      <button onClick={() => handleDigit('9')} type="button" className={numBtn}>
        9
      </button>
      <button
        onClick={() => handleOp('−')}
        type="button"
        className={opBtn}
        title="Subtract (-)"
      >
        −
      </button>

      {/* Row 3: 4, 5, 6, + */}
      <button onClick={() => handleDigit('4')} type="button" className={numBtn}>
        4
      </button>
      <button onClick={() => handleDigit('5')} type="button" className={numBtn}>
        5
      </button>
      <button onClick={() => handleDigit('6')} type="button" className={numBtn}>
        6
      </button>
      <button
        onClick={() => handleOp('+')}
        type="button"
        className={opBtn}
        title="Add (+)"
      >
        +
      </button>

      {/* Row 4: 1, 2, 3, = (or backspace / dot) */}
      <button onClick={() => handleDigit('1')} type="button" className={numBtn}>
        1
      </button>
      <button onClick={() => handleDigit('2')} type="button" className={numBtn}>
        2
      </button>
      <button onClick={() => handleDigit('3')} type="button" className={numBtn}>
        3
      </button>
      <button
        onClick={handleEq}
        type="button"
        className={`${eqBtn} row-span-2 h-auto`}
        title="Calculate (Enter or =)"
      >
        =
      </button>

      {/* Row 5: 0, ., ⌫ */}
      <button onClick={() => handleDigit('0')} type="button" className={numBtn}>
        0
      </button>
      <button onClick={() => handleDigit('.')} type="button" className={numBtn}>
        .
      </button>
      <button
        onClick={() => {
          playKeyClick('clear');
          onBackspace();
        }}
        type="button"
        className={funcBtn}
        title="Backspace"
      >
        <Delete className="w-5 h-5 text-slate-300" />
      </button>
    </div>
  );
};
