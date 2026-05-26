import { AppShell } from "@/components/app-shell";
import { DashboardDataProvider } from "@/components/dashboard-data-provider";
import { getBootstrapData } from "@/lib/queries/bootstrap";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getBootstrapData();

  return (
    <DashboardDataProvider data={data}>
      <AppShell>{children}</AppShell>
    </DashboardDataProvider>
  );
}
