import { useAppState } from "../state/AppStateContext";
import type { FundingSource, FundingType } from "../domain/types";

const TYPE_OPTIONS: { value: FundingType; label: string }[] = [
  { value: "founder_capital", label: "Founder capital" },
  { value: "investment", label: "Investment" },
  { value: "grant", label: "Grant" },
  { value: "loan", label: "Loan" },
  { value: "other", label: "Other" },
];

function newFundingSource(): FundingSource {
  return { id: crypto.randomUUID(), type: "founder_capital", amount: 0, receivedMonth: 1 };
}

/**
 * FR-011-012: funding is cash the founder plans to receive during the projection; it is
 * never treated as operating revenue (see src/domain/projection.ts). Cash already on hand
 * at the start of the projection is entered on the Business step as `startingCash`.
 */
export function FundingStep() {
  const { activeScenario, updateActiveScenario } = useAppState();
  const sources = activeScenario?.fundingSources ?? [];

  function updateSource(id: string, patch: Partial<FundingSource>) {
    updateActiveScenario((scenario) => ({
      ...scenario,
      fundingSources: scenario.fundingSources.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  }

  function addSource() {
    updateActiveScenario((scenario) => ({
      ...scenario,
      fundingSources: [...scenario.fundingSources, newFundingSource()],
    }));
  }

  function removeSource(id: string) {
    updateActiveScenario((scenario) => ({
      ...scenario,
      fundingSources: scenario.fundingSources.filter((f) => f.id !== id),
    }));
  }

  return (
    <section aria-labelledby="funding-heading">
      <h2 id="funding-heading">Funding</h2>
      <p>
        Cash already on hand is set on the Business step as starting cash. Add any additional
        funding you expect to receive <em>during</em> the projection below.
      </p>
      {sources.map((source, index) => (
        <fieldset key={source.id}>
          <legend>Funding source {index + 1}</legend>

          <label htmlFor={`fs-type-${source.id}`}>Type</label>
          <select
            id={`fs-type-${source.id}`}
            value={source.type}
            onChange={(e) => updateSource(source.id, { type: e.target.value as FundingType })}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label htmlFor={`fs-amount-${source.id}`}>Amount</label>
          <input
            id={`fs-amount-${source.id}`}
            type="number"
            min={0}
            step="0.01"
            value={source.amount}
            onChange={(e) => updateSource(source.id, { amount: Number(e.target.value) })}
          />

          <label htmlFor={`fs-month-${source.id}`}>Month received</label>
          <input
            id={`fs-month-${source.id}`}
            type="number"
            min={1}
            value={source.receivedMonth}
            onChange={(e) => updateSource(source.id, { receivedMonth: Number(e.target.value) })}
          />

          <button type="button" onClick={() => removeSource(source.id)}>
            Remove this funding source
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={addSource}>
        Add funding source
      </button>
    </section>
  );
}
