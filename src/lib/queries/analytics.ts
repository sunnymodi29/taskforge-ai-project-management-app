import { getBootstrapData } from "@/lib/queries/bootstrap";
import { computeOrgAnalytics } from "@/lib/analytics/compute";
import type { OrgAnalytics } from "@/lib/analytics/types";

export async function getOrgAnalytics(
  projectId: string | null = null
): Promise<OrgAnalytics> {
  const data = await getBootstrapData();
  return computeOrgAnalytics(data, projectId);
}
