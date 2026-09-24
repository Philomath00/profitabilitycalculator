import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { BusinessProfile, Scenario } from "../domain/types";

function defaultScenario(): Scenario {
  return {
    id: crypto.randomUUID(),
    businessProfileId: "",
    name: "Base Case",
    isBaseCase: true,
    revenueStreams: [],
    costItems: [],
    fundingSources: [],
  };
}

/**
 * In-memory-only application state (FR-045: no accounts, no persistence — data lives only
 * for the duration of the working session). Nothing here is ever written to localStorage,
 * a server, or any other durable store.
 */
export interface AppState {
  businessProfile: BusinessProfile | null;
  scenarios: Scenario[];
  activeScenarioId: string | null;
}

interface AppStateContextValue {
  state: AppState;
  activeScenario: Scenario;
  setBusinessProfile: (profile: BusinessProfile) => void;
  setScenarios: (scenarios: Scenario[]) => void;
  updateScenario: (scenarioId: string, updater: (scenario: Scenario) => Scenario) => void;
  updateActiveScenario: (updater: (scenario: Scenario) => Scenario) => void;
  addScenario: (scenario: Scenario) => void;
  removeScenario: (scenarioId: string) => void;
  setActiveScenarioId: (scenarioId: string) => void;
  hasUnsavedWork: boolean;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const initialScenario = defaultScenario();
    return {
      businessProfile: null,
      scenarios: [initialScenario],
      activeScenarioId: initialScenario.id,
    };
  });

  const setBusinessProfile = (profile: BusinessProfile) =>
    setState((prev) => ({
      ...prev,
      businessProfile: profile,
      scenarios: prev.scenarios.map((s) =>
        s.businessProfileId === "" ? { ...s, businessProfileId: profile.id } : s,
      ),
    }));

  const setScenarios = (scenarios: Scenario[]) =>
    setState((prev) => ({
      ...prev,
      scenarios,
      activeScenarioId: prev.activeScenarioId ?? scenarios[0]?.id ?? null,
    }));

  const updateScenario = (scenarioId: string, updater: (scenario: Scenario) => Scenario) =>
    setState((prev) => ({
      ...prev,
      scenarios: prev.scenarios.map((s) => (s.id === scenarioId ? updater(s) : s)),
    }));

  const setActiveScenarioId = (scenarioId: string) =>
    setState((prev) => ({ ...prev, activeScenarioId: scenarioId }));

  const addScenario = (scenario: Scenario) =>
    setState((prev) => ({ ...prev, scenarios: [...prev.scenarios, scenario] }));

  const removeScenario = (scenarioId: string) =>
    setState((prev) => {
      const scenarios = prev.scenarios.filter((s) => s.id !== scenarioId);
      const activeScenarioId =
        prev.activeScenarioId === scenarioId ? (scenarios[0]?.id ?? null) : prev.activeScenarioId;
      return { ...prev, scenarios, activeScenarioId };
    });

  const activeScenario =
    state.scenarios.find((s) => s.id === state.activeScenarioId) ?? state.scenarios[0];

  const updateActiveScenario = (updater: (scenario: Scenario) => Scenario) => {
    if (!activeScenario) return;
    updateScenario(activeScenario.id, updater);
  };

  const hasUnsavedWork =
    state.businessProfile !== null ||
    state.scenarios.some((s) => s.revenueStreams.length > 0 || s.costItems.length > 0);

  const value = useMemo(
    () => ({
      state,
      activeScenario,
      setBusinessProfile,
      setScenarios,
      updateScenario,
      updateActiveScenario,
      addScenario,
      removeScenario,
      setActiveScenarioId,
      hasUnsavedWork,
    }),
    [state, activeScenario, hasUnsavedWork, updateActiveScenario],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return ctx;
}
