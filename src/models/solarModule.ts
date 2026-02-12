export type CellType = 'mono-PERC' | 'mono-HJT' | 'mono-TOPCon' | 'poly' | 'custom';
export type CellFormat = 'M6-166mm' | 'M10-182mm' | 'M12-210mm' | 'custom';
export type GlassType = 'tempered-3.2mm' | 'tempered-2.0mm' | 'anti-glare-3.2mm' | 'custom';
export type BacksheetType = 'glass-glass' | 'TPT' | 'TPE' | 'transparent' | 'custom';

export interface CellLayout {
  rows: number;
  columns: number;
  halfCut: boolean;
  cellSpacingX: number; // mm
  cellSpacingY: number; // mm
}

// Color efficiency factors for power computation
export const MODULE_COLOR_TYPES = [
  { id: 'standard', label: 'Standard (Dark Blue)', factor: 1.0 },
  { id: 'full-black', label: 'Full Black', factor: 0.97 },
  { id: 'totally-black', label: 'Totally Black', factor: 0.94 },
  { id: 'solarcolor-blue', label: 'SOLARCOLOR Blue', factor: 0.82 },
  { id: 'solarcolor-green', label: 'SOLARCOLOR Green', factor: 0.76 },
  { id: 'solarcolor-red', label: 'SOLARCOLOR Red', factor: 0.72 },
  { id: 'solarcolor-terracotta', label: 'SOLARCOLOR Terracotta', factor: 0.74 },
  { id: 'solarcolor-grey', label: 'SOLARCOLOR Grey', factor: 0.80 },
  { id: 'solarcolor-white', label: 'SOLARCOLOR White', factor: 0.68 },
] as const;

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

export function computeTotalCells(layout: CellLayout): number {
  return layout.rows * layout.columns * (layout.halfCut ? 2 : 1);
}

export function computePower(
  totalCells: number,
  cellFormat: CellFormat,
  halfCut: boolean,
  moduleColorType: string,
  texturedGlass: boolean
): number {
  const fullCellPower = CELL_POWER_MAP[cellFormat] ?? 6.0;
  const cellPower = halfCut ? fullCellPower / 2 : fullCellPower;
  const colorType = MODULE_COLOR_TYPES.find((c) => c.id === moduleColorType);
  const colorFactor = colorType?.factor ?? 1.0;
  const glassFactor = texturedGlass ? TEXTURED_GLASS_EFFICIENCY : 1.0;
  return Math.round(totalCells * cellPower * colorFactor * glassFactor * 10) / 10;
}

export interface SolarModule {
  id: string;
  name: string;
  // Outer dimensions
  width: number;   // mm
  height: number;  // mm
  // Cell configuration
  cellType: CellType;
  cellFormat: CellFormat;
  cellSizeMm: number;       // actual cell edge length in mm (derived from format)
  cellLayout: CellLayout;
  // Margins (distance from module edge to active cell area)
  marginTop: number;    // mm
  marginBottom: number; // mm
  marginLeft: number;   // mm
  marginRight: number;  // mm
  // Components
  glassType: GlassType;
  backsheetType: BacksheetType;
  // Ribbon / interconnection
  ribbonWidthMm: number;   // fixed, not editable
  ribbonCount: number;      // fixed, not editable
  ribbonColor: string;      // editable
  // Encapsulant
  encapsulantType: 'EVA' | 'POE' | 'EPE';
  // Power computation inputs
  moduleColorType: string;  // ID from MODULE_COLOR_TYPES
  texturedGlass: boolean;
  // Production flags
  useStandardSpacing: boolean;
  isStandardString: boolean;
  stringsPrinted: boolean;
  glassColorProcess: 'none' | 'morpho' | 'inkjet';
  // Calculated
  totalCells: number;
  powerWp: number;
  // Color for visual identification
  color: string;
}

export function createDefaultModule(id: string, name: string): SolarModule {
  const cellLayout: CellLayout = {
    rows: 6,
    columns: 10,
    halfCut: true,
    cellSpacingX: 2,
    cellSpacingY: 2,
  };
  const totalCells = computeTotalCells(cellLayout);
  const cellFormat: CellFormat = 'M10-182mm';
  const moduleColorType = 'standard';
  const texturedGlass = false;
  return {
    id,
    name,
    width: 1134,
    height: 1722,
    cellType: 'mono-PERC',
    cellFormat,
    cellSizeMm: FORMAT_SIZE_MAP[cellFormat],
    cellLayout,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 25,
    marginRight: 25,
    glassType: 'tempered-3.2mm',
    backsheetType: 'glass-glass',
    ribbonWidthMm: 0.4,
    ribbonCount: 6,
    ribbonColor: '#c0c0c0',
    encapsulantType: 'EVA',
    moduleColorType,
    texturedGlass,
    useStandardSpacing: true,
    isStandardString: true,
    stringsPrinted: false,
    glassColorProcess: 'none',
    totalCells,
    powerWp: computePower(totalCells, cellFormat, cellLayout.halfCut, moduleColorType, texturedGlass),
    color: '#1e3a5f',
  };
}
