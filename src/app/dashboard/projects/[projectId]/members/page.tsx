"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Users, Settings } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent, Avatar } from "@/components/ui";
import { useDataStore } from "@/store/data-store";
import { resolveProjectFromParam } from "@/lib/projects/route";
import { ProjectManageDialog } from "@/components/project-manage-dialog";
import { PROJECT_ROLE_OPTIONS } from "@/lib/projects/constants";

export default function ProjectMembersPage() {
  const params = useParams();
  const projectKey = String(params.projectId ?? "");
  const { projects, permissions, currentUser, getProjectMembers } = useDataStore();
  const [manageOpen, setManageOpen] = useState(false);

  const project = useMemo(
    () => resolveProjectFromParam(projects, projectKey),
    [projects, projectKey]
  );

  if (!project) {
    return (
      <div className="p-6 text-muted-foreground text-sm">Project not found.</div>
    );
  }

  const members = getProjectMembers(project.id);
  const myRole = members.find((m) => m.userId === currentUser.id)?.role;
  const canManage =
    permissions.isOrgOwner ||
    permissions.isOrgProjectAdmin ||
    myRole === "project_admin";

  const roleLabel = (role: string) =>
    PROJECT_ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;

  return (
    <>
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Members
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {project.name} ({project.key})
          </p>
        </div>
        {canManage && (
          <Button className="gap-2" size="sm" onClick={() => setManageOpen(true)}>
            <Settings className="h-4 w-4" /> Manage
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project team ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <Avatar src={m.user.avatarUrl} name={m.user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{m.user.email}</div>
              </div>
              <span className="text-xs text-muted-foreground">{roleLabel(m.role)}</span>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No members yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
    <ProjectManageDialog
    project={manageOpen ? project : null}
    onClose={() => setManageOpen(false)}
  />
  </>
  );
}
