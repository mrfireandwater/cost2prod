import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { SolarModule, SubmoduleConfig, SubmoduleRotation } from '../../models/solarModule';
import {
  MODULE_COLOR_TYPES,
  CELL_TYPE_DEFINITIONS,
  GLASS_TYPE_DEFINITIONS,
  getCellTypeDef,
  computeSubmoduleCells,
} from '../../models/solarModule';
import type { ProductionSection, ProductionSubStep } from '../../models/production';

function NumberInput({
  label, value, onChange, unit, min, max, step,
}: {
  label: string; value: number; onChange: (v: number) => void;
  unit?: string; min?: number; max?: number; step?: number;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-slate-500">
        {label} {unit && <span className="text-slate-400">({unit})</span>}
      </span>
      <input
        type="number"
        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

// ── Collapsible section wrapper ──
function Collapsible({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        {title}
        <span className="text-slate-400">{open ? '\u2212' : '+'}</span>
      </button>
      {open && <div className="border-t border-slate-200 px-3 py-2">{children}</div>}
    </div>
  );
}

const ROTATIONS: SubmoduleRotation[] = [0, 90, 180, 270];

// ── Submodule settings ──
function SubmoduleSettings({
  sub,
  moduleId,
  subKey,
  label,
}: {
  sub: SubmoduleConfig;
  moduleId: string;
  subKey: 'submodule1' | 'submodule2';
  label: string;
}) {
  const { updateSubmodule, materialConfig } = useAppContext();
  const upd = (u: Partial<SubmoduleConfig>) => updateSubmodule(moduleId, subKey, u);
  const cellDef = getCellTypeDef(sub.cellTypeId);
  const cellPrice = materialConfig.cellPrices[sub.cellTypeId] ?? cellDef.priceCHF;
  const totalCells = computeSubmoduleCells(sub);

  return (
    <Collapsible title={label}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <NumberInput label="Strings" value={sub.stringAmount} min={1} max={30} onChange={(v) => upd({ stringAmount: v })} />
        <NumberInput label="Cells/string" value={sub.cellsPerString} min={1} max={30} onChange={(v) => upd({ cellsPerString: v })} />
        <label className="flex flex-col gap-0.5 col-span-2">
          <span className="text-[11px] font-medium text-slate-500">Cell type</span>
          <select className="rounded border border-slate-300 bg-white px-2 py-1 text-xs" value={sub.cellTypeId} onChange={(e) => upd({ cellTypeId: e.target.value })}>
            {CELL_TYPE_DEFINITIONS.map((ct) => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-slate-500">Price per cell</span>
          <div className="rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
            {cellPrice.toFixed(2)} CHF
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-slate-500">Total cells</span>
          <div className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">{totalCells}</div>
        </div>
        <label className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-slate-500">Rotation</span>
          <select className="rounded border border-slate-300 bg-white px-2 py-1 text-xs" value={sub.rotation} onChange={(e) => upd({ rotation: Number(e.target.value) as SubmoduleRotation })}>
            {ROTATIONS.map((r) => <option key={r} value={r}>{r}°</option>)}
          </select>
        </label>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={sub.halfCut} onChange={(e) => upd({ halfCut: e.target.checked })} className="rounded" />
          Half-cut
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={sub.standardLayout} onChange={(e) => upd({ standardLayout: e.target.checked })} className="rounded" />
          Standard layout
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={sub.blackRibbonsAndConnectors} onChange={(e) => upd({ blackRibbonsAndConnectors: e.target.checked })} className="rounded" />
          Black ribbons
        </label>
      </div>
      {!sub.standardLayout && (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <NumberInput label="Border X" value={sub.distanceToBorderX} unit="mm" min={0} step={1} onChange={(v) => upd({ distanceToBorderX: v })} />
          <NumberInput label="Border Y" value={sub.distanceToBorderY} unit="mm" min={0} step={1} onChange={(v) => upd({ distanceToBorderY: v })} />
          <NumberInput label="Cell spacing" value={sub.distanceBetweenCells} unit="mm" min={0} step={0.5} onChange={(v) => upd({ distanceBetweenCells: v })} />
          <NumberInput label="String spacing" value={sub.distanceBetweenStrings} unit="mm" min={0} step={0.5} onChange={(v) => upd({ distanceBetweenStrings: v })} />
        </div>
      )}
    </Collapsible>
  );
}

// ── Module settings ──
function ModuleSettings({ module }: { module: SolarModule }) {
  const { updateModule } = useAppContext();
  const id = module.id;
  const update = (updates: Partial<SolarModule>) => updateModule(id, updates);

  return (
    <div className="space-y-3">
      <Collapsible title="Module Dimensions">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <NumberInput label="Width" value={module.width} unit="mm" min={100} onChange={(v) => update({ width: v })} />
          <NumberInput label="Height" value={module.height} unit="mm" min={100} onChange={(v) => update({ height: v })} />
        </div>
      </Collapsible>

      <SubmoduleSettings sub={module.submodule1} moduleId={id} subKey="submodule1" label="Submodul 1" />

      {module.submodule2Enabled && (
        <SubmoduleSettings sub={module.submodule2} moduleId={id} subKey="submodule2" label="Submodul 2" />
      )}

      <Collapsible title="Module Color">
        <label className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-slate-500">Module color</span>
          <select className="rounded border border-slate-300 bg-white px-2 py-1 text-xs" value={module.moduleColorId} onChange={(e) => update({ moduleColorId: e.target.value })}>
            {MODULE_COLOR_TYPES.map((ct) => <option key={ct.id} value={ct.id}>{ct.label} ({(ct.factor * 100).toFixed(0)}%)</option>)}
          </select>
        </label>
      </Collapsible>

      <Collapsible title="Glass Configuration">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-0.5">
            <span className="text-[11px] font-medium text-slate-500">Front glass</span>
            <select className="rounded border border-slate-300 bg-white px-2 py-1 text-xs" value={module.frontGlassId} onChange={(e) => update({ frontGlassId: e.target.value })}>
              {GLASS_TYPE_DEFINITIONS.map((g) => <option key={g.id} value={g.id}>{g.label} ({g.transparencyEfficiency * 100}%)</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[11px] font-medium text-slate-500">Back glass</span>
            <select className="rounded border border-slate-300 bg-white px-2 py-1 text-xs" value={module.backGlassId} onChange={(e) => update({ backGlassId: e.target.value })}>
              {GLASS_TYPE_DEFINITIONS.map((g) => <option key={g.id} value={g.id}>{g.label} ({g.transparencyEfficiency * 100}%)</option>)}
            </select>
          </label>
        </div>
      </Collapsible>

      <Collapsible title="Encapsulant">
        <label className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-slate-500">Type</span>
          <select className="rounded border border-slate-300 bg-white px-2 py-1 text-xs" value={module.encapsulantType} onChange={(e) => update({ encapsulantType: e.target.value as 'EVA' | 'POE' | 'EPE' })}>
            {['EVA', 'POE', 'EPE'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </Collapsible>
    </div>
  );
}

// ── SubStep editor row ──
function SubStepRow({ sectionId, step }: { sectionId: string; step: ProductionSubStep }) {
  const { updateSubStep } = useAppContext();
  const upd = (u: Partial<ProductionSubStep>) => updateSubStep(sectionId, step.id, u);
  return (
    <div className="grid grid-cols-5 gap-1 items-end">
      <div className="text-[10px] text-slate-600 font-medium truncate col-span-1 pb-1">{step.name}</div>
      <NumberInput label="Mach. min" value={step.machineMinutes} min={0} step={0.5} onChange={(v) => upd({ machineMinutes: v })} />
      <NumberInput label="Op. min" value={step.operatorMinutes} min={0} step={0.5} onChange={(v) => upd({ operatorMinutes: v })} />
      <NumberInput label="Mach. CHF/hr" value={step.machineCostPerHour} min={0} step={1} onChange={(v) => upd({ machineCostPerHour: v })} />
      <NumberInput label="Op. CHF/hr" value={step.operatorCostPerHour} min={0} step={1} onChange={(v) => upd({ operatorCostPerHour: v })} />
    </div>
  );
}

// ── Section settings card ──
function SectionSettings({ section }: { section: ProductionSection }) {
  const { updateSection } = useAppContext();
  return (
    <Collapsible title={`${section.icon} ${section.name}`} defaultOpen={false}>
      <p className="text-[10px] text-slate-400 mb-2">{section.description}</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <NumberInput label="Base Cost" value={section.baseCostCHF} unit="CHF" min={0} step={0.5} onChange={(v) => updateSection(section.id, { baseCostCHF: v })} />
        <NumberInput label="Per Module" value={section.perModuleCostCHF} unit="CHF" min={0} step={0.5} onChange={(v) => updateSection(section.id, { perModuleCostCHF: v })} />
      </div>
      {section.subSteps.length > 0 && (
        <div className="space-y-1 mt-2">
          <div className="text-[10px] font-semibold text-slate-500 mb-1">Sub-steps (machine + operator)</div>
          {section.subSteps.map((ss) => (
            <SubStepRow key={ss.id} sectionId={section.id} step={ss} />
          ))}
        </div>
      )}
    </Collapsible>
  );
}

export default function Settings() {
  const {
    modules, selectedModuleId, selectModule, sections,
    materialConfig, updateMaterialConfig,
    stringConfig, updateStringConfig,
    spacingConfig, updateSpacingConfig,
    marginConfig, updateMarginConfig,
  } = useAppContext();
  const selectedModule = modules.find((m) => m.id === selectedModuleId) ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-2">
        <h2 className="text-sm font-bold text-slate-700">Settings</h2>
        <p className="text-[10px] text-slate-400">All editable parameters from Module Design and Production & Costs</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Module Design Parameters */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="inline-block h-3 w-1 rounded bg-blue-600" />
            Module Design Parameters
          </h3>
          {modules.length > 0 && (
            <div className="mb-3">
              <label className="flex items-center gap-2 text-xs text-slate-500">
                Module:
                <select
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                  value={selectedModuleId ?? ''}
                  onChange={(e) => selectModule(e.target.value || null)}
                >
                  <option value="">-- Select module --</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {selectedModule ? (
            <ModuleSettings module={selectedModule} />
          ) : (
            <div className="rounded border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400">
              Select a module above to edit its parameters
            </div>
          )}
        </section>

        {/* Production & Cost Parameters */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="inline-block h-3 w-1 rounded bg-amber-500" />
            Production & Cost Parameters
          </h3>

          <div className="space-y-2">
            {sections.map((s) => {
              if (s.id === 'material') {
                return (
                  <Collapsible key={s.id} title={`${s.icon} ${s.name}`} defaultOpen={false}>
                    <p className="text-[10px] text-slate-400 mb-2">{s.description}</p>

                    {/* Cell prices (per cell type) */}
                    <div className="text-[10px] font-semibold text-slate-500 mb-1">Cell prices (CHF per cell)</div>
                    <div className="overflow-x-auto mb-2">
                      <table className="text-[10px] w-full">
                        <thead>
                          <tr className="text-slate-500">
                            <th className="text-left py-0.5 pr-2">Cell Type</th>
                            <th className="text-right py-0.5 px-1">CHF/cell</th>
                          </tr>
                        </thead>
                        <tbody>
                          {CELL_TYPE_DEFINITIONS.map((ct) => (
                            <tr key={ct.id} className="border-t border-slate-100">
                              <td className="py-0.5 pr-2 font-medium text-slate-600">{ct.label}</td>
                              <td className="py-0.5 px-1">
                                <input
                                  type="number"
                                  className="w-16 rounded border border-slate-200 px-1 py-0.5 text-[10px] text-right focus:border-blue-500 focus:outline-none"
                                  value={materialConfig.cellPrices[ct.id] ?? ct.priceCHF}
                                  min={0}
                                  step={0.01}
                                  onChange={(e) => {
                                    const updated = { ...materialConfig.cellPrices, [ct.id]: Number(e.target.value) };
                                    updateMaterialConfig({ cellPrices: updated });
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Glass prices */}
                    <div className="text-[10px] font-semibold text-slate-500 mb-1 mt-3">Glass types & prices (CHF/m2)</div>
                    <div className="overflow-x-auto mb-2">
                      <table className="text-[10px] w-full">
                        <thead>
                          <tr className="text-slate-500">
                            <th className="text-left py-0.5 pr-2">Glass Type</th>
                            <th className="text-right py-0.5 px-1">Efficiency</th>
                            <th className="text-right py-0.5 px-1">CHF/m2</th>
                          </tr>
                        </thead>
                        <tbody>
                          {GLASS_TYPE_DEFINITIONS.map((g) => (
                            <tr key={g.id} className="border-t border-slate-100">
                              <td className="py-0.5 pr-2 font-medium text-slate-600">{g.label}</td>
                              <td className="py-0.5 px-1 text-right text-slate-500">{(g.transparencyEfficiency * 100).toFixed(0)}%</td>
                              <td className="py-0.5 px-1 text-right text-slate-600">{g.priceCHFPerM2}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="text-[10px] font-semibold text-slate-500 mb-1 mt-3">Other materials</div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <NumberInput label="Backsheet" value={materialConfig.backsheetPerM2} unit="CHF/m2" min={0} step={0.5} onChange={(v) => updateMaterialConfig({ backsheetPerM2: v })} />
                      <NumberInput label="Encapsulant" value={materialConfig.encapsulantPerM2} unit="CHF/m2" min={0} step={0.5} onChange={(v) => updateMaterialConfig({ encapsulantPerM2: v })} />
                      <NumberInput label="Ribbon/cell" value={materialConfig.ribbonPerCell} unit="CHF" min={0} step={0.005} onChange={(v) => updateMaterialConfig({ ribbonPerCell: v })} />
                      <NumberInput label="Junction box" value={materialConfig.junctionBoxCost} unit="CHF" min={0} step={0.5} onChange={(v) => updateMaterialConfig({ junctionBoxCost: v })} />
                    </div>
                  </Collapsible>
                );
              }

              if (s.id === 'string-production') {
                return (
                  <Collapsible key={s.id} title={`${s.icon} ${s.name}`} defaultOpen={false}>
                    <p className="text-[10px] text-slate-400 mb-2">{s.description}</p>

                    <div className="text-[10px] font-semibold text-slate-500 mb-1">String production costs</div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <NumberInput label="Non-standard setup" value={stringConfig.nonStandardSetupCost} unit="CHF" min={0} step={1} onChange={(v) => updateStringConfig({ nonStandardSetupCost: v })} />
                      <NumberInput label="Printing / string" value={stringConfig.printingCostPerString} unit="CHF" min={0} step={0.1} onChange={(v) => updateStringConfig({ printingCostPerString: v })} />
                    </div>

                    {s.subSteps.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <div className="text-[10px] font-semibold text-slate-500 mb-1">Sub-steps</div>
                        {s.subSteps.map((ss) => (
                          <SubStepRow key={ss.id} sectionId={s.id} step={ss} />
                        ))}
                      </div>
                    )}
                  </Collapsible>
                );
              }

              return <SectionSettings key={s.id} section={s} />;
            })}

            {/* Spacing & Margin configs */}
            <Collapsible title="Spacing & Margin Thresholds" defaultOpen={false}>
              <div className="text-[10px] font-semibold text-slate-500 mb-1">Standard spacing (mm)</div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <NumberInput label="Standard X" value={spacingConfig.standardX} unit="mm" min={0} step={0.5} onChange={(v) => updateSpacingConfig({ standardX: v })} />
                <NumberInput label="Standard Y" value={spacingConfig.standardY} unit="mm" min={0} step={0.5} onChange={(v) => updateSpacingConfig({ standardY: v })} />
                <NumberInput label="Non-std factor" value={spacingConfig.nonStandardCostFactor} min={1} step={0.01} onChange={(v) => updateSpacingConfig({ nonStandardCostFactor: v })} />
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mb-1">Margin thresholds</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <NumberInput label="Standard min" value={marginConfig.standardMinMm} unit="mm" min={0} onChange={(v) => updateMarginConfig({ standardMinMm: v })} />
                <NumberInput label="Tight threshold" value={marginConfig.tightThresholdMm} unit="mm" min={0} onChange={(v) => updateMarginConfig({ tightThresholdMm: v })} />
                <NumberInput label="Medium factor" value={marginConfig.mediumCostFactor} min={1} step={0.01} onChange={(v) => updateMarginConfig({ mediumCostFactor: v })} />
                <NumberInput label="Tight factor" value={marginConfig.tightCostFactor} min={1} step={0.01} onChange={(v) => updateMarginConfig({ tightCostFactor: v })} />
              </div>
            </Collapsible>
          </div>
        </section>
      </div>
    </div>
  );
}
