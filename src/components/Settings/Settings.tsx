import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { SolarModule, CellType, CellFormat, GlassType, BacksheetType, CellLayout } from '../../models/solarModule';
import type { ProductionSection, ProductionSubStep } from '../../models/production';

const CELL_TYPES: CellType[] = ['mono-PERC', 'mono-HJT', 'mono-TOPCon', 'poly', 'custom'];
const CELL_FORMATS: CellFormat[] = ['M6-166mm', 'M10-182mm', 'M12-210mm', 'custom'];
const GLASS_TYPES: GlassType[] = ['tempered-3.2mm', 'tempered-2.0mm', 'anti-glare-3.2mm', 'custom'];
const BACKSHEET_TYPES: BacksheetType[] = ['glass-glass', 'TPT', 'TPE', 'transparent', 'custom'];

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

function SelectInput<T extends string>({
  label, value, options, onChange,
}: {
  label: string; value: T; options: T[]; onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <select
        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
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
        <span className="text-slate-400">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="border-t border-slate-200 px-3 py-2">{children}</div>}
    </div>
  );
}

// ── Module settings ──
function ModuleSettings({ module }: { module: SolarModule }) {
  const { updateModule, stringConfig, marginConfig } = useAppContext();
  const id = module.id;
  const update = (updates: Partial<SolarModule>) => updateModule(id, updates);
  const updateLayout = (updates: Partial<CellLayout>) =>
    update({ cellLayout: { ...module.cellLayout, ...updates } });

  const cellPrice = stringConfig.cellPrices[module.cellType]?.[module.cellFormat] ?? 0;
  const minMargin = Math.min(module.marginTop, module.marginBottom, module.marginLeft, module.marginRight);
  const marginWarning = minMargin < marginConfig.tightThresholdMm
    ? 'Tight margins (+35% cost)'
    : minMargin < marginConfig.standardMinMm
      ? 'Medium margins (+15% cost)'
      : null;

  return (
    <div className="space-y-3">
      <Collapsible title="Cell Configuration">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SelectInput label="Cell Type" value={module.cellType} options={CELL_TYPES} onChange={(v) => update({ cellType: v })} />
          <SelectInput label="Cell Format" value={module.cellFormat} options={CELL_FORMATS} onChange={(v) => update({ cellFormat: v })} />
          <NumberInput label="Cell Size" value={module.cellSizeMm} unit="mm" min={50} max={250} onChange={(v) => update({ cellSizeMm: v })} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-medium text-slate-500">Price per cell</span>
            <div className="rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
              {cellPrice.toFixed(2)} EUR
            </div>
          </div>
        </div>
        <label className="mt-2 flex items-center gap-2 text-xs">
          <input type="checkbox" checked={module.cellLayout.halfCut} onChange={(e) => updateLayout({ halfCut: e.target.checked })} className="rounded" />
          Half-cut cells
        </label>
      </Collapsible>

      <Collapsible title="Module Dimensions">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <NumberInput label="Width" value={module.width} unit="mm" min={100} onChange={(v) => update({ width: v })} />
          <NumberInput label="Height" value={module.height} unit="mm" min={100} onChange={(v) => update({ height: v })} />
        </div>
      </Collapsible>

      <Collapsible title="Cell Layout">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <NumberInput label="Rows" value={module.cellLayout.rows} min={1} max={20} onChange={(v) => updateLayout({ rows: v })} />
          <NumberInput label="Columns" value={module.cellLayout.columns} min={1} max={20} onChange={(v) => updateLayout({ columns: v })} />
          <NumberInput label="Spacing X" value={module.cellLayout.cellSpacingX} unit="mm" min={0} step={0.5} onChange={(v) => updateLayout({ cellSpacingX: v })} />
          <NumberInput label="Spacing Y" value={module.cellLayout.cellSpacingY} unit="mm" min={0} step={0.5} onChange={(v) => updateLayout({ cellSpacingY: v })} />
        </div>
        <label className="mt-2 flex items-center gap-2 text-xs">
          <input type="checkbox" checked={module.useStandardSpacing} onChange={(e) => update({ useStandardSpacing: e.target.checked })} className="rounded" />
          Standard spacing (2/2 mm)
        </label>
        {!module.useStandardSpacing && (
          <div className="mt-1 text-[10px] text-amber-600">Non-standard spacing increases production cost</div>
        )}
      </Collapsible>

      <Collapsible title="Margins (edge to cells)">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <NumberInput label="Top" value={module.marginTop} unit="mm" min={0} onChange={(v) => update({ marginTop: v })} />
          <NumberInput label="Bottom" value={module.marginBottom} unit="mm" min={0} onChange={(v) => update({ marginBottom: v })} />
          <NumberInput label="Left" value={module.marginLeft} unit="mm" min={0} onChange={(v) => update({ marginLeft: v })} />
          <NumberInput label="Right" value={module.marginRight} unit="mm" min={0} onChange={(v) => update({ marginRight: v })} />
        </div>
        <div className="mt-1 text-[10px] text-slate-400">
          Standard min: {marginConfig.standardMinMm} mm | Tight threshold: {marginConfig.tightThresholdMm} mm
        </div>
        {marginWarning && (
          <div className="mt-1 text-[10px] text-amber-600">{marginWarning}</div>
        )}
      </Collapsible>

      <Collapsible title="Components">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SelectInput label="Glass" value={module.glassType} options={GLASS_TYPES} onChange={(v) => update({ glassType: v })} />
          <SelectInput label="Backsheet" value={module.backsheetType} options={BACKSHEET_TYPES} onChange={(v) => update({ backsheetType: v })} />
          <SelectInput label="Encapsulant" value={module.encapsulantType} options={['EVA', 'POE', 'EPE']} onChange={(v) => update({ encapsulantType: v as 'EVA' | 'POE' | 'EPE' })} />
          <label className="flex flex-col gap-0.5">
            <span className="text-[11px] font-medium text-slate-500">Ribbon Color</span>
            <input type="color" className="h-[26px] w-10 cursor-pointer rounded border border-slate-300" value={module.ribbonColor} onChange={(e) => update({ ribbonColor: e.target.value })} />
          </label>
        </div>
        <label className="mt-2 flex items-center gap-2 text-xs">
          <input type="checkbox" checked={module.isStandardString} onChange={(e) => update({ isStandardString: e.target.checked })} className="rounded" />
          Standard string layout
        </label>
        <label className="mt-1 flex items-center gap-2 text-xs">
          <input type="checkbox" checked={module.stringsPrinted} onChange={(e) => update({ stringsPrinted: e.target.checked })} className="rounded" />
          Printed strings (colored)
        </label>
        <label className="mt-2 flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-slate-500">Glass color process</span>
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            value={module.glassColorProcess}
            onChange={(e) => update({ glassColorProcess: e.target.value as 'none' | 'morpho' | 'inkjet' })}
          >
            <option value="none">None (standard)</option>
            <option value="morpho">Morpho color (structural)</option>
            <option value="inkjet">Inkjet printed</option>
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
      <NumberInput label="Mach. EUR/hr" value={step.machineCostPerHour} min={0} step={1} onChange={(v) => upd({ machineCostPerHour: v })} />
      <NumberInput label="Op. EUR/hr" value={step.operatorCostPerHour} min={0} step={1} onChange={(v) => upd({ operatorCostPerHour: v })} />
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
        <NumberInput label="Base Cost" value={section.baseCostEur} unit="EUR" min={0} step={0.5} onChange={(v) => updateSection(section.id, { baseCostEur: v })} />
        <NumberInput label="Per Module" value={section.perModuleCostEur} unit="EUR" min={0} step={0.5} onChange={(v) => updateSection(section.id, { perModuleCostEur: v })} />
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
        {/* ═══ Module Design Parameters ═══ */}
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

        {/* ═══ Production & Cost Parameters ═══ */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="inline-block h-3 w-1 rounded bg-amber-500" />
            Production & Cost Parameters
          </h3>

          <div className="space-y-2">
            {/* Section-level settings (Sales, Planning, etc.) */}
            {sections.map((s) => {
              if (s.id === 'material') {
                // Material has its own config
                return (
                  <Collapsible key={s.id} title={`${s.icon} ${s.name}`} defaultOpen={false}>
                    <p className="text-[10px] text-slate-400 mb-2">{s.description}</p>

                    {/* Glass pricing */}
                    <div className="text-[10px] font-semibold text-slate-500 mb-1">Glass base prices (EUR/m²)</div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {Object.entries(materialConfig.glassBasePrices).map(([type, price]) => (
                        <NumberInput
                          key={type}
                          label={type}
                          value={price}
                          unit="EUR/m²"
                          min={0}
                          step={0.5}
                          onChange={(v) => updateMaterialConfig({ glassBasePrices: { ...materialConfig.glassBasePrices, [type]: v } })}
                        />
                      ))}
                    </div>

                    <div className="text-[10px] font-semibold text-slate-500 mb-1 mt-3">Glass premiums (EUR/m²)</div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <NumberInput label="Textured" value={materialConfig.texturedGlassPremium} unit="EUR/m²" min={0} step={0.5} onChange={(v) => updateMaterialConfig({ texturedGlassPremium: v })} />
                      <NumberInput label="Morpho color" value={materialConfig.morphoColorPremium} unit="EUR/m²" min={0} step={1} onChange={(v) => updateMaterialConfig({ morphoColorPremium: v })} />
                      <NumberInput label="Inkjet print" value={materialConfig.inkjetPrintPremium} unit="EUR/m²" min={0} step={0.5} onChange={(v) => updateMaterialConfig({ inkjetPrintPremium: v })} />
                    </div>

                    <div className="text-[10px] font-semibold text-slate-500 mb-1 mt-3">Other materials</div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <NumberInput label="Backsheet" value={materialConfig.backsheetPerM2} unit="EUR/m²" min={0} step={0.5} onChange={(v) => updateMaterialConfig({ backsheetPerM2: v })} />
                      <NumberInput label="Encapsulant" value={materialConfig.encapsulantPerM2} unit="EUR/m²" min={0} step={0.5} onChange={(v) => updateMaterialConfig({ encapsulantPerM2: v })} />
                      <NumberInput label="Ribbon/cell" value={materialConfig.ribbonPerCell} unit="EUR" min={0} step={0.005} onChange={(v) => updateMaterialConfig({ ribbonPerCell: v })} />
                      <NumberInput label="Junction box" value={materialConfig.junctionBoxCost} unit="EUR" min={0} step={0.5} onChange={(v) => updateMaterialConfig({ junctionBoxCost: v })} />
                    </div>
                  </Collapsible>
                );
              }

              if (s.id === 'string-production') {
                return (
                  <Collapsible key={s.id} title={`${s.icon} ${s.name}`} defaultOpen={false}>
                    <p className="text-[10px] text-slate-400 mb-2">{s.description}</p>

                    <div className="text-[10px] font-semibold text-slate-500 mb-1">Cell prices (EUR per cell)</div>
                    <div className="overflow-x-auto mb-2">
                      <table className="text-[10px] w-full">
                        <thead>
                          <tr className="text-slate-500">
                            <th className="text-left py-0.5 pr-2">Type / Format</th>
                            {CELL_FORMATS.map((f) => <th key={f} className="text-right py-0.5 px-1">{f}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {CELL_TYPES.map((ct) => (
                            <tr key={ct} className="border-t border-slate-100">
                              <td className="py-0.5 pr-2 font-medium text-slate-600">{ct}</td>
                              {CELL_FORMATS.map((cf) => (
                                <td key={cf} className="py-0.5 px-1">
                                  <input
                                    type="number"
                                    className="w-14 rounded border border-slate-200 px-1 py-0.5 text-[10px] text-right focus:border-blue-500 focus:outline-none"
                                    value={stringConfig.cellPrices[ct]?.[cf] ?? 0}
                                    min={0}
                                    step={0.01}
                                    onChange={(e) => {
                                      const updated = { ...stringConfig.cellPrices };
                                      if (!updated[ct]) updated[ct] = {};
                                      updated[ct] = { ...updated[ct], [cf]: Number(e.target.value) };
                                      updateStringConfig({ cellPrices: updated });
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="text-[10px] font-semibold text-slate-500 mb-1 mt-3">String production costs</div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <NumberInput label="Non-standard setup" value={stringConfig.nonStandardSetupCost} unit="EUR" min={0} step={1} onChange={(v) => updateStringConfig({ nonStandardSetupCost: v })} />
                      <NumberInput label="Printing / string" value={stringConfig.printingCostPerString} unit="EUR" min={0} step={0.1} onChange={(v) => updateStringConfig({ printingCostPerString: v })} />
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
