/**
 * Production-grade Mathematical Expression Parser & Calculator Engine
 * Uses an AST / Shunting-Yard evaluator with operator precedence,
 * DEG/RAD trigonometric conversions, and high-precision float sanitation.
 */

import { AngleMode } from '../types/calculator';

export const PI = Math.PI;
export const E = Math.E;
export const PHI = (1 + Math.sqrt(5)) / 2;

// Factorial helper
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial requires non-negative integer');
  }
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Format numbers for human display, resolving float precision errors
export function formatCalculatorNumber(val: number): string {
  if (!Number.isFinite(val)) {
    if (Number.isNaN(val)) return 'Error';
    return val > 0 ? 'Infinity' : '-Infinity';
  }

  // Handle zero
  if (Object.is(val, -0) || Math.abs(val) < 1e-15) {
    return '0';
  }

  // For very large or tiny numbers, use exponential
  const absVal = Math.abs(val);
  if (absVal >= 1e14 || (absVal < 1e-7 && absVal > 0)) {
    const expStr = val.toExponential(8);
    // clean trailing zeros in mantissa
    return expStr.replace(/(\.[0-9]*[1-9])0+e/, '$1e').replace(/\.0+e/, 'e');
  }

  // Round float artifacts (e.g. 0.1 + 0.2 = 0.30000000000000004)
  const rounded = Number(val.toPrecision(12));
  return String(rounded);
}

