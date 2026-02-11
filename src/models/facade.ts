export interface FacadeSlot {
  moduleId: string; // references SolarModule.id, or '' for empty
  row: number;
  col: number;
}

export interface FacadeConfig {
  rows: number;
  columns: number;
  slots: FacadeSlot[];
  facadeWidthMm: number;
  facadeHeightMm: number;
  gapMm: number; // gap between modules
}

export function createDefaultFacade(): FacadeConfig {
  const rows = 4;
  const columns = 3;
  const slots: FacadeSlot[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      slots.push({ moduleId: '', row: r, col: c });
    }
  }
  return {
    rows,
    columns,
    slots,
    facadeWidthMm: 4000,
    facadeHeightMm: 8000,
    gapMm: 20,
  };
}
