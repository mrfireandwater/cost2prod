import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  type SolarModule,
  createDefaultModule,
  computeTotalCells,
  computePower,
  FORMAT_SIZE_MAP,
} from '../models/solarModule';
import {
  DEFAULT_SECTIONS,
  calculateCostsForModule,
  type ProductionSection,
  type SectionCost,
} from '../models/production';

interface AppState {
  modules: SolarModule[];
  selectedModuleId: string | null;
  sections: ProductionSection[];
  // Derived
  selectedModule: SolarModule | null;
  sectionCosts: SectionCost[];
  totalCost: number;
}

interface AppActions {
  addModule: () => void;
  removeModule: (id: string) => void;
  updateModule: (id: string, updates: Partial<SolarModule>) => void;
  selectModule: (id: string | null) => void;
  updateSection: (id: string, updates: Partial<ProductionSection>) => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<SolarModule[]>(() => {
    const m = createDefaultModule(uuidv4(), 'Module 1');
    return [m];
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [sections, setSections] = useState<ProductionSection[]>(DEFAULT_SECTIONS);

  const selectedModule = modules.find((m) => m.id === selectedModuleId) ?? null;

  // Calculate costs for selected module
  const { sectionCosts, totalCost } = (() => {
    if (!selectedModule) return { sectionCosts: [], totalCost: 0 };
    const areaM2 = (selectedModule.width * selectedModule.height) / 1_000_000;
    return calculateCostsForModule(sections, selectedModule.totalCells, areaM2);
  })();

  const addModule = useCallback(() => {
    const id = uuidv4();
    const name = `Module ${modules.length + 1}`;
    setModules((prev) => [...prev, createDefaultModule(id, name)]);
  }, [modules.length]);

  const removeModule = useCallback((id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    setSelectedModuleId((prev) => (prev === id ? null : prev));
  }, []);

  const updateModule = useCallback((id: string, updates: Partial<SolarModule>) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, ...updates };

        // Auto-set cellSizeMm when format changes
        if (updates.cellFormat) {
          updated.cellSizeMm = FORMAT_SIZE_MAP[updates.cellFormat] ?? m.cellSizeMm;
        }

        // Recompute totalCells if layout changed
        if (updates.cellLayout) {
          updated.totalCells = computeTotalCells(updates.cellLayout);
        }

        // Recompute power whenever relevant fields change
        if (
          updates.cellLayout ||
          updates.cellFormat ||
          updates.moduleColorType !== undefined ||
          updates.texturedGlass !== undefined
        ) {
          updated.powerWp = computePower(
            updated.totalCells,
            updated.cellFormat,
            updated.cellLayout.halfCut,
            updated.moduleColorType,
            updated.texturedGlass
          );
        }

        return updated;
      })
    );
  }, []);

  const selectModule = useCallback((id: string | null) => {
    setSelectedModuleId(id);
  }, []);

  const updateSection = useCallback((id: string, updates: Partial<ProductionSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  return (
    <AppContext.Provider
      value={{
        modules,
        selectedModuleId,
        sections,
        selectedModule,
        sectionCosts,
        totalCost,
        addModule,
        removeModule,
        updateModule,
        selectModule,
        updateSection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
