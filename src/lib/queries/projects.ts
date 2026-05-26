import { prisma } from "@/lib/db";
import { normalizeProjectKey } from "@/lib/projects/route";
import { serializeProject } from "@/lib/serializers";
import type { Project } from "@/types";

const projectInclude = {
  lead: true,
  _count: { select: { issues: true, members: true } },
} as const;

export async function getProjectByKey(
  projectKey: string,
  organizationId: string
): Promise<Project | null> {
  const key = normalizeProjectKey(projectKey);
  const project = await prisma.project.findFirst({
    where: { organizationId, key },
    include: projectInclude,
  });

  if (!project) return null;

  return serializeProject(project);
}

export async function getProjectByRouteParam(
  param: string,
  organizationId: string
): Promise<Project | null> {
  const byKey = await getProjectByKey(param, organizationId);
  if (byKey) return byKey;
  return getProjectById(param);
}

export async function resolveProjectIdFromRouteParam(
  param: string,
  organizationId: string
): Promise<string> {
  const project = await getProjectByRouteParam(param, organizationId);
  if (!project) throw new Error("NOT_FOUND: Project not found");
  return project.id;
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: projectInclude,
  });

  if (!project) return null;

  return serializeProject(project);
}

export async function getProjects(organizationId: string): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    include: projectInclude,
    orderBy: { name: "asc" },
  });

  return projects.map((p) => serializeProject(p));
}
