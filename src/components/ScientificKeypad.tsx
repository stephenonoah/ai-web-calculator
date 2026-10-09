import React, { useState } from 'react';
import { Delete } from 'lucide-react';
import { AngleMode } from '../types/calculator';
import { playKeyClick } from '../utils/audioFeedback';

interface ScientificKeypadProps {
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onEquals: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  onScientificFunc: (fn: string) => void;
  onConstant: (c: string) => void;
  onParenthesis: (p: '(' | ')') => void;
}

export const ScientificKeypad: React.FC<ScientificKeypadProps> = ({
  angleMode,
  onToggleAngleMode,
  onDigit,
  onOperator,
  onEquals,
  onClear,
  onBackspace,
  onToggleSign,
  onScientificFunc,
  onConstant,
  onParenthesis,
}) => {
  const [isSecond, setIsSecond] = useState(false);

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

  const handleFunc = (fn: string) => {
    playKeyClick('op');
    onScientificFunc(fn);
  };

  const sciBtn =
    'h-11 md:h-12 rounded-xl bg-slate-900 text-sky-300 hover:bg-slate-800 active:scale-[0.97] transition-all font-mono text-sm md:text-base font-medium shadow-xs border border-sky-900/30 flex items-center justify-center select-none cursor-pointer';

  const numBtn =
    'h-11 md:h-12 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.97] transition-all font-mono text-xl font-medium shadow-xs border border-slate-700/50 flex items-center justify-center select-none cursor-pointer';

  const opBtn =
    'h-11 md:h-12 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 active:scale-[0.97] transition-all font-mono text-xl font-semibold shadow-xs border border-amber-500/30 flex items-center justify-center select-none cursor-pointer';

  const utilBtn =
    'h-11 md:h-12 rounded-xl bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 active:scale-[0.97] transition-all font-mono text-sm md:text-base font-medium shadow-xs border border-slate-700/40 flex items-center justify-center select-none cursor-pointer';

  const eqBtn =
    'h-11 md:h-12 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-[0.97] transition-all font-mono text-2xl font-bold shadow-md shadow-amber-500/20 border border-amber-400 flex items-center justify-center select-none cursor-pointer';

  return (
    <div className="grid grid-cols-5 gap-1.5 md:gap-2">
      {/* Row 1: 2nd, DEG/RAD, sin/asin, cos/acos, tan/atan */}
      <button
        onClick={() => {
          playKeyClick('toggle');
          setIsSecond(!isSecond);
        }}
        type="button"
        className={`${sciBtn} ${isSecond ? 'bg-sky-500/25 text-sky-200 border-sky-400 font-bold' : ''}`}
        title="2nd Function Shift"
      >
        2nd
      </button>
      <button
        onClick={() => {
          playKeyClick('toggle');
          onToggleAngleMode();
        }}
        type="button"
        className={`${sciBtn} text-amber-400 font-bold`}
        title="Angle Mode (DEG / RAD)"
      >
        {angleMode}
      </button>
      <button
        onClick={() => handleFunc(isSecond ? 'asin' : 'sin')}
        type="button"
        className={sciBtn}
      >
        {isSecond ? 'sin⁻¹' : 'sin'}
      </button>
      <button
        onClick={() => handleFunc(isSecond ? 'acos' : 'cos')}
        type="button"
        className={sciBtn}
      >
        {isSecond ? 'cos⁻¹' : 'cos'}
      </button>
      <button
        onClick={() => handleFunc(isSecond ? 'atan' : 'tan')}
        type="button"
        className={sciBtn}
      >
        {isSecond ? 'tan⁻¹' : 'tan'}
      </button>

      {/* Row 2: sinh, cosh, tanh, ln/e^x, log/10^x */}
      <button onClick={() => handleFunc('sinh')} type="button" className={sciBtn}>
        sinh
      </button>
      <button onClick={() => handleFunc('cosh')} type="button" className={sciBtn}>
        cosh
      </button>
      <button onClick={() => handleFunc('tanh')} type="button" className={sciBtn}>
        tanh
      </button>
      <button
        onClick={() => handleFunc(isSecond ? 'exp' : 'ln')}
        type="button"
        className={sciBtn}
      >
        {isSecond ? 'eˣ' : 'ln'}
      </button>
      <button
        onClick={() => handleFunc(isSecond ? 'pow10' : 'log')}
        type="button"
        className={sciBtn}
      >
        {isSecond ? '10ˣ' : 'log'}
      </button>

      {/* Row 3: x^y, x^2, √x, constants, brackets */}
      <button
        onClick={() => handleOp('^')}
        type="button"
        className={sciBtn}
        title="x to the power of y"
      >
        xʸ
      </button>
      <button
        onClick={() => handleFunc('square')}
        type="button"
        className={sciBtn}
        title="Square (x²)"
      >
        x²
      </button>
      <button
        onClick={() => handleFunc('sqrt')}
        type="button"
        className={sciBtn}
        title="Square Root (√x)"
      >
        √x
      </button>
      <button
        onClick={() => {
          playKeyClick('num');
          onParenthesis('(');
        }}
        type="button"
        className={utilBtn}
        title="Left Parenthesis ("
      >
        (
      </button>
      <button
        onClick={() => {
          playKeyClick('num');
          onParenthesis(')');
        }}
        type="button"
        className={utilBtn}
        title="Right Parenthesis )"
      >
        )
      </button>

      {/* Row 4: π, e, n!, 1/x, ÷ */}
      <button
        onClick={() => {
          playKeyClick('num');
          onConstant('π');
        }}
        type="button"
        className={sciBtn}
        title="Pi Constant (π)"
      >
        π
      </button>
      <button
        onClick={() => {
          playKeyClick('num');
          onConstant('e');
        }}
        type="button"
        className={sciBtn}
        title="Euler's Number (e)"
      >
        e
      </button>
      <button
        onClick={() => handleFunc('fact')}
        type="button"
        className={sciBtn}
        title="Factorial (n!)"
      >
        n!
      </button>
      <button
        onClick={() => handleFunc('reciprocal')}
        type="button"
        className={sciBtn}
        title="Reciprocal (1/x)"
      >
        1/x
      </button>
      <button
        onClick={() => handleOp('÷')}
        type="button"
        className={opBtn}
        title="Divide (/)"
      >
        ÷
      </button>

      {/* Row 5: 7, 8, 9, AC, × */}
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
        onClick={handleClear}
        type="button"
        className={`${utilBtn} text-rose-400 hover:text-rose-300 font-bold`}
        title="Clear All (Escape)"
      >
        AC
      </button>
      <button
        onClick={() => handleOp('×')}
        type="button"
        className={opBtn}
        title="Multiply (*)"
      >
        ×
      </button>

      {/* Row 6: 4, 5, 6, ±, − */}
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
        onClick={() => {
          playKeyClick('toggle');
          onToggleSign();
        }}
        type="button"
        className={utilBtn}
        title="Plus / Minus (±)"
      >
        ±
      </button>
      <button
        onClick={() => handleOp('−')}
        type="button"
        className={opBtn}
        title="Subtract (-)"
      >
        −
      </button>

      {/* Row 7: 1, 2, 3, %, + */}
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
        onClick={() => handleOp('%')}
        type="button"
        className={utilBtn}
        title="Modulo / Remainder (%)"
      >
        %
      </button>
      <button
        onClick={() => handleOp('+')}
        type="button"
        className={opBtn}
        title="Add (+)"
      >
        +
      </button>

      {/* Row 8: 0, ., Backspace, |x|, = */}
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
        className={utilBtn}
        title="Backspace"
      >
        <Delete className="w-5 h-5 text-slate-300" />
      </button>
      <button
        onClick={() => handleFunc('abs')}
        type="button"
        className={sciBtn}
        title="Absolute Value (|x|)"
      >
        |x|
      </button>
      <button
        onClick={handleEq}
        type="button"
        className={eqBtn}
        title="Evaluate (= or Enter)"
      >
        =
      </button>
    </div>
  );
};
