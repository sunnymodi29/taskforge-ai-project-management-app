import { getBootstrapData } from "@/lib/queries/bootstrap";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const bootstrap = await getBootstrapData();

  return <AnalyticsDashboard bootstrap={bootstrap} />;
}
