import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  type SolarModule,
  type SubmoduleConfig,
  type SubmoduleKey,
  createDefaultModule,
  computeSubmoduleCells,
  computeModulePower,
  computeJunctionBoxCount,
  getEnabledSubmodules,
  getGlassTypeDef,
} from '../models/solarModule';
import {
  DEFAULT_SECTIONS,
  DEFAULT_MATERIAL_CONFIG,
  DEFAULT_STRING_CONFIG,
  DEFAULT_SPACING_CONFIG,
  DEFAULT_MARGIN_CONFIG,
  calculateCosts,
  computeOptimalCost,
  calculateFixedAndVariableCosts,
  costPerUnitAtQuantity,
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
  optimalCost: number;
  costOptimizationDelta: number; // current - optimal in CHF
  costOptimizationRatio: number; // 0=green(optimal) to 1=red(far from optimal)
  // Quantity cost curve data
  quantityCostCurve: { quantity: number; costPerUnit: number }[];
}

interface AppActions {
  addModule: () => void;
  removeModule: (id: string) => void;
  updateModule: (id: string, updates: Partial<SolarModule>) => void;
  updateSubmodule: (moduleId: string, subKey: SubmoduleKey, updates: Partial<SubmoduleConfig>) => void;
  selectModule: (id: string | null) => void;
  updateSection: (id: string, updates: Partial<ProductionSection>) => void;
  updateSubStep: (sectionId: string, subStepId: string, updates: Partial<ProductionSubStep>) => void;
  updateMaterialConfig: (updates: Partial<MaterialConfig>) => void;
  updateStringConfig: (updates: Partial<StringConfig>) => void;
  updateSpacingConfig: (updates: Partial<SpacingConfig>) => void;
  updateMarginConfig: (updates: Partial<MarginConfig>) => void;
  importModules: (modules: SolarModule[]) => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

// ── LocalStorage persistence ──
const STORAGE_KEY_MODULES = 'cost2prod-modules';
const STORAGE_KEY_SELECTED = 'cost2prod-selected-module';

/** Backfill missing fields on modules loaded from localStorage (schema migration) */
function migrateModule(m: Partial<SolarModule>): SolarModule {
  const defaults = createDefaultModule(m.id ?? '', m.name ?? 'Module');
  return {
    ...defaults,
    ...m,
    // Ensure new submodule fields exist
    quantity: m.quantity ?? 1,
    submodule3Enabled: m.submodule3Enabled ?? false,
    submodule3: m.submodule3 ?? defaults.submodule3,
    submodule4Enabled: m.submodule4Enabled ?? false,
    submodule4: m.submodule4 ?? defaults.submodule4,
    submodule5Enabled: m.submodule5Enabled ?? false,
    submodule5: m.submodule5 ?? defaults.submodule5,
  };
}

function loadModules(): SolarModule[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MODULES);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((m: Partial<SolarModule>) => migrateModule(m));
    }
  } catch { /* ignore corrupt data */ }
  return null;
}

function saveModules(modules: SolarModule[]) {
  try { localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(modules)); } catch { /* quota exceeded */ }
}

function loadSelectedId(): string | null {
  try { return localStorage.getItem(STORAGE_KEY_SELECTED); } catch { return null; }
}

function saveSelectedId(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY_SELECTED, id);
    else localStorage.removeItem(STORAGE_KEY_SELECTED);
  } catch { /* ignore */ }
}

