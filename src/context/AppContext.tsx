import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  type SolarModule,
  type SubmoduleConfig,
  createDefaultModule,
  computeSubmoduleCells,
  computeModulePower,
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
  updateSubmodule: (moduleId: string, subKey: 'submodule1' | 'submodule2', updates: Partial<SubmoduleConfig>) => void;
  selectModule: (id: string | null) => void;
  updateSection: (id: string, updates: Partial<ProductionSection>) => void;
  updateSubStep: (sectionId: string, subStepId: string, updates: Partial<ProductionSubStep>) => void;
  updateMaterialConfig: (updates: Partial<MaterialConfig>) => void;
  updateStringConfig: (updates: Partial<StringConfig>) => void;
  updateSpacingConfig: (updates: Partial<SpacingConfig>) => void;
  updateMarginConfig: (updates: Partial<MarginConfig>) => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

// Derive glass color process from frontglass color
function deriveGlassColorProcess(frontglassColor: string): 'none' | 'morpho' | 'inkjet' {
  if (frontglassColor.startsWith('solarcolor-')) return 'morpho';
  return 'none';
}

// Recompute derived fields on a module
function recompute(m: SolarModule): SolarModule {
  const sub1Cells = computeSubmoduleCells(m.submodule1);
  const sub2Cells = m.submodule2Enabled ? computeSubmoduleCells(m.submodule2) : 0;
  return {
    ...m,
    totalCells: sub1Cells + sub2Cells,
    powerWp: computeModulePower(m.submodule1, m.submodule2Enabled, m.submodule2, m.frontglassColor, m.frontglassTexture),
  };
}

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
    const sub1 = selectedModule.submodule1;
    const params: ModuleCostParams = {
      totalCells: selectedModule.totalCells,
      areaM2: (selectedModule.width * selectedModule.height) / 1_000_000,
      numStrings: sub1.stringAmount + (selectedModule.submodule2Enabled ? selectedModule.submodule2.stringAmount : 0),
      cellType: sub1.cellType,
      cellFormat: sub1.cellFormat,
      glassType: selectedModule.frontglassTexture === 'anti-glare' ? 'anti-glare-3.2mm' : 'tempered-3.2mm',
      texturedGlass: selectedModule.frontglassTexture === 'textured',
      glassColorProcess: deriveGlassColorProcess(selectedModule.frontglassColor),
      isStandardString: sub1.standardLayout,
      stringsPrinted: selectedModule.frontglassColor.startsWith('solarcolor-'),
      useStandardSpacing: sub1.standardLayout,
      marginTop: sub1.distanceToBorderY,
      marginBottom: sub1.distanceToBorderY,
      marginLeft: sub1.distanceToBorderX,
      marginRight: sub1.distanceToBorderX,
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
        return recompute({ ...m, ...updates });
      })
    );
  }, []);

  const updateSubmodule = useCallback((moduleId: string, subKey: 'submodule1' | 'submodule2', updates: Partial<SubmoduleConfig>) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const updatedSub = { ...m[subKey], ...updates };
        return recompute({ ...m, [subKey]: updatedSub });
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
        updateSubmodule,
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
