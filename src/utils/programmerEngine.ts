import { ProgrammerBase, WordSize } from '../types/calculator';

export const WORD_BIT_SIZES: Record<WordSize, number> = {
  QWORD: 64,
  DWORD: 32,
  WORD: 16,
  BYTE: 8,
};

export function getWordMask(wordSize: WordSize): bigint {
  switch (wordSize) {
    case 'BYTE':
      return 0xFFn;
    case 'WORD':
      return 0xFFFFn;
    case 'DWORD':
      return 0xFFFFFFFFn;
    case 'QWORD':
      return 0xFFFFFFFFFFFFFFFFn;
  }
}

export function maskToWord(val: bigint, wordSize: WordSize): bigint {
  const mask = getWordMask(wordSize);
  return val & mask;
}

export function formatBinaryWithSpaces(val: bigint, wordSize: WordSize): string {
  const bits = WORD_BIT_SIZES[wordSize];
  let binStr = (val & getWordMask(wordSize)).toString(2).padStart(bits, '0');
  // Group in nibbles of 4
  const groups: string[] = [];
  for (let i = 0; i < binStr.length; i += 4) {
    groups.push(binStr.slice(i, i + 4));
  }
  return groups.join(' ');
}

export function formatHexWithSpaces(val: bigint, wordSize: WordSize): string {
  const hex = (val & getWordMask(wordSize)).toString(16).toUpperCase();
  const bits = WORD_BIT_SIZES[wordSize];
  const hexLen = bits / 4;
  const padded = hex.padStart(hexLen, '0');
  // Group in 2 hex chars
  const groups: string[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    groups.push(padded.slice(i, i + 4));
  }
  return groups.join(' ');
}

export function formatOctal(val: bigint, wordSize: WordSize): string {
  return (val & getWordMask(wordSize)).toString(8);
}

export function formatDecimal(val: bigint, wordSize: WordSize, signed: boolean = true): string {
  const masked = val & getWordMask(wordSize);
  if (!signed) {
    return masked.toString(10);
  }
  const bits = BigInt(WORD_BIT_SIZES[wordSize]);
  const signBit = 1n << (bits - 1n);
  if ((masked & signBit) !== 0n) {
    // Negative two's complement
    const complement = masked - (1n << bits);
    return complement.toString(10);
  }
  return masked.toString(10);
}

export function parseFromBase(input: string, base: ProgrammerBase, wordSize: WordSize): bigint {
  const clean = input.replace(/\s+/g, '').trim();
  if (!clean) return 0n;

  try {
    let num: bigint;
    switch (base) {
      case 'HEX':
        num = BigInt('0x' + clean);
        break;
      case 'DEC':
        num = BigInt(clean);
        break;
      case 'OCT':
        num = BigInt('0o' + clean);
        break;
      case 'BIN':
        num = BigInt('0b' + clean);
        break;
    }
    return maskToWord(num, wordSize);
  } catch {
    return 0n;
  }
}

export function toggleBit(val: bigint, bitIndex: number, wordSize: WordSize): bigint {
  const mask = 1n << BigInt(bitIndex);
  const nextVal = val ^ mask;
  return maskToWord(nextVal, wordSize);
}

export type BitwiseOp = 'AND' | 'OR' | 'XOR' | 'NOT' | 'NAND' | 'NOR' | 'LSH' | 'RSH';

export function executeBitwise(
  op: BitwiseOp,
  a: bigint,
  b: bigint | null,
  wordSize: WordSize
): bigint {
  const mask = getWordMask(wordSize);
  const maskedA = a & mask;
  const maskedB = b !== null ? b & mask : 0n;

  switch (op) {
    case 'AND':
      return maskedA & maskedB;
    case 'OR':
      return maskedA | maskedB;
    case 'XOR':
      return maskedA ^ maskedB;
    case 'NOT':
      return (~maskedA) & mask;
    case 'NAND':
      return (~(maskedA & maskedB)) & mask;
    case 'NOR':
      return (~(maskedA | maskedB)) & mask;
    case 'LSH': {
      const shift = Number(maskedB % 64n);
      return (maskedA << BigInt(shift)) & mask;
    }
    case 'RSH': {
      const shift = Number(maskedB % 64n);
      return (maskedA >> BigInt(shift)) & mask;
    }
  }
}