// Recompute derived fields on a module
function recompute(m: SolarModule): SolarModule {
  const enabledSubs = getEnabledSubmodules(m);
  const totalCells = enabledSubs.reduce((sum, s) => sum + computeSubmoduleCells(s), 0);
  return {
    ...m,
    totalCells,
    powerWp: computeModulePower(
      m.submodule1, m.submodule2Enabled, m.submodule2, m.moduleColorId, m.frontGlassId,
      m.submodule3Enabled, m.submodule3, m.submodule4Enabled, m.submodule4, m.submodule5Enabled, m.submodule5,
    ),
    junctionBoxCount: computeJunctionBoxCount(
      m.submodule1, m.submodule2Enabled, m.submodule2,
      m.submodule3Enabled, m.submodule3, m.submodule4Enabled, m.submodule4, m.submodule5Enabled, m.submodule5,
    ),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<SolarModule[]>(() => {
    const saved = loadModules();
    if (saved) return saved.map(recompute);
    return [createDefaultModule(uuidv4(), 'Module 1')];
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(() => {
    const savedId = loadSelectedId();
    // Validate that the saved ID exists in the loaded modules
    const saved = loadModules();
    if (savedId && saved?.some((m) => m.id === savedId)) return savedId;
    return null;
  });
  const [sections, setSections] = useState<ProductionSection[]>(DEFAULT_SECTIONS);
  const [materialConfig, setMaterialConfig] = useState<MaterialConfig>(DEFAULT_MATERIAL_CONFIG);
  const [stringConfig, setStringConfig] = useState<StringConfig>(DEFAULT_STRING_CONFIG);
  const [spacingConfig, setSpacingConfig] = useState<SpacingConfig>(DEFAULT_SPACING_CONFIG);
  const [marginConfig, setMarginConfig] = useState<MarginConfig>(DEFAULT_MARGIN_CONFIG);

  // Persist to localStorage on change
  useEffect(() => { saveModules(modules); }, [modules]);
  useEffect(() => { saveSelectedId(selectedModuleId); }, [selectedModuleId]);

  const selectedModule = modules.find((m) => m.id === selectedModuleId) ?? null;

  // Build cost params from the selected module
  function buildCostParams(mod: SolarModule): ModuleCostParams {
    const sub1 = mod.submodule1;
    const enabledSubs = getEnabledSubmodules(mod);
    const frontGlass = getGlassTypeDef(mod.frontGlassId);
    const backGlass = getGlassTypeDef(mod.backGlassId);
    return {
      totalCells: mod.totalCells,
      areaM2: (mod.width * mod.height) / 1_000_000,
      numStrings: enabledSubs.reduce((sum, s) => sum + s.stringAmount, 0),
      cellTypeId: sub1.cellTypeId,
      frontGlassId: mod.frontGlassId,
      backGlassId: mod.backGlassId,
      frontGlassPricePerM2: frontGlass.priceCHFPerM2,
      backGlassPricePerM2: backGlass.priceCHFPerM2,
      isStandardString: sub1.standardLayout,
      stringsPrinted: mod.moduleColorId.startsWith('solarcolor-'),
      useStandardSpacing: sub1.standardLayout,
      marginTop: sub1.distanceToBorderY,
      marginBottom: sub1.distanceToBorderY,
      marginLeft: sub1.distanceToBorderX,
      marginRight: sub1.distanceToBorderX,
      junctionBoxCount: mod.junctionBoxCount,
    };
  }

  // Calculate costs for selected module
  const QUANTITY_STEPS = [1, 5, 10, 20, 50, 100, 200, 1000];

  const { sectionCosts, totalCost, optimalCost, costOptimizationDelta, costOptimizationRatio, quantityCostCurve } = (() => {
    if (!selectedModule) return { sectionCosts: [] as SectionCost[], totalCost: 0, optimalCost: 0, costOptimizationDelta: 0, costOptimizationRatio: 0, quantityCostCurve: [] as { quantity: number; costPerUnit: number }[] };
    const params = buildCostParams(selectedModule);
    const result = calculateCosts(sections, materialConfig, stringConfig, spacingConfig, marginConfig, params);
    const optimal = computeOptimalCost(sections, materialConfig, stringConfig, spacingConfig, marginConfig, params, selectedModule.powerWp);
    const delta = Math.max(0, result.totalCost - optimal);
    const ratio = Math.min(1, delta / 50);

    // Quantity cost curve
    const { fixedCost, variableCost } = calculateFixedAndVariableCosts(sections, materialConfig, stringConfig, spacingConfig, marginConfig, params);
    const quantityCostCurve = QUANTITY_STEPS.map((q) => ({
      quantity: q,
      costPerUnit: costPerUnitAtQuantity(fixedCost, variableCost, q),
    }));

    return {
      ...result,
      optimalCost: Math.round(optimal * 100) / 100,
      costOptimizationDelta: Math.round(delta * 100) / 100,
      costOptimizationRatio: ratio,
      quantityCostCurve,
    };
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

  const updateSubmodule = useCallback((moduleId: string, subKey: SubmoduleKey, updates: Partial<SubmoduleConfig>) => {
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

  const importModules = useCallback((imported: SolarModule[]) => {
    const migrated = imported.map((m) => recompute(migrateModule(m)));
    setModules(migrated);
    setSelectedModuleId(migrated.length > 0 ? migrated[0].id : null);
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
        optimalCost,
        costOptimizationDelta,
        costOptimizationRatio,
        quantityCostCurve,
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
        importModules,
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
