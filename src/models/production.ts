// ── Sub-step model: each production step with machine + operator time ──
export interface ProductionSubStep {
  id: string;
  name: string;
  machineMinutes: number;      // machine time per module (min)
  operatorMinutes: number;     // operator time per module (min)
  machineCostPerHour: number;  // EUR/hr
  operatorCostPerHour: number; // EUR/hr
}

// ── Section: a stage of the production line ──
export interface ProductionSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  colorClass: string;
  baseCostEur: number;        // fixed cost per module
  perModuleCostEur: number;   // scales with module count
  subSteps: ProductionSubStep[];
}

// ── Material pricing config (BOM) ──
export interface MaterialConfig {
  glassBasePrices: Record<string, number>; // EUR/m² by glass type
  texturedGlassPremium: number;  // additional EUR/m²
  morphoColorPremium: number;    // additional EUR/m²
  inkjetPrintPremium: number;    // additional EUR/m²
  backsheetPerM2: number;        // EUR/m²
  encapsulantPerM2: number;      // EUR/m²
  ribbonPerCell: number;         // EUR/cell
  junctionBoxCost: number;       // EUR per box
}

// ── String production config ──
export interface StringConfig {
  nonStandardSetupCost: number;    // EUR, machine setup if non-standard
  printingCostPerString: number;   // EUR, per string if printed
  cellPrices: Record<string, Record<string, number>>; // EUR per cell [type][format]
}

// ── Spacing config (standard vs non-standard) ──
export interface SpacingConfig {
  standardX: number;              // mm
  standardY: number;              // mm
  nonStandardCostFactor: number;  // multiplier on process cost (e.g. 1.15)
}

// ── Margin config (minimum thresholds) ──
export interface MarginConfig {
  standardMinMm: number;       // above this = standard cost
  tightThresholdMm: number;    // below this = tight cost
  mediumCostFactor: number;    // factor for margins between tight..standard
  tightCostFactor: number;     // factor for margins below tight threshold
}

// ════════════════════════════════════════════
// Defaults
// ════════════════════════════════════════════

