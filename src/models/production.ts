// ── Sub-step model: each production step with machine + operator time ──
export interface ProductionSubStep {
  id: string;
  name: string;
  machineMinutes: number;      // machine time per module (min)
  operatorMinutes: number;     // operator time per module (min)
  machineCostPerHour: number;  // CHF/hr
  operatorCostPerHour: number; // CHF/hr
}

// ── Section: a stage of the production line ──
export interface ProductionSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  colorClass: string;
  baseCostCHF: number;        // fixed cost per module
  perModuleCostCHF: number;   // scales with module count
  subSteps: ProductionSubStep[];
}

// ── Material pricing config (BOM) ──
export interface MaterialConfig {
  // Cell costs are now here (moved from string config)
  cellPrices: Record<string, number>;  // CHF per cell, keyed by cellTypeId
  // Glass costs are computed from GLASS_TYPE_DEFINITIONS (per m2)
  backsheetPerM2: number;        // CHF/m2
  encapsulantPerM2: number;      // CHF/m2
  ribbonPerCell: number;         // CHF/cell
  junctionBoxCost: number;       // CHF per box
}

// ── String production config ──
export interface StringConfig {
  nonStandardSetupCost: number;    // CHF, machine setup if non-standard
  printingCostPerString: number;   // CHF, per string if printed
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
  // 1. Sales
  {
    id: 'sales',
    name: 'Sales',
    icon: '💼',
    description: 'Customer acquisition, quote preparation, order processing',
    colorClass: 'bg-indigo-500',
    baseCostCHF: 5,
    perModuleCostCHF: 3,
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
    baseCostCHF: 5,
    perModuleCostCHF: 0,
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
    description: 'Glass, cells, backsheet, encapsulant, ribbons, junction boxes',
    colorClass: 'bg-amber-500',
    baseCostCHF: 0,
    perModuleCostCHF: 0,
    subSteps: [],
  },
  // 4. String Production
  {
    id: 'string-production',
    name: 'String Production',
    icon: '🔗',
    description: 'Cell sorting, tabbing & stringing, inspection',
    colorClass: 'bg-green-500',
    baseCostCHF: 0,
    perModuleCostCHF: 0,
    subSteps: [
      { id: 'cell-sorting', name: 'Cell sorting', machineMinutes: 1.5, operatorMinutes: 1, machineCostPerHour: 60, operatorCostPerHour: 28 },
      { id: 'tabbing-stringing', name: 'Tabbing & stringing', machineMinutes: 3, operatorMinutes: 2, machineCostPerHour: 80, operatorCostPerHour: 28 },
      { id: 'string-inspection', name: 'String inspection', machineMinutes: 1.5, operatorMinutes: 1, machineCostPerHour: 50, operatorCostPerHour: 28 },
    ],
  },
  // 5. Frontend (lay-up) – new substeps per user spec
  {
    id: 'frontend',
    name: 'Frontend',
    icon: '🔲',
    description: 'Front glass cleaning, layup, string placement, soldering, testing',
    colorClass: 'bg-cyan-500',
    baseCostCHF: 0,
    perModuleCostCHF: 0,
    subSteps: [
      { id: 'fe-frontglass-clean', name: 'Clean front glass', machineMinutes: 2, operatorMinutes: 1, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'fe-frontglass-place', name: 'Place front glass', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'fe-solder-pads', name: 'Place solder pads', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'fe-strings-place', name: 'Place strings', machineMinutes: 3, operatorMinutes: 3, machineCostPerHour: 60, operatorCostPerHour: 28 },
      { id: 'fe-cross-solder', name: 'Solder cross-connectors', machineMinutes: 2, operatorMinutes: 2, machineCostPerHour: 50, operatorCostPerHour: 28 },
      { id: 'fe-tedlar-tape', name: 'Apply Tedlar tape', machineMinutes: 1, operatorMinutes: 1, machineCostPerHour: 30, operatorCostPerHour: 28 },
      { id: 'fe-corner-tape', name: 'Tape corners at cross-connectors', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 30, operatorCostPerHour: 28 },
      { id: 'fe-string-repair', name: 'String repair (if broken)', machineMinutes: 0, operatorMinutes: 3, machineCostPerHour: 0, operatorCostPerHour: 28 },
      { id: 'fe-backfoil-place', name: 'Place back foil', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'fe-backglass-place', name: 'Place back glass', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'fe-el-test', name: 'EL test', machineMinutes: 2, operatorMinutes: 1, machineCostPerHour: 50, operatorCostPerHour: 28 },
      { id: 'fe-trimming', name: 'Trim overhanging foil', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
    ],
  },
  // 6. Backend – new substeps per user spec
  {
    id: 'backend',
    name: 'Backend',
    icon: '⚙️',
    description: 'Lamination aid removal, inspection, junction box, trimming, packaging',
    colorClass: 'bg-purple-500',
    baseCostCHF: 0,
    perModuleCostCHF: 0,
    subSteps: [
      { id: 'be-remove-aids', name: 'Remove lamination aids & tape', machineMinutes: 0, operatorMinutes: 2, machineCostPerHour: 0, operatorCostPerHour: 28 },
      { id: 'be-visual-inspect', name: 'Visual inspection', machineMinutes: 0, operatorMinutes: 2, machineCostPerHour: 0, operatorCostPerHour: 28 },
      { id: 'be-el-test', name: 'EL test', machineMinutes: 2, operatorMinutes: 1, machineCostPerHour: 50, operatorCostPerHour: 28 },
      { id: 'be-batch-modules', name: 'Batch modules', machineMinutes: 0, operatorMinutes: 1, machineCostPerHour: 0, operatorCostPerHour: 28 },
      { id: 'be-rough-trimming', name: 'Rough trimming', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'be-cross-conn-bend', name: 'Remove & bend cross-connector tabs', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 30, operatorCostPerHour: 28 },
      { id: 'be-jbox-pot', name: 'Pot junction box', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'be-jbox-place', name: 'Place junction box', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'be-jbox-solder', name: 'Solder junction box', machineMinutes: 2, operatorMinutes: 2, machineCostPerHour: 50, operatorCostPerHour: 28 },
      { id: 'be-flash-test', name: 'Flash test module', machineMinutes: 2, operatorMinutes: 1, machineCostPerHour: 60, operatorCostPerHour: 28 },
      { id: 'be-jbox-potting-fill', name: 'Fill junction box with potting compound', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 30, operatorCostPerHour: 28 },
      { id: 'be-dry', name: 'Let dry', machineMinutes: 8, operatorMinutes: 0, machineCostPerHour: 10, operatorCostPerHour: 0 },
      { id: 'be-clean-glass', name: 'Clean module glass', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 30, operatorCostPerHour: 28 },
      { id: 'be-fine-trimming', name: 'Fine trimming of edges', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'be-jbox-lid', name: 'Place junction box lid', machineMinutes: 0, operatorMinutes: 1, machineCostPerHour: 0, operatorCostPerHour: 28 },
      { id: 'be-arrange', name: 'Arrange modules', machineMinutes: 0, operatorMinutes: 2, machineCostPerHour: 0, operatorCostPerHour: 28 },
      { id: 'be-backrails', name: 'Mount backrails', machineMinutes: 2, operatorMinutes: 3, machineCostPerHour: 40, operatorCostPerHour: 28 },
      { id: 'be-pack', name: 'Package', machineMinutes: 1, operatorMinutes: 2, machineCostPerHour: 30, operatorCostPerHour: 28 },
    ],
  },
  // 7. Shipment (packaging section removed, shipment remains)
  {
    id: 'shipment',
    name: 'Shipment',
    icon: '🚚',
    description: 'Warehousing, logistics, transport, delivery',
    colorClass: 'bg-red-500',
    baseCostCHF: 3,
    perModuleCostCHF: 2,
    subSteps: [
      { id: 'warehousing', name: 'Warehousing', machineMinutes: 2, operatorMinutes: 2, machineCostPerHour: 30, operatorCostPerHour: 25 },
      { id: 'transport-prep', name: 'Transport preparation', machineMinutes: 1, operatorMinutes: 3, machineCostPerHour: 20, operatorCostPerHour: 25 },
    ],
  },
];

export const DEFAULT_MATERIAL_CONFIG: MaterialConfig = {
  cellPrices: {
    'G1-full-black-a': 0.22,
    'G1-totally-black-b': 0.30,
    'G1-solarcolor-b': 0.35,
    'M6-totally-black-a': 0.25,
    'M6-solarcolor-a': 0.30,
    'M10-full-black-a': 0.28,
    'M10-totally-black-b': 0.38,
    'M10-solarcolor-b': 0.42,
    'G12-full-black-c': 0.45,
    'G12-totally-black-c': 0.55,
    'G12-solarcolor-c': 0.60,
    'custom': 0.28,
  },
  backsheetPerM2: 4,
  encapsulantPerM2: 3.5,
  ribbonPerCell: 0.03,
  junctionBoxCost: 3,
};

export const DEFAULT_STRING_CONFIG: StringConfig = {
  nonStandardSetupCost: 12,    // CHF, machine re-setup
  printingCostPerString: 1.5,  // CHF per printed string
};

export const DEFAULT_SPACING_CONFIG: SpacingConfig = {
  standardX: 2,
  standardY: 2,
  nonStandardCostFactor: 1.15,  // 15% surcharge
};

export const DEFAULT_MARGIN_CONFIG: MarginConfig = {
  standardMinMm: 25,           // >= 25 mm -> standard cost
  tightThresholdMm: 20,        // < 20 mm -> tight cost
  mediumCostFactor: 1.15,      // 20-24 mm -> 15% surcharge
  tightCostFactor: 1.35,       // < 20 mm -> 35% surcharge
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
  numStrings: number;
  cellTypeId: string;
  frontGlassId: string;
  backGlassId: string;
  frontGlassPricePerM2: number;
  backGlassPricePerM2: number;
  isStandardString: boolean;
  stringsPrinted: boolean;
  useStandardSpacing: boolean;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  junctionBoxCount: number;
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
    let cost = section.baseCostCHF + section.perModuleCostCHF;
    const { costs: subStepCosts, total: subStepTotal } = computeSubStepCosts(section.subSteps);

    switch (section.id) {
      case 'material': {
        // BOM: cells (moved here from string production)
        const cellPrice = materialConfig.cellPrices[params.cellTypeId] ?? 0.28;
        cost += cellPrice * params.totalCells;
        // BOM: glass (front + back)
        cost += params.frontGlassPricePerM2 * params.areaM2;
        cost += params.backGlassPricePerM2 * params.areaM2;
        // BOM: other
        cost += materialConfig.backsheetPerM2 * params.areaM2;
        cost += materialConfig.encapsulantPerM2 * params.areaM2;
        cost += materialConfig.ribbonPerCell * params.totalCells;
        cost += materialConfig.junctionBoxCost * params.junctionBoxCount;
        break;
      }

      case 'string-production': {
        // Machine setup if non-standard
        if (!params.isStandardString) cost += stringConfig.nonStandardSetupCost;
        // Process cost with spacing factor
        cost += subStepTotal * spacingFactor;
        // Printing cost
        if (params.stringsPrinted) cost += stringConfig.printingCostPerString * params.numStrings;
        break;
      }

      case 'frontend':
        cost += subStepTotal * spacingFactor * marginFactor;
        break;

      case 'backend':
        cost += subStepTotal * marginFactor;
        break;

      default:
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

// ════════════════════════════════════════════
// Cost optimization helpers
// ════════════════════════════════════════════

// Compute the "best case" cost for the same power output:
// standard layout, cheapest cell per Wp, category (a) glass
export function computeOptimalCost(
  sections: ProductionSection[],
  materialConfig: MaterialConfig,
  stringConfig: StringConfig,
  spacingConfig: SpacingConfig,
  marginConfig: MarginConfig,
  currentParams: ModuleCostParams,
  _currentPowerWp: number,
): number {
  // Use same params but with standard layout
  const optimalParams: ModuleCostParams = {
    ...currentParams,
    isStandardString: true,
    useStandardSpacing: true,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 25,
    marginRight: 25,
  };
  const { totalCost } = calculateCosts(sections, materialConfig, stringConfig, spacingConfig, marginConfig, optimalParams);
  return totalCost;
}
