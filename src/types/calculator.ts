export type CalculatorMode = 'standard' | 'scientific' | 'programmer' | 'converter' | 'financial';

export type AngleMode = 'DEG' | 'RAD';

export type ThemeMode = 'dark' | 'titanium' | 'light';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  mode: CalculatorMode;
}

export type ProgrammerBase = 'HEX' | 'DEC' | 'OCT' | 'BIN';
export type WordSize = 'QWORD' | 'DWORD' | 'WORD' | 'BYTE'; // 64, 32, 16, 8 bits

export interface MemoryItem {
  id: string;
  value: string;
  timestamp: number;
}
