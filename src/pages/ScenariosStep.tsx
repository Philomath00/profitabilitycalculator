import { useState } from "react";
import { useAppState } from "../state/AppStateContext";
import { duplicateScenario } from "../domain/scenario";
import { ScenarioComparison } from "../components/ScenarioComparison";

/** FR-023-024: create/duplicate/compare scenarios; the founder authors what "conservative" etc. means. */
export function ScenariosStep() {
  const { state, addScenario, removeScenario, setActiveScenarioId, updateScenario } = useAppState();
  const [newName, setNewName] = useState("");

  function handleDuplicate() {
    if (!state.activeScenarioId) return;
    const source = state.scenarios.find((s) => s.id === state.activeScenarioId);
    if (!source) return;
    const name = newName.trim() || `${source.name} (copy)`;
    const copy = duplicateScenario(source, name);
    addScenario(copy);
    setActiveScenarioId(copy.id);
    setNewName("");
  }

  return (
    <section aria-labelledby="scenarios-heading">
      <h2 id="scenarios-heading">Scenarios</h2>

      <ul>
        {state.scenarios.map((scenario) => (
          <li key={scenario.id}>
            <label>
              <input
                type="radio"
                name="active-scenario"
                checked={state.activeScenarioId === scenario.id}
                onChange={() => setActiveScenarioId(scenario.id)}
              />
              <input
                type="text"
                aria-label={`Name for scenario`}
                value={scenario.name}
                onChange={(e) =>
                  updateScenario(scenario.id, (s) => ({ ...s, name: e.target.value }))
                }
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={scenario.isBaseCase}
                onChange={() =>
                  updateScenario(scenario.id, (s) => ({ ...s, isBaseCase: !s.isBaseCase }))
                }
              />
              Base case
            </label>
            {state.scenarios.length > 1 && (
              <button type="button" onClick={() => removeScenario(scenario.id)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      <div>
        <label htmlFor="new-scenario-name">
          Duplicate the selected scenario as a new one, e.g. "Conservative" or "Optimistic"
        </label>
        <input
          id="new-scenario-name"
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="button" onClick={handleDuplicate}>
          Duplicate scenario
        </button>
      </div>

      {state.businessProfile && state.scenarios.length > 1 && (
        <ScenarioComparison
          businessProfile={state.businessProfile}
          scenarios={state.scenarios}
        />
      )}
    </section>
  );
}
