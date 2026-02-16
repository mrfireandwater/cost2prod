import { useState, useCallback, useRef } from 'react';
import { AppProvider } from './context/AppContext';
import ModuleDesigner from './components/ModuleDesigner/ModuleDesigner';
import ModulePreview from './components/ModulePreview/ModulePreview';
import ProductionLine from './components/ProductionLine/ProductionLine';
import CostBreakdown from './components/CostBreakdown/CostBreakdown';
import Settings from './components/Settings/Settings';

type Tab = 'design' | 'production' | 'settings';

// Draggable resize handle between two panels
function ResizeHandle({
  onDrag,
}: {
  onDrag: (deltaX: number) => void;
}) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    lastX.current = e.clientX;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const dx = ev.clientX - lastX.current;
      lastX.current = ev.clientX;
      onDrag(dx);
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [onDrag]);

  return (
    <div
      className="w-1.5 flex-shrink-0 cursor-col-resize bg-slate-200 hover:bg-blue-400 active:bg-blue-500 transition-colors"
      onMouseDown={handleMouseDown}
    />
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('design');
  // Default designer width: 320px * 1.3 = 416px
  const [designerWidth, setDesignerWidth] = useState(416);
  // Default production cost panel width
  const [costPanelWidth, setCostPanelWidth] = useState(420);

  const handleDesignerResize = useCallback((dx: number) => {
    setDesignerWidth((prev) => Math.max(280, Math.min(800, prev + dx)));
  }, []);

  const handleCostPanelResize = useCallback((dx: number) => {
    // Cost panel is on the right, so dragging right shrinks it
    setCostPanelWidth((prev) => Math.max(280, Math.min(700, prev - dx)));
  }, []);

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            C2P
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Cost2Prod</h1>
            <p className="text-[10px] text-slate-400">Solar Module Cost Calculator</p>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab('design')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'design'
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            Module Design
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'production'
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            Production & Costs
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            Settings
          </button>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex flex-1 overflow-hidden">
        {activeTab === 'design' ? (
          <>
            {/* Left panel: Module Designer (resizable) */}
            <div
              className="flex-shrink-0 overflow-hidden bg-white"
              style={{ width: designerWidth }}
            >
              <ModuleDesigner />
            </div>

            <ResizeHandle onDrag={handleDesignerResize} />

            {/* Right: Module Preview */}
            <div className="flex-1 overflow-hidden bg-white">
              <ModulePreview />
            </div>
          </>
        ) : activeTab === 'production' ? (
          <>
            {/* Left: Production Line */}
            <div className="flex-1 overflow-hidden bg-white">
              <ProductionLine />
            </div>

            <ResizeHandle onDrag={handleCostPanelResize} />

            {/* Right: Cost Breakdown Charts (resizable) */}
            <div
              className="flex-shrink-0 overflow-hidden bg-white"
              style={{ width: costPanelWidth }}
            >
              <CostBreakdown />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-hidden bg-white">
            <Settings />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-1 text-center text-[10px] text-slate-400">
        Cost2Prod - Solar Module Production Cost Calculator
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