// Format with thousand commas for display (e.g. 1,234,567.89)
export function formatWithCommas(rawNumStr: string): string {
  if (!rawNumStr || rawNumStr === 'Error' || rawNumStr === 'Infinity' || rawNumStr === '-Infinity') {
    return rawNumStr;
  }
  if (rawNumStr.includes('e') || rawNumStr.includes('E')) {
    return rawNumStr;
  }
  const parts = rawNumStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

type TokenType = 'NUMBER' | 'OP' | 'FUNC' | 'LPAREN' | 'RPAREN' | 'COMMA';

interface Token {
  type: TokenType;
  value: string;
}

const OPERATORS: Record<string, { precedence: number; assoc: 'LEFT' | 'RIGHT' }> = {
  '+': { precedence: 2, assoc: 'LEFT' },
  '-': { precedence: 2, assoc: 'LEFT' },
  '×': { precedence: 3, assoc: 'LEFT' },
  '*': { precedence: 3, assoc: 'LEFT' },
  '÷': { precedence: 3, assoc: 'LEFT' },
  '/': { precedence: 3, assoc: 'LEFT' },
  '%': { precedence: 3, assoc: 'LEFT' },
  '^': { precedence: 4, assoc: 'RIGHT' },
  'u-': { precedence: 5, assoc: 'RIGHT' }, // unary minus
};

const KNOWN_FUNCS = new Set([
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'ln', 'log', 'log10', 'log2',
  'sqrt', 'cbrt', 'abs',
  'fact', 'exp'
]);

export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  // Normalize operators and spaces
  const cleanExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, `${Math.PI}`)
    .replace(/\be\b/g, `${Math.E}`)
    .replace(/φ/g, `${PHI}`);

  while (i < cleanExpr.length) {
    const ch = cleanExpr[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (including decimal and scientific notation e.g. 1.2e+4)
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(cleanExpr[i + 1] || ''))) {
      let numStr = '';
      while (
        i < cleanExpr.length &&
        (/\d/.test(cleanExpr[i]) ||
          cleanExpr[i] === '.' ||
          ((cleanExpr[i] === 'e' || cleanExpr[i] === 'E') &&
            (cleanExpr[i + 1] === '+' || cleanExpr[i + 1] === '-' || /\d/.test(cleanExpr[i + 1]))))
      ) {
        if (cleanExpr[i] === 'e' || cleanExpr[i] === 'E') {
          numStr += cleanExpr[i];
          i++;
          if (cleanExpr[i] === '+' || cleanExpr[i] === '-') {
            numStr += cleanExpr[i];
            i++;
          }
        } else {
          numStr += cleanExpr[i];
          i++;
        }
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Identifiers (function names)
    if (/[a-zA-Z]/.test(ch)) {
      let idStr = '';
      while (i < cleanExpr.length && /[a-zA-Z0-9]/.test(cleanExpr[i])) {
        idStr += cleanExpr[i];
        i++;
      }
      idStr = idStr.toLowerCase();
      if (KNOWN_FUNCS.has(idStr)) {
        tokens.push({ type: 'FUNC', value: idStr });
      } else {
        throw new Error(`Unknown function: ${idStr}`);
      }
      continue;
    }

    // Parentheses
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Operators
    if (['+', '-', '*', '/', '%', '^'].includes(ch)) {
      // Check for unary minus: preceded by start of expression, another operator, or LPAREN
      if (ch === '-') {
        const prev = tokens[tokens.length - 1];
        if (!prev || prev.type === 'OP' || prev.type === 'LPAREN' || prev.value === 'u-') {
          tokens.push({ type: 'OP', value: 'u-' });
          i++;
          continue;
        }
      }
      tokens.push({ type: 'OP', value: ch });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${ch}`);
  }

  return tokens;
}

// Shunting-Yard to convert infix tokens into postfix (RPN)
export function infixToPostfix(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const opStack: Token[] = [];

  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx];

    if (token.type === 'NUMBER') {
      output.push(token);
    } else if (token.type === 'FUNC') {
      opStack.push(token);
    } else if (token.type === 'OP') {
      const o1 = token.value;
      const o1Info = OPERATORS[o1];

      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type === 'OP') {
          const o2 = top.value;
          const o2Info = OPERATORS[o2];
          if (
            (o1Info.assoc === 'LEFT' && o1Info.precedence <= o2Info.precedence) ||
            (o1Info.assoc === 'RIGHT' && o1Info.precedence < o2Info.precedence)
          ) {
            output.push(opStack.pop()!);
            continue;
          }
        }
        break;
      }
      opStack.push(token);
    } else if (token.type === 'LPAREN') {
      opStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundMatching = false;
      while (opStack.length > 0) {
        const top = opStack.pop()!;
        if (top.type === 'LPAREN') {
          foundMatching = true;
          break;
        }
        output.push(top);
      }
      if (!foundMatching) {
        throw new Error('Mismatched parentheses');
      }
      // If top of stack is a function, pop it to output
      if (opStack.length > 0 && opStack[opStack.length - 1].type === 'FUNC') {
        output.push(opStack.pop()!);
      }
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Mismatched parentheses');
    }
    output.push(top);
  }

  return output;
}

// Evaluate Postfix RPN
export function evaluatePostfix(postfix: Token[], angleMode: AngleMode): number {
  const stack: number[] = [];

  const toRad = (val: number) => (angleMode === 'DEG' ? (val * Math.PI) / 180 : val);
  const fromRad = (rad: number) => (angleMode === 'DEG' ? (rad * 180) / Math.PI : rad);

  for (const token of postfix) {
    if (token.type === 'NUMBER') {
      const num = parseFloat(token.value);
      if (Number.isNaN(num)) throw new Error('Invalid number');
      stack.push(num);
    } else if (token.type === 'OP') {
      if (token.value === 'u-') {
        if (stack.length < 1) throw new Error('Invalid syntax');
        const a = stack.pop()!;
        stack.push(-a);
        continue;
      }

      if (stack.length < 2) throw new Error('Invalid syntax');
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (token.value) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          if (b === 0) throw new Error('Cannot divide by zero');
          stack.push(a / b);
          break;
        case '%':
          // Standard modulo or percentage depending on context; here standard remainder
          if (b === 0) throw new Error('Modulo by zero');
          stack.push(a % b);
          break;
        case '^':
          stack.push(Math.pow(a, b));
          break;
        default:
          throw new Error(`Unsupported operator ${token.value}`);
      }
    } else if (token.type === 'FUNC') {
      if (stack.length < 1) throw new Error('Function argument missing');
      const a = stack.pop()!;

      switch (token.value) {
        case 'sin':
          // In DEG mode, check 180 multiples to avoid 1.22e-16 float artifact
          if (angleMode === 'DEG' && Math.abs(a % 180) === 0) {
            stack.push(0);
          } else {
            stack.push(Math.sin(toRad(a)));
          }
          break;
        case 'cos':
          if (angleMode === 'DEG' && Math.abs((a - 90) % 180) === 0) {
            stack.push(0);
          } else {
            stack.push(Math.cos(toRad(a)));
          }
          break;
        case 'tan':
          if (angleMode === 'DEG' && Math.abs((a - 90) % 180) === 0) {
            throw new Error('Undefined (tan 90°)');
          }
          stack.push(Math.tan(toRad(a)));
          break;
        case 'asin':
          if (a < -1 || a > 1) throw new Error('Domain error (-1 to 1)');
          stack.push(fromRad(Math.asin(a)));
          break;
        case 'acos':
          if (a < -1 || a > 1) throw new Error('Domain error (-1 to 1)');
          stack.push(fromRad(Math.acos(a)));
          break;
        case 'atan':
          stack.push(fromRad(Math.atan(a)));
          break;
        case 'sinh':
          stack.push(Math.sinh(a));
          break;
        case 'cosh':
          stack.push(Math.cosh(a));
          break;
        case 'tanh':
          stack.push(Math.tanh(a));
          break;
        case 'ln':
          if (a <= 0) throw new Error('Domain error (x > 0)');
          stack.push(Math.log(a));
          break;
        case 'log':
        case 'log10':
          if (a <= 0) throw new Error('Domain error (x > 0)');
          stack.push(Math.log10(a));
          break;
        case 'log2':
          if (a <= 0) throw new Error('Domain error (x > 0)');
          stack.push(Math.log2(a));
          break;
        case 'sqrt':
          if (a < 0) throw new Error('Square root of negative');
          stack.push(Math.sqrt(a));
          break;
        case 'cbrt':
          stack.push(Math.cbrt(a));
          break;
        case 'abs':
          stack.push(Math.abs(a));
          break;
        case 'exp':
          stack.push(Math.exp(a));
          break;
        case 'fact':
          stack.push(factorial(a));
          break;
        default:
          throw new Error(`Unsupported function ${token.value}`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression format');
  }

  return stack[0];
}

// Master evaluation function
export function calculateExpression(expr: string, angleMode: AngleMode = 'DEG'): { result: number; error: string | null } {
  if (!expr.trim()) {
    return { result: 0, error: null };
  }

  try {
    const tokens = tokenize(expr);
    const postfix = infixToPostfix(tokens);
    const val = evaluatePostfix(postfix, angleMode);
    return { result: val, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Calculation error';
    return { result: NaN, error: msg };
  }
}

// Quick preview evaluator: handles trailing unclosed parens or operators gracefully
export function previewExpression(expr: string, angleMode: AngleMode = 'DEG'): string | null {
  if (!expr.trim()) return null;

  // Trim trailing operator if user is still typing (e.g. "12 + ")
  let candidate = expr.trim();
  if (['+', '-', '*', '/', '×', '÷', '^', '%'].includes(candidate.slice(-1))) {
    candidate = candidate.slice(0, -1).trim();
  }
  if (!candidate) return null;

  // Auto-close missing open parentheses for preview
  const openCount = (candidate.match(/\(/g) || []).length;
  const closeCount = (candidate.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    candidate += ')'.repeat(openCount - closeCount);
  }

  const { result, error } = calculateExpression(candidate, angleMode);
  if (error || Number.isNaN(result)) return null;

  return formatCalculatorNumber(result);
}