export const DEFAULT_SECTIONS: ProductionSection[] = [
  // 1. Sales (before planning)
  {
    id: 'sales',
    name: 'Sales',
    icon: '💼',
    description: 'Customer acquisition, quote preparation, order processing',
    colorClass: 'bg-indigo-500',
    baseCostEur: 5,
    perModuleCostEur: 3,
    subSteps: [
      { id: 'customer-acq', name: 'Customer acquisition', machineMinutes: 2, operatorMinutes: 5, machineCostPerHour: 20, operatorCostPerHour: 35 },
      { id: 'quote-prep', name: 'Quote preparation', machineMinutes: 3, operatorMinutes: 8, machineCostPerHour: 30, operatorCostPerHour: 35 },
    ],
  },
  // 2. Planning
  {
    id: 'planning',
    name: 'Planning',
    icon: '📐',
    description: 'Engineering design, layout planning, certifications',
    colorClass: 'bg-blue-500',
    baseCostEur: 5,
    perModuleCostEur: 0,
    subSteps: [
      { id: 'eng-design', name: 'Engineering design', machineMinutes: 5, operatorMinutes: 8, machineCostPerHour: 30, operatorCostPerHour: 40 },
      { id: 'certifications', name: 'Certifications', machineMinutes: 2, operatorMinutes: 5, machineCostPerHour: 20, operatorCostPerHour: 35 },
    ],
  },
  // 3. Material Cost (BOM – substeps empty, cost computed from MaterialConfig)
  {
    id: 'material',
    name: 'Material Cost',
    icon: '📦',
    description: 'Glass, backsheet, encapsulant, ribbons, junction box',
    colorClass: 'bg-amber-500',
    baseCostEur: 0,
    perModuleCostEur: 0,
    subSteps: [],
  },
  // 4. String Production
  {
    id: 'string-production',
    name: 'String Production',
    icon: '🔗',
    description: 'Cell sorting, tabbing & stringing, inspection',
    colorClass: 'bg-green-500',
    baseCostEur: 0,
    perModuleCostEur: 0,
    subSteps: [
      { id: 'cell-sorting', name: 'Cell sorting', machineMinutes: 1.5, operatorMinutes: 1, machineCostPerHour: 60, operatorCostPerHour: 28 },
      { id: 'tabbing-stringing', name: 'Tabbing & stringing', machineMinutes: 3, operatorMinutes: 2, machineCostPerHour: 80, operatorCostPerHour: 28 },
      { id: 'string-inspection', name: 'String inspection', machineMinutes: 1.5, operatorMinutes: 1, machineCostPerHour: 50, operatorCostPerHour: 28 },
    ],
  },
  // 5. Frontend (lay-up)
  {
    id: 'frontend',
    name: 'Frontend',
    icon: '🔲',
    description: 'Glass cleaning, encapsulant layup, cell placement, EL test',
    colorClass: 'bg-cyan-500',
    baseCostEur: 0,
    perModuleCostEur: 0,
    subSteps: [
      { id: 'glass-cleaning', name: 'Glass cleaning', machineMinutes: 2, operatorMinutes: 1, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'encapsulant-layup', name: 'Encapsulant layup', machineMinutes: 3, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'cell-placement', name: 'Cell matrix placement', machineMinutes: 4, operatorMinutes: 3, machineCostPerHour: 60, operatorCostPerHour: 28 },
      { id: 'el-test-pre', name: 'EL test (pre-lamination)', machineMinutes: 2, operatorMinutes: 1, machineCostPerHour: 50, operatorCostPerHour: 28 },
    ],
  },
  // 6. Backend
  {
    id: 'backend',
    name: 'Backend',
    icon: '⚙️',
    description: 'Lamination, trimming, junction box mounting, curing',
    colorClass: 'bg-purple-500',
    baseCostEur: 0,
    perModuleCostEur: 0,
    subSteps: [
      { id: 'lamination', name: 'Lamination', machineMinutes: 12, operatorMinutes: 2, machineCostPerHour: 60, operatorCostPerHour: 28 },
      { id: 'trimming', name: 'Trimming', machineMinutes: 2, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'jbox-mounting', name: 'Junction box mounting', machineMinutes: 3, operatorMinutes: 3, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'curing', name: 'Curing', machineMinutes: 8, operatorMinutes: 1, machineCostPerHour: 30, operatorCostPerHour: 28 },
    ],
  },
  // 7. Packaging
  {
    id: 'packaging',
    name: 'Packaging',
    icon: '📋',
    description: 'Final EL test, flash test, visual inspection, labeling, palletizing',
    colorClass: 'bg-orange-500',
    baseCostEur: 2,
    perModuleCostEur: 1,
    subSteps: [
      { id: 'el-test-final', name: 'Final EL test', machineMinutes: 2, operatorMinutes: 1, machineCostPerHour: 50, operatorCostPerHour: 28 },
      { id: 'flash-test', name: 'Flash test', machineMinutes: 2, operatorMinutes: 1, machineCostPerHour: 60, operatorCostPerHour: 28 },
      { id: 'visual-inspection', name: 'Visual inspection', machineMinutes: 0, operatorMinutes: 2, machineCostPerHour: 0, operatorCostPerHour: 28 },
      { id: 'labeling', name: 'Labeling', machineMinutes: 1, operatorMinutes: 1, machineCostPerHour: 20, operatorCostPerHour: 28 },
      { id: 'palletizing', name: 'Palletizing', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 30, operatorCostPerHour: 28 },
    ],
  },
  // 8. Shipment
  {
    id: 'shipment',
    name: 'Shipment',
    icon: '🚚',
    description: 'Warehousing, logistics, transport, delivery',
    colorClass: 'bg-red-500',
    baseCostEur: 3,
    perModuleCostEur: 2,
    subSteps: [
      { id: 'warehousing', name: 'Warehousing', machineMinutes: 2, operatorMinutes: 2, machineCostPerHour: 30, operatorCostPerHour: 25 },
      { id: 'transport-prep', name: 'Transport preparation', machineMinutes: 1, operatorMinutes: 3, machineCostPerHour: 20, operatorCostPerHour: 25 },
    ],
  },
];

