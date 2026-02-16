import React, { useRef, useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { SolarModule, SubmoduleConfig } from '../../models/solarModule';
import { MODULE_COLOR_TYPES, getCellTypeDef, computeShapePoints } from '../../models/solarModule';

// Compute the cell matrix dimensions for a submodule (in mm)
function computeMatrixSize(sub: SubmoduleConfig) {
  const cellDef = getCellTypeDef(sub.cellTypeId);
  const cellW = cellDef.sizeXMm;
  const cellH = cellDef.sizeYMm;
  const totalCols = sub.stringAmount;
  const totalRows = sub.cellsPerString;
  const matrixW = totalCols * cellW + (totalCols - 1) * sub.distanceBetweenStrings;
  const matrixH = totalRows * cellH + (totalRows - 1) * sub.distanceBetweenCells;
  return { matrixW, matrixH, cellW, cellH, totalCols, totalRows };
}

// Render a single submodule's cell matrix, ribbons, cross connectors, and junction boxes
function SubmoduleSVG({
  sub,
  module,
  regionY,
  regionX,
}: {
  sub: SubmoduleConfig;
  module: SolarModule;
  regionY: number;
  regionX: number;
}) {
  const { matrixW, matrixH, cellW, cellH, totalCols, totalRows } = computeMatrixSize(sub);

  // Position: distanceToBorderX/Y is the offset from region origin to matrix top-left
  const offsetX = regionX + sub.distanceToBorderX;
  const offsetY = regionY + sub.distanceToBorderY;

  // Cell color from module color
  const colorType = MODULE_COLOR_TYPES.find((c) => c.id === module.moduleColorId);
  const cellColor = colorType?.displayColor ?? '#1e3a5f';

  // Ribbon/connector color
  const ribbonColor = sub.blackRibbonsAndConnectors ? '#000000' : '#c0c0c0';

  const elements: React.ReactElement[] = [];

  // Apply rotation transform around the matrix center
  const centerX = offsetX + matrixW / 2;
  const centerY = offsetY + matrixH / 2;
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
  const jbCount = Math.floor(totalCols / 2);
  const jbWidth = 14;
  const jbHeight = sub.junctionBoxSpacing;

  for (let p = 0; p < jbCount; p++) {
    const leftStringIdx = p * 2;
    const rightStringIdx = p * 2 + 1;
    const leftX = offsetX + leftStringIdx * (cellW + sub.distanceBetweenStrings);
    const rightX = offsetX + rightStringIdx * (cellW + sub.distanceBetweenStrings) + cellW;
    const jbX = (leftX + rightX) / 2 - jbWidth / 2;
    const jbY = offsetY + matrixH + 4;

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

// Dimension annotation: a line with arrows and a label between two points
function DimensionAnnotation({
  x1, y1, x2, y2, label, orientation,
}: {
  x1: number; y1: number; x2: number; y2: number;
  label: string; orientation: 'horizontal' | 'vertical';
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g pointerEvents="none">
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#f97316"
        strokeWidth={0.6}
        strokeDasharray="3 1.5"
      />
      {/* Small ticks at ends */}
      {orientation === 'horizontal' ? (
        <>
          <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} stroke="#f97316" strokeWidth={0.6} />
          <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} stroke="#f97316" strokeWidth={0.6} />
        </>
      ) : (
        <>
          <line x1={x1 - 4} y1={y1} x2={x1 + 4} y2={y1} stroke="#f97316" strokeWidth={0.6} />
          <line x1={x2 - 4} y1={y2} x2={x2 + 4} y2={y2} stroke="#f97316" strokeWidth={0.6} />
        </>
      )}
      {/* Label */}
      {orientation === 'horizontal' ? (
        <text
          x={midX}
          y={midY - 4}
          textAnchor="middle"
          fontSize={8}
          fill="#f97316"
          fontWeight="bold"
        >
          {label}
        </text>
      ) : (
        <text
          x={midX + 6}
          y={midY + 3}
          textAnchor="start"
          fontSize={8}
          fill="#f97316"
          fontWeight="bold"
        >
          {label}
        </text>
      )}
    </g>
  );
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
  onSubmoduleDrag?: (subKey: 'submodule1' | 'submodule2', newX: number, newY: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const { width, height } = module;

  // Backglass: use white as default background
  const bgColor = '#f1f5f9';

  // Module color overlay
  const moduleColor = MODULE_COLOR_TYPES.find((c) => c.id === module.moduleColorId);
  const overlayColor = moduleColor?.displayColor ?? '#1e3a5f';

  // Shape polygon points
  const shapePoints = computeShapePoints(module);
  const shapePointsStr = shapePoints.map(([x, y]) => `${x},${y}`).join(' ');
  // Inset version for background fill (0.5px inset)
  // We'll just use the same points with a slight inset via CSS or SVG tricks
  const shapeBoundsMaxX = Math.max(...shapePoints.map(([x]) => x));

  // Expand viewBox for annotations
  const padRight = 40;
  const padBottom = 40;
  const viewBox = `0 0 ${Math.max(width, shapeBoundsMaxX) + padRight} ${height + padBottom}`;

  // Determine submodule regions – both submodules use the full module area
  const sub2On = module.submodule2Enabled;

  // Compute matrix sizes for dashed rects and dimension annotations
  const sub1Matrix = computeMatrixSize(module.submodule1);
  const sub2Matrix = sub2On ? computeMatrixSize(module.submodule2) : null;

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

  // Submodule 1 position annotations
  const sub1X = module.submodule1.distanceToBorderX;
  const sub1Y = module.submodule1.distanceToBorderY;
  const sub1MatrixTop = sub1Y;
  const sub1MatrixLeft = sub1X;

  // Submodule 2 position annotations (relative to module origin, same as sub1)
  const sub2X = module.submodule2.distanceToBorderX;
  const sub2Y = module.submodule2.distanceToBorderY;

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
      {/* Clip path for module shape */}
      <defs>
        <clipPath id="module-shape-clip">
          <polygon points={shapePointsStr} />
        </clipPath>
      </defs>

      {/* Module outline (shape-aware) */}
      <polygon points={shapePointsStr} fill="none" stroke="#94a3b8" strokeWidth={1} />

      {/* Backglass background (shape-aware) */}
      <polygon points={shapePointsStr} fill={bgColor} strokeWidth={0} />

      {/* Submodule 1 dashed border around cell matrix */}
      <rect
        x={sub1MatrixLeft}
        y={sub1MatrixTop}
        width={sub1Matrix.matrixW}
        height={sub1Matrix.matrixH}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={0.5}
        strokeDasharray="4 2"
        opacity={0.4}
      />

      {/* Submodule 1 X/Y dimension annotations */}
      {sub1X > 5 && (
        <DimensionAnnotation
          x1={0} y1={sub1MatrixTop + sub1Matrix.matrixH / 2}
          x2={sub1MatrixLeft} y2={sub1MatrixTop + sub1Matrix.matrixH / 2}
          label={`X: ${sub1X} mm`}
          orientation="horizontal"
        />
      )}
      {sub1Y > 5 && (
        <DimensionAnnotation
          x1={sub1MatrixLeft + sub1Matrix.matrixW / 2} y1={0}
          x2={sub1MatrixLeft + sub1Matrix.matrixW / 2} y2={sub1MatrixTop}
          label={`Y: ${sub1Y} mm`}
          orientation="vertical"
        />
      )}

      {/* Submodule 1 draggable group */}
      <g
        style={{ cursor: dragState?.subKey === 'submodule1' ? 'grabbing' : 'grab' }}
        onMouseDown={(e) => handleMouseDown(e, 'submodule1')}
      >
        <SubmoduleSVG
          sub={module.submodule1}
          module={module}
          regionY={0}
          regionX={0}
        />
      </g>

      {/* Submodule 2 (if enabled) */}
      {sub2On && sub2Matrix && (
        <>
          {/* Sub2 dashed border around cell matrix */}
          <rect
            x={sub2X}
            y={sub2Y}
            width={sub2Matrix.matrixW}
            height={sub2Matrix.matrixH}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={0.5}
            strokeDasharray="4 2"
            opacity={0.4}
          />

          {/* Submodule 2 X/Y dimension annotations */}
          {sub2X > 5 && (
            <DimensionAnnotation
              x1={0} y1={sub2Y + sub2Matrix.matrixH / 2}
              x2={sub2X} y2={sub2Y + sub2Matrix.matrixH / 2}
              label={`X: ${sub2X} mm`}
              orientation="horizontal"
            />
          )}
          {sub2Y > 5 && (
            <DimensionAnnotation
              x1={sub2X + sub2Matrix.matrixW / 2} y1={0}
              x2={sub2X + sub2Matrix.matrixW / 2} y2={sub2Y}
              label={`Y: ${sub2Y} mm`}
              orientation="vertical"
            />
          )}

          {/* Submodule 2 draggable group */}
          <g
            style={{ cursor: dragState?.subKey === 'submodule2' ? 'grabbing' : 'grab' }}
            onMouseDown={(e) => handleMouseDown(e, 'submodule2')}
          >
            <SubmoduleSVG
              sub={module.submodule2}
              module={module}
              regionY={0}
              regionX={0}
            />
          </g>
        </>
      )}

      {/* Semi-transparent module color overlay (shape-aware) */}
      <polygon
        points={shapePointsStr}
        fill={overlayColor}
        opacity={0.15}
        pointerEvents="none"
      />

      {/* Dimension annotations (overall module size) */}
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
        x1={shapeBoundsMaxX + 15}
        y1={0}
        x2={shapeBoundsMaxX + 15}
        y2={height}
        stroke="#64748b"
        strokeWidth={0.8}
      />
      <text
        x={shapeBoundsMaxX + 20}
        y={height / 2}
        fontSize={10}
        fill="#64748b"
        transform={`rotate(90, ${shapeBoundsMaxX + 20}, ${height / 2})`}
        textAnchor="middle"
      >
        {height} mm
      </text>

      {/* Shape-specific dimension annotations */}
      {module.shape === 'parallelogram' && (
        <>
          {/* Skew angle indicator */}
          <text x={shapeBoundsMaxX / 2} y={height + 38} textAnchor="middle" fontSize={8} fill="#94a3b8">
            Skew: {module.skewAngle}°
          </text>
        </>
      )}
      {module.shape === 'trapezoid' && (
        <>
          {/* Cut dimension annotations */}
          <DimensionAnnotation
            x1={width - module.cutWidth} y1={0}
            x2={width} y2={0}
            label={`${module.cutWidth}`}
            orientation="horizontal"
          />
          <DimensionAnnotation
            x1={width} y1={0}
            x2={width} y2={module.cutHeight}
            label={`${module.cutHeight}`}
            orientation="vertical"
          />
        </>
      )}

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
