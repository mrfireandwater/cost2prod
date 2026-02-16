import { useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { SolarModule, SubmoduleConfig, SubmoduleKey, SubmoduleRotation, ModuleShape } from '../../models/solarModule';
import {
  MODULE_COLOR_TYPES,
  CELL_TYPE_DEFINITIONS,
  GLASS_TYPE_DEFINITIONS,
  getCellTypeDef,
  getGlassTypeDef,
  computeSubmoduleCells,
} from '../../models/solarModule';

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

const ROTATIONS: SubmoduleRotation[] = [0, 90, 180, 270];

// ── Submodule form (reused for sub1 and sub2) ──
function SubmoduleForm({
  sub,
  moduleId,
  subKey,
}: {
  sub: SubmoduleConfig;
  moduleId: string;
  subKey: SubmoduleKey;
}) {
  const { updateSubmodule } = useAppContext();
  const upd = (updates: Partial<SubmoduleConfig>) => updateSubmodule(moduleId, subKey, updates);
  const totalCells = computeSubmoduleCells(sub);
  const cellDef = getCellTypeDef(sub.cellTypeId);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="String amount" value={sub.stringAmount} min={1} max={30} onChange={(v) => upd({ stringAmount: v })} />
        <NumberInput label="Cells per string" value={sub.cellsPerString} min={1} max={30} onChange={(v) => upd({ cellsPerString: v })} />
      </div>

      {/* Combined cell type (type + format merged) */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Cell type</span>
        <select
          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          value={sub.cellTypeId}
          onChange={(e) => {
            const newId = e.target.value;
            const def = getCellTypeDef(newId);
            upd({
              cellTypeId: newId,
              ...(sub.standardLayout ? {
                distanceBetweenCells: def.standardSpacingY,
                distanceBetweenStrings: def.standardSpacingX,
                distanceToBorderX: def.standardBorderX,
                distanceToBorderY: def.standardBorderY,
              } : {}),
            });
          }}
        >
          {CELL_TYPE_DEFINITIONS.map((ct) => (
            <option key={ct.id} value={ct.id}>
              {ct.label} ({ct.sizeXMm}x{ct.sizeYMm}mm, {ct.wpPerCell}Wp, {ct.priceCHF} CHF)
            </option>
          ))}
        </select>
      </label>

      {/* Rotation */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Rotation</span>
        <select
          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          value={sub.rotation}
          onChange={(e) => upd({ rotation: Number(e.target.value) as SubmoduleRotation })}
        >
          {ROTATIONS.map((r) => (
            <option key={r} value={r}>{r}°</option>
          ))}
        </select>
      </label>

      {/* Submodule position on glass (always visible & editable) */}
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Position X" value={sub.distanceToBorderX} unit="mm" min={0} step={1} onChange={(v) => upd({ distanceToBorderX: v })} />
        <NumberInput label="Position Y" value={sub.distanceToBorderY} unit="mm" min={0} step={1} onChange={(v) => upd({ distanceToBorderY: v })} />
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
                    distanceToBorderX: cellDef.standardBorderX,
                    distanceToBorderY: cellDef.standardBorderY,
                    distanceBetweenCells: cellDef.standardSpacingY,
                    distanceBetweenStrings: cellDef.standardSpacingX,
                    junctionBoxSpacing: 10,
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
          <NumberInput label="Distance between cells" value={sub.distanceBetweenCells} unit="mm" min={0} step={0.5} onChange={(v) => upd({ distanceBetweenCells: v })} />
          <NumberInput label="Distance between strings" value={sub.distanceBetweenStrings} unit="mm" min={0} step={0.5} onChange={(v) => upd({ distanceBetweenStrings: v })} />
          <NumberInput label="Junction box spacing" value={sub.junctionBoxSpacing} unit="mm" min={1} step={1} onChange={(v) => upd({ junctionBoxSpacing: v })} />
        </div>
      )}
      {!sub.standardLayout && (
        <div className="ml-5 text-[10px] text-amber-600">Non-standard layout increases production cost</div>
      )}

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
        {cellDef.isHalfCut && <span className="ml-1 text-slate-400">(half-cut, each counts as 1 unit)</span>}
      </div>
    </div>
  );
}

// ── Cost optimization bar ──
function CostOptimizationBar({ ratio, delta }: { ratio: number; delta: number }) {
  // ratio: 0 = green (optimal), 1 = red (far from optimal)
  const pct = Math.round(ratio * 100);
  // Gradient from green to yellow to red
  const r = Math.round(255 * Math.min(1, ratio * 2));
  const g = Math.round(255 * Math.min(1, (1 - ratio) * 2));
  const barColor = `rgb(${r}, ${g}, 50)`;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.max(5, pct)}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] mt-0.5">
          <span className="text-green-600">Optimal</span>
          <span className="text-red-500">Expensive</span>
        </div>
      </div>
      <div className="text-xs font-bold text-slate-700 whitespace-nowrap">
        +{delta.toFixed(2)} CHF
      </div>
    </div>
  );
}

