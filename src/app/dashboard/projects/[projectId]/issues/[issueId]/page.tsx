"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { IssueDetailView } from "@/components/issue-detail-view";
import { projectPath } from "@/lib/projects/route";
import { ArrowLeft } from "lucide-react";

export default function IssueFullPage() {
  const params = useParams();
  const projectKey = params.projectId as string;
  const issueId = params.issueId as string;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-background">
      <div className="px-6 py-3 border-b border-border bg-card/50 shrink-0">
        <Link
          href={projectPath(projectKey, "/list")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to issues
        </Link>
      </div>
      <div className="flex-1 min-h-0 flex justify-center overflow-hidden">
        <IssueDetailView issueId={issueId} variant="page" className="w-full" />
      </div>
    </div>
  );
}
