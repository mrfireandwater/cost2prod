import { useAppContext } from '../../context/AppContext';
import type { SolarModule, GlassType, BacksheetType, CellLayout } from '../../models/solarModule';
import { MODULE_COLOR_TYPES, TEXTURED_GLASS_EFFICIENCY } from '../../models/solarModule';

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

function ModuleForm({ module }: { module: SolarModule }) {
  const { updateModule } = useAppContext();
  const id = module.id;

  const update = (updates: Partial<SolarModule>) => updateModule(id, updates);
  const updateLayout = (updates: Partial<CellLayout>) =>
    update({ cellLayout: { ...module.cellLayout, ...updates } });

  const colorType = MODULE_COLOR_TYPES.find((c) => c.id === module.moduleColorType);
  const colorFactor = colorType?.factor ?? 1.0;
  const glassFactor = module.texturedGlass ? TEXTURED_GLASS_EFFICIENCY : 1.0;

  return (
    <div className="space-y-4">
      {/* Name & Color */}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Module Name</span>
          <input
            type="text"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            value={module.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Color</span>
          <input
            type="color"
            className="h-[30px] w-10 cursor-pointer rounded border border-slate-300"
            value={module.color}
            onChange={(e) => update({ color: e.target.value })}
          />
        </label>
      </div>

      {/* Dimensions */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">Module Dimensions</legend>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="Width" value={module.width} unit="mm" min={100} onChange={(v) => update({ width: v })} />
          <NumberInput label="Height" value={module.height} unit="mm" min={100} onChange={(v) => update({ height: v })} />
        </div>
      </fieldset>

      {/* Cell Layout */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">Cell Layout (Strings)</legend>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="Rows" value={module.cellLayout.rows} min={1} max={20} onChange={(v) => updateLayout({ rows: v })} />
          <NumberInput label="Columns" value={module.cellLayout.columns} min={1} max={20} onChange={(v) => updateLayout({ columns: v })} />
          <NumberInput label="Spacing X" value={module.cellLayout.cellSpacingX} unit="mm" min={0} onChange={(v) => updateLayout({ cellSpacingX: v })} />
          <NumberInput label="Spacing Y" value={module.cellLayout.cellSpacingY} unit="mm" min={0} onChange={(v) => updateLayout({ cellSpacingY: v })} />
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={module.cellLayout.halfCut}
            onChange={(e) => updateLayout({ halfCut: e.target.checked })}
            className="rounded"
          />
          Half-cut cells
        </label>
        <div className="mt-1 text-xs text-slate-400">
          Total cells: <span className="font-semibold text-slate-600">{module.totalCells}</span>
        </div>
      </fieldset>

      {/* Power */}
      <fieldset className="rounded border border-blue-200 bg-blue-50/30 p-2">
        <legend className="px-1 text-xs font-semibold text-blue-700">Power</legend>

        {/* Module color type - two column dropdown */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Module Color (efficiency)</span>
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none font-mono"
            value={module.moduleColorType}
            onChange={(e) => update({ moduleColorType: e.target.value })}
          >
            {MODULE_COLOR_TYPES.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.label.padEnd(28)} {(ct.factor * 100).toFixed(0)}%
              </option>
            ))}
          </select>
        </label>

        {/* Textured glass */}
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={module.texturedGlass}
            onChange={(e) => update({ texturedGlass: e.target.checked })}
            className="rounded"
          />
          Textured glass
          <span className="text-xs text-slate-400">
            ({(TEXTURED_GLASS_EFFICIENCY * 100).toFixed(0)}% efficiency)
          </span>
        </label>

        {/* Computed power display */}
        <div className="mt-3 rounded bg-white border border-blue-200 p-2">
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Cells:</span>
              <span className="font-medium text-slate-700">{module.totalCells}</span>
            </div>
            <div className="flex justify-between">
              <span>Color factor:</span>
              <span className="font-medium text-slate-700">{(colorFactor * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Glass factor:</span>
              <span className="font-medium text-slate-700">{(glassFactor * 100).toFixed(0)}%</span>
            </div>
            <hr className="border-slate-200" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-blue-700">Power:</span>
              <span className="text-blue-700">{module.powerWp} Wp</span>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Components */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">Components</legend>
        <div className="grid grid-cols-2 gap-2">
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

export default function ModuleDesigner() {
  const { modules, selectedModuleId, addModule, removeModule, selectModule } = useAppContext();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <h2 className="text-sm font-bold text-slate-700">Module Designer</h2>
        <button
          onClick={addModule}
          className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          + Add Module
        </button>
      </div>

      {/* Module tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-2 py-1">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => selectModule(m.id)}
            className={`flex items-center gap-1 rounded-t px-2 py-1 text-xs font-medium whitespace-nowrap ${
              selectedModuleId === m.id
                ? 'bg-white text-blue-700 border border-b-0 border-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: m.color }}
            />
            {m.name}
            {modules.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removeModule(m.id);
                }}
                className="ml-1 text-slate-400 hover:text-red-500 cursor-pointer"
              >
                x
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active module form */}
      <div className="flex-1 overflow-y-auto p-3">
        {selectedModuleId && modules.find((m) => m.id === selectedModuleId) ? (
          <ModuleForm module={modules.find((m) => m.id === selectedModuleId)!} />
        ) : modules.length > 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Select a module tab to edit
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Add a module to get started
          </div>
        )}
      </div>
    </div>
  );
}
