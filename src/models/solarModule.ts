// ── Combined Cell Type definitions (type + format merged) ──
// Each cell type includes its size, standard spacing, power, and price
export interface CellTypeDefinition {
  id: string;
  label: string;
  category: 'G1' | 'G2' | 'custom';
  sizeMm: number;           // cell width/height in mm
  standardSpacingX: number; // Zellstringabstände X (mm)
  standardSpacingY: number; // Zellstringabstände Y (mm)
  standardBorderX: number;  // standard margin X (mm)
  standardBorderY: number;  // standard margin Y (mm)
  wpPerCell: number;         // Wp per full cell (assuming 25% efficiency)
  priceCHF: number;          // CHF per cell
}

export const CELL_TYPE_DEFINITIONS: CellTypeDefinition[] = [
  // G1 types (166mm)
  { id: 'G1-fully-black-a', label: 'Typ G1 fully black (a)', category: 'G1', sizeMm: 166, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 5.8, priceCHF: 0.22 },
  { id: 'G1-totally-black-b', label: 'Typ G1 totally black (b)', category: 'G1', sizeMm: 166, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 5.5, priceCHF: 0.30 },
  { id: 'G1-standard-blue-a', label: 'Typ G1 standard blue (a)', category: 'G1', sizeMm: 166, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 5.8, priceCHF: 0.20 },
  // G2 types (182mm)
  { id: 'G2-fully-black-a', label: 'Typ G2 fully black (a)', category: 'G2', sizeMm: 182, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 7.0, priceCHF: 0.28 },
  { id: 'G2-totally-black-b', label: 'Typ G2 totally black (b)', category: 'G2', sizeMm: 182, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 6.6, priceCHF: 0.38 },
  { id: 'G2-standard-blue-a', label: 'Typ G2 standard blue (a)', category: 'G2', sizeMm: 182, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 7.0, priceCHF: 0.25 },
  { id: 'G2-HJT-a', label: 'Typ G2 HJT (a)', category: 'G2', sizeMm: 182, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 7.5, priceCHF: 0.52 },
  { id: 'G2-TOPCon-a', label: 'Typ G2 TOPCon (a)', category: 'G2', sizeMm: 182, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 7.2, priceCHF: 0.34 },
  // Custom
  { id: 'custom', label: 'Custom', category: 'custom', sizeMm: 182, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 6.0, priceCHF: 0.28 },
];

export function getCellTypeDef(id: string): CellTypeDefinition {
  return CELL_TYPE_DEFINITIONS.find((c) => c.id === id) ?? CELL_TYPE_DEFINITIONS[0];
}

// ── Glass type definitions ──
export type GlassCategory = 'a' | 'b' | 'c';

export interface GlassTypeDefinition {
  id: string;
  label: string;
  category: GlassCategory;
  transparencyEfficiency: number; // 1.0 for (a), 0.9 for (b), 0.8 for (c)
  priceCHFPerM2: number;
}

export const GLASS_TYPE_DEFINITIONS: GlassTypeDefinition[] = [
  // (a) Transparent glass - efficiency 1.0
  { id: 'tempered-3.2mm-clear', label: 'Tempered 3.2mm Clear (a)', category: 'a', transparencyEfficiency: 1.0, priceCHFPerM2: 10 },
  { id: 'tempered-2.0mm-clear', label: 'Tempered 2.0mm Clear (a)', category: 'a', transparencyEfficiency: 1.0, priceCHFPerM2: 8 },
  { id: 'anti-glare-3.2mm', label: 'Anti-Glare 3.2mm (a)', category: 'a', transparencyEfficiency: 1.0, priceCHFPerM2: 14 },
  { id: 'low-iron-3.2mm', label: 'Low Iron 3.2mm (a)', category: 'a', transparencyEfficiency: 1.0, priceCHFPerM2: 12 },
  // (b) Semi-transparent / textured glass - efficiency 0.9
  { id: 'textured-3.2mm', label: 'Textured 3.2mm (b)', category: 'b', transparencyEfficiency: 0.9, priceCHFPerM2: 18 },
  { id: 'satin-3.2mm', label: 'Satin Finish 3.2mm (b)', category: 'b', transparencyEfficiency: 0.9, priceCHFPerM2: 16 },
  { id: 'matte-3.2mm', label: 'Matte 3.2mm (b)', category: 'b', transparencyEfficiency: 0.9, priceCHFPerM2: 15 },
  // (c) Opaque / colored glass - efficiency 0.8
  { id: 'morpho-color', label: 'Morpho Color Glass (c)', category: 'c', transparencyEfficiency: 0.8, priceCHFPerM2: 40 },
  { id: 'inkjet-printed', label: 'Inkjet Printed Glass (c)', category: 'c', transparencyEfficiency: 0.8, priceCHFPerM2: 25 },
  { id: 'ceramic-printed', label: 'Ceramic Printed Glass (c)', category: 'c', transparencyEfficiency: 0.8, priceCHFPerM2: 30 },
];

export function getGlassTypeDef(id: string): GlassTypeDefinition {
  return GLASS_TYPE_DEFINITIONS.find((g) => g.id === id) ?? GLASS_TYPE_DEFINITIONS[0];
}

// ── Module Color (replaces separate front/back color) ──
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

