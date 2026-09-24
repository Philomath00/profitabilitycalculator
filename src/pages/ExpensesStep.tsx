import { useAppState } from "../state/AppStateContext";
import type { CostCategory, CostItem, VariableBasis } from "../domain/types";

const CATEGORY_OPTIONS: { value: CostCategory; label: string }[] = [
  { value: "fixed", label: "Fixed" },
  { value: "variable", label: "Variable" },
  { value: "one_time_startup", label: "Startup / one-time" },
  { value: "growth", label: "Growth" },
  { value: "custom", label: "Custom" },
];

function newCostItem(): CostItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    category: "fixed",
    amount: 0,
    variableBasis: null,
    startMonth: 1,
    endMonth: null,
  };
}

/** FR-008-010: fixed/variable/one-time/growth cost categories, plus custom categories. */
export function ExpensesStep() {
  const { activeScenario, updateActiveScenario } = useAppState();
  const items = activeScenario?.costItems ?? [];

  function updateItem(id: string, patch: Partial<CostItem>) {
    updateActiveScenario((scenario) => ({
      ...scenario,
      costItems: scenario.costItems.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  function addItem() {
    updateActiveScenario((scenario) => ({
      ...scenario,
      costItems: [...scenario.costItems, newCostItem()],
    }));
  }

  function removeItem(id: string) {
    updateActiveScenario((scenario) => ({
      ...scenario,
      costItems: scenario.costItems.filter((c) => c.id !== id),
    }));
  }

  return (
    <section aria-labelledby="expenses-heading">
      <h2 id="expenses-heading">Expenses</h2>
      {items.length === 0 && <p>No cost items yet.</p>}
      {items.map((item, index) => (
        <fieldset key={item.id}>
          <legend>Cost item {index + 1}</legend>

          <label htmlFor={`ci-name-${item.id}`}>Name</label>
          <input
            id={`ci-name-${item.id}`}
            type="text"
            value={item.name}
            onChange={(e) => updateItem(item.id, { name: e.target.value })}
          />

          <label htmlFor={`ci-category-${item.id}`}>Category</label>
          <select
            id={`ci-category-${item.id}`}
            value={item.category}
            onChange={(e) => {
              const category = e.target.value as CostCategory;
              updateItem(item.id, {
                category,
                variableBasis: category === "variable" ? (item.variableBasis ?? "percent_of_revenue") : null,
              });
            }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {item.category === "variable" && (
            <>
              <label htmlFor={`ci-basis-${item.id}`}>Variable basis</label>
              <select
                id={`ci-basis-${item.id}`}
                value={item.variableBasis ?? "percent_of_revenue"}
                onChange={(e) => updateItem(item.id, { variableBasis: e.target.value as VariableBasis })}
              >
                <option value="percent_of_revenue">% of revenue</option>
                <option value="per_unit">Per unit sold</option>
              </select>
            </>
          )}

          <label htmlFor={`ci-amount-${item.id}`}>
            {item.category === "variable" && item.variableBasis === "percent_of_revenue"
              ? "Amount (%)"
              : "Amount (currency)"}
          </label>
          <input
            id={`ci-amount-${item.id}`}
            type="number"
            min={0}
            step="0.01"
            value={item.amount}
            onChange={(e) => updateItem(item.id, { amount: Number(e.target.value) })}
          />

          <label htmlFor={`ci-start-${item.id}`}>Start month</label>
          <input
            id={`ci-start-${item.id}`}
            type="number"
            min={1}
            value={item.startMonth}
            onChange={(e) => updateItem(item.id, { startMonth: Number(e.target.value) })}
          />

          {item.category !== "one_time_startup" && (
            <>
              <label htmlFor={`ci-end-${item.id}`}>End month (blank = continues through projection end)</label>
              <input
                id={`ci-end-${item.id}`}
                type="number"
                min={item.startMonth}
                value={item.endMonth ?? ""}
                onChange={(e) =>
                  updateItem(item.id, { endMonth: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </>
          )}

          <button type="button" onClick={() => removeItem(item.id)}>
            Remove this cost item
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={addItem}>
        Add cost item
      </button>
    </section>
  );
}
