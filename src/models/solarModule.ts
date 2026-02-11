export type CellType = 'mono-PERC' | 'mono-HJT' | 'mono-TOPCon' | 'poly' | 'custom';
export type CellFormat = 'M6-166mm' | 'M10-182mm' | 'M12-210mm' | 'custom';
export type GlassType = 'tempered-3.2mm' | 'tempered-2.0mm' | 'anti-glare-3.2mm' | 'custom';
export type BacksheetType = 'glass-glass' | 'TPT' | 'TPE' | 'transparent' | 'custom';
export type FrameType = 'aluminium-silver' | 'aluminium-black' | 'frameless' | 'custom';

export interface CellLayout {
  rows: number;
  columns: number;
  halfCut: boolean;
  cellSpacingX: number; // mm
  cellSpacingY: number; // mm
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
  cellSizeMm: number;       // actual cell edge length in mm
  cellLayout: CellLayout;
  // Margins (distance from module edge to active cell area)
  marginTop: number;    // mm
  marginBottom: number; // mm
  marginLeft: number;   // mm
  marginRight: number;  // mm
  // Components
  glassType: GlassType;
  backsheetType: BacksheetType;
  frameType: FrameType;
  // Ribbon / interconnection
  ribbonWidthMm: number;
  ribbonCount: number; // per cell (typically 5 or 6 for multi-busbar)
  // Junction box
  junctionBoxCount: number;
  // Encapsulant
  encapsulantType: 'EVA' | 'POE' | 'EPE';
  // Calculated
  totalCells: number;
  powerWp: number;
  // Color for facade representation
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
  return {
    id,
    name,
    width: 1134,
    height: 1722,
    cellType: 'mono-PERC',
    cellFormat: 'M10-182mm',
    cellSizeMm: 182,
    cellLayout,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 25,
    marginRight: 25,
    glassType: 'tempered-3.2mm',
    backsheetType: 'glass-glass',
    frameType: 'aluminium-black',
    ribbonWidthMm: 0.4,
    ribbonCount: 6,
    junctionBoxCount: 1,
    encapsulantType: 'EVA',
    totalCells: cellLayout.rows * cellLayout.columns * (cellLayout.halfCut ? 2 : 1),
    powerWp: 400,
    color: '#1e3a5f',
  };
}

export function computeTotalCells(layout: CellLayout): number {
  return layout.rows * layout.columns * (layout.halfCut ? 2 : 1);
}
