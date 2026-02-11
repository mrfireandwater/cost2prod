import type { SolarModule } from './solarModule';

export interface ProductionStep {
  id: string;
  name: string;
  description: string;
}

export interface SubcategoryCostModel {
  baseCostEur: number;
  perCellCostEur: number;
  perM2CostEur: number;
}

export interface ProductionSubcategory {
  id: string;
  name: string;
  costModel: SubcategoryCostModel;
}

export interface ProductionSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: ProductionStep[];
  subcategories: ProductionSubcategory[];
  colorClass: string;
  // Cost model: base cost + per-cell cost + per-m2 cost
  baseCostEur: number;
  perCellCostEur: number;
  perM2CostEur: number;
}

export const FRONTEND_SUBCATEGORIES: ProductionSubcategory[] = [
  { id: 'glass-cleaning', name: 'Glass Cleaning', costModel: { baseCostEur: 0.30, perCellCostEur: 0, perM2CostEur: 0.25 } },
  { id: 'front-encapsulant-deposition', name: 'Front Encapsulant Deposition', costModel: { baseCostEur: 0.20, perCellCostEur: 0, perM2CostEur: 0.40 } },
  { id: 'layup', name: 'Layup', costModel: { baseCostEur: 0.50, perCellCostEur: 0.005, perM2CostEur: 0.30 } },
  { id: 'crossconnector-soldering', name: 'Cross Connector Soldering', costModel: { baseCostEur: 0.40, perCellCostEur: 0.003, perM2CostEur: 0 } },
  { id: 'masking-tape-application', name: 'Masking Tape Application', costModel: { baseCostEur: 0.20, perCellCostEur: 0, perM2CostEur: 0.15 } },
  { id: 'back-encapsulant-deposition', name: 'Back Encapsulant Deposition', costModel: { baseCostEur: 0.20, perCellCostEur: 0, perM2CostEur: 0.40 } },
  { id: 'pairing', name: 'Pairing', costModel: { baseCostEur: 0.30, perCellCostEur: 0.002, perM2CostEur: 0 } },
  { id: 'el-test-pre', name: 'EL-Test (Pre-Lamination)', costModel: { baseCostEur: 0.50, perCellCostEur: 0, perM2CostEur: 0.20 } },
  { id: 'taping-lamination-frame', name: 'Taping + Lamination Frame Assembly', costModel: { baseCostEur: 0.60, perCellCostEur: 0, perM2CostEur: 0.50 } },
  { id: 'lamination', name: 'Lamination', costModel: { baseCostEur: 0.80, perCellCostEur: 0.01, perM2CostEur: 0.80 } },
];

export const BACKEND_SUBCATEGORIES: ProductionSubcategory[] = [
  { id: 'tape-frame-removal', name: 'Tape and Frame Removal', costModel: { baseCostEur: 0.30, perCellCostEur: 0, perM2CostEur: 0.20 } },
  { id: 'el-test-post', name: 'EL-Test Post Lamination', costModel: { baseCostEur: 0.50, perCellCostEur: 0, perM2CostEur: 0.20 } },
  { id: 'early-trimming', name: 'Early Trimming', costModel: { baseCostEur: 0.30, perCellCostEur: 0, perM2CostEur: 0.15 } },
  { id: 'junction-box-assembly', name: 'Junction Box Assembly', costModel: { baseCostEur: 0.40, perCellCostEur: 0, perM2CostEur: 0 } },
  { id: 'junction-box-soldering', name: 'Junction Box Soldering', costModel: { baseCostEur: 0.30, perCellCostEur: 0, perM2CostEur: 0 } },
  { id: 'junction-box-potting', name: 'Junction Box Potting', costModel: { baseCostEur: 0.25, perCellCostEur: 0, perM2CostEur: 0 } },
  { id: 'flash-test', name: 'Flash-Test', costModel: { baseCostEur: 0.50, perCellCostEur: 0, perM2CostEur: 0.20 } },
  { id: 'trimming-finish', name: 'Trimming Finish', costModel: { baseCostEur: 0.30, perCellCostEur: 0, perM2CostEur: 0.15 } },
  { id: 'cleaning', name: 'Cleaning', costModel: { baseCostEur: 0.20, perCellCostEur: 0, perM2CostEur: 0.20 } },
  { id: 'back-rail-assembly', name: 'Back Rail Assembly', costModel: { baseCostEur: 0.50, perCellCostEur: 0, perM2CostEur: 0.30 } },
  { id: 'curing', name: 'Curing', costModel: { baseCostEur: 0.30, perCellCostEur: 0, perM2CostEur: 0.40 } },
  { id: 'packaging', name: 'Packaging', costModel: { baseCostEur: 0.20, perCellCostEur: 0, perM2CostEur: 0.20 } },
];

