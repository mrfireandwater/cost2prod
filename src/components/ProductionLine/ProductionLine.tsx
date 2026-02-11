import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { SubcategoryCostModel } from '../../models/production';

const SECTION_COLORS: Record<string, string> = {
  planning: '#3b82f6',
  material: '#f59e0b',
  'string-production': '#22c55e',
  frontend: '#06b6d4',
  backend: '#a855f7',
  'packaging-section': '#f97316',
  shipment: '#ef4444',
};

function SubcategoryCostInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] text-slate-400">{label}</span>
      <input
        type="number"
        step={0.01}
        min={0}
        className="w-full rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export default function ProductionLine() {
  const { sections, sectionCosts, selectedModule, totalCost, updateSubcategoryCost } = useAppContext();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    frontend: true,
    backend: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-3 py-2">
        <h2 className="text-sm font-bold text-slate-700">Production Line</h2>
        {selectedModule && (
          <p className="text-xs text-slate-400">
            Cost breakdown for: {selectedModule.name} | Total: <span className="font-bold text-slate-700">{totalCost.toFixed(2)} EUR</span>
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!selectedModule ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Select a module to see production costs
          </div>
        ) : (
          <div className="space-y-2">
            {/* Visual production flow */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {sections.map((section, i) => {
                const cost = sectionCosts.find((sc) => sc.sectionId === section.id);
                return (
                  <div key={section.id} className="flex items-center">
                    <div
                      className="flex min-w-[100px] flex-col items-center rounded-lg p-2 text-white shadow-sm transition-transform hover:scale-105"
                      style={{ backgroundColor: SECTION_COLORS[section.id] || '#6b7280' }}
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span className="text-[10px] font-bold text-center leading-tight">{section.name}</span>
                      {cost && (
                        <span className="mt-1 text-[10px] font-medium bg-black/20 rounded px-1">
                          {cost.cost.toFixed(2)} EUR
                        </span>
                      )}
                    </div>
                    {i < sections.length - 1 && (
                      <div className="mx-0.5 text-slate-300 text-lg">&#8594;</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cost bar visualization */}
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-slate-600 mb-2">Cost Distribution</h3>
              <div className="flex h-8 w-full overflow-hidden rounded-lg">
                {sectionCosts.map((sc) => (
                  <div
                    key={sc.sectionId}
                    className="flex items-center justify-center text-[9px] font-bold text-white transition-all"
                    style={{
                      width: `${sc.percentage}%`,
                      backgroundColor: SECTION_COLORS[sc.sectionId] || '#6b7280',
                      minWidth: sc.percentage > 0 ? '20px' : '0',
                    }}
                    title={`${sc.sectionName}: ${sc.cost.toFixed(2)} EUR (${sc.percentage}%)`}
                  >
                    {sc.percentage > 8 ? `${sc.percentage}%` : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed section cards */}
            <div className="mt-4 space-y-2">
              {sections.map((section) => {
                const cost = sectionCosts.find((sc) => sc.sectionId === section.id);
                const hasSubcategories = section.subcategories.length > 0;
                const isExpanded = expandedSections[section.id] ?? false;

                return (
                  <div
                    key={section.id}
                    className="rounded-lg border border-slate-200 bg-white shadow-sm"
                  >
                    {/* Section header */}
                    <div
                      className={`flex items-start justify-between p-3 ${hasSubcategories ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                      onClick={() => hasSubcategories && toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                          style={{ backgroundColor: SECTION_COLORS[section.id] || '#6b7280' }}
                        >
                          {section.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                            {section.name}
                            {hasSubcategories && (
                              <span className="text-xs text-slate-400">
                                {isExpanded ? '▼' : '▶'} {section.subcategories.length} steps
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-400">{section.description}</p>
                        </div>
                      </div>
                      {cost && (
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-800">{cost.cost.toFixed(2)} EUR</div>
                          <div className="text-xs text-slate-400">{cost.percentage}%</div>
                        </div>
                      )}
                    </div>

                    {/* Section-level cost breakdown (for sections without subcategories) */}
                    {!hasSubcategories && (
                      <div className="border-t border-slate-100 px-3 pb-3 pt-2">
                        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                          <div>
                            Base: <span className="font-medium text-slate-600">{section.baseCostEur.toFixed(2)} EUR</span>
                          </div>
                          <div>
                            Per cell: <span className="font-medium text-slate-600">{section.perCellCostEur.toFixed(2)} EUR</span>
                          </div>
                          <div>
                            Per m2: <span className="font-medium text-slate-600">{section.perM2CostEur.toFixed(2)} EUR</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subcategories (expandable) */}
                    {hasSubcategories && isExpanded && (
                      <div className="border-t border-slate-100">
                        {section.subcategories.map((sub, idx) => {
                          const subCost = cost?.subcategoryCosts.find((sc) => sc.subcategoryId === sub.id);
                          return (
                            <div
                              key={sub.id}
                              className={`px-3 py-2 ${idx < section.subcategories.length - 1 ? 'border-b border-slate-50' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-medium text-slate-600">{sub.name}</span>
                                {subCost && (
                                  <span className="text-xs font-bold text-slate-700">{subCost.cost.toFixed(2)} EUR</span>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <SubcategoryCostInput
                                  label="Base (EUR)"
                                  value={sub.costModel.baseCostEur}
                                  onChange={(v) =>
                                    updateSubcategoryCost(section.id, sub.id, { baseCostEur: v } as Partial<SubcategoryCostModel>)
                                  }
                                />
                                <SubcategoryCostInput
                                  label="Per cell (EUR)"
                                  value={sub.costModel.perCellCostEur}
                                  onChange={(v) =>
                                    updateSubcategoryCost(section.id, sub.id, { perCellCostEur: v } as Partial<SubcategoryCostModel>)
                                  }
                                />
                                <SubcategoryCostInput
                                  label="Per m2 (EUR)"
                                  value={sub.costModel.perM2CostEur}
                                  onChange={(v) =>
                                    updateSubcategoryCost(section.id, sub.id, { perM2CostEur: v } as Partial<SubcategoryCostModel>)
                                  }
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
