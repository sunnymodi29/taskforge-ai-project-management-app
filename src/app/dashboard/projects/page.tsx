import { ProjectsPageView } from "@/components/projects/projects-page-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

export default function AllProjectsPage() {
  return <ProjectsPageView />;
}
