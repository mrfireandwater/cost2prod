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
  DEFAULT_MATERIAL_CONFIG,
  DEFAULT_STRING_CONFIG,
  DEFAULT_SPACING_CONFIG,
  DEFAULT_MARGIN_CONFIG,
  calculateCosts,
  type ProductionSection,
  type ProductionSubStep,
  type MaterialConfig,
  type StringConfig,
  type SpacingConfig,
  type MarginConfig,
  type SectionCost,
  type ModuleCostParams,
} from '../models/production';

interface AppState {
  modules: SolarModule[];
  selectedModuleId: string | null;
  sections: ProductionSection[];
  materialConfig: MaterialConfig;
  stringConfig: StringConfig;
  spacingConfig: SpacingConfig;
  marginConfig: MarginConfig;
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
  updateSubStep: (sectionId: string, subStepId: string, updates: Partial<ProductionSubStep>) => void;
  updateMaterialConfig: (updates: Partial<MaterialConfig>) => void;
  updateStringConfig: (updates: Partial<StringConfig>) => void;
  updateSpacingConfig: (updates: Partial<SpacingConfig>) => void;
  updateMarginConfig: (updates: Partial<MarginConfig>) => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<SolarModule[]>(() => {
    const m = createDefaultModule(uuidv4(), 'Module 1');
    return [m];
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [sections, setSections] = useState<ProductionSection[]>(DEFAULT_SECTIONS);
  const [materialConfig, setMaterialConfig] = useState<MaterialConfig>(DEFAULT_MATERIAL_CONFIG);
  const [stringConfig, setStringConfig] = useState<StringConfig>(DEFAULT_STRING_CONFIG);
  const [spacingConfig, setSpacingConfig] = useState<SpacingConfig>(DEFAULT_SPACING_CONFIG);
  const [marginConfig, setMarginConfig] = useState<MarginConfig>(DEFAULT_MARGIN_CONFIG);

  const selectedModule = modules.find((m) => m.id === selectedModuleId) ?? null;

  // Calculate costs for selected module
  const { sectionCosts, totalCost } = (() => {
    if (!selectedModule) return { sectionCosts: [] as SectionCost[], totalCost: 0 };
    const params: ModuleCostParams = {
      totalCells: selectedModule.totalCells,
      areaM2: (selectedModule.width * selectedModule.height) / 1_000_000,
      numStrings: selectedModule.cellLayout.columns,
      cellType: selectedModule.cellType,
      cellFormat: selectedModule.cellFormat,
      glassType: selectedModule.glassType,
      texturedGlass: selectedModule.texturedGlass,
      glassColorProcess: selectedModule.glassColorProcess,
      isStandardString: selectedModule.isStandardString,
      stringsPrinted: selectedModule.stringsPrinted,
      useStandardSpacing: selectedModule.useStandardSpacing,
      marginTop: selectedModule.marginTop,
      marginBottom: selectedModule.marginBottom,
      marginLeft: selectedModule.marginLeft,
      marginRight: selectedModule.marginRight,
    };
    return calculateCosts(sections, materialConfig, stringConfig, spacingConfig, marginConfig, params);
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

  const updateSubStep = useCallback((sectionId: string, subStepId: string, updates: Partial<ProductionSubStep>) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          subSteps: s.subSteps.map((ss) => (ss.id === subStepId ? { ...ss, ...updates } : ss)),
        };
      })
    );
  }, []);

  const updateMaterialConfig = useCallback((updates: Partial<MaterialConfig>) => {
    setMaterialConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateStringConfig = useCallback((updates: Partial<StringConfig>) => {
    setStringConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSpacingConfig = useCallback((updates: Partial<SpacingConfig>) => {
    setSpacingConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateMarginConfig = useCallback((updates: Partial<MarginConfig>) => {
    setMarginConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        modules,
        selectedModuleId,
        sections,
        materialConfig,
        stringConfig,
        spacingConfig,
        marginConfig,
        selectedModule,
        sectionCosts,
        totalCost,
        addModule,
        removeModule,
        updateModule,
        selectModule,
        updateSection,
        updateSubStep,
        updateMaterialConfig,
        updateStringConfig,
        updateSpacingConfig,
        updateMarginConfig,
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
