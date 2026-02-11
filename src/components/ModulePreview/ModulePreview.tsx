import { useAppContext } from '../../context/AppContext';
import type { SolarModule } from '../../models/solarModule';
import { MODULE_COLOR_PALETTE, getCellGeometry } from '../../models/solarModule';

function ModuleSVG({ module }: { module: SolarModule }) {
  const { width, height, cellLayout, marginTop, marginBottom, marginLeft, marginRight } = module;

  const geom = getCellGeometry(module.cellGeometryId);
  const colorDef = MODULE_COLOR_PALETTE[module.moduleColor];

  // Scale factor: fit into a viewBox that represents the real mm dimensions
  const viewBox = `0 0 ${width} ${height}`;

  const activeWidth = width - marginLeft - marginRight;
  const activeHeight = height - marginTop - marginBottom;

  // Determine cell arrangement
  const totalRows = cellLayout.halfCut ? cellLayout.rows * 2 : cellLayout.rows;
  const totalCols = cellLayout.columns;

  // Use geometry-specific cell dimensions
  const effectiveCellW = Math.min(
    geom.cellWidthMm,
    (activeWidth - (totalCols - 1) * cellLayout.cellSpacingX) / totalCols
  );
  const effectiveCellH = Math.min(
    geom.cellHeightMm,
    (activeHeight - (totalRows - 1) * cellLayout.cellSpacingY) / totalRows
  );

  // Center the cell matrix within the active area
  const matrixW = totalCols * effectiveCellW + (totalCols - 1) * cellLayout.cellSpacingX;
  const matrixH = totalRows * effectiveCellH + (totalRows - 1) * cellLayout.cellSpacingY;
  const offsetX = marginLeft + (activeWidth - matrixW) / 2;
  const offsetY = marginTop + (activeHeight - matrixH) / 2;

  // Ribbon and cross connector colors
  const ribbonHex = module.ribbonColor === 'black' ? '#1a1a1a' : '#c0c0c0';
  const crossConnHex = module.crossConnectorColor === 'black' ? '#1a1a1a' : '#c0c0c0';

  const cells = [];
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      const cx = offsetX + c * (effectiveCellW + cellLayout.cellSpacingX);
      const cy = offsetY + r * (effectiveCellH + cellLayout.cellSpacingY);

      // Cell shape - rounded corners for M6 RearCon
      const cornerRadius = geom.roundedCorners ? 4 : 1;

      // Cell body (dark silicon)
      cells.push(
        <rect
          key={`cell-${r}-${c}`}
          x={cx}
          y={cy}
          width={effectiveCellW}
          height={effectiveCellH}
          fill="#1a1a2e"
          stroke="#2a2a4a"
          strokeWidth={0.5}
          rx={cornerRadius}
        />
      );

      // Cell grid lines (visible cell pattern - busbar grid pattern)
      // Horizontal grid lines for cell texture
      const gridLineCount = 6;
      for (let gi = 1; gi < gridLineCount; gi++) {
        const gy = cy + (gi / gridLineCount) * effectiveCellH;
        cells.push(
          <line
            key={`grid-h-${r}-${c}-${gi}`}
            x1={cx + 1}
            y1={gy}
            x2={cx + effectiveCellW - 1}
            y2={gy}
            stroke="#2a2a4a"
            strokeWidth={0.3}
            opacity={0.5}
          />
        );
      }

      // Draw ribbons on each cell (skip for rear contact cells)
      if (!geom.rearContact && module.ribbonCount > 0) {
        for (let ri = 0; ri < module.ribbonCount; ri++) {
          const ribbonX = cx + ((ri + 1) / (module.ribbonCount + 1)) * effectiveCellW;
          cells.push(
            <line
              key={`ribbon-${r}-${c}-${ri}`}
              x1={ribbonX}
              y1={cy}
              x2={ribbonX}
              y2={cy + effectiveCellH}
              stroke={ribbonHex}
              strokeWidth={module.ribbonWidthMm * 2}
              opacity={0.6}
            />
          );
        }
      }
    }
  }

  // Cross connectors (horizontal ribbons between cell string rows)
  const crossConnectors = [];
  for (let r = 0; r < totalRows - 1; r++) {
    // Connect at alternating sides
    const side = r % 2 === 0 ? 'right' : 'left';
    const connY = offsetY + (r + 1) * (effectiveCellH + cellLayout.cellSpacingY) - cellLayout.cellSpacingY / 2;

    // Draw cross connector line across all columns
    if (side === 'right') {
      const startX = offsetX + matrixW - effectiveCellW * 0.3;
      const endX = offsetX + matrixW + 5;
      crossConnectors.push(
        <line
          key={`xconn-${r}`}
          x1={startX}
          y1={connY}
          x2={endX}
          y2={connY}
          stroke={crossConnHex}
          strokeWidth={1.5}
          opacity={0.6}
        />
      );
    } else {
      const startX = offsetX - 5;
      const endX = offsetX + effectiveCellW * 0.3;
      crossConnectors.push(
        <line
          key={`xconn-${r}`}
          x1={startX}
          y1={connY}
          x2={endX}
          y2={connY}
          stroke={crossConnHex}
          strokeWidth={1.5}
          opacity={0.6}
        />
      );
    }

    // Connection point circle
    const sx = side === 'right' ? offsetX + matrixW - 5 : offsetX + 5;
    crossConnectors.push(
      <circle key={`conn-${r}`} cx={sx} cy={connY} r={3} fill={crossConnHex} opacity={0.5} />
    );
  }

  // Junction box
  const jbWidth = 60;
  const jbHeight = 25;
  const jbX = width / 2 - jbWidth / 2;
  const jbY = height - marginBottom / 2 - jbHeight / 2;

  // Background fill based on module color
  const bgFill = module.moduleColor === 'transparent'
    ? '#e8f4f8'
    : module.backsheetType === 'transparent'
      ? '#e8f4f8'
      : '#0f172a';

  return (
    <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {/* Module frame */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="none"
        stroke={module.frameType === 'frameless' ? '#94a3b8' : '#374151'}
        strokeWidth={module.frameType === 'frameless' ? 1 : 4}
        rx={module.frameType === 'frameless' ? 0 : 3}
      />

      {/* Glass / backsheet background */}
      <rect
        x={module.frameType === 'frameless' ? 0 : 4}
        y={module.frameType === 'frameless' ? 0 : 4}
        width={width - (module.frameType === 'frameless' ? 0 : 8)}
        height={height - (module.frameType === 'frameless' ? 0 : 8)}
        fill={bgFill}
        rx={1}
      />

      {/* Cells with ribbons */}
      {cells}

      {/* Cross connectors */}
      {crossConnectors}

      {/* Color overlay (SOLARCOLOR tinting) - on top of cells */}
      {module.moduleColor !== 'black' && (
        <rect
          x={module.frameType === 'frameless' ? 0 : 4}
          y={module.frameType === 'frameless' ? 0 : 4}
          width={width - (module.frameType === 'frameless' ? 0 : 8)}
          height={height - (module.frameType === 'frameless' ? 0 : 8)}
          fill={colorDef.hex}
          opacity={colorDef.opacity}
          rx={1}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Junction box */}
      <rect
        x={jbX}
        y={jbY}
        width={jbWidth}
        height={jbHeight}
        fill="#374151"
        stroke="#6b7280"
        strokeWidth={1}
        rx={3}
      />
      <text
        x={width / 2}
        y={jbY + jbHeight / 2 + 3}
        textAnchor="middle"
        fontSize={8}
        fill="#9ca3af"
      >
        J-Box
      </text>

      {/* Dimension annotations */}
      {/* Width arrow */}
      <line x1={0} y1={height + 15} x2={width} y2={height + 15} stroke="#64748b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-rev)" />
      <text x={width / 2} y={height + 28} textAnchor="middle" fontSize={10} fill="#64748b">
        {width} mm
      </text>

      {/* Height arrow */}
      <line x1={width + 15} y1={0} x2={width + 15} y2={height} stroke="#64748b" strokeWidth={0.8} />
      <text x={width + 20} y={height / 2} fontSize={10} fill="#64748b" transform={`rotate(90, ${width + 20}, ${height / 2})`} textAnchor="middle">
        {height} mm
      </text>

      {/* Arrow markers */}
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#64748b" />
        </marker>
        <marker id="arrowhead-rev" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto">
          <polygon points="6 0, 0 2, 6 4" fill="#64748b" />
        </marker>
      </defs>
    </svg>
  );
}

export default function ModulePreview() {
  const { selectedModule } = useAppContext();

  if (!selectedModule) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Select a module to see its preview
      </div>
    );
  }

  const areaM2 = (selectedModule.width * selectedModule.height) / 1_000_000;
  const geom = getCellGeometry(selectedModule.cellGeometryId);
  const colorDef = MODULE_COLOR_PALETTE[selectedModule.moduleColor];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-3 py-2">
        <h2 className="text-sm font-bold text-slate-700">
          Module Preview: {selectedModule.name}
        </h2>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="mx-auto" style={{ maxWidth: '400px', maxHeight: '100%' }}>
          <ModuleSVG module={selectedModule} />
        </div>
      </div>

      {/* Specs summary */}
      <div className="border-t border-slate-200 px-3 py-2">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Dimensions</span>
            <div className="font-medium">{selectedModule.width} x {selectedModule.height} mm</div>
          </div>
          <div>
            <span className="text-slate-400">Area</span>
            <div className="font-medium">{areaM2.toFixed(3)} m2</div>
          </div>
          <div>
            <span className="text-slate-400">Cells</span>
            <div className="font-medium">{selectedModule.totalCells} ({geom.label.split(' ')[0]})</div>
          </div>
          <div>
            <span className="text-slate-400">Power</span>
            <div className="font-medium">{selectedModule.powerWp} Wp</div>
          </div>
          <div>
            <span className="text-slate-400">Color</span>
            <div className="font-medium flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm border border-slate-300"
                style={{ backgroundColor: colorDef.hex }}
              />
              {colorDef.label}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Ribbons</span>
            <div className="font-medium">
              {geom.rearContact ? 'Rear contact' : `${selectedModule.ribbonCount}x ${selectedModule.ribbonColor}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
