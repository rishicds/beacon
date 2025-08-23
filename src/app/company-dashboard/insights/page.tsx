import SummarizedReport from "@/components/dashboard/summarized-report";
import NaturalLanguageQuery from "@/components/dashboard/natural-language-query";

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-8 p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Insights</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <SummarizedReport />
        <NaturalLanguageQuery />
      </div>
    </div>
  );
}
