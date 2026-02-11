export interface ProductionStep {
  id: string;
  name: string;
  description: string;
}

export interface ProductionSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: ProductionStep[];
  colorClass: string;
  // Cost model: base cost + per-cell cost + per-m2 cost
  baseCostEur: number;
  perCellCostEur: number;
  perM2CostEur: number;
}

export const DEFAULT_SECTIONS: ProductionSection[] = [
  {
    id: 'planning',
    name: 'Planning',
    icon: '📐',
    description: 'Engineering, module design, layout planning, certifications',
    steps: [],
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
    colorClass: 'bg-green-500',
    baseCostEur: 3,
    perCellCostEur: 0.08,
    perM2CostEur: 0,
  },
  {
    id: 'frontend',
    name: 'Frontend',
    icon: '🔲',
    description: 'Glass cleaning, EVA/POE layup, cell matrix placement, EL test pre-lamination',
    steps: [],
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
    colorClass: 'bg-purple-500',
    baseCostEur: 5,
    perCellCostEur: 0.01,
    perM2CostEur: 4,
  },
  {
    id: 'packaging',
    name: 'Packaging',
    icon: '📋',
    description: 'Final EL test, flash test, visual inspection, labeling, palletizing',
    steps: [],
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
    colorClass: 'bg-red-500',
    baseCostEur: 2,
    perCellCostEur: 0,
    perM2CostEur: 1,
  },
];

export interface SectionCost {
  sectionId: string;
  sectionName: string;
  cost: number;
  percentage: number;
  colorClass: string;
}

export function calculateCostsForModule(
  sections: ProductionSection[],
  totalCells: number,
  moduleAreaM2: number
): { sectionCosts: SectionCost[]; totalCost: number } {
  const sectionCosts: SectionCost[] = sections.map((s) => {
    const cost = s.baseCostEur + s.perCellCostEur * totalCells + s.perM2CostEur * moduleAreaM2;
    return {
      sectionId: s.id,
      sectionName: s.name,
      cost: Math.round(cost * 100) / 100,
      percentage: 0,
      colorClass: s.colorClass,
    };
  });
  const totalCost = sectionCosts.reduce((sum, sc) => sum + sc.cost, 0);
  for (const sc of sectionCosts) {
    sc.percentage = totalCost > 0 ? Math.round((sc.cost / totalCost) * 1000) / 10 : 0;
  }
  return { sectionCosts, totalCost: Math.round(totalCost * 100) / 100 };
}
