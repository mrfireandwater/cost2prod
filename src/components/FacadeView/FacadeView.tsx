import { useAppContext } from '../../context/AppContext';

export default function FacadeView() {
  const { facade, modules, selectedModuleId, selectModule, assignModuleToSlot, updateFacade } = useAppContext();


  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <h2 className="text-sm font-bold text-slate-700">Facade View</h2>
        <div className="flex gap-2 text-xs">
          <label className="flex items-center gap-1">
            Rows:
            <input
              type="number"
              min={1}
              max={10}
              value={facade.rows}
              onChange={(e) => updateFacade({ rows: Number(e.target.value) })}
              className="w-12 rounded border border-slate-300 px-1 py-0.5 text-center"
            />
          </label>
          <label className="flex items-center gap-1">
            Cols:
            <input
              type="number"
              min={1}
              max={10}
              value={facade.columns}
              onChange={(e) => updateFacade({ columns: Number(e.target.value) })}
              className="w-12 rounded border border-slate-300 px-1 py-0.5 text-center"
            />
          </label>
        </div>
      </div>

      <div className="flex-1 p-3">
        {/* Building outline */}
        <div className="relative mx-auto h-full max-w-md rounded border-2 border-slate-400 bg-slate-200 p-1">
          {/* Grid of slots */}
          <div
            className="grid h-full w-full gap-[2px]"
            style={{
              gridTemplateRows: `repeat(${facade.rows}, 1fr)`,
              gridTemplateColumns: `repeat(${facade.columns}, 1fr)`,
            }}
          >
            {facade.slots.map((slot) => {
              const assignedModule = modules.find((m) => m.id === slot.moduleId);
              const isSelected = slot.moduleId === selectedModuleId && !!slot.moduleId;
              return (
                <div
                  key={`${slot.row}-${slot.col}`}
                  className={`relative flex cursor-pointer items-center justify-center rounded-sm border transition-all ${
                    isSelected
                      ? 'border-yellow-400 ring-2 ring-yellow-400'
                      : 'border-slate-300 hover:border-blue-400'
                  }`}
                  style={{
                    backgroundColor: assignedModule ? assignedModule.color : '#e2e8f0',
                  }}
                  onClick={() => {
                    if (assignedModule) {
                      selectModule(assignedModule.id);
                    }
                  }}
                >
                  {assignedModule ? (
                    <div className="text-center">
                      <div className="text-[9px] font-bold text-white/90 drop-shadow">
                        {assignedModule.name}
                      </div>
                      <div className="text-[8px] text-white/70">
                        {assignedModule.powerWp}Wp
                      </div>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-400">Empty</span>
                  )}

                  {/* Assign dropdown */}
                  <select
                    className="absolute inset-0 cursor-pointer opacity-0"
                    value={slot.moduleId}
                    onChange={(e) => assignModuleToSlot(slot.row, slot.col, e.target.value)}
                    title="Assign module"
                  >
                    <option value="">-- Empty --</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-slate-200 px-3 py-2">
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {modules.map((m) => (
            <span key={m.id} className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: m.color }} />
              {m.name}
            </span>
          ))}
          <span className="text-slate-400 ml-auto">Click slot to select. Use dropdown to assign.</span>
        </div>
      </div>
    </div>
  );
}
