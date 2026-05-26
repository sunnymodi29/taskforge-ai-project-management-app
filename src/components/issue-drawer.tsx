"use client";

import { IssueDetailView } from "@/components/issue-detail-view";
import { cn } from "@/lib/utils";

interface IssueDrawerProps {
  issueId: string;
  onClose: () => void;
}

export default function IssueDrawer({ issueId, onClose }: IssueDrawerProps) {
  return (
    <div className="w-[520px] shrink-0 flex flex-col h-full absolute right-0 z-20 max-h-[calc(100vh-56px)]">
      <IssueDetailView issueId={issueId} variant="drawer" onClose={onClose} className="h-full" />
    </div>
  );
}