// ── Main module form ──
function ModuleForm({ module }: { module: SolarModule }) {
  const { updateModule, totalCost, optimalCost, costOptimizationDelta, costOptimizationRatio } = useAppContext();
  const id = module.id;
  const update = (updates: Partial<SolarModule>) => updateModule(id, updates);

  const colorType = MODULE_COLOR_TYPES.find((c) => c.id === module.moduleColorId);
  const colorFactor = colorType?.factor ?? 1.0;
  const frontGlass = getGlassTypeDef(module.frontGlassId);
  const glassFactor = frontGlass.transparencyEfficiency;

  return (
    <div className="space-y-4">
      {/* Name, Quantity & Color */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
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
          <span className="text-xs font-medium text-slate-500">Quantity</span>
          <input
            type="number"
            className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            value={module.quantity}
            min={1}
            onChange={(e) => update({ quantity: Math.max(1, Number(e.target.value)) })}
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

        {/* Shape selector */}
        <div className="mt-3">
          <span className="text-xs font-medium text-slate-500">Shape</span>
          <div className="mt-1 flex gap-2">
            {/* Rectangle */}
            <button
              type="button"
              onClick={() => update({ shape: 'rectangle' as ModuleShape })}
              className={`flex flex-col items-center gap-1 rounded border px-3 py-2 text-[10px] transition-colors ${
                module.shape === 'rectangle'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
              title="Rectangle (4 sides, 90° angles)"
            >
              <svg width="32" height="24" viewBox="0 0 32 24">
                <rect x="2" y="2" width="28" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Rectangle
            </button>

            {/* Parallelogram */}
            <button
              type="button"
              onClick={() => update({ shape: 'parallelogram' as ModuleShape })}
              className={`flex flex-col items-center gap-1 rounded border px-3 py-2 text-[10px] transition-colors ${
                module.shape === 'parallelogram'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
              title="Parallelogram (4 sides, non-90° angles)"
            >
              <svg width="32" height="24" viewBox="0 0 32 24">
                <polygon points="8,2 30,2 24,22 2,22" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Parallelo.
            </button>

            {/* Trapezoid rectangle (5 sides) */}
            <button
              type="button"
              onClick={() => update({ shape: 'trapezoid' as ModuleShape })}
              className={`flex flex-col items-center gap-1 rounded border px-3 py-2 text-[10px] transition-colors ${
                module.shape === 'trapezoid'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
              title="Trapezoid rectangle (5 sides, corner cut)"
            >
              <svg width="32" height="24" viewBox="0 0 32 24">
                <polygon points="2,2 22,2 30,10 30,22 2,22" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Trapezoid
            </button>
          </div>
        </div>

        {/* Shape-specific parameters */}
        {module.shape === 'parallelogram' && (
          <div className="mt-2">
            <NumberInput label="Skew angle" value={module.skewAngle} unit="°" min={1} max={45} step={1} onChange={(v) => update({ skewAngle: v })} />
          </div>
        )}
        {module.shape === 'trapezoid' && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <NumberInput label="Cut width" value={module.cutWidth} unit="mm" min={10} max={module.width - 10} step={1} onChange={(v) => update({ cutWidth: v })} />
            <NumberInput label="Cut height" value={module.cutHeight} unit="mm" min={10} max={module.height - 10} step={1} onChange={(v) => update({ cutHeight: v })} />
          </div>
        )}
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

      {/* Submodul 3 (optional) */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={module.submodule3Enabled}
              onChange={(e) => update({ submodule3Enabled: e.target.checked })}
              className="rounded"
            />
            Submodul 3
          </label>
        </legend>
        {module.submodule3Enabled && (
          <SubmoduleForm sub={module.submodule3} moduleId={id} subKey="submodule3" />
        )}
        {!module.submodule3Enabled && (
          <div className="text-xs text-slate-400 italic py-1">Enable to add a third cell array</div>
        )}
      </fieldset>

      {/* Submodul 4 (optional) */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={module.submodule4Enabled}
              onChange={(e) => update({ submodule4Enabled: e.target.checked })}
              className="rounded"
            />
            Submodul 4
          </label>
        </legend>
        {module.submodule4Enabled && (
          <SubmoduleForm sub={module.submodule4} moduleId={id} subKey="submodule4" />
        )}
        {!module.submodule4Enabled && (
          <div className="text-xs text-slate-400 italic py-1">Enable to add a fourth cell array</div>
        )}
      </fieldset>

      {/* Submodul 5 (optional) */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={module.submodule5Enabled}
              onChange={(e) => update({ submodule5Enabled: e.target.checked })}
              className="rounded"
            />
            Submodul 5
          </label>
        </legend>
        {module.submodule5Enabled && (
          <SubmoduleForm sub={module.submodule5} moduleId={id} subKey="submodule5" />
        )}
        {!module.submodule5Enabled && (
          <div className="text-xs text-slate-400 italic py-1">Enable to add a fifth cell array</div>
        )}
      </fieldset>

      {/* Junction boxes & Cross-connectors (read-only computed) */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">Junction Boxes & Cross-connectors</legend>
        <div className="text-xs text-slate-500 space-y-1">
          <div className="flex justify-between">
            <span>Junction boxes (Dosen):</span>
            <span className="font-medium text-slate-700">{module.junctionBoxCount}</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>= strings/2 per submodule (strings in pairs)</span>
          </div>
          <div className="flex justify-between">
            <span>Cross-connectors (Querverbinder):</span>
            <span className="font-medium text-slate-700">
              {(module.submodule1.stringAmount - 1)
                + (module.submodule2Enabled ? (module.submodule2.stringAmount - 1) : 0)
                + (module.submodule3Enabled ? (module.submodule3.stringAmount - 1) : 0)
                + (module.submodule4Enabled ? (module.submodule4.stringAmount - 1) : 0)
                + (module.submodule5Enabled ? (module.submodule5.stringAmount - 1) : 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>JB spacing:</span>
            <span className="font-medium text-slate-700">{module.submodule1.junctionBoxSpacing} mm</span>
          </div>
        </div>
      </fieldset>

      {/* Module color (single color replacing front/back) */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">Module Color</legend>
        <label className="flex flex-col gap-1">
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none font-mono"
            value={module.moduleColorId}
            onChange={(e) => update({ moduleColorId: e.target.value })}
          >
            {MODULE_COLOR_TYPES.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.label} ({(ct.factor * 100).toFixed(0)}%)
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      {/* Glass type */}
      <fieldset className="rounded border border-slate-200 p-2">
        <legend className="px-1 text-xs font-semibold text-slate-600">Glass</legend>
        <div className="space-y-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Front glass</span>
            <select
              className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
              value={module.frontGlassId}
              onChange={(e) => update({ frontGlassId: e.target.value })}
            >
              {GLASS_TYPE_DEFINITIONS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label} - {g.priceCHFPerM2} CHF/m2
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Back glass</span>
            <select
              className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
              value={module.backGlassId}
              onChange={(e) => update({ backGlassId: e.target.value })}
            >
              {GLASS_TYPE_DEFINITIONS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label} - {g.priceCHFPerM2} CHF/m2
                </option>
              ))}
            </select>
          </label>
        </div>
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
              <span>Glass factor ({frontGlass.label}):</span>
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

      {/* Price & Cost Optimization */}
      <fieldset className="rounded border border-green-200 bg-green-50/30 p-2">
        <legend className="px-1 text-xs font-semibold text-green-700">Price & Cost Optimization</legend>
        <div className="rounded bg-white border border-green-200 p-2">
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Total cost:</span>
              <span className="font-bold text-slate-800">{totalCost.toFixed(2)} CHF</span>
            </div>
            <div className="flex justify-between">
              <span>Optimal cost:</span>
              <span className="font-medium text-green-700">{optimalCost.toFixed(2)} CHF</span>
            </div>
            {module.powerWp > 0 && (
              <div className="flex justify-between">
                <span>CHF / Wp:</span>
                <span className="font-medium text-slate-700">{(totalCost / module.powerWp).toFixed(3)}</span>
              </div>
            )}
            <hr className="border-slate-200 my-1" />
            <div className="text-[10px] font-semibold text-slate-600 mb-1">Cost Optimization</div>
            <CostOptimizationBar ratio={costOptimizationRatio} delta={costOptimizationDelta} />
          </div>
        </div>
      </fieldset>
    </div>
  );
}

export default function ModuleDesigner() {
  const { modules, selectedModuleId, addModule, removeModule, selectModule, importModules } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = JSON.stringify(modules, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cost2prod-modules.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          alert('Invalid file: expected a non-empty array of modules.');
          return;
        }
        importModules(parsed as SolarModule[]);
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = '';
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <h2 className="text-sm font-bold text-slate-700">Module Designer</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
            title="Import modules from JSON"
          >
            Import
          </button>
          <button
            onClick={handleExport}
            className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
            title="Export modules as JSON"
          >
            Export
          </button>
          <button
            onClick={addModule}
            className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Add Module
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
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
