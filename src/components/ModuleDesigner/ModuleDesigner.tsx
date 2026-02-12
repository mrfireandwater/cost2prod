import { useAppContext } from '../../context/AppContext';
import type { SolarModule, SubmoduleConfig, CellType, CellFormat, GlassTexture } from '../../models/solarModule';
import {
  MODULE_COLOR_TYPES,
  BACKGLASS_COLOR_OPTIONS,
  GLASS_TEXTURE_OPTIONS,
  TEXTURED_GLASS_EFFICIENCY,
  computeSubmoduleCells,
} from '../../models/solarModule';
import { DEFAULT_SPACING_CONFIG, DEFAULT_MARGIN_CONFIG } from '../../models/production';

const CELL_TYPES: CellType[] = ['mono-PERC', 'mono-HJT', 'mono-TOPCon', 'poly', 'custom'];
const CELL_FORMATS: CellFormat[] = ['M6-166mm', 'M10-182mm', 'M12-210mm', 'custom'];

function NumberInput({
  label, value, onChange, unit, min, max, step,
}: {
  label: string; value: number; onChange: (v: number) => void;
  unit?: string; min?: number; max?: number; step?: number;
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

// ── Submodule form (reused for sub1 and sub2) ──
function SubmoduleForm({
  sub,
  moduleId,
  subKey,
}: {
  sub: SubmoduleConfig;
  moduleId: string;
  subKey: 'submodule1' | 'submodule2';
}) {
  const { updateSubmodule } = useAppContext();
  const upd = (updates: Partial<SubmoduleConfig>) => updateSubmodule(moduleId, subKey, updates);
  const totalCells = computeSubmoduleCells(sub);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="String amount" value={sub.stringAmount} min={1} max={30} onChange={(v) => upd({ stringAmount: v })} />
        <NumberInput label="Cells per string" value={sub.cellsPerString} min={1} max={30} onChange={(v) => upd({ cellsPerString: v })} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Cell type</span>
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            value={sub.cellType}
            onChange={(e) => upd({ cellType: e.target.value as CellType })}
          >
            {CELL_TYPES.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Cell format</span>
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            value={sub.cellFormat}
            onChange={(e) => upd({ cellFormat: e.target.value as CellFormat })}
          >
            {CELL_FORMATS.map((cf) => (
              <option key={cf} value={cf}>{cf}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={sub.standardLayout}
          onChange={(e) => {
            const std = e.target.checked;
            upd({
              standardLayout: std,
              ...(std
                ? {
                    distanceToBorderX: DEFAULT_MARGIN_CONFIG.standardMinMm,
                    distanceToBorderY: 40,
                    distanceBetweenCells: DEFAULT_SPACING_CONFIG.standardY,
                    distanceBetweenStrings: DEFAULT_SPACING_CONFIG.standardX,
                  }
                : {}),
            });
          }}
          className="rounded"
        />
        Standard Layout
      </label>
      {!sub.standardLayout && (
        <div className="ml-5 grid grid-cols-2 gap-2">
          <NumberInput label="Distance to border X" value={sub.distanceToBorderX} unit="mm" min={0} step={1} onChange={(v) => upd({ distanceToBorderX: v })} />
          <NumberInput label="Distance to border Y" value={sub.distanceToBorderY} unit="mm" min={0} step={1} onChange={(v) => upd({ distanceToBorderY: v })} />
          <NumberInput label="Distance between cells" value={sub.distanceBetweenCells} unit="mm" min={0} step={0.5} onChange={(v) => upd({ distanceBetweenCells: v })} />
          <NumberInput label="Distance between strings" value={sub.distanceBetweenStrings} unit="mm" min={0} step={0.5} onChange={(v) => upd({ distanceBetweenStrings: v })} />
        </div>
      )}
      {!sub.standardLayout && (
        <div className="ml-5 text-[10px] text-amber-600">Non-standard layout increases production cost</div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={sub.halfCut}
          onChange={(e) => upd({ halfCut: e.target.checked })}
          className="rounded"
        />
        Half-cut cells
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={sub.blackRibbonsAndConnectors}
          onChange={(e) => upd({ blackRibbonsAndConnectors: e.target.checked })}
          className="rounded"
        />
        Black ribbons and connector
      </label>

      <div className="text-xs text-slate-400">
        Total cells: <span className="font-semibold text-slate-600">{totalCells}</span>
      </div>
    </div>
  );
}

// ── Main module form ──
function ModuleForm({ module }: { module: SolarModule }) {
  const { updateModule } = useAppContext();
  const id = module.id;
  const update = (updates: Partial<SolarModule>) => updateModule(id, updates);

  const colorType = MODULE_COLOR_TYPES.find((c) => c.id === module.frontglassColor);
  const colorFactor = colorType?.factor ?? 1.0;
  const glassFactor = module.frontglassTexture === 'textured' ? TEXTURED_GLASS_EFFICIENCY : 1.0;

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

      {/* Submodul 1 */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">Submodul 1</legend>
        <SubmoduleForm sub={module.submodule1} moduleId={id} subKey="submodule1" />
      </fieldset>

      {/* Submodul 2 (optional) */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={module.submodule2Enabled}
              onChange={(e) => update({ submodule2Enabled: e.target.checked })}
              className="rounded"
            />
            Submodul 2
          </label>
        </legend>
        {module.submodule2Enabled && (
          <SubmoduleForm sub={module.submodule2} moduleId={id} subKey="submodule2" />
        )}
        {!module.submodule2Enabled && (
          <div className="text-xs text-slate-400 italic py-1">Enable to add a second cell array</div>
        )}
      </fieldset>

      {/* Glass type */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">Glass type</legend>
        <label className="flex items-center gap-2 text-sm mb-2">
          <input
            type="checkbox"
            checked={module.standardGlass}
            onChange={(e) => {
              const std = e.target.checked;
              update({
                standardGlass: std,
                ...(std
                  ? {
                      frontglassTexture: 'smooth' as GlassTexture,
                      frontglassColor: 'standard',
                      backglassTexture: 'smooth' as GlassTexture,
                      backglassColor: 'white',
                    }
                  : {}),
              });
            }}
            className="rounded"
          />
          Standard glass
        </label>

        {!module.standardGlass && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500">Frontglass texture</span>
                <select
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  value={module.frontglassTexture}
                  onChange={(e) => update({ frontglassTexture: e.target.value as GlassTexture })}
                >
                  {GLASS_TEXTURE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500">Frontglass color</span>
                <select
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none font-mono"
                  value={module.frontglassColor}
                  onChange={(e) => update({ frontglassColor: e.target.value })}
                >
                  {MODULE_COLOR_TYPES.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.label.padEnd(28)} {(ct.factor * 100).toFixed(0)}%
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500">Backglass texture</span>
                <select
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  value={module.backglassTexture}
                  onChange={(e) => update({ backglassTexture: e.target.value as GlassTexture })}
                >
                  {GLASS_TEXTURE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500">Backglass color</span>
                <select
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  value={module.backglassColor}
                  onChange={(e) => update({ backglassColor: e.target.value })}
                >
                  {BACKGLASS_COLOR_OPTIONS.map((bc) => (
                    <option key={bc.id} value={bc.id}>{bc.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}
      </fieldset>

      {/* Power (computed, read-only) */}
      <fieldset className="rounded border border-blue-200 bg-blue-50/30 p-2">
        <legend className="px-1 text-xs font-semibold text-blue-700">Power</legend>
        <div className="rounded bg-white border border-blue-200 p-2">
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Cells:</span>
              <span className="font-medium text-slate-700">{module.totalCells}</span>
            </div>
            <div className="flex justify-between">
              <span>Color factor ({colorType?.label ?? 'standard'}):</span>
              <span className="font-medium text-slate-700">{(colorFactor * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Glass factor ({module.frontglassTexture}):</span>
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
