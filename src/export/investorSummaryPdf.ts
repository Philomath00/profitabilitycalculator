import jsPDF from "jspdf";
import type {
  BreakEvenResult,
  BusinessProfile,
  MonthlyProjectionRow,
  Scenario,
} from "../domain/types";
import {
  buildInvestorSummaryContent,
  type InvestorSummaryCategory,
} from "./investorSummaryContent";

const CATEGORY_LABELS: Record<InvestorSummaryCategory, string> = {
  fact: "FACT",
  assumption: "ASSUMPTION",
  calculated_result: "CALCULATED RESULT",
  projection: "PROJECTION",
};

/**
 * Per contracts/investor-summary-export.md: generated entirely client-side, no network
 * request. Every figure comes from buildInvestorSummaryContent(), which itself only reads
 * computeMonthlyProjection()/computeBreakEven() output — nothing here recomputes or rounds
 * independently.
 */
export function generateInvestorSummaryDocument(
  businessProfile: BusinessProfile,
  scenario: Scenario,
  projection: MonthlyProjectionRow[],
  breakEven: BreakEvenResult,
): File {
  const content = buildInvestorSummaryContent(businessProfile, scenario, projection, breakEven);
  const doc = new jsPDF();
  const marginX = 15;
  let y = 20;

  doc.setFontSize(16);
  doc.text(content.title, marginX, y);
  y += 10;

  doc.setFontSize(11);
  for (const line of content.lines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(`[${CATEGORY_LABELS[line.category]}]`, marginX, y);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(`${line.label}: ${line.value}`, 170);
    doc.text(wrapped, marginX + 38, y);
    y += 7 * wrapped.length;
  }

  y += 6;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "italic");
  const disclaimerLines = doc.splitTextToSize(content.disclaimer, 180);
  doc.text(disclaimerLines, marginX, y);

  const blob = doc.output("blob");
  const fileName = `investor-summary-${scenario.name.replace(/\s+/g, "-").toLowerCase()}.pdf`;
  return new File([blob], fileName, { type: "application/pdf" });
}
