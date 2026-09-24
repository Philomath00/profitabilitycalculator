const TERMS: { term: string; definition: string }[] = [
  {
    term: "Gross margin",
    definition:
      "The percentage of revenue left after subtracting variable costs (the costs that scale with sales). Higher means more of each dollar of revenue is available to cover fixed costs and profit.",
  },
  {
    term: "Burn rate",
    definition: "How much cash the business is spending, on net, in a given month.",
  },
  {
    term: "Runway",
    definition:
      "How many months the business can keep operating before its cash balance reaches zero, at the current pace of spending.",
  },
  {
    term: "Contribution margin",
    definition:
      "The profit each additional unit or customer generates after variable costs, before fixed costs are covered.",
  },
  {
    term: "Operating break-even",
    definition: "The first month a business's revenue covers that month's operating expenses.",
  },
  {
    term: "Cumulative break-even",
    definition:
      "The first month a business's total accumulated profit has recovered all of its prior accumulated losses.",
  },
  {
    term: "Operating profit",
    definition:
      "Revenue minus operating expenses for a period, before taxes (this product does not model taxes — see the investor summary disclaimer).",
  },
  {
    term: "Cumulative profitability",
    definition:
      "The running total of operating profit/loss added up from the start of the projection.",
  },
];

/** FR-044: plain-language explanations of financial terminology, alongside the underlying data. */
export function Glossary() {
  return (
    <details>
      <summary>What do these terms mean?</summary>
      <dl>
        {TERMS.map((t) => (
          <div key={t.term}>
            <dt>{t.term}</dt>
            <dd>{t.definition}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
