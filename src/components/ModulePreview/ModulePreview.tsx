import React, { useRef, useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { SolarModule, SubmoduleConfig } from '../../models/solarModule';
import { MODULE_COLOR_TYPES, getCellTypeDef } from '../../models/solarModule';

// Render a single submodule's cell matrix, ribbons, and cross connectors
function SubmoduleSVG({
  sub,
  module,
  regionY,
  regionH,
  regionX,
  regionW,
}: {
  sub: SubmoduleConfig;
  module: SolarModule;
  regionY: number;
  regionH: number;
  regionX: number;
  regionW: number;
}) {
  const cellDef = getCellTypeDef(sub.cellTypeId);
  const marginX = sub.distanceToBorderX;
  const marginY = sub.distanceToBorderY;

  const activeWidth = regionW - 2 * marginX;
  const activeHeight = regionH - 2 * marginY;

  // Cell units: cellsPerString = number of cell units
  // If halfCut, each unit is physically half a cell (shorter), but still counts as 1
  const totalRows = sub.cellsPerString; // cell units per string
  const totalCols = sub.stringAmount;

  const cellSizeMm = cellDef.sizeMm;
  const cellW = cellSizeMm;
  // If half-cut, the physical cell height is half the cell size
  const cellH = sub.halfCut ? cellSizeMm / 2 : cellSizeMm;

  // Center the cell matrix within the active area
  const matrixW = totalCols * cellW + (totalCols - 1) * sub.distanceBetweenStrings;
  const matrixH = totalRows * cellH + (totalRows - 1) * sub.distanceBetweenCells;
  const offsetX = regionX + marginX + (activeWidth - matrixW) / 2;
  const offsetY = regionY + marginY + (activeHeight - matrixH) / 2;

  // Cell color from module color
  const colorType = MODULE_COLOR_TYPES.find((c) => c.id === module.moduleColorId);
  const cellColor = colorType?.displayColor ?? '#1e3a5f';

  // Ribbon/connector color
  const ribbonColor = sub.blackRibbonsAndConnectors ? '#000000' : '#c0c0c0';

  const elements: React.ReactElement[] = [];

  // Apply rotation transform
  const centerX = regionX + regionW / 2;
  const centerY = regionY + regionH / 2;
  const rotation = sub.rotation;
  const groupTransform = rotation !== 0
    ? `rotate(${rotation}, ${centerX}, ${centerY})`
    : undefined;

  // Cells + ribbons
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      const cx = offsetX + c * (cellW + sub.distanceBetweenStrings);
      const cy = offsetY + r * (cellH + sub.distanceBetweenCells);
      elements.push(
        <rect
          key={`cell-${r}-${c}`}
          x={cx}
          y={cy}
          width={cellW}
          height={cellH}
          fill={cellColor}
          stroke={cellColor === '#030712' ? '#1a1a2e' : '#00000020'}
          strokeWidth={0.5}
          rx={1}
        />
      );

      // Ribbons
      for (let ri = 0; ri < module.ribbonCount; ri++) {
        const ribbonX = cx + ((ri + 1) / (module.ribbonCount + 1)) * cellW;
        elements.push(
          <line
            key={`ribbon-${r}-${c}-${ri}`}
            x1={ribbonX}
            y1={cy}
            x2={ribbonX}
            y2={cy + cellH}
            stroke={ribbonColor}
            strokeWidth={module.ribbonWidthMm * 2}
            opacity={0.6}
          />
        );
      }
    }
  }

  // Cross connectors between adjacent string columns
  const crossConnectorWidth = 2;

  for (let c = 0; c < totalCols - 1; c++) {
    const isBottom = c % 2 === 0;
    const y = isBottom ? offsetY + matrixH : offsetY;
    const x1 = offsetX + c * (cellW + sub.distanceBetweenStrings) + cellW;
    const x2 = offsetX + (c + 1) * (cellW + sub.distanceBetweenStrings);

    // Horizontal bar
    elements.push(
      <rect
        key={`cross-h-${c}`}
        x={x1}
        y={isBottom ? y - crossConnectorWidth : y}
        width={x2 - x1}
        height={crossConnectorWidth}
        fill={ribbonColor}
        opacity={0.7}
      />
    );

    // Vertical stubs
    const stubTopC = isBottom
      ? offsetY + (totalRows - 1) * (cellH + sub.distanceBetweenCells) + cellH
      : offsetY;
    elements.push(
      <rect
        key={`cross-vl-${c}`}
        x={x1 - crossConnectorWidth / 2}
        y={isBottom ? stubTopC : y}
        width={crossConnectorWidth}
        height={isBottom ? y - stubTopC : offsetY - y + crossConnectorWidth}
        fill={ribbonColor}
        opacity={0.7}
      />
    );
    elements.push(
      <rect
        key={`cross-vr-${c}`}
        x={x2 + crossConnectorWidth / 2 - crossConnectorWidth}
        y={isBottom ? stubTopC : y}
        width={crossConnectorWidth}
        height={isBottom ? y - stubTopC : offsetY - y + crossConnectorWidth}
        fill={ribbonColor}
        opacity={0.7}
      />
    );
  }

  // Junction boxes between string pairs
  // Strings come in pairs: (0,1), (2,3), (4,5), ...
  // JB count = strings / 2
  const jbCount = Math.floor(totalCols / 2);
  const jbWidth = 14;
  const jbHeight = sub.junctionBoxSpacing;

  for (let p = 0; p < jbCount; p++) {
    // Each pair: string 2p and string 2p+1
    // JB is positioned between the two strings of the pair, below the cell matrix
    const leftStringIdx = p * 2;
    const rightStringIdx = p * 2 + 1;
    const leftX = offsetX + leftStringIdx * (cellW + sub.distanceBetweenStrings);
    const rightX = offsetX + rightStringIdx * (cellW + sub.distanceBetweenStrings) + cellW;
    const jbX = (leftX + rightX) / 2 - jbWidth / 2;
    const jbY = offsetY + matrixH + 4; // below the cell matrix

    elements.push(
      <g key={`jbox-${p}`}>
        <rect
          x={jbX}
          y={jbY}
          width={jbWidth}
          height={jbHeight}
          fill="#374151"
          stroke="#6b7280"
          strokeWidth={0.8}
          rx={2}
        />
        <text
          x={jbX + jbWidth / 2}
          y={jbY + jbHeight / 2 + 2.5}
          textAnchor="middle"
          fontSize={5}
          fill="#9ca3af"
        >
          JB
        </text>
      </g>
    );
  }

  return <g transform={groupTransform}>{elements}</g>;
}

