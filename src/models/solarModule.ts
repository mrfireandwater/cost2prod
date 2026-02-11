export type CellType = 'mono-PERC' | 'mono-HJT' | 'mono-TOPCon' | 'poly' | 'custom';
export type CellFormat = 'M6-166mm' | 'M10-182mm' | 'M12-210mm' | 'custom';
export type GlassType = 'tempered-3.2mm' | 'tempered-2.0mm' | 'anti-glare-3.2mm' | 'custom';
export type BacksheetType = 'glass-glass' | 'TPT' | 'TPE' | 'transparent' | 'custom';
export type FrameType = 'aluminium-silver' | 'aluminium-black' | 'frameless' | 'custom';

export type ModuleColor =
  | 'morpho-yellow'
  | 'morpho-green'
  | 'morpho-terracota'
  | 'printed-color'
  | 'transparent'
  | 'black';

export type RibbonColor = 'silver' | 'black';
export type CrossConnectorColor = 'silver' | 'black';

// Cell geometries from Megasol V24.02 planning document
export type CellGeometryId =
  | 'M10-HC'
  | 'M10-HIR'
  | 'M12-HC-HiR'
  | 'G12-HC'
  | 'M6-RC-HC'
  | 'G1';

export interface CellGeometryDef {
  id: CellGeometryId;
  label: string;
  cellWidthMm: number;   // x dimension
  cellHeightMm: number;  // y dimension (half-cut height if halfCut)
  fullCellHeightMm: number; // full cell height before half-cut
  halfCut: boolean;
  defaultRibbonCount: number;
  roundedCorners: boolean; // M6 RearCon has rounded corners
  rearContact: boolean;    // no visible ribbons from front for RearCon
}

export const CELL_GEOMETRIES: CellGeometryDef[] = [
  {
    id: 'M10-HC',
    label: 'M10 HC (182 x 83mm)',
    cellWidthMm: 182,
    cellHeightMm: 83,
    fullCellHeightMm: 166,
    halfCut: true,
    defaultRibbonCount: 6,
    roundedCorners: false,
    rearContact: false,
  },
  {
    id: 'M10-HIR',
    label: 'M10 HIR (182 x 91mm)',
    cellWidthMm: 182,
    cellHeightMm: 91,
    fullCellHeightMm: 182,
    halfCut: true,
    defaultRibbonCount: 6,
    roundedCorners: false,
    rearContact: false,
  },
  {
    id: 'M12-HC-HiR',
    label: 'M12 HC HiR (210 x 105mm)',
    cellWidthMm: 210,
    cellHeightMm: 105,
    fullCellHeightMm: 210,
    halfCut: true,
    defaultRibbonCount: 6,
    roundedCorners: false,
    rearContact: false,
  },
  {
    id: 'G12-HC',
    label: 'G12 HC (210 x 105mm)',
    cellWidthMm: 210,
    cellHeightMm: 105,
    fullCellHeightMm: 210,
    halfCut: true,
    defaultRibbonCount: 6,
    roundedCorners: false,
    rearContact: false,
  },
  {
    id: 'M6-RC-HC',
    label: 'M6 RearCon HC (166 x 83mm)',
    cellWidthMm: 166,
    cellHeightMm: 83,
    fullCellHeightMm: 166,
    halfCut: true,
    defaultRibbonCount: 0, // rear contact - no visible ribbons
    roundedCorners: true,
    rearContact: true,
  },
  {
    id: 'G1',
    label: 'G1 (158.75 x 158.75mm)',
    cellWidthMm: 158.75,
    cellHeightMm: 158.75,
    fullCellHeightMm: 158.75,
    halfCut: false,
    defaultRibbonCount: 5,
    roundedCorners: false,
    rearContact: false,
  },
];

export function getCellGeometry(id: CellGeometryId): CellGeometryDef {
  return CELL_GEOMETRIES.find((g) => g.id === id) ?? CELL_GEOMETRIES[0];
}

// Color definitions for the module color palette
export const MODULE_COLOR_PALETTE: Record<ModuleColor, { label: string; hex: string; opacity: number }> = {
  'morpho-yellow': { label: 'Morpho Yellow', hex: '#d4a017', opacity: 0.55 },
  'morpho-green': { label: 'Morpho Green', hex: '#2e7d32', opacity: 0.55 },
  'morpho-terracota': { label: 'Morpho Terracota', hex: '#a0522d', opacity: 0.55 },
  'printed-color': { label: 'Printed Color', hex: '#6a5acd', opacity: 0.45 },
  'transparent': { label: 'Transparent', hex: '#e8f4f8', opacity: 0.15 },
  'black': { label: 'Black', hex: '#1a1a2e', opacity: 0.0 },
};

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
  cellGeometryId: CellGeometryId;
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
  ribbonCount: number; // per cell (depends on cell geometry)
  ribbonColor: RibbonColor;
  crossConnectorColor: CrossConnectorColor;
  // Junction box
  junctionBoxCount: number;
  // Encapsulant
  encapsulantType: 'EVA' | 'POE' | 'EPE';
  // Calculated
  totalCells: number;
  powerWp: number;
  // Module appearance color (for glass tinting / SOLARCOLOR)
  moduleColor: ModuleColor;
  // Color for facade grid representation
  color: string;
}

export function createDefaultModule(id: string, name: string): SolarModule {
  const geom = getCellGeometry('M10-HC');
  const cellLayout: CellLayout = {
    rows: 6,
    columns: 10,
    halfCut: geom.halfCut,
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
    cellSizeMm: geom.cellWidthMm,
    cellGeometryId: 'M10-HC',
    cellLayout,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 25,
    marginRight: 25,
    glassType: 'tempered-3.2mm',
    backsheetType: 'glass-glass',
    frameType: 'aluminium-black',
    ribbonWidthMm: 0.4,
    ribbonCount: geom.defaultRibbonCount,
    ribbonColor: 'silver',
    crossConnectorColor: 'silver',
    junctionBoxCount: 1,
    encapsulantType: 'EVA',
    totalCells: cellLayout.rows * cellLayout.columns * (cellLayout.halfCut ? 2 : 1),
    powerWp: 400,
    moduleColor: 'black',
    color: '#1e3a5f',
  };
}

export function computeTotalCells(layout: CellLayout): number {
  return layout.rows * layout.columns * (layout.halfCut ? 2 : 1);
}
