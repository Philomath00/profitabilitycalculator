import { useAppState } from "../state/AppStateContext";
import { useProjection } from "../state/useProjection";
import { computeDashboardMetrics } from "../domain/dashboardMetrics";
import { DashboardMetrics } from "../components/DashboardMetrics";
import { RevenueExpensesChart } from "../components/RevenueExpensesChart";
import { ProfitabilityChart } from "../components/ProfitabilityChart";
import { CashRunwayChart } from "../components/CashRunwayChart";
import { Glossary } from "../components/Glossary";

/** Assembles the investor-ready dashboard (FR-026-031). */
export function DashboardStep() {
  const { state } = useAppState();
  const { rows, breakEven } = useProjection();

  if (!state.businessProfile || !breakEven || rows.length === 0) {
    return (
      <section aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading">Dashboard</h2>
        <p>Complete the Business, Revenue, and Expenses steps first to see your dashboard.</p>
      </section>
    );
  }

  const currency = state.businessProfile.currency;
  const metrics = computeDashboardMetrics(rows, breakEven);

  return (
    <section aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading">Dashboard</h2>
      <Glossary />
      <DashboardMetrics metrics={metrics} currency={currency} />
      <RevenueExpensesChart
        rows={rows}
        operatingBreakEvenMonth={breakEven.operatingBreakEvenMonth}
        currency={currency}
      />
      <ProfitabilityChart rows={rows} currency={currency} />
      <CashRunwayChart rows={rows} currency={currency} />
    </section>
  );
}