// Drag state interface
interface DragState {
  subKey: 'submodule1' | 'submodule2';
  startMouseX: number;
  startMouseY: number;
  startBorderX: number;
  startBorderY: number;
}

function ModuleSVG({
  module,
  onSubmoduleDrag,
}: {
  module: SolarModule;
  onSubmoduleDrag?: (subKey: 'submodule1' | 'submodule2', dx: number, dy: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const { width, height } = module;

  // Backglass: use white as default background
  const bgColor = '#f1f5f9';

  // Module color overlay
  const moduleColor = MODULE_COLOR_TYPES.find((c) => c.id === module.moduleColorId);
  const overlayColor = moduleColor?.displayColor ?? '#1e3a5f';

  // Expand viewBox for annotations
  const padRight = 40;
  const padBottom = 40;
  const viewBox = `0 0 ${width + padRight} ${height + padBottom}`;

  // Determine submodule regions
  const sub2On = module.submodule2Enabled;
  const gap = sub2On ? 10 : 0;
  const sub1H = sub2On ? (height - gap) / 2 : height;
  const sub2H = sub2On ? (height - gap) / 2 : 0;

  // Convert screen coordinates to SVG coordinates
  const screenToSvg = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const inv = ctm.inverse();
    return {
      x: inv.a * screenX + inv.c * screenY + inv.e,
      y: inv.b * screenX + inv.d * screenY + inv.f,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, subKey: 'submodule1' | 'submodule2') => {
    e.preventDefault();
    const sub = subKey === 'submodule1' ? module.submodule1 : module.submodule2;
    const svgPt = screenToSvg(e.clientX, e.clientY);
    setDragState({
      subKey,
      startMouseX: svgPt.x,
      startMouseY: svgPt.y,
      startBorderX: sub.distanceToBorderX,
      startBorderY: sub.distanceToBorderY,
    });
  }, [module, screenToSvg]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState || !onSubmoduleDrag) return;
    const svgPt = screenToSvg(e.clientX, e.clientY);
    const dx = svgPt.x - dragState.startMouseX;
    const dy = svgPt.y - dragState.startMouseY;
    onSubmoduleDrag(dragState.subKey, dragState.startBorderX + dx, dragState.startBorderY + dy);
  }, [dragState, onSubmoduleDrag, screenToSvg]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Module outline */}
      <rect x={0} y={0} width={width} height={height} fill="none" stroke="#94a3b8" strokeWidth={1} />

      {/* Backglass background */}
      <rect x={0.5} y={0.5} width={width - 1} height={height - 1} fill={bgColor} rx={1} />

      {/* Submodule 1 active area (dashed border showing position) */}
      <rect
        x={module.submodule1.distanceToBorderX}
        y={module.submodule1.distanceToBorderY}
        width={width - 2 * module.submodule1.distanceToBorderX}
        height={sub1H - 2 * module.submodule1.distanceToBorderY}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={0.5}
        strokeDasharray="4 2"
        opacity={0.4}
      />

      {/* Submodule 1 draggable group */}
      <g
        style={{ cursor: dragState?.subKey === 'submodule1' ? 'grabbing' : 'grab' }}
        onMouseDown={(e) => handleMouseDown(e, 'submodule1')}
      >
        <SubmoduleSVG
          sub={module.submodule1}
          module={module}
          regionY={0}
          regionH={sub1H}
          regionX={0}
          regionW={width}
        />
      </g>

      {/* Submodule 2 (if enabled) */}
      {sub2On && (
        <>
          {/* Divider line */}
          <line
            x1={10}
            y1={sub1H + gap / 2}
            x2={width - 10}
            y2={sub1H + gap / 2}
            stroke="#64748b"
            strokeWidth={0.5}
            strokeDasharray="6 3"
            opacity={0.5}
          />

          {/* Sub2 active area */}
          <rect
            x={module.submodule2.distanceToBorderX}
            y={sub1H + gap + module.submodule2.distanceToBorderY}
            width={width - 2 * module.submodule2.distanceToBorderX}
            height={sub2H - 2 * module.submodule2.distanceToBorderY}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={0.5}
            strokeDasharray="4 2"
            opacity={0.4}
          />

          {/* Submodule 2 draggable group */}
          <g
            style={{ cursor: dragState?.subKey === 'submodule2' ? 'grabbing' : 'grab' }}
            onMouseDown={(e) => handleMouseDown(e, 'submodule2')}
          >
            <SubmoduleSVG
              sub={module.submodule2}
              module={module}
              regionY={sub1H + gap}
              regionH={sub2H}
              regionX={0}
              regionW={width}
            />
          </g>
        </>
      )}

      {/* Semi-transparent module color overlay */}
      <rect
        x={0.5}
        y={0.5}
        width={width - 1}
        height={height - 1}
        fill={overlayColor}
        opacity={0.15}
        rx={1}
        pointerEvents="none"
      />

      {/* Dimension annotations */}
      <line
        x1={0}
        y1={height + 15}
        x2={width}
        y2={height + 15}
        stroke="#64748b"
        strokeWidth={0.8}
        markerEnd="url(#arrowhead)"
        markerStart="url(#arrowhead-rev)"
      />
      <text x={width / 2} y={height + 28} textAnchor="middle" fontSize={10} fill="#64748b">
        {width} mm
      </text>

      <line
        x1={width + 15}
        y1={0}
        x2={width + 15}
        y2={height}
        stroke="#64748b"
        strokeWidth={0.8}
      />
      <text
        x={width + 20}
        y={height / 2}
        fontSize={10}
        fill="#64748b"
        transform={`rotate(90, ${width + 20}, ${height / 2})`}
        textAnchor="middle"
      >
        {height} mm
      </text>

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
  const { selectedModule, updateSubmodule } = useAppContext();

  const handleSubmoduleDrag = useCallback(
    (subKey: 'submodule1' | 'submodule2', newBorderX: number, newBorderY: number) => {
      if (!selectedModule) return;
      // Clamp to reasonable bounds (min 0)
      const clampedX = Math.max(0, Math.round(newBorderX));
      const clampedY = Math.max(0, Math.round(newBorderY));
      updateSubmodule(selectedModule.id, subKey, {
        distanceToBorderX: clampedX,
        distanceToBorderY: clampedY,
      });
    },
    [selectedModule, updateSubmodule],
  );

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
        <p className="text-[10px] text-slate-400">Click and drag cells to reposition submodule on glass</p>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="mx-auto h-full" style={{ maxWidth: '600px' }}>
          <ModuleSVG module={selectedModule} onSubmoduleDrag={handleSubmoduleDrag} />
        </div>
      </div>
    </div>
  );
}
