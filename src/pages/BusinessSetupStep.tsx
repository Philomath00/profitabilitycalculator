import { useState } from "react";
import { useAppState } from "../state/AppStateContext";
import type { BusinessModelType, BusinessProfile } from "../domain/types";
import { validateInputs } from "../domain/validation";

const BUSINESS_MODEL_OPTIONS: { value: BusinessModelType; label: string }[] = [
  { value: "saas_subscription", label: "SaaS / Subscription" },
  { value: "marketplace", label: "Marketplace" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "service", label: "Service business" },
  { value: "transactional", label: "Transactional business" },
  { value: "product", label: "Product business" },
  { value: "hybrid", label: "Hybrid" },
  { value: "other", label: "Other" },
];

const PERIOD_OPTIONS = [12, 24, 36, 60] as const;

function emptyProfile(): BusinessProfile {
  return {
    id: crypto.randomUUID(),
    name: "",
    industry: "",
    businessModelType: "saas_subscription",
    currency: "USD",
    projectionStartDate: new Date().toISOString().slice(0, 10),
    projectionPeriodMonths: 24,
    startingCash: 0,
  };
}

/** FR-001-003: business profile inputs. */
export function BusinessSetupStep() {
  const { state, setBusinessProfile } = useAppState();
  const [draft, setDraft] = useState<BusinessProfile>(state.businessProfile ?? emptyProfile());

  const issues = validateInputs(draft, { revenueStreams: [] }).filter((i) =>
    i.field.startsWith("businessProfile"),
  );

  function update<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    setBusinessProfile(next);
  }

  const issueFor = (field: string) => issues.find((i) => i.field === `businessProfile.${field}`);

  return (
    <section aria-labelledby="business-setup-heading">
      <h2 id="business-setup-heading">Business</h2>
      <form>
        <div>
          <label htmlFor="business-name">Business / startup name</label>
          <input
            id="business-name"
            type="text"
            value={draft.name}
            maxLength={200}
            required
            aria-invalid={Boolean(issueFor("name"))}
            aria-describedby={issueFor("name") ? "business-name-error" : undefined}
            onChange={(e) => update("name", e.target.value)}
          />
          {issueFor("name") && (
            <p id="business-name-error" role="alert">
              {issueFor("name")!.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="business-industry">Industry / sector</label>
          <input
            id="business-industry"
            type="text"
            value={draft.industry}
            onChange={(e) => update("industry", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="business-model">Business model</label>
          <select
            id="business-model"
            value={draft.businessModelType}
            onChange={(e) => update("businessModelType", e.target.value as BusinessModelType)}
          >
            {BUSINESS_MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="business-currency">Primary currency (ISO 4217, e.g. USD)</label>
          <input
            id="business-currency"
            type="text"
            value={draft.currency}
            maxLength={3}
            aria-invalid={Boolean(issueFor("currency"))}
            aria-describedby={issueFor("currency") ? "business-currency-error" : undefined}
            onChange={(e) => update("currency", e.target.value.toUpperCase())}
          />
          {issueFor("currency") && (
            <p id="business-currency-error" role="alert">
              {issueFor("currency")!.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="business-start-date">Projection start date</label>
          <input
            id="business-start-date"
            type="date"
            value={draft.projectionStartDate}
            onChange={(e) => update("projectionStartDate", e.target.value)}
          />
        </div>

        <fieldset>
          <legend>Projection period</legend>
          {PERIOD_OPTIONS.map((months) => (
            <label key={months}>
              <input
                type="radio"
                name="projection-period"
                value={months}
                checked={draft.projectionPeriodMonths === months}
                onChange={() => update("projectionPeriodMonths", months)}
              />
              {months} months
            </label>
          ))}
        </fieldset>

        <div>
          <label htmlFor="business-starting-cash">Starting cash</label>
          <input
            id="business-starting-cash"
            type="number"
            min={0}
            step="0.01"
            value={draft.startingCash}
            aria-invalid={Boolean(issueFor("startingCash"))}
            aria-describedby={issueFor("startingCash") ? "business-starting-cash-error" : undefined}
            onChange={(e) => update("startingCash", Number(e.target.value))}
          />
          {issueFor("startingCash") && (
            <p id="business-starting-cash-error" role="alert">
              {issueFor("startingCash")!.message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