export const DEFAULT_MATERIAL_CONFIG: MaterialConfig = {
  glassBasePrices: {
    'tempered-3.2mm': 10,
    'tempered-2.0mm': 8,
    'anti-glare-3.2mm': 14,
    'custom': 10,
  },
  texturedGlassPremium: 8,     // EUR/m² additional for textured
  morphoColorPremium: 30,      // EUR/m² morpho / structural color
  inkjetPrintPremium: 15,      // EUR/m² inkjet printed color
  backsheetPerM2: 4,
  encapsulantPerM2: 3.5,
  ribbonPerCell: 0.03,
  junctionBoxCost: 3,
};

export const DEFAULT_STRING_CONFIG: StringConfig = {
  nonStandardSetupCost: 12,    // EUR, machine re-setup
  printingCostPerString: 1.5,  // EUR per printed string
  cellPrices: {
    'mono-PERC':  { 'M6-166mm': 0.22, 'M10-182mm': 0.28, 'M12-210mm': 0.38, 'custom': 0.28 },
    'mono-HJT':   { 'M6-166mm': 0.40, 'M10-182mm': 0.52, 'M12-210mm': 0.68, 'custom': 0.52 },
    'mono-TOPCon': { 'M6-166mm': 0.26, 'M10-182mm': 0.34, 'M12-210mm': 0.45, 'custom': 0.34 },
    'poly':        { 'M6-166mm': 0.15, 'M10-182mm': 0.19, 'M12-210mm': 0.25, 'custom': 0.19 },
    'custom':      { 'M6-166mm': 0.22, 'M10-182mm': 0.28, 'M12-210mm': 0.38, 'custom': 0.28 },
  },
};

export const DEFAULT_SPACING_CONFIG: SpacingConfig = {
  standardX: 2,
  standardY: 2,
  nonStandardCostFactor: 1.15,  // 15% surcharge
};

export const DEFAULT_MARGIN_CONFIG: MarginConfig = {
  standardMinMm: 25,           // >= 25 mm → standard cost
  tightThresholdMm: 20,        // < 20 mm → tight cost
  mediumCostFactor: 1.15,      // 20-24 mm → 15% surcharge
  tightCostFactor: 1.35,       // < 20 mm → 35% surcharge
};

// ════════════════════════════════════════════
// Cost calculation result types
// ════════════════════════════════════════════

export interface SubStepCost {
  subStepId: string;
  subStepName: string;
  machineCost: number;
  operatorCost: number;
  totalCost: number;
}

export interface SectionCost {
  sectionId: string;
  sectionName: string;
  cost: number;
  percentage: number;
  colorClass: string;
  subStepCosts: SubStepCost[];
}

// ════════════════════════════════════════════
// Cost calculation
// ════════════════════════════════════════════

