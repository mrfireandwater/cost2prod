import { useAppContext } from '../../context/AppContext';
import type { SolarModule, CellType, CellFormat, GlassType, BacksheetType, CellLayout } from '../../models/solarModule';
import type { ProductionSection } from '../../models/production';

const CELL_TYPES: CellType[] = ['mono-PERC', 'mono-HJT', 'mono-TOPCon', 'poly', 'custom'];
const CELL_FORMATS: CellFormat[] = ['M6-166mm', 'M10-182mm', 'M12-210mm', 'custom'];
const GLASS_TYPES: GlassType[] = ['tempered-3.2mm', 'tempered-2.0mm', 'anti-glare-3.2mm', 'custom'];
const BACKSHEET_TYPES: BacksheetType[] = ['glass-glass', 'TPT', 'TPE', 'transparent', 'custom'];

function NumberInput({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">
        {label} {unit && <span className="text-slate-400">({unit})</span>}
      </span>
      <input
        type="number"
        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
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
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select
        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function ModuleSettings({ module }: { module: SolarModule }) {
  const { updateModule } = useAppContext();
  const id = module.id;

  const update = (updates: Partial<SolarModule>) => updateModule(id, updates);
  const updateLayout = (updates: Partial<CellLayout>) =>
    update({ cellLayout: { ...module.cellLayout, ...updates } });

  return (
    <div className="space-y-4">
      {/* Cell Configuration */}
      <fieldset className="rounded border border-slate-200 p-3">
        <legend className="px-1 text-xs font-semibold text-slate-600">Cell Configuration</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SelectInput label="Cell Type" value={module.cellType} options={CELL_TYPES} onChange={(v) => update({ cellType: v })} />
          <SelectInput label="Cell Format" value={module.cellFormat} options={CELL_FORMATS} onChange={(v) => update({ cellFormat: v })} />
          <NumberInput label="Cell Size" value={module.cellSizeMm} unit="mm" min={50} max={250} onChange={(v) => update({ cellSizeMm: v })} />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Half-cut</span>
            <label className="flex items-center gap-2 text-sm mt-1">
              <input
                type="checkbox"
                checked={module.cellLayout.halfCut}
                onChange={(e) => updateLayout({ halfCut: e.target.checked })}
                className="rounded"
              />
              Enabled
            </label>
          </div>
        </div>
      </fieldset>

      {/* Module Dimensions */}
      <fieldset className="rounded border border-slate-200 p-3">
        <legend className="px-1 text-xs font-semibold text-slate-600">Module Dimensions</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumberInput label="Width" value={module.width} unit="mm" min={100} onChange={(v) => update({ width: v })} />
          <NumberInput label="Height" value={module.height} unit="mm" min={100} onChange={(v) => update({ height: v })} />
        </div>
      </fieldset>

      {/* Cell Layout */}
      <fieldset className="rounded border border-slate-200 p-3">
        <legend className="px-1 text-xs font-semibold text-slate-600">Cell Layout</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumberInput label="Rows" value={module.cellLayout.rows} min={1} max={20} onChange={(v) => updateLayout({ rows: v })} />
          <NumberInput label="Columns" value={module.cellLayout.columns} min={1} max={20} onChange={(v) => updateLayout({ columns: v })} />
          <NumberInput label="Spacing X" value={module.cellLayout.cellSpacingX} unit="mm" min={0} onChange={(v) => updateLayout({ cellSpacingX: v })} />
          <NumberInput label="Spacing Y" value={module.cellLayout.cellSpacingY} unit="mm" min={0} onChange={(v) => updateLayout({ cellSpacingY: v })} />
        </div>
      </fieldset>

      {/* Margins */}
      <fieldset className="rounded border border-slate-200 p-3">
        <legend className="px-1 text-xs font-semibold text-slate-600">Margins (edge to cells)</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumberInput label="Top" value={module.marginTop} unit="mm" min={0} onChange={(v) => update({ marginTop: v })} />
          <NumberInput label="Bottom" value={module.marginBottom} unit="mm" min={0} onChange={(v) => update({ marginBottom: v })} />
          <NumberInput label="Left" value={module.marginLeft} unit="mm" min={0} onChange={(v) => update({ marginLeft: v })} />
          <NumberInput label="Right" value={module.marginRight} unit="mm" min={0} onChange={(v) => update({ marginRight: v })} />
        </div>
      </fieldset>

      {/* Components */}
      <fieldset className="rounded border border-slate-200 p-3">
        <legend className="px-1 text-xs font-semibold text-slate-600">Components</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SelectInput label="Glass" value={module.glassType} options={GLASS_TYPES} onChange={(v) => update({ glassType: v })} />
          <SelectInput label="Backsheet" value={module.backsheetType} options={BACKSHEET_TYPES} onChange={(v) => update({ backsheetType: v })} />
          <SelectInput label="Encapsulant" value={module.encapsulantType} options={['EVA', 'POE', 'EPE']} onChange={(v) => update({ encapsulantType: v as 'EVA' | 'POE' | 'EPE' })} />
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Ribbon Color</span>
            <input
              type="color"
              className="h-[30px] w-10 cursor-pointer rounded border border-slate-300"
              value={module.ribbonColor}
              onChange={(e) => update({ ribbonColor: e.target.value })}
            />
          </label>
        </div>
      </fieldset>
    </div>
  );
}

function SectionSettings({ section }: { section: ProductionSection }) {
  const { updateSection } = useAppContext();

  return (
    <div className="rounded border border-slate-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{section.icon}</span>
        <h4 className="text-xs font-semibold text-slate-700">{section.name}</h4>
        <span className="text-[10px] text-slate-400">{section.description}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <NumberInput
          label="Base Cost"
          value={section.baseCostEur}
          unit="EUR"
          min={0}
          step={0.5}
          onChange={(v) => updateSection(section.id, { baseCostEur: v })}
        />
        <NumberInput
          label="Per Cell Cost"
          value={section.perCellCostEur}
          unit="EUR"
          min={0}
          step={0.01}
          onChange={(v) => updateSection(section.id, { perCellCostEur: v })}
        />
        <NumberInput
          label="Per m2 Cost"
          value={section.perM2CostEur}
          unit="EUR"
          min={0}
          step={0.5}
          onChange={(v) => updateSection(section.id, { perM2CostEur: v })}
        />
      </div>
    </div>
  );
}

export default function Settings() {
  const { modules, selectedModuleId, selectModule, sections } = useAppContext();
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

          {/* Module selector */}
          {modules.length > 0 && (
            <div className="mb-3">
              <label className="flex items-center gap-2 text-xs text-slate-500">
                Module:
                <select
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  value={selectedModuleId ?? ''}
                  onChange={(e) => selectModule(e.target.value || null)}
                >
                  <option value="">-- Select module --</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
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
            {sections.map((section) => (
              <SectionSettings key={section.id} section={section} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
