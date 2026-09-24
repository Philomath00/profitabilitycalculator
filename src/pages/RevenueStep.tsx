import { useAppState } from "../state/AppStateContext";
import type { RevenueStream, RevenueStreamType } from "../domain/types";

const TYPE_OPTIONS: { value: RevenueStreamType; label: string }[] = [
  { value: "subscription", label: "Subscription (MRR-style)" },
  { value: "unit_sale", label: "Unit sale" },
  { value: "transaction_commission", label: "Transaction / commission" },
  { value: "custom", label: "Custom" },
];

function newRevenueStream(): RevenueStream {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "subscription",
    startingValue: 0,
    pricePerUnit: 0,
    growthRatePercentPerMonth: 0,
    churnRatePercent: 0,
    commissionRatePercent: null,
  };
}

/** FR-004-007: one or more revenue streams, growth/churn assumptions that change over time. */
export function RevenueStep() {
  const { activeScenario, updateActiveScenario } = useAppState();
  const streams = activeScenario?.revenueStreams ?? [];

  function updateStream(id: string, patch: Partial<RevenueStream>) {
    updateActiveScenario((scenario) => ({
      ...scenario,
      revenueStreams: scenario.revenueStreams.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function addStream() {
    updateActiveScenario((scenario) => ({
      ...scenario,
      revenueStreams: [...scenario.revenueStreams, newRevenueStream()],
    }));
  }

  function removeStream(id: string) {
    updateActiveScenario((scenario) => ({
      ...scenario,
      revenueStreams: scenario.revenueStreams.filter((s) => s.id !== id),
    }));
  }

  return (
    <section aria-labelledby="revenue-heading">
      <h2 id="revenue-heading">Revenue</h2>
      {streams.length === 0 && (
        <p>No revenue streams yet — add at least one to build a projection.</p>
      )}
      {streams.map((stream, index) => (
        <fieldset key={stream.id}>
          <legend>Revenue stream {index + 1}</legend>

          <label htmlFor={`rs-name-${stream.id}`}>Name</label>
          <input
            id={`rs-name-${stream.id}`}
            type="text"
            value={stream.name}
            onChange={(e) => updateStream(stream.id, { name: e.target.value })}
          />

          <label htmlFor={`rs-type-${stream.id}`}>Type</label>
          <select
            id={`rs-type-${stream.id}`}
            value={stream.type}
            onChange={(e) => updateStream(stream.id, { type: e.target.value as RevenueStreamType })}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label htmlFor={`rs-starting-${stream.id}`}>
            {stream.type === "transaction_commission"
              ? "Starting transaction volume"
              : "Starting customers/units"}
          </label>
          <input
            id={`rs-starting-${stream.id}`}
            type="number"
            min={0}
            value={stream.startingValue}
            onChange={(e) => updateStream(stream.id, { startingValue: Number(e.target.value) })}
          />

          {stream.type === "transaction_commission" ? (
            <>
              <label htmlFor={`rs-commission-${stream.id}`}>Commission / take rate (%)</label>
              <input
                id={`rs-commission-${stream.id}`}
                type="number"
                min={0}
                max={100}
                value={stream.commissionRatePercent ?? 0}
                onChange={(e) =>
                  updateStream(stream.id, { commissionRatePercent: Number(e.target.value) })
                }
              />
            </>
          ) : (
            <>
              <label htmlFor={`rs-price-${stream.id}`}>Price per unit / subscriber</label>
              <input
                id={`rs-price-${stream.id}`}
                type="number"
                min={0}
                step="0.01"
                value={stream.pricePerUnit ?? 0}
                onChange={(e) => updateStream(stream.id, { pricePerUnit: Number(e.target.value) })}
              />
            </>
          )}

          <label htmlFor={`rs-growth-${stream.id}`}>Monthly growth rate (%, may be negative)</label>
          <input
            id={`rs-growth-${stream.id}`}
            type="number"
            step="0.1"
            value={stream.growthRatePercentPerMonth}
            onChange={(e) =>
              updateStream(stream.id, { growthRatePercentPerMonth: Number(e.target.value) })
            }
          />

          <label htmlFor={`rs-churn-${stream.id}`}>Monthly churn rate (%)</label>
          <input
            id={`rs-churn-${stream.id}`}
            type="number"
            min={0}
            max={100}
            value={stream.churnRatePercent}
            onChange={(e) => updateStream(stream.id, { churnRatePercent: Number(e.target.value) })}
          />

          <button type="button" onClick={() => removeStream(stream.id)}>
            Remove this revenue stream
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={addStream}>
        Add revenue stream
      </button>
    </section>
  );
}
