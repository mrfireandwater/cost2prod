import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { type SolarModule, createDefaultModule, getCellGeometry } from '../models/solarModule';
import { type FacadeConfig, createDefaultFacade } from '../models/facade';
import {
  DEFAULT_SECTIONS,
  calculateCostsForModule,
  type ProductionSection,
  type SectionCost,
  type ProductionSubcategory,
  type SubcategoryCostModel,
} from '../models/production';

interface AppState {
  modules: SolarModule[];
  selectedModuleId: string | null;
  facade: FacadeConfig;
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
  updateFacade: (updates: Partial<FacadeConfig>) => void;
  assignModuleToSlot: (row: number, col: number, moduleId: string) => void;
  updateSection: (id: string, updates: Partial<ProductionSection>) => void;
  updateSubcategoryCost: (sectionId: string, subcategoryId: string, updates: Partial<SubcategoryCostModel>) => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<SolarModule[]>(() => {
    const m = createDefaultModule(uuidv4(), 'Module 1');
    return [m];
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [facade, setFacade] = useState<FacadeConfig>(createDefaultFacade);
  const [sections, setSections] = useState<ProductionSection[]>(DEFAULT_SECTIONS);

  const selectedModule = modules.find((m) => m.id === selectedModuleId) ?? null;

  // Calculate costs for selected module
  const { sectionCosts, totalCost } = (() => {
    if (!selectedModule) return { sectionCosts: [] as SectionCost[], totalCost: 0 };
    const areaM2 = (selectedModule.width * selectedModule.height) / 1_000_000;
    return calculateCostsForModule(sections, selectedModule.totalCells, areaM2, selectedModule);
  })();

  const addModule = useCallback(() => {
    const id = uuidv4();
    const name = `Module ${modules.length + 1}`;
    setModules((prev) => [...prev, createDefaultModule(id, name)]);
  }, [modules.length]);

  const removeModule = useCallback((id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    setSelectedModuleId((prev) => (prev === id ? null : prev));
    setFacade((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.moduleId === id ? { ...s, moduleId: '' } : s)),
    }));
  }, []);

  const updateModule = useCallback((id: string, updates: Partial<SolarModule>) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, ...updates };
        // Recompute totalCells if layout changed
        if (updates.cellLayout) {
          const layout = updates.cellLayout;
          updated.totalCells = layout.rows * layout.columns * (layout.halfCut ? 2 : 1);
        }
        // If cell geometry changed, update related fields
        if (updates.cellGeometryId) {
          const geom = getCellGeometry(updates.cellGeometryId);
          updated.cellSizeMm = geom.cellWidthMm;
          updated.ribbonCount = geom.defaultRibbonCount;
          updated.cellLayout = {
            ...updated.cellLayout,
            halfCut: geom.halfCut,
          };
          updated.totalCells = updated.cellLayout.rows * updated.cellLayout.columns * (geom.halfCut ? 2 : 1);
        }
        return updated;
      })
    );
  }, []);

  const selectModule = useCallback((id: string | null) => {
    setSelectedModuleId(id);
  }, []);

  const updateFacade = useCallback((updates: Partial<FacadeConfig>) => {
    setFacade((prev) => {
      const next = { ...prev, ...updates };
      // Rebuild slots if grid size changed
      if (updates.rows !== undefined || updates.columns !== undefined) {
        const rows = updates.rows ?? prev.rows;
        const cols = updates.columns ?? prev.columns;
        const newSlots = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const existing = prev.slots.find((s) => s.row === r && s.col === c);
            newSlots.push(existing ?? { moduleId: '', row: r, col: c });
          }
        }
        next.slots = newSlots;
      }
      return next;
    });
  }, []);

  const assignModuleToSlot = useCallback((row: number, col: number, moduleId: string) => {
    setFacade((prev) => ({
      ...prev,
      slots: prev.slots.map((s) =>
        s.row === row && s.col === col ? { ...s, moduleId } : s
      ),
    }));
  }, []);

  const updateSection = useCallback((id: string, updates: Partial<ProductionSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const updateSubcategoryCost = useCallback(
    (sectionId: string, subcategoryId: string, updates: Partial<SubcategoryCostModel>) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            subcategories: s.subcategories.map((sub: ProductionSubcategory) =>
              sub.id === subcategoryId
                ? { ...sub, costModel: { ...sub.costModel, ...updates } }
                : sub
            ),
          };
        })
      );
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        modules,
        selectedModuleId,
        facade,
        sections,
        selectedModule,
        sectionCosts,
        totalCost,
        addModule,
        removeModule,
        updateModule,
        selectModule,
        updateFacade,
        assignModuleToSlot,
        updateSection,
        updateSubcategoryCost,
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
