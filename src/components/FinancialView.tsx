import React, { useState } from 'react';
import { DollarSign, Percent, Users, Calendar } from 'lucide-react';
import { playKeyClick } from '../utils/audioFeedback';

export const FinancialView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'loan' | 'tip'>('loan');

  // Loan state
  const [principal, setPrincipal] = useState<string>('250000');
  const [interestRate, setInterestRate] = useState<string>('6.5');
  const [termYears, setTermYears] = useState<string>('30');

  // Tip state
  const [billAmount, setBillAmount] = useState<string>('85.00');
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [customTip, setCustomTip] = useState<string>('');
  const [numPeople, setNumPeople] = useState<string>('3');

  // Loan Math
  const P = parseFloat(principal) || 0;
  const annualRate = (parseFloat(interestRate) || 0) / 100;
  const monthlyRate = annualRate / 12;
  const totalMonths = (parseFloat(termYears) || 0) * 12;

  let monthlyPayment = 0;
  let totalCost = 0;
  let totalInterest = 0;

  if (P > 0 && monthlyRate > 0 && totalMonths > 0) {
    monthlyPayment =
      (P * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    totalCost = monthlyPayment * totalMonths;
    totalInterest = totalCost - P;
  } else if (P > 0 && monthlyRate === 0 && totalMonths > 0) {
    monthlyPayment = P / totalMonths;
    totalCost = P;
    totalInterest = 0;
  }

  // Tip Math
  const bill = parseFloat(billAmount) || 0;
  const activeTipPct = customTip ? parseFloat(customTip) || 0 : tipPercent;
  const guests = Math.max(1, parseInt(numPeople) || 1);
  const tipVal = bill * (activeTipPct / 100);
  const totalBill = bill + tipVal;
  const perPerson = totalBill / guests;

  const tipPresets = [10, 15, 18, 20, 25];

  return (
    <div className="space-y-4">
      {/* Sub-Tabs: Loan / Mortgage vs Tip & Split */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
        <button
          onClick={() => {
            playKeyClick('toggle');
            setActiveTab('loan');
          }}
          type="button"
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'loan'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Loan & Mortgage
        </button>
        <button
          onClick={() => {
            playKeyClick('toggle');
            setActiveTab('tip');
          }}
          type="button"
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'tip'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Tip & Bill Split
        </button>
      </div>

      {activeTab === 'loan' ? (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3.5 shadow-inner">
            {/* Principal */}
            <div>
              <label className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-mono">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Loan Principal
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-lg text-slate-100 focus:outline-none focus:border-amber-500/60 tabular-nums"
              />
            </div>

            {/* Interest Rate & Term */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-mono">
                  <Percent className="w-3.5 h-3.5 text-amber-400" /> Annual Interest (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-lg text-slate-100 focus:outline-none focus:border-amber-500/60 tabular-nums"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Term (Years)
                </label>
                <input
                  type="number"
                  value={termYears}
                  onChange={(e) => setTermYears(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-lg text-slate-100 focus:outline-none focus:border-amber-500/60 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-baseline justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400">Monthly Payment</span>
              <span className="font-mono text-2xl md:text-3xl font-bold text-amber-400 tabular-nums">
                ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block mb-0.5">Total Interest:</span>
                <span className="text-slate-200 font-semibold tabular-nums text-sm">
                  ${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block mb-0.5">Total Payments:</span>
                <span className="text-slate-200 font-semibold tabular-nums text-sm">
                  ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3.5 shadow-inner">
            {/* Bill Amount */}
            <div>
              <label className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-mono">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Bill Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-lg text-slate-100 focus:outline-none focus:border-amber-500/60 tabular-nums"
              />
            </div>

            {/* Tip Percentage Presets */}
            <div>
              <label className="text-xs text-slate-400 flex items-center gap-1 mb-1.5 font-mono">
                <Percent className="w-3.5 h-3.5 text-amber-400" /> Tip Percentage
              </label>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {tipPresets.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      playKeyClick('toggle');
                      setTipPercent(pct);
                      setCustomTip('');
                    }}
                    type="button"
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      tipPercent === pct && !customTip
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Or custom tip %"
                value={customTip}
                onChange={(e) => {
                  setCustomTip(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Number of Guests */}
            <div>
              <label className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-mono">
                <Users className="w-3.5 h-3.5 text-amber-400" /> Number of People
              </label>
              <input
                type="number"
                min="1"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-lg text-slate-100 focus:outline-none focus:border-amber-500/60 tabular-nums"
              />
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-baseline justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400">Total Per Person</span>
              <span className="font-mono text-2xl md:text-3xl font-bold text-amber-400 tabular-nums">
                ${perPerson.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block mb-0.5">Tip Total:</span>
                <span className="text-slate-200 font-semibold tabular-nums text-sm">
                  ${tipVal.toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block mb-0.5">Total with Tip:</span>
                <span className="text-slate-200 font-semibold tabular-nums text-sm">
                  ${totalBill.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
