export type UnitCategory = 'length' | 'mass' | 'temperature' | 'data' | 'speed' | 'area' | 'time' | 'volume';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (baseVal: number) => number;
}

export const UNIT_CATEGORIES: Record<
  UnitCategory,
  { label: string; units: UnitDefinition[] }
> = {
  length: {
    label: 'Length',
    units: [
      { id: 'm', name: 'Meter', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', name: 'Kilometer', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: 'mm', name: 'Millimeter', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'mi', name: 'Mile', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: 'yd', name: 'Yard', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: 'ft', name: 'Foot', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'in', name: 'Inch', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: 'nmi', name: 'Nautical Mile', symbol: 'NM', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
    ],
  },
  mass: {
    label: 'Mass / Weight',
    units: [
      { id: 'kg', name: 'Kilogram', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
      { id: 'g', name: 'Gram', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'mg', name: 'Milligram', symbol: 'mg', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      { id: 'lb', name: 'Pound', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
      { id: 'ton', name: 'Metric Ton', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'stone', name: 'Stone', symbol: 'st', toBase: (v) => v * 6.35029318, fromBase: (v) => v / 6.35029318 },
    ],
  },
  temperature: {
    label: 'Temperature',
    units: [
      { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  data: {
    label: 'Digital Storage',
    units: [
      { id: 'b', name: 'Byte', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kb', name: 'Kilobyte (decimal)', symbol: 'KB', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'mb', name: 'Megabyte (decimal)', symbol: 'MB', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'gb', name: 'Gigabyte (decimal)', symbol: 'GB', toBase: (v) => v * 1e9, fromBase: (v) => v / 1e9 },
      { id: 'tb', name: 'Terabyte (decimal)', symbol: 'TB', toBase: (v) => v * 1e12, fromBase: (v) => v / 1e12 },
      { id: 'kib', name: 'Kibibyte (binary)', symbol: 'KiB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'mib', name: 'Mebibyte (binary)', symbol: 'MiB', toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
      { id: 'gib', name: 'Gibibyte (binary)', symbol: 'GiB', toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
      { id: 'tib', name: 'Tebibyte (binary)', symbol: 'TiB', toBase: (v) => v * 1024 ** 4, fromBase: (v) => v / 1024 ** 4 },
    ],
  },
  speed: {
    label: 'Speed',
    units: [
      { id: 'mps', name: 'Meters / sec', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kph', name: 'Kilometers / hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'mph', name: 'Miles / hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'knot', name: 'Knots', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
      { id: 'fps', name: 'Feet / sec', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    ],
  },
  area: {
    label: 'Area',
    units: [
      { id: 'sqm', name: 'Square Meter', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
      { id: 'sqkm', name: 'Square Kilometer', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'sqft', name: 'Square Foot', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: 'sqyd', name: 'Square Yard', symbol: 'yd²', toBase: (v) => v * 0.836127, fromBase: (v) => v / 0.836127 },
      { id: 'acre', name: 'Acre', symbol: 'ac', toBase: (v) => v * 4046.85642, fromBase: (v) => v / 4046.85642 },
      { id: 'ha', name: 'Hectare', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    ],
  },
  time: {
    label: 'Time',
    units: [
      { id: 's', name: 'Second', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ms', name: 'Millisecond', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'min', name: 'Minute', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: 'hr', name: 'Hour', symbol: 'hr', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'day', name: 'Day', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { id: 'week', name: 'Week', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      { id: 'year', name: 'Year (365d)', symbol: 'yr', toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
    ],
  },
  volume: {
    label: 'Volume',
    units: [
      { id: 'l', name: 'Liter', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ml', name: 'Milliliter', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'cum', name: 'Cubic Meter', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'gal', name: 'US Gallon', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { id: 'qt', name: 'US Quart', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
      { id: 'pt', name: 'US Pint', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
      { id: 'cup', name: 'US Cup', symbol: 'cup', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
      { id: 'floz', name: 'Fluid Ounce', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
    ],
  },
};

export function convertValue(
  value: number,
  category: UnitCategory,
  fromUnitId: string,
  toUnitId: string
): number {
  if (Number.isNaN(value)) return 0;
  if (fromUnitId === toUnitId) return value;

  const cat = UNIT_CATEGORIES[category];
  if (!cat) return value;

  const fromUnit = cat.units.find((u) => u.id === fromUnitId);
  const toUnit = cat.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) return value;

  const base = fromUnit.toBase(value);
  return toUnit.fromBase(base);
}
