import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import { UNIT_CATEGORIES, UnitCategory, convertValue } from '../utils/converterEngine';
import { formatCalculatorNumber, formatWithCommas } from '../utils/calculatorEngine';
import { playKeyClick } from '../utils/audioFeedback';

export const ConverterView: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [copied, setCopied] = useState<boolean>(false);

  const catData = UNIT_CATEGORIES[category];
  const units = catData.units;

  // Handle switching category
  const handleCategoryChange = (newCat: UnitCategory) => {
    playKeyClick('toggle');
    setCategory(newCat);
    const newUnits = UNIT_CATEGORIES[newCat].units;
    setFromUnit(newUnits[0].id);
    setToUnit(newUnits[1] ? newUnits[1].id : newUnits[0].id);
  };

  const handleSwap = () => {
    playKeyClick('toggle');
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const parsedInput = parseFloat(inputValue);
  const validNum = !Number.isNaN(parsedInput);
  const converted = validNum ? convertValue(parsedInput, category, fromUnit, toUnit) : 0;
  const convertedStr = validNum ? formatCalculatorNumber(converted) : '0';

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
        {(Object.keys(UNIT_CATEGORIES) as UnitCategory[]).map((catKey) => {
          const item = UNIT_CATEGORIES[catKey];
          const active = category === catKey;
          return (
            <button
              key={catKey}
              onClick={() => handleCategoryChange(catKey)}
              type="button"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Converter Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-5 shadow-inner space-y-4">
        {/* Input & Unit 1 */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-mono">From</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xl text-slate-100 focus:outline-none focus:border-amber-500/60 tabular-nums"
            />
            <select
              value={fromUnit}
              onChange={(e) => {
                playKeyClick('toggle');
                setFromUnit(e.target.value);
              }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={handleSwap}
            type="button"
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Swap units"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Result & Unit 2 */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-mono">To</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between min-h-[50px]">
              <span className="font-mono text-xl font-bold text-slate-100 tabular-nums truncate">
                {formatWithCommas(convertedStr)}
              </span>
              <button
                onClick={handleCopy}
                type="button"
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors ml-2"
                title="Copy result"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <select
              value={toUnit}
              onChange={(e) => {
                playKeyClick('toggle');
                setToUnit(e.target.value);
              }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Full Live Conversion Matrix Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>All {catData.label} Equivalents</span>
          <span className="font-mono">
            for {inputValue || '0'} {units.find((u) => u.id === fromUnit)?.symbol}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
          {units.map((u) => {
            const val = validNum ? convertValue(parsedInput, category, fromUnit, u.id) : 0;
            const str = formatCalculatorNumber(val);
            return (
              <div
                key={u.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/60 text-xs font-mono"
              >
                <span className="text-slate-400 truncate max-w-[110px]">{u.name}:</span>
                <span className="text-slate-200 font-semibold tabular-nums truncate ml-2">
                  {formatWithCommas(str)} {u.symbol}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
