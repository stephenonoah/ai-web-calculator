import React, { useState } from 'react';
import { Delete } from 'lucide-react';
import { ProgrammerBase, WordSize } from '../types/calculator';
import {
  WORD_BIT_SIZES,
  executeBitwise,
  formatBinaryWithSpaces,
  formatDecimal,
  formatHexWithSpaces,
  formatOctal,
  maskToWord,
  parseFromBase,
  toggleBit,
  BitwiseOp,
} from '../utils/programmerEngine';
import { playKeyClick } from '../utils/audioFeedback';

export const ProgrammerView: React.FC = () => {
  const [currentVal, setCurrentVal] = useState<bigint>(0n);
  const [activeBase, setActiveBase] = useState<ProgrammerBase>('DEC');
  const [wordSize, setWordSize] = useState<WordSize>('DWORD');
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [pendingOp, setPendingOp] = useState<BitwiseOp | null>(null);
  const [storedVal, setStoredVal] = useState<bigint | null>(null);
  const [inputBuffer, setInputBuffer] = useState<string>('0');

  const bitCount = WORD_BIT_SIZES[wordSize];

  // Helper to commit typed input
  const updateFromInput = (newStr: string) => {
    setInputBuffer(newStr);
    const parsed = parseFromBase(newStr, activeBase, wordSize);
    setCurrentVal(parsed);
  };

  const handleDigit = (digit: string) => {
    playKeyClick('num');
    let nextStr = inputBuffer;
    if (nextStr === '0') {
      nextStr = digit;
    } else {
      nextStr += digit;
    }
    updateFromInput(nextStr);
  };

  const handleBackspace = () => {
    playKeyClick('clear');
    if (inputBuffer.length <= 1) {
      updateFromInput('0');
    } else {
      updateFromInput(inputBuffer.slice(0, -1));
    }
  };

  const handleClear = () => {
    playKeyClick('clear');
    setCurrentVal(0n);
    setInputBuffer('0');
    setPendingOp(null);
    setStoredVal(null);
  };

  const handleBitClick = (index: number) => {
    playKeyClick('toggle');
    const toggled = toggleBit(currentVal, index, wordSize);
    setCurrentVal(toggled);
    // Sync input buffer with new base
    if (activeBase === 'HEX') setInputBuffer(toggled.toString(16).toUpperCase());
    else if (activeBase === 'DEC') setInputBuffer(formatDecimal(toggled, wordSize, isSigned));
    else if (activeBase === 'OCT') setInputBuffer(toggled.toString(8));
    else if (activeBase === 'BIN') setInputBuffer(toggled.toString(2));
  };

  const handleSelectBase = (base: ProgrammerBase) => {
    playKeyClick('toggle');
    setActiveBase(base);
    if (base === 'HEX') setInputBuffer(currentVal.toString(16).toUpperCase());
    else if (base === 'DEC') setInputBuffer(formatDecimal(currentVal, wordSize, isSigned));
    else if (base === 'OCT') setInputBuffer(currentVal.toString(8));
    else if (base === 'BIN') setInputBuffer(currentVal.toString(2));
  };

  const handleWordSize = (ws: WordSize) => {
    playKeyClick('toggle');
    setWordSize(ws);
    const masked = maskToWord(currentVal, ws);
    setCurrentVal(masked);
    if (activeBase === 'HEX') setInputBuffer(masked.toString(16).toUpperCase());
    else if (activeBase === 'DEC') setInputBuffer(formatDecimal(masked, ws, isSigned));
    else if (activeBase === 'OCT') setInputBuffer(masked.toString(8));
    else if (activeBase === 'BIN') setInputBuffer(masked.toString(2));
  };

  const handleBitwiseOp = (op: BitwiseOp) => {
    playKeyClick('op');
    if (op === 'NOT') {
      const res = executeBitwise('NOT', currentVal, null, wordSize);
      setCurrentVal(res);
      setInputBuffer(formatDecimal(res, wordSize, isSigned));
      return;
    }

    setStoredVal(currentVal);
    setPendingOp(op);
    setInputBuffer('0');
  };

  const handleEquals = () => {
    playKeyClick('equals');
    if (pendingOp && storedVal !== null) {
      const res = executeBitwise(pendingOp, storedVal, currentVal, wordSize);
      setCurrentVal(res);
      setInputBuffer(formatDecimal(res, wordSize, isSigned));
      setPendingOp(null);
      setStoredVal(null);
    }
  };

  // Determine enabled keypad keys based on current active base
  const isDigitEnabled = (key: string): boolean => {
    if (activeBase === 'BIN') return key === '0' || key === '1';
    if (activeBase === 'OCT') return /^[0-7]$/.test(key);
    if (activeBase === 'DEC') return /^[0-9]$/.test(key);
    if (activeBase === 'HEX') return /^[0-9A-F]$/.test(key);
    return false;
  };

  // Render bit grid: for 64-bit or 32-bit
  const renderBitGrid = () => {
    const bits: React.ReactNode[] = [];
    const bitMask = maskToWord(currentVal, wordSize);

    // Group in rows of 16 or 8 bits
    const totalBits = bitCount;
    for (let i = totalBits - 1; i >= 0; i--) {
      const isSet = (bitMask & (1n << BigInt(i))) !== 0n;
      bits.push(
        <button
          key={i}
          onClick={() => handleBitClick(i)}
          type="button"
          title={`Bit ${i}: ${isSet ? '1' : '0'} (click to toggle)`}
          className={`flex flex-col items-center justify-center p-1 rounded transition-colors text-center cursor-pointer select-none ${
            isSet
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 hover:bg-amber-500/35 font-bold'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800 hover:bg-slate-800 hover:text-slate-300'
          }`}
        >
          <span className="font-mono text-xs tabular-nums leading-none">{isSet ? '1' : '0'}</span>
          <span className="text-[9px] font-mono text-slate-400 leading-none mt-0.5">{i}</span>
        </button>
      );
    }

    return (
      <div className="grid grid-cols-8 md:grid-cols-16 gap-1 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
        {bits}
      </div>
    );
  };

  const btnStyle = (key: string) => {
    const enabled = isDigitEnabled(key);
    return `h-10 md:h-11 rounded-lg font-mono text-base font-medium transition-all select-none flex items-center justify-center ${
      enabled
        ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-95 cursor-pointer border border-slate-700/60 shadow-xs'
        : 'bg-slate-900/40 text-slate-400 border border-slate-800/40 cursor-not-allowed'
    }`;
  };

  const opStyle =
    'h-10 md:h-11 rounded-lg font-mono text-sm font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 active:scale-95 transition-all select-none flex items-center justify-center cursor-pointer';

  return (
    <div className="space-y-3">
      {/* 4-Base Multi-Telemetry Display Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 space-y-1.5 shadow-inner">
        {/* HEX */}
        <div
          onClick={() => handleSelectBase('HEX')}
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
            activeBase === 'HEX' ? 'bg-slate-800/90 ring-1 ring-amber-500/50' : 'hover:bg-slate-800/40'
          }`}
        >
          <span className={`font-mono text-xs font-bold ${activeBase === 'HEX' ? 'text-amber-400' : 'text-slate-400'}`}>
            HEX
          </span>
          <span className="font-mono text-sm md:text-base font-semibold text-slate-100 tabular-nums truncate tracking-wider">
            {formatHexWithSpaces(currentVal, wordSize)}
          </span>
        </div>

        {/* DEC */}
        <div
          onClick={() => handleSelectBase('DEC')}
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
            activeBase === 'DEC' ? 'bg-slate-800/90 ring-1 ring-amber-500/50' : 'hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs font-bold ${activeBase === 'DEC' ? 'text-amber-400' : 'text-slate-400'}`}>
              DEC
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSigned(!isSigned);
              }}
              type="button"
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Toggle Signed / Unsigned decimal display"
            >
              {isSigned ? 'SIGNED' : 'UNSIGNED'}
            </button>
          </div>
          <span className="font-mono text-sm md:text-base font-semibold text-slate-100 tabular-nums truncate">
            {formatDecimal(currentVal, wordSize, isSigned)}
          </span>
        </div>

        {/* OCT */}
        <div
          onClick={() => handleSelectBase('OCT')}
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
            activeBase === 'OCT' ? 'bg-slate-800/90 ring-1 ring-amber-500/50' : 'hover:bg-slate-800/40'
          }`}
        >
          <span className={`font-mono text-xs font-bold ${activeBase === 'OCT' ? 'text-amber-400' : 'text-slate-400'}`}>
            OCT
          </span>
          <span className="font-mono text-sm md:text-base font-semibold text-slate-100 tabular-nums truncate">
            {formatOctal(currentVal, wordSize)}
          </span>
        </div>

        {/* BIN */}
        <div
          onClick={() => handleSelectBase('BIN')}
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
            activeBase === 'BIN' ? 'bg-slate-800/90 ring-1 ring-amber-500/50' : 'hover:bg-slate-800/40'
          }`}
        >
          <span className={`font-mono text-xs font-bold ${activeBase === 'BIN' ? 'text-amber-400' : 'text-slate-400'}`}>
            BIN
          </span>
          <span className="font-mono text-xs md:text-sm font-semibold text-slate-100 tabular-nums truncate tracking-wider">
            {formatBinaryWithSpaces(currentVal, wordSize)}
          </span>
        </div>
      </div>

      {/* Bit Word Size Selector & Status */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['QWORD', 'DWORD', 'WORD', 'BYTE'] as WordSize[]).map((ws) => (
            <button
              key={ws}
              onClick={() => handleWordSize(ws)}
              type="button"
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                wordSize === ws
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {ws} ({WORD_BIT_SIZES[ws]})
            </button>
          ))}
        </div>

        {pendingOp && (
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
            {pendingOp}
          </span>
        )}
      </div>

      {/* Interactive Bit Toggle Matrix */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
          <span>Interactive Bit Matrix</span>
          <span>Click any bit to toggle 0 / 1</span>
        </div>
        {renderBitGrid()}
      </div>

      {/* Bitwise operations & Programmer Keypad */}
      <div className="grid grid-cols-6 gap-1.5 md:gap-2">
        {/* Bitwise Logic Row */}
        <button onClick={() => handleBitwiseOp('AND')} type="button" className={opStyle}>
          AND
        </button>
        <button onClick={() => handleBitwiseOp('OR')} type="button" className={opStyle}>
          OR
        </button>
        <button onClick={() => handleBitwiseOp('XOR')} type="button" className={opStyle}>
          XOR
        </button>
        <button onClick={() => handleBitwiseOp('NOT')} type="button" className={opStyle}>
          NOT
        </button>
        <button onClick={() => handleBitwiseOp('LSH')} type="button" className={opStyle}>
          LSH
        </button>
        <button onClick={() => handleBitwiseOp('RSH')} type="button" className={opStyle}>
          RSH
        </button>

        {/* Row A, B, 7, 8, 9, AC */}
        <button onClick={() => isDigitEnabled('A') && handleDigit('A')} disabled={!isDigitEnabled('A')} type="button" className={btnStyle('A')}>
          A
        </button>
        <button onClick={() => isDigitEnabled('B') && handleDigit('B')} disabled={!isDigitEnabled('B')} type="button" className={btnStyle('B')}>
          B
        </button>
        <button onClick={() => isDigitEnabled('7') && handleDigit('7')} disabled={!isDigitEnabled('7')} type="button" className={btnStyle('7')}>
          7
        </button>
        <button onClick={() => isDigitEnabled('8') && handleDigit('8')} disabled={!isDigitEnabled('8')} type="button" className={btnStyle('8')}>
          8
        </button>
        <button onClick={() => isDigitEnabled('9') && handleDigit('9')} disabled={!isDigitEnabled('9')} type="button" className={btnStyle('9')}>
          9
        </button>
        <button
          onClick={handleClear}
          type="button"
          className="h-10 md:h-11 rounded-lg font-mono text-sm font-bold bg-slate-800 text-rose-400 hover:bg-slate-700 active:scale-95 transition-all select-none flex items-center justify-center cursor-pointer border border-slate-700/60"
        >
          AC
        </button>

        {/* Row C, D, 4, 5, 6, ⌫ */}
        <button onClick={() => isDigitEnabled('C') && handleDigit('C')} disabled={!isDigitEnabled('C')} type="button" className={btnStyle('C')}>
          C
        </button>
        <button onClick={() => isDigitEnabled('D') && handleDigit('D')} disabled={!isDigitEnabled('D')} type="button" className={btnStyle('D')}>
          D
        </button>
        <button onClick={() => isDigitEnabled('4') && handleDigit('4')} disabled={!isDigitEnabled('4')} type="button" className={btnStyle('4')}>
          4
        </button>
        <button onClick={() => isDigitEnabled('5') && handleDigit('5')} disabled={!isDigitEnabled('5')} type="button" className={btnStyle('5')}>
          5
        </button>
        <button onClick={() => isDigitEnabled('6') && handleDigit('6')} disabled={!isDigitEnabled('6')} type="button" className={btnStyle('6')}>
          6
        </button>
        <button
          onClick={handleBackspace}
          type="button"
          className="h-10 md:h-11 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all select-none flex items-center justify-center cursor-pointer border border-slate-700/60"
        >
          <Delete className="w-4 h-4" />
        </button>

        {/* Row E, F, 1, 2, 3, = */}
        <button onClick={() => isDigitEnabled('E') && handleDigit('E')} disabled={!isDigitEnabled('E')} type="button" className={btnStyle('E')}>
          E
        </button>
        <button onClick={() => isDigitEnabled('F') && handleDigit('F')} disabled={!isDigitEnabled('F')} type="button" className={btnStyle('F')}>
          F
        </button>
        <button onClick={() => isDigitEnabled('1') && handleDigit('1')} disabled={!isDigitEnabled('1')} type="button" className={btnStyle('1')}>
          1
        </button>
        <button onClick={() => isDigitEnabled('2') && handleDigit('2')} disabled={!isDigitEnabled('2')} type="button" className={btnStyle('2')}>
          2
        </button>
        <button onClick={() => isDigitEnabled('3') && handleDigit('3')} disabled={!isDigitEnabled('3')} type="button" className={btnStyle('3')}>
          3
        </button>
        <button
          onClick={handleEquals}
          type="button"
          className="row-span-2 h-auto rounded-lg font-mono text-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all select-none flex items-center justify-center cursor-pointer shadow-md shadow-amber-500/20"
        >
          =
        </button>

        {/* Row 0 spanning */}
        <button
          onClick={() => isDigitEnabled('0') && handleDigit('0')}
          disabled={!isDigitEnabled('0')}
          type="button"
          className={`${btnStyle('0')} col-span-5`}
        >
          0
        </button>
      </div>
    </div>
  );
};
