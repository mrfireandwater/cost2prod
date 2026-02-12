import { useAppContext } from '../../context/AppContext';
import type { SolarModule } from '../../models/solarModule';

function ModuleSVG({ module }: { module: SolarModule }) {
  const { width, height, cellLayout, cellSizeMm, marginTop, marginBottom, marginLeft, marginRight } = module;

  const activeWidth = width - marginLeft - marginRight;
  const activeHeight = height - marginTop - marginBottom;

  // Cell arrangement
  const totalRows = cellLayout.halfCut ? cellLayout.rows * 2 : cellLayout.rows;
  const totalCols = cellLayout.columns;

  // Use actual cell dimensions from cell geometry - cells are always their real size
  const cellW = cellSizeMm;
  const cellH = cellLayout.halfCut ? cellSizeMm / 2 : cellSizeMm;

  // Center the cell matrix within the active area
  const matrixW = totalCols * cellW + (totalCols - 1) * cellLayout.cellSpacingX;
  const matrixH = totalRows * cellH + (totalRows - 1) * cellLayout.cellSpacingY;
  const offsetX = marginLeft + (activeWidth - matrixW) / 2;
  const offsetY = marginTop + (activeHeight - matrixH) / 2;

  // Expand viewBox to show annotations
  const padRight = 40;
  const padBottom = 40;
  const viewBox = `0 0 ${width + padRight} ${height + padBottom}`;

  const cells = [];
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      const cx = offsetX + c * (cellW + cellLayout.cellSpacingX);
      const cy = offsetY + r * (cellH + cellLayout.cellSpacingY);
      cells.push(
        <rect
          key={`cell-${r}-${c}`}
          x={cx}
          y={cy}
          width={cellW}
          height={cellH}
          fill="#1a1a2e"
          stroke="#2a2a4a"
          strokeWidth={0.5}
          rx={1}
        />
      );

      // Draw ribbons on each cell
      for (let ri = 0; ri < module.ribbonCount; ri++) {
        const ribbonX = cx + ((ri + 1) / (module.ribbonCount + 1)) * cellW;
        cells.push(
          <line
            key={`ribbon-${r}-${c}-${ri}`}
            x1={ribbonX}
            y1={cy}
            x2={ribbonX}
            y2={cy + cellH}
            stroke={module.ribbonColor}
            strokeWidth={module.ribbonWidthMm * 2}
            opacity={0.6}
          />
        );
      }
    }
  }

  // Cross connectors between adjacent string columns
  // Strings run as columns of cells; cross connectors connect column ends in a serpentine pattern
  const crossConnectors = [];
  const crossConnectorWidth = 2; // mm thickness of cross connector bar

  for (let c = 0; c < totalCols - 1; c++) {
    // Alternating: even transitions at bottom, odd transitions at top
    const isBottom = c % 2 === 0;

    // Y position: at the bottom or top of the cell matrix
    const y = isBottom
      ? offsetY + matrixH // bottom of matrix
      : offsetY; // top of matrix

    // X range: from end of column c to start of column c+1
    const x1 = offsetX + c * (cellW + cellLayout.cellSpacingX) + cellW;
    const x2 = offsetX + (c + 1) * (cellW + cellLayout.cellSpacingX);

    // Horizontal cross connector bar
    crossConnectors.push(
      <rect
        key={`cross-h-${c}`}
        x={x1}
        y={isBottom ? y - crossConnectorWidth : y}
        width={x2 - x1}
        height={crossConnectorWidth}
        fill={module.ribbonColor}
        opacity={0.7}
      />
    );

    // Vertical stubs connecting the cross connector to the last/first cell of each column
    // Left stub (from column c)
    const stubTopC = isBottom
      ? offsetY + (totalRows - 1) * (cellH + cellLayout.cellSpacingY) + cellH
      : offsetY;
    crossConnectors.push(
      <rect
        key={`cross-vl-${c}`}
        x={x1 - crossConnectorWidth / 2}
        y={isBottom ? stubTopC : y}
        width={crossConnectorWidth}
        height={isBottom ? y - stubTopC : offsetY - y + crossConnectorWidth}
        fill={module.ribbonColor}
        opacity={0.7}
      />
    );

    // Right stub (to column c+1)
    crossConnectors.push(
      <rect
        key={`cross-vr-${c}`}
        x={x2 + crossConnectorWidth / 2 - crossConnectorWidth}
        y={isBottom ? stubTopC : y}
        width={crossConnectorWidth}
        height={isBottom ? y - stubTopC : offsetY - y + crossConnectorWidth}
        fill={module.ribbonColor}
        opacity={0.7}
      />
    );
  }

  // Junction box: positioned between two strings on one side of the module
  // Per PDF spec, junction box connects to cross connectors between strings
  const jbWidth = 25;
  const jbHeight = 60;
  // Place on the right side of the module, between the middle two string connections
  const middleConnIdx = Math.floor((totalCols - 1) / 2);
  const isMiddleBottom = middleConnIdx % 2 === 0;
  // Junction box Y: at the cross connector position between middle strings
  const jbEdgeY = isMiddleBottom
    ? offsetY + matrixH
    : offsetY;
  const jbY = isMiddleBottom
    ? jbEdgeY - jbHeight / 2
    : jbEdgeY - jbHeight / 2;
  // Junction box X: on the right edge of the module
  const jbX = width - jbWidth - 2;

  // Connection lines from cross connector to junction box
  const jbConnections = [];
  const connY = isMiddleBottom ? offsetY + matrixH - 1 : offsetY + 1;
  const connStartX = offsetX + middleConnIdx * (cellW + cellLayout.cellSpacingX) + cellW + cellLayout.cellSpacingX / 2;
  jbConnections.push(
    <line
      key="jb-conn"
      x1={connStartX}
      y1={connY}
      x2={jbX}
      y2={jbY + jbHeight / 2}
      stroke="#6b7280"
      strokeWidth={1.5}
      strokeDasharray="3 2"
      opacity={0.6}
    />
  );

  return (
    <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {/* Module outline (frameless - no frame component) */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1}
      />

      {/* Glass / backsheet background */}
      <rect
        x={0.5}
        y={0.5}
        width={width - 1}
        height={height - 1}
        fill={module.backsheetType === 'transparent' ? '#e8f4f8' : '#0f172a'}
        rx={1}
      />

      {/* Active area outline */}
      <rect
        x={marginLeft}
        y={marginTop}
        width={activeWidth}
        height={activeHeight}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={0.5}
        strokeDasharray="4 2"
        opacity={0.4}
      />

      {/* Cells with ribbons */}
      {cells}

      {/* Cross connectors */}
      {crossConnectors}

      {/* Junction box connection lines */}
      {jbConnections}

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
        x={jbX + jbWidth / 2}
        y={jbY + jbHeight / 2 + 3}
        textAnchor="middle"
        fontSize={7}
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

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-3 py-2">
        <h2 className="text-sm font-bold text-slate-700">
          Module Preview: {selectedModule.name}
        </h2>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="mx-auto h-full" style={{ maxWidth: '600px' }}>
          <ModuleSVG module={selectedModule} />
        </div>
      </div>
    </div>
  );
}
