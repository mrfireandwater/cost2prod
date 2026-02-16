// ── Combined Cell Type definitions (type + format merged) ──
// Each cell type includes its dimensions, standard spacing, power, and price
export interface CellTypeDefinition {
  id: string;
  label: string;
  category: 'G1' | 'M6' | 'M10' | 'G12' | 'custom';
  sizeXMm: number;           // cell width in mm
  sizeYMm: number;           // cell height in mm (half of sizeX for HC types)
  isHalfCut: boolean;        // true for HC cell types
  standardSpacingX: number;  // Zellstringabstände X (mm)
  standardSpacingY: number;  // Zellstringabstände Y (mm)
  standardBorderX: number;   // standard margin X (mm)
  standardBorderY: number;   // standard margin Y (mm)
  wpPerCell: number;         // Wp per full cell (halved for HC in power calc)
  priceCHF: number;          // CHF per cell
}

export const CELL_TYPE_DEFINITIONS: CellTypeDefinition[] = [
  // Typ G1 (158.75 x 158.75mm) – full cells
  { id: 'G1-full-black-a',    label: 'Typ G1 Full Black (a)',    category: 'G1', sizeXMm: 158.75, sizeYMm: 158.75, isHalfCut: false, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 5.8, priceCHF: 0.22 },
  { id: 'G1-totally-black-b', label: 'Typ G1 Totally Black (b)', category: 'G1', sizeXMm: 158.75, sizeYMm: 158.75, isHalfCut: false, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 5.5, priceCHF: 0.30 },
  { id: 'G1-solarcolor-b',    label: 'Typ G1 SOLARCOLOR (b)',    category: 'G1', sizeXMm: 158.75, sizeYMm: 158.75, isHalfCut: false, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 5.5, priceCHF: 0.35 },
  // Typ M6 RearCon HC (166 x 83mm) – half-cut
  { id: 'M6-totally-black-a',  label: 'Typ M6 RearCon HC Totally Black (a)', category: 'M6', sizeXMm: 166, sizeYMm: 83, isHalfCut: true, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 5.8, priceCHF: 0.25 },
  { id: 'M6-solarcolor-a',     label: 'Typ M6 RearCon HC SOLARCOLOR (a)',    category: 'M6', sizeXMm: 166, sizeYMm: 83, isHalfCut: true, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 5.8, priceCHF: 0.30 },
  // Typ M10 HC (182 x 91mm) – half-cut
  { id: 'M10-full-black-a',    label: 'Typ M10 HC Full Black (a)',    category: 'M10', sizeXMm: 182, sizeYMm: 91, isHalfCut: true, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 7.0, priceCHF: 0.28 },
  { id: 'M10-totally-black-b', label: 'Typ M10 HC Totally Black (b)', category: 'M10', sizeXMm: 182, sizeYMm: 91, isHalfCut: true, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 6.6, priceCHF: 0.38 },
  { id: 'M10-solarcolor-b',    label: 'Typ M10 HC SOLARCOLOR (b)',    category: 'M10', sizeXMm: 182, sizeYMm: 91, isHalfCut: true, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 6.6, priceCHF: 0.42 },
  // Typ G12 HC (210 x 105mm) – half-cut
  { id: 'G12-full-black-c',    label: 'Typ G12 HC Full Black (c)',    category: 'G12', sizeXMm: 210, sizeYMm: 105, isHalfCut: true, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 9.0, priceCHF: 0.45 },
  { id: 'G12-totally-black-c', label: 'Typ G12 HC Totally Black (c)', category: 'G12', sizeXMm: 210, sizeYMm: 105, isHalfCut: true, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 8.5, priceCHF: 0.55 },
  { id: 'G12-solarcolor-c',    label: 'Typ G12 HC SOLARCOLOR (c)',    category: 'G12', sizeXMm: 210, sizeYMm: 105, isHalfCut: true, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 8.5, priceCHF: 0.60 },
  // Custom
  { id: 'custom', label: 'Custom', category: 'custom', sizeXMm: 182, sizeYMm: 91, isHalfCut: true, standardSpacingX: 2, standardSpacingY: 2, standardBorderX: 25, standardBorderY: 40, wpPerCell: 6.0, priceCHF: 0.28 },
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

// ── Module shape type ──
export type ModuleShape = 'rectangle' | 'parallelogram' | 'trapezoid';

// ── Rotation type ──
export type SubmoduleRotation = 0 | 90 | 180 | 270;

// ── Submodule: an independent cell array within a module ──
export interface SubmoduleConfig {
  stringAmount: number;           // number of strings (columns)
  cellsPerString: number;         // number of cell UNITS per string (half cell = 1 unit)
  cellTypeId: string;             // ID into CELL_TYPE_DEFINITIONS
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
  // Shape
  shape: ModuleShape;
  skewAngle: number;    // degrees – parallelogram skew (0 = rectangle)
  cutWidth: number;     // mm – trapezoid corner cut horizontal dimension
  cutHeight: number;    // mm – trapezoid corner cut vertical dimension
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

// ── Cell counting ──
// cellsPerString = number of cell units (HC types: each unit is a half-cell)
export function computeSubmoduleCells(sub: SubmoduleConfig): number {
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
    // HC cell types: each cell unit is a half-cell, power per unit = wpPerCell / 2
    // Full cell types: power per unit = wpPerCell
    const powerPerUnit = cellDef.isHalfCut ? cellDef.wpPerCell / 2 : cellDef.wpPerCell;
    return cellUnits * powerPerUnit;
  }

  let total = subPower(submodule1);
  if (submodule2Enabled) total += subPower(submodule2);
  return Math.round(total * colorFactor * glassFactor * 10) / 10;
}

/** Compute polygon points (in mm) for the module outline based on shape */
export function computeShapePoints(m: SolarModule): [number, number][] {
  const { width: w, height: h, shape } = m;
  if (shape === 'parallelogram') {
    // Skew offset: horizontal shift based on angle
    const offset = h * Math.tan((Math.abs(m.skewAngle) * Math.PI) / 180);
    // Top edge shifted right, bottom edge at origin
    return [
      [offset, 0],
      [w, 0],
      [w - offset, h],
      [0, h],
    ];
  }
  if (shape === 'trapezoid') {
    // Rectangle with top-right corner cut off (5-sided)
    const cw = Math.min(m.cutWidth, w);
    const ch = Math.min(m.cutHeight, h);
    return [
      [0, 0],
      [w - cw, 0],
      [w, ch],
      [w, h],
      [0, h],
    ];
  }
  // Rectangle
  return [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
}

export function createDefaultSubmodule(): SubmoduleConfig {
  return {
    stringAmount: 10,
    cellsPerString: 6,
    cellTypeId: 'M10-full-black-a',
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
    shape: 'rectangle' as ModuleShape,
    skewAngle: 15,
    cutWidth: 200,
    cutHeight: 200,
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
