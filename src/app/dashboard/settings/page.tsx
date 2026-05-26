import { SettingsPageClient } from "@/components/settings/settings-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function DashboardSettingsPage() {
  return <SettingsPageClient />;
}
