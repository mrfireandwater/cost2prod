export type CellType = 'mono-PERC' | 'mono-HJT' | 'mono-TOPCon' | 'poly' | 'custom';
export type CellFormat = 'M6-166mm' | 'M10-182mm' | 'M12-210mm' | 'custom';
export type GlassTexture = 'smooth' | 'textured' | 'anti-glare';

// Color efficiency factors for power computation (with display colors for preview)
export const MODULE_COLOR_TYPES = [
  { id: 'standard', label: 'Standard (Dark Blue)', factor: 1.0, displayColor: '#1e3a5f' },
  { id: 'full-black', label: 'Full Black', factor: 0.97, displayColor: '#111827' },
  { id: 'totally-black', label: 'Totally Black', factor: 0.94, displayColor: '#030712' },
  { id: 'solarcolor-blue', label: 'SOLARCOLOR Blue', factor: 0.82, displayColor: '#1d4ed8' },
  { id: 'solarcolor-green', label: 'SOLARCOLOR Green', factor: 0.76, displayColor: '#15803d' },
  { id: 'solarcolor-red', label: 'SOLARCOLOR Red', factor: 0.72, displayColor: '#b91c1c' },
  { id: 'solarcolor-terracotta', label: 'SOLARCOLOR Terracotta', factor: 0.74, displayColor: '#9a3412' },
  { id: 'solarcolor-grey', label: 'SOLARCOLOR Grey', factor: 0.80, displayColor: '#4b5563' },
  { id: 'solarcolor-white', label: 'SOLARCOLOR White', factor: 0.68, displayColor: '#cbd5e1' },
] as const;

export const BACKGLASS_COLOR_OPTIONS = [
  { id: 'white', label: 'White', displayColor: '#f1f5f9' },
  { id: 'black', label: 'Black', displayColor: '#1e293b' },
  { id: 'transparent', label: 'Transparent', displayColor: '#e0f2fe' },
] as const;

export const GLASS_TEXTURE_OPTIONS: GlassTexture[] = ['smooth', 'textured', 'anti-glare'];

export const TEXTURED_GLASS_EFFICIENCY = 0.95;

// Base power per full cell (Wp) by cell format
export const CELL_POWER_MAP: Record<string, number> = {
  'M6-166mm': 5.8,
  'M10-182mm': 7.0,
  'M12-210mm': 9.5,
  'custom': 6.0,
};

// Cell size (mm) by cell format
export const FORMAT_SIZE_MAP: Record<string, number> = {
  'M6-166mm': 166,
  'M10-182mm': 182,
  'M12-210mm': 210,
  'custom': 182,
};

// ── Submodule: an independent cell array within a module ──
export interface SubmoduleConfig {
  stringAmount: number;           // number of strings (columns)
  cellsPerString: number;         // number of cells per string (rows)
  cellType: CellType;
  cellFormat: CellFormat;
  halfCut: boolean;
  standardLayout: boolean;        // when true, uses standard spacing & margin values
  distanceToBorderX: number;      // mm - margin left and right
  distanceToBorderY: number;      // mm - margin top and bottom
  distanceBetweenCells: number;   // mm - spacing between cells within a string
  distanceBetweenStrings: number; // mm - spacing between strings
  blackRibbonsAndConnectors: boolean;
}

export interface SolarModule {
  id: string;
  name: string;
  width: number;   // mm
  height: number;  // mm
  // Submodules
  submodule1: SubmoduleConfig;
  submodule2Enabled: boolean;
  submodule2: SubmoduleConfig;
  // Glass configuration
  standardGlass: boolean;
  frontglassTexture: GlassTexture;
  frontglassColor: string;        // ID from MODULE_COLOR_TYPES
  backglassTexture: GlassTexture;
  backglassColor: string;         // ID from BACKGLASS_COLOR_OPTIONS
  // Fixed ribbon properties
  ribbonWidthMm: number;
  ribbonCount: number;
  // Encapsulant
  encapsulantType: 'EVA' | 'POE' | 'EPE';
  // Computed
  totalCells: number;
  powerWp: number;
  // Color for visual identification
  color: string;
}

export function computeSubmoduleCells(sub: SubmoduleConfig): number {
  return sub.stringAmount * sub.cellsPerString * (sub.halfCut ? 2 : 1);
}

export function computeModulePower(
  submodule1: SubmoduleConfig,
  submodule2Enabled: boolean,
  submodule2: SubmoduleConfig,
  frontglassColor: string,
  frontglassTexture: GlassTexture,
): number {
  const colorType = MODULE_COLOR_TYPES.find((c) => c.id === frontglassColor);
  const colorFactor = colorType?.factor ?? 1.0;
  const glassFactor = frontglassTexture === 'textured' ? TEXTURED_GLASS_EFFICIENCY : 1.0;

  function subPower(sub: SubmoduleConfig): number {
    const cells = computeSubmoduleCells(sub);
    const fullCellPower = CELL_POWER_MAP[sub.cellFormat] ?? 6.0;
    const cellPower = sub.halfCut ? fullCellPower / 2 : fullCellPower;
    return cells * cellPower;
  }

  let total = subPower(submodule1);
  if (submodule2Enabled) total += subPower(submodule2);
  return Math.round(total * colorFactor * glassFactor * 10) / 10;
}

export function createDefaultSubmodule(): SubmoduleConfig {
  return {
    stringAmount: 10,
    cellsPerString: 6,
    cellType: 'mono-PERC',
    cellFormat: 'M10-182mm',
    halfCut: true,
    standardLayout: true,
    distanceToBorderX: 25,
    distanceToBorderY: 40,
    distanceBetweenCells: 2,
    distanceBetweenStrings: 2,
    blackRibbonsAndConnectors: false,
  };
}

export function createDefaultModule(id: string, name: string): SolarModule {
  const submodule1 = createDefaultSubmodule();
  const submodule2 = createDefaultSubmodule();
  submodule2.stringAmount = 5;
  submodule2.cellsPerString = 3;
  const frontglassColor = 'standard';
  const frontglassTexture: GlassTexture = 'smooth';
  const totalCells = computeSubmoduleCells(submodule1);
  const powerWp = computeModulePower(submodule1, false, submodule2, frontglassColor, frontglassTexture);

  return {
    id,
    name,
    width: 1134,
    height: 1722,
    submodule1,
    submodule2Enabled: false,
    submodule2,
    standardGlass: true,
    frontglassTexture,
    frontglassColor,
    backglassTexture: 'smooth',
    backglassColor: 'white',
    ribbonWidthMm: 0.4,
    ribbonCount: 6,
    encapsulantType: 'EVA',
    totalCells,
    powerWp,
    color: '#1e3a5f',
  };
}