export const DEFAULT_SECTIONS: ProductionSection[] = [
  {
    id: 'planning',
    name: 'Planning',
    icon: '📐',
    description: 'Engineering, module design, layout planning, certifications',
    steps: [],
    subcategories: [],
    colorClass: 'bg-blue-500',
    baseCostEur: 15,
    perCellCostEur: 0,
    perM2CostEur: 2,
  },
  {
    id: 'material',
    name: 'Material Cost',
    icon: '📦',
    description: 'Cells, glass, backsheet, frame, ribbons, encapsulant, junction box',
    steps: [],
    subcategories: [],
    colorClass: 'bg-amber-500',
    baseCostEur: 5,
    perCellCostEur: 0.45,
    perM2CostEur: 18,
  },
  {
    id: 'string-production',
    name: 'String Production',
    icon: '🔗',
    description: 'Cell sorting, tabbing & stringing, string inspection',
    steps: [],
    subcategories: [],
    colorClass: 'bg-green-500',
    baseCostEur: 3,
    perCellCostEur: 0.08,
    perM2CostEur: 0,
  },
  {
    id: 'frontend',
    name: 'Frontend',
    icon: '🔲',
    description: 'Glass cleaning, encapsulant layup, cell matrix placement, EL test pre-lamination',
    steps: [],
    subcategories: [...FRONTEND_SUBCATEGORIES],
    colorClass: 'bg-cyan-500',
    baseCostEur: 4,
    perCellCostEur: 0.02,
    perM2CostEur: 3,
  },
  {
    id: 'backend',
    name: 'Backend',
    icon: '⚙️',
    description: 'Lamination, trimming, framing, junction box mounting, curing',
    steps: [],
    subcategories: [...BACKEND_SUBCATEGORIES],
    colorClass: 'bg-purple-500',
    baseCostEur: 5,
    perCellCostEur: 0.01,
    perM2CostEur: 4,
  },
  {
    id: 'packaging-section',
    name: 'Packaging',
    icon: '📋',
    description: 'Final EL test, flash test, visual inspection, labeling, palletizing',
    steps: [],
    subcategories: [],
    colorClass: 'bg-orange-500',
    baseCostEur: 3,
    perCellCostEur: 0,
    perM2CostEur: 1.5,
  },
  {
    id: 'shipment',
    name: 'Shipment',
    icon: '🚚',
    description: 'Logistics, transport, delivery',
    steps: [],
    subcategories: [],
    colorClass: 'bg-red-500',
    baseCostEur: 2,
    perCellCostEur: 0,
    perM2CostEur: 1,
  },
];

export interface SubcategoryCost {
  subcategoryId: string;
  subcategoryName: string;
  cost: number;
}

export interface SectionCost {
  sectionId: string;
  sectionName: string;
  cost: number;
  percentage: number;
  colorClass: string;
  subcategoryCosts: SubcategoryCost[];
}

export function calculateSubcategoryCost(
  sub: ProductionSubcategory,
  totalCells: number,
  moduleAreaM2: number,
  _module?: SolarModule
): number {
  const cost =
    sub.costModel.baseCostEur +
    sub.costModel.perCellCostEur * totalCells +
    sub.costModel.perM2CostEur * moduleAreaM2;
  return Math.round(cost * 100) / 100;
}

export function calculateCostsForModule(
  sections: ProductionSection[],
  totalCells: number,
  moduleAreaM2: number,
  module?: SolarModule
): { sectionCosts: SectionCost[]; totalCost: number } {
  const sectionCosts: SectionCost[] = sections.map((s) => {
    // Calculate subcategory costs
    const subcategoryCosts: SubcategoryCost[] = s.subcategories.map((sub) => ({
      subcategoryId: sub.id,
      subcategoryName: sub.name,
      cost: calculateSubcategoryCost(sub, totalCells, moduleAreaM2, module),
    }));

    // Section-level cost = base + per-cell + per-m2
    const sectionBaseCost = s.baseCostEur + s.perCellCostEur * totalCells + s.perM2CostEur * moduleAreaM2;

    // If subcategories exist, total cost is sum of subcategory costs
    // Otherwise use the section-level cost
    const cost = subcategoryCosts.length > 0
      ? subcategoryCosts.reduce((sum, sc) => sum + sc.cost, 0)
      : sectionBaseCost;

    return {
      sectionId: s.id,
      sectionName: s.name,
      cost: Math.round(cost * 100) / 100,
      percentage: 0,
      colorClass: s.colorClass,
      subcategoryCosts,
    };
  });
  const totalCost = sectionCosts.reduce((sum, sc) => sum + sc.cost, 0);
  for (const sc of sectionCosts) {
    sc.percentage = totalCost > 0 ? Math.round((sc.cost / totalCost) * 1000) / 10 : 0;
  }
  return { sectionCosts, totalCost: Math.round(totalCost * 100) / 100 };
}
