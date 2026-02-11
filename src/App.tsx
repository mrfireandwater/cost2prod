import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import ModuleDesigner from './components/ModuleDesigner/ModuleDesigner';
import FacadeView from './components/FacadeView/FacadeView';
import ModulePreview from './components/ModulePreview/ModulePreview';
import ProductionLine from './components/ProductionLine/ProductionLine';
import CostBreakdown from './components/CostBreakdown/CostBreakdown';

type Tab = 'design' | 'production';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('design');

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
            Module Design & Facade
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
        </nav>
      </header>

      {/* Main content */}
      <main className="flex flex-1 overflow-hidden">
        {activeTab === 'design' ? (
          <>
            {/* Left panel: Module Designer */}
            <div className="w-80 flex-shrink-0 overflow-hidden border-r border-slate-200 bg-white">
              <ModuleDesigner />
            </div>

            {/* Center: Facade View */}
            <div className="flex-1 overflow-hidden bg-white border-r border-slate-200">
              <FacadeView />
            </div>

            {/* Right: Module Preview */}
            <div className="w-96 flex-shrink-0 overflow-hidden bg-white">
              <ModulePreview />
            </div>
          </>
        ) : (
          <>
            {/* Left: Production Line */}
            <div className="flex-1 overflow-hidden border-r border-slate-200 bg-white">
              <ProductionLine />
            </div>

            {/* Right: Cost Breakdown Charts */}
            <div className="w-[420px] flex-shrink-0 overflow-hidden bg-white">
              <CostBreakdown />
            </div>
          </>
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