// Backglass color options
export const BACKGLASS_COLOR_OPTIONS = [
  { id: 'white', label: 'White', displayColor: '#f1f5f9' },
  { id: 'black', label: 'Black', displayColor: '#1e293b' },
  { id: 'transparent', label: 'Transparent', displayColor: '#e0f2fe' },
] as const;

// ── Rotation type ──
export type SubmoduleRotation = 0 | 90 | 180 | 270;

// ── Submodule: an independent cell array within a module ──
export interface SubmoduleConfig {
  stringAmount: number;           // number of strings (columns)
  cellsPerString: number;         // number of cell UNITS per string (half cell = 1 unit)
  cellTypeId: string;             // ID into CELL_TYPE_DEFINITIONS
  halfCut: boolean;
  standardLayout: boolean;
  distanceToBorderX: number;      // mm – X position of submodule on glass
  distanceToBorderY: number;      // mm – Y position of submodule on glass
  distanceBetweenCells: number;   // mm
  distanceBetweenStrings: number; // mm
  junctionBoxSpacing: number;     // mm – spacing for junction boxes (default 10)
  blackRibbonsAndConnectors: boolean;
  rotation: SubmoduleRotation;    // 0, 90, 180, 270 degrees
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
  frontGlassId: string;    // ID into GLASS_TYPE_DEFINITIONS
  backGlassId: string;     // ID into GLASS_TYPE_DEFINITIONS (same list as front)
  // Module color (single color with semi-transparent overlay)
  moduleColorId: string;   // ID from MODULE_COLOR_TYPES
  // Fixed ribbon properties
  ribbonWidthMm: number;
  ribbonCount: number;
  // Encapsulant
  encapsulantType: 'EVA' | 'POE' | 'EPE';
  // Computed
  totalCells: number;
  powerWp: number;
  junctionBoxCount: number;  // computed: strings/2 per submodule
  // Color for visual identification in tabs
  color: string;
}

// ── Cell counting: half cell = 1 cell unit ──
// cellsPerString = number of cell units
// With halfCut: each unit is a half-cell physically, but counts as 1 cell unit
// Without halfCut: each unit is a full cell
export function computeSubmoduleCells(sub: SubmoduleConfig): number {
  // Cell units = stringAmount * cellsPerString (regardless of halfCut)
  return sub.stringAmount * sub.cellsPerString;
}

// Junction box count: strings / 2 per submodule (strings come in pairs)
export function computeJunctionBoxCount(
  submodule1: SubmoduleConfig,
  submodule2Enabled: boolean,
  submodule2: SubmoduleConfig,
): number {
  const jbFromSub1 = Math.floor(submodule1.stringAmount / 2);
  let total = jbFromSub1;
  if (submodule2Enabled) {
    const jbFromSub2 = Math.floor(submodule2.stringAmount / 2);
    total += jbFromSub2;
  }
  return total;
}

export function computeModulePower(
  submodule1: SubmoduleConfig,
  submodule2Enabled: boolean,
  submodule2: SubmoduleConfig,
  moduleColorId: string,
  frontGlassId: string,
): number {
  const colorType = MODULE_COLOR_TYPES.find((c) => c.id === moduleColorId);
  const colorFactor = colorType?.factor ?? 1.0;
  const glassDef = getGlassTypeDef(frontGlassId);
  const glassFactor = glassDef.transparencyEfficiency;

  function subPower(sub: SubmoduleConfig): number {
    const cellDef = getCellTypeDef(sub.cellTypeId);
    const cellUnits = computeSubmoduleCells(sub);
    // If half-cut, each cell unit is a half-cell, so power per unit = wpPerCell / 2
    // If full cell, power per unit = wpPerCell
    const powerPerUnit = sub.halfCut ? cellDef.wpPerCell / 2 : cellDef.wpPerCell;
    return cellUnits * powerPerUnit;
  }

  let total = subPower(submodule1);
  if (submodule2Enabled) total += subPower(submodule2);
  return Math.round(total * colorFactor * glassFactor * 10) / 10;
}

export function createDefaultSubmodule(): SubmoduleConfig {
  return {
    stringAmount: 10,
    cellsPerString: 6,
    cellTypeId: 'G2-fully-black-a',
    halfCut: true,
    standardLayout: true,
    distanceToBorderX: 25,
    distanceToBorderY: 40,
    distanceBetweenCells: 2,
    distanceBetweenStrings: 2,
    junctionBoxSpacing: 10,
    blackRibbonsAndConnectors: false,
    rotation: 0,
  };
}

export function createDefaultModule(id: string, name: string): SolarModule {
  const submodule1 = createDefaultSubmodule();
  const submodule2 = createDefaultSubmodule();
  submodule2.stringAmount = 5;
  submodule2.cellsPerString = 3;
  const moduleColorId = 'standard';
  const frontGlassId = 'tempered-3.2mm-clear';
  const totalCells = computeSubmoduleCells(submodule1);
  const powerWp = computeModulePower(submodule1, false, submodule2, moduleColorId, frontGlassId);
  const junctionBoxCount = computeJunctionBoxCount(submodule1, false, submodule2);

  return {
    id,
    name,
    width: 1134,
    height: 1722,
    submodule1,
    submodule2Enabled: false,
    submodule2,
    frontGlassId,
    backGlassId: 'tempered-3.2mm-clear',
    moduleColorId,
    ribbonWidthMm: 0.4,
    ribbonCount: 6,
    encapsulantType: 'EVA',
    totalCells,
    powerWp,
    junctionBoxCount,
    color: '#1e3a5f',
  };
}