export interface ModuleCostParams {
  totalCells: number;
  areaM2: number;
  numStrings: number;        // = columns
  cellType: string;
  cellFormat: string;
  glassType: string;
  texturedGlass: boolean;
  glassColorProcess: 'none' | 'morpho' | 'inkjet';
  isStandardString: boolean;
  stringsPrinted: boolean;
  useStandardSpacing: boolean;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

function computeSubStepCosts(subSteps: ProductionSubStep[]): { costs: SubStepCost[]; total: number } {
  const costs = subSteps.map((s) => {
    const machineCost = (s.machineMinutes / 60) * s.machineCostPerHour;
    const operatorCost = (s.operatorMinutes / 60) * s.operatorCostPerHour;
    return {
      subStepId: s.id,
      subStepName: s.name,
      machineCost: Math.round(machineCost * 100) / 100,
      operatorCost: Math.round(operatorCost * 100) / 100,
      totalCost: Math.round((machineCost + operatorCost) * 100) / 100,
    };
  });
  const total = costs.reduce((sum, c) => sum + c.totalCost, 0);
  return { costs, total };
}

export function calculateCosts(
  sections: ProductionSection[],
  materialConfig: MaterialConfig,
  stringConfig: StringConfig,
  spacingConfig: SpacingConfig,
  marginConfig: MarginConfig,
  params: ModuleCostParams
): { sectionCosts: SectionCost[]; totalCost: number } {
  const minMargin = Math.min(params.marginTop, params.marginBottom, params.marginLeft, params.marginRight);

  // Margin cost factor (applied to frontend + backend)
  let marginFactor = 1.0;
  if (minMargin < marginConfig.tightThresholdMm) {
    marginFactor = marginConfig.tightCostFactor;
  } else if (minMargin < marginConfig.standardMinMm) {
    marginFactor = marginConfig.mediumCostFactor;
  }

  // Spacing cost factor (applied to string production + frontend)
  const spacingFactor = params.useStandardSpacing ? 1.0 : spacingConfig.nonStandardCostFactor;

  const sectionCosts: SectionCost[] = sections.map((section) => {
    let cost = section.baseCostEur + section.perModuleCostEur;
    const { costs: subStepCosts, total: subStepTotal } = computeSubStepCosts(section.subSteps);

    switch (section.id) {
      case 'material': {
        // BOM: glass
        const glassBase = materialConfig.glassBasePrices[params.glassType] ?? 10;
        let glassPricePerM2 = glassBase;
        if (params.texturedGlass) glassPricePerM2 += materialConfig.texturedGlassPremium;
        if (params.glassColorProcess === 'morpho') glassPricePerM2 += materialConfig.morphoColorPremium;
        if (params.glassColorProcess === 'inkjet') glassPricePerM2 += materialConfig.inkjetPrintPremium;
        cost += glassPricePerM2 * params.areaM2;
        // BOM: other
        cost += materialConfig.backsheetPerM2 * params.areaM2;
        cost += materialConfig.encapsulantPerM2 * params.areaM2;
        cost += materialConfig.ribbonPerCell * params.totalCells;
        cost += materialConfig.junctionBoxCost;
        break;
      }

      case 'string-production': {
        // Cell cost
        const cellPrice = stringConfig.cellPrices[params.cellType]?.[params.cellFormat] ?? 0.28;
        cost += cellPrice * params.totalCells;
        // Machine setup if non-standard
        if (!params.isStandardString) cost += stringConfig.nonStandardSetupCost;
        // Process cost with spacing factor
        cost += subStepTotal * spacingFactor;
        // Printing cost
        if (params.stringsPrinted) cost += stringConfig.printingCostPerString * params.numStrings;
        break;
      }

      case 'frontend':
        // Process cost affected by spacing and margin factors
        cost += subStepTotal * spacingFactor * marginFactor;
        break;

      case 'backend':
        // Process cost affected by margin factor
        cost += subStepTotal * marginFactor;
        break;

      default:
        // Sales, planning, packaging, shipment: base + perModule + substeps
        cost += subStepTotal;
        break;
    }

    return {
      sectionId: section.id,
      sectionName: section.name,
      cost: Math.round(cost * 100) / 100,
      percentage: 0,
      colorClass: section.colorClass,
      subStepCosts,
    };
  });

  const totalCost = sectionCosts.reduce((sum, sc) => sum + sc.cost, 0);
  for (const sc of sectionCosts) {
    sc.percentage = totalCost > 0 ? Math.round((sc.cost / totalCost) * 1000) / 10 : 0;
  }
  return { sectionCosts, totalCost: Math.round(totalCost * 100) / 100 };
}
