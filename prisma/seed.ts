import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

function createPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required to run the seed (PostgreSQL).");
  }
  return new PrismaClient({
    adapter: new PrismaPg(new Pool({ connectionString: url })),
  });
}

const prisma = createPrisma();

const DEMO_PASSWORD = "password123";

async function main() {
  console.log("Seeding database...");

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.embedding.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.issueLabel.deleteMany();
  await prisma.issueAssignee.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.savedView.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.label.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.epic.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const userDefs = [
    { id: "u1", name: "Alex Rivera", email: "alex@trackezz.com", seed: "Alex", createdAt: new Date("2024-01-01") },
    { id: "u2", name: "Jordan Kim", email: "jordan@trackezz.com", seed: "Jordan", createdAt: new Date("2024-01-05") },
    { id: "u3", name: "Sam Patel", email: "sam@trackezz.com", seed: "Sam", createdAt: new Date("2024-01-10") },
    { id: "u4", name: "Casey Morgan", email: "casey@trackezz.com", seed: "Casey", createdAt: new Date("2024-01-15") },
    { id: "u5", name: "Riley Chen", email: "riley@trackezz.com", seed: "Riley", createdAt: new Date("2024-01-20") },
  ];

  const users = await Promise.all(
    userDefs.map((u) =>
      prisma.user.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email,
          emailVerified: new Date(),
          passwordHash,
          image: `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.seed}`,
          avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.seed}`,
          createdAt: u.createdAt,
        },
      })
    )
  );

  const organization = await prisma.organization.create({
    data: {
      id: "org1",
      name: "Media.net",
      slug: "media-net",
      ownerId: "u1",
      createdAt: new Date("2024-01-01"),
    },
  });

  await prisma.organizationMember.createMany({
    data: [
      { userId: "u1", organizationId: organization.id, role: "owner" },
      { userId: "u2", organizationId: organization.id, role: "project_admin" },
      { userId: "u3", organizationId: organization.id, role: "project_admin" },
      { userId: "u4", organizationId: organization.id, role: "project_admin" },
      { userId: "u5", organizationId: organization.id, role: "project_admin" },
    ],
  });

  await prisma.subscription.create({
    data: {
      organizationId: organization.id,
      plan: "pro",
      status: "active",
    },
  });

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        id: "p1", name: "TrackEzz Platform", key: "TE", description: "Core platform development",
        color: "#6366f1", icon: "⚡", organizationId: organization.id, leadId: "u1", issueCounter: 12,
        createdAt: new Date("2024-01-15"), updatedAt: new Date("2024-03-10"),
      },
    }),
    prisma.project.create({
      data: {
        id: "p2", name: "Mobile App", key: "MOB", description: "iOS and Android client",
        color: "#8b5cf6", icon: "📱", organizationId: organization.id, leadId: "u2", issueCounter: 0,
        createdAt: new Date("2024-02-01"), updatedAt: new Date("2024-03-08"),
      },
    }),
    prisma.project.create({
      data: {
        id: "p3", name: "API Gateway", key: "API", description: "REST and GraphQL services",
        color: "#10b981", icon: "🔌", organizationId: organization.id, leadId: "u3", issueCounter: 0,
        createdAt: new Date("2024-02-15"), updatedAt: new Date("2024-03-05"),
      },
    }),
    prisma.project.create({
      data: {
        id: "p4", name: "Marketing Site", key: "MKT", description: "Public landing pages",
        color: "#f59e0b", icon: "🌐", organizationId: organization.id, leadId: "u4", issueCounter: 0,
        createdAt: new Date("2024-03-01"), updatedAt: new Date("2024-03-09"),
      },
    }),
  ]);

  await prisma.projectMember.createMany({
    data: [
      { userId: "u1", projectId: "p1", role: "project_admin" },
      { userId: "u2", projectId: "p1", role: "project_admin" },
      { userId: "u3", projectId: "p1", role: "member" },
      { userId: "u4", projectId: "p1", role: "member" },
      { userId: "u5", projectId: "p1", role: "member" },
      { userId: "u2", projectId: "p2", role: "project_admin" },
      { userId: "u3", projectId: "p2", role: "member" },
    ],
  });

  await prisma.label.createMany({
    data: [
      { id: "l1", name: "frontend", color: "#3b82f6", projectId: "p1" },
      { id: "l2", name: "backend", color: "#8b5cf6", projectId: "p1" },
      { id: "l3", name: "database", color: "#f59e0b", projectId: "p1" },
      { id: "l4", name: "performance", color: "#10b981", projectId: "p1" },
      { id: "l5", name: "security", color: "#ef4444", projectId: "p1" },
      { id: "l6", name: "ux", color: "#f97316", projectId: "p1" },
      { id: "l7", name: "api", color: "#06b6d4", projectId: "p2" },
      { id: "l8", name: "mobile", color: "#ec4899", projectId: "p2" },
    ],
  });

  await prisma.sprint.createMany({
    data: [
      { id: "sp1", name: "Sprint 1", goal: "Foundation & Auth", status: "completed", startDate: new Date("2024-01-15"), endDate: new Date("2024-01-29"), projectId: "p1" },
      { id: "sp2", name: "Sprint 2", goal: "Core Issue Tracking", status: "completed", startDate: new Date("2024-01-29"), endDate: new Date("2024-02-12"), projectId: "p1" },
      { id: "sp3", name: "Sprint 3", goal: "Boards & Collaboration", status: "active", startDate: new Date("2024-02-12"), endDate: new Date("2024-02-26"), projectId: "p1" },
      { id: "sp4", name: "Sprint 4", goal: "AI Features", status: "planning", startDate: new Date("2024-02-26"), endDate: new Date("2024-03-11"), projectId: "p1" },
    ],
  });

  await prisma.epic.createMany({
    data: [
      { id: "e1", name: "Authentication System", description: "Full auth with SSO", color: "#6366f1", projectId: "p1" },
      { id: "e2", name: "Issue Management", description: "Core CRUD features", color: "#8b5cf6", projectId: "p1" },
      { id: "e3", name: "Board Views", description: "Kanban, list, calendar", color: "#10b981", projectId: "p1" },
      { id: "e4", name: "AI Integration", description: "OpenAI-powered features", color: "#f59e0b", projectId: "p1" },
    ],
  });

  const dueInDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  const issuesData = [
    { id: "i1", issueNumber: 1, issueKey: "TE-1", title: "Design and implement the new dashboard layout", description: "Redesign the main dashboard with widgets, quick stats, and recent activity feed.", type: "feature" as const, status: "in_progress" as const, priority: "high" as const, reporterId: "u1", projectId: "p1", sprintId: "sp3", epicId: "e3", estimate: 8, dueDate: dueInDays(2), createdAt: new Date("2024-02-12"), updatedAt: new Date("2024-02-15"), assignees: ["u1"], labels: ["l1", "l6"] },
    { id: "i2", issueNumber: 2, issueKey: "TE-2", title: "Implement drag-and-drop Kanban board", description: "Build a fully functional Kanban board with drag-and-drop support.", type: "feature" as const, status: "in_progress" as const, priority: "high" as const, reporterId: "u1", projectId: "p1", sprintId: "sp3", epicId: "e3", estimate: 13, dueDate: dueInDays(5), createdAt: new Date("2024-02-12"), updatedAt: new Date("2024-02-15"), assignees: ["u2"], labels: ["l1"] },
    { id: "i3", issueNumber: 3, issueKey: "TE-3", title: "Session token expires prematurely on idle", description: "Users are logged out after ~10 minutes of inactivity.", type: "bug" as const, status: "done" as const, priority: "urgent" as const, severity: "critical" as const, reporterId: "u2", projectId: "p1", sprintId: "sp3", estimate: 3, environment: "Production", reproductionSteps: "1. Log in\n2. Idle 10 min", expectedResult: "Stay logged in", actualResult: "Redirect to login", createdAt: new Date("2024-02-13"), updatedAt: new Date("2024-02-14"), assignees: ["u1"], labels: ["l2"] },
    { id: "i4", issueNumber: 4, issueKey: "TE-4", title: "AI-powered issue summarization endpoint", type: "feature" as const, status: "todo" as const, priority: "medium" as const, reporterId: "u1", projectId: "p1", sprintId: "sp3", epicId: "e4", estimate: 5, createdAt: new Date("2024-02-12"), updatedAt: new Date("2024-02-12"), assignees: ["u3"], labels: ["l2", "l3"] },
    { id: "i5", issueNumber: 5, issueKey: "TE-5", title: "Duplicate bug detection using embeddings", type: "feature" as const, status: "todo" as const, priority: "medium" as const, reporterId: "u1", projectId: "p1", epicId: "e4", estimate: 8, createdAt: new Date("2024-02-12"), updatedAt: new Date("2024-02-12"), assignees: [], labels: ["l2", "l3"] },
    { id: "i6", issueNumber: 6, issueKey: "TE-6", title: "File upload widget crashes on large images > 10MB", type: "bug" as const, status: "in_review" as const, priority: "high" as const, severity: "major" as const, reporterId: "u3", projectId: "p1", sprintId: "sp3", estimate: 2, dueDate: dueInDays(9), environment: "Staging", createdAt: new Date("2024-02-14"), updatedAt: new Date("2024-02-15"), assignees: ["u2"], labels: ["l1"] },
    { id: "i7", issueNumber: 7, issueKey: "TE-7", title: "Implement real-time comment updates with Pusher", type: "feature" as const, status: "backlog" as const, priority: "medium" as const, reporterId: "u1", projectId: "p1", epicId: "e3", estimate: 8, createdAt: new Date("2024-02-10"), updatedAt: new Date("2024-02-10"), assignees: ["u4"], labels: ["l1", "l2"] },
    { id: "i8", issueNumber: 8, issueKey: "TE-8", title: "Sprint velocity chart not rendering on Safari", type: "bug" as const, status: "todo" as const, priority: "low" as const, severity: "minor" as const, reporterId: "u4", projectId: "p1", sprintId: "sp3", estimate: 2, environment: "Production", browserDevice: "Safari 17", createdAt: new Date("2024-02-15"), updatedAt: new Date("2024-02-15"), assignees: [], labels: ["l1"] },
    { id: "i9", issueNumber: 9, issueKey: "TE-9", title: "Command palette (Ctrl+K) with fuzzy search", type: "feature" as const, status: "todo" as const, priority: "medium" as const, reporterId: "u1", projectId: "p1", sprintId: "sp4", epicId: "e3", estimate: 5, createdAt: new Date("2024-02-10"), updatedAt: new Date("2024-02-10"), assignees: [], labels: ["l1"] },
    { id: "i10", issueNumber: 10, issueKey: "TE-10", title: "Setup Prisma schema and initial migrations", type: "task" as const, status: "done" as const, priority: "high" as const, reporterId: "u1", projectId: "p1", sprintId: "sp2", epicId: "e1", estimate: 5, createdAt: new Date("2024-01-29"), updatedAt: new Date("2024-02-02"), assignees: ["u1"], labels: ["l3"] },
    { id: "i11", issueNumber: 11, issueKey: "TE-11", title: "Rate limiting middleware for API routes", type: "task" as const, status: "backlog" as const, priority: "medium" as const, reporterId: "u1", projectId: "p1", estimate: 3, createdAt: new Date("2024-02-10"), updatedAt: new Date("2024-02-10"), assignees: [], labels: ["l2", "l5"] },
    { id: "i12", issueNumber: 12, issueKey: "TE-12", title: "Notification email templates with Resend", type: "task" as const, status: "backlog" as const, priority: "low" as const, reporterId: "u1", projectId: "p1", estimate: 4, createdAt: new Date("2024-02-10"), updatedAt: new Date("2024-02-10"), assignees: ["u5"], labels: ["l2"] },
  ];

  for (const issue of issuesData) {
    const { assignees, labels, ...data } = issue;
    await prisma.issue.create({
      data: {
        ...data,
        assignees: assignees.length ? { create: assignees.map((userId) => ({ userId })) } : undefined,
        labels: labels.length ? { create: labels.map((labelId) => ({ labelId })) } : undefined,
      },
    });
  }

  await prisma.attachment.createMany({
    data: [
      { id: "a1", name: "screenshot-login-bug.png", url: "/mock/screenshot1.png", storagePath: "/workspaces/ws1/projects/p1/issues/i3/attachments/a1", size: 248000, type: "image/png", issueId: "i3", uploadedById: "u2", createdAt: new Date("2024-02-14") },
      { id: "a2", name: "error-console.png", url: "/mock/screenshot2.png", storagePath: "/workspaces/ws1/projects/p1/issues/i3/attachments/a2", size: 124000, type: "image/png", issueId: "i3", uploadedById: "u2", createdAt: new Date("2024-02-14") },
      { id: "a3", name: "design-spec.pdf", url: "/mock/spec.pdf", storagePath: "/workspaces/ws1/projects/p1/issues/i1/attachments/a3", size: 1200000, type: "application/pdf", issueId: "i1", uploadedById: "u1", createdAt: new Date("2024-02-10") },
    ],
  });

  const c1 = await prisma.comment.create({
    data: { id: "c1", content: "I can reproduce this on Chrome 121.", authorId: "u2", issueId: "i3", createdAt: new Date("2024-02-14T10:30:00"), updatedAt: new Date("2024-02-14T10:30:00") },
  });
  const c2 = await prisma.comment.create({
    data: { id: "c2", content: "Fix pushed in branch fix/session-refresh.", authorId: "u1", issueId: "i3", createdAt: new Date("2024-02-14T14:15:00"), updatedAt: new Date("2024-02-14T14:15:00") },
  });
  await prisma.comment.create({
    data: { id: "c3", content: "Confirmed working in staging.", authorId: "u3", issueId: "i3", createdAt: new Date("2024-02-14T16:00:00"), updatedAt: new Date("2024-02-14T16:00:00") },
  });

  await prisma.reaction.createMany({
    data: [
      { id: "r1", emoji: "👍", userId: "u1", commentId: c1.id },
      { id: "r2", emoji: "👍", userId: "u3", commentId: c1.id },
      { id: "r3", emoji: "🚀", userId: "u2", commentId: c2.id },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { id: "n1", type: "mention", title: "Jordan mentioned you", message: "in TE-3", read: false, userId: "u1", issueId: "i3", actorId: "u2", createdAt: new Date("2024-02-14T10:30:00") },
      { id: "n2", type: "assign", title: "Assigned to you", message: "TE-1: Dashboard layout", read: false, userId: "u1", issueId: "i1", actorId: "u2", createdAt: new Date("2024-02-13T09:00:00") },
      { id: "n3", type: "comment", title: "New comment on TE-3", message: "Sam: Confirmed working", read: true, userId: "u1", issueId: "i3", actorId: "u3", createdAt: new Date("2024-02-14T16:00:00") },
      { id: "n4", type: "status_change", title: "Status changed", message: "TE-10 → Done", read: true, userId: "u1", issueId: "i10", actorId: "u1", createdAt: new Date("2024-02-02T14:00:00") },
      { id: "n5", type: "sprint", title: "Sprint 3 is active", message: "Boards & Collaboration", read: true, userId: "u1", actorId: "u2", createdAt: new Date("2024-02-12T09:00:00") },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      { id: "al1", action: "changed status", details: "TE-3 → Done", userId: "u3", issueId: "i3", projectId: "p1", organizationId: organization.id, createdAt: new Date("2024-02-14T16:00:00") },
      { id: "al2", action: "commented on", details: "TE-3", userId: "u3", issueId: "i3", projectId: "p1", organizationId: organization.id, createdAt: new Date("2024-02-14T16:00:00") },
      { id: "al3", action: "changed priority", details: "TE-6 → High", userId: "u1", issueId: "i6", projectId: "p1", organizationId: organization.id, createdAt: new Date("2024-02-14T15:00:00") },
      { id: "al4", action: "assigned", details: "TE-6 → Jordan", userId: "u1", issueId: "i6", projectId: "p1", organizationId: organization.id, createdAt: new Date("2024-02-14T14:00:00") },
      { id: "al5", action: "created issue", details: "TE-8", userId: "u4", issueId: "i8", projectId: "p1", organizationId: organization.id, createdAt: new Date("2024-02-15T11:00:00") },
      { id: "al6", action: "merged PR", details: "fix/session-refresh", userId: "u1", issueId: "i3", projectId: "p1", organizationId: organization.id, createdAt: new Date("2024-02-14T13:00:00") },
    ],
  });

  await prisma.invitation.createMany({
    data: [
      { id: "inv1", email: "jordan@trackezz.com", token: "seed-invite-jordan-project", projectRole: "member", projectId: "p1", invitedById: "u1", status: "pending", expiresAt: new Date("2026-12-31"), createdAt: new Date("2024-02-14") },
      { id: "inv2", email: "designer@example.com", token: "seed-invite-designer-org", organizationRole: "project_admin", organizationId: organization.id, invitedById: "u1", status: "pending", expiresAt: new Date("2026-12-31"), createdAt: new Date("2024-02-13") },
    ],
  });

  await prisma.notification.create({
    data: {
      id: "n6",
      type: "invitation",
      title: "Invitation to TrackEzz",
      message: "invited you to join as member",
      read: false,
      userId: "u2",
      invitationId: "inv1",
      actorId: "u1",
      createdAt: new Date("2024-02-14T12:00:00"),
    },
  });

  const aiConvo = await prisma.aIConversation.create({
    data: { id: "ai1", title: "Sprint planning assistance", projectId: "p1", userId: "u1", createdAt: new Date("2024-02-15") },
  });

  await prisma.aIMessage.createMany({
    data: [
      { id: "aim1", role: "user", content: "Help me plan Sprint 4?", conversationId: aiConvo.id, createdAt: new Date("2024-02-15T10:00:00") },
      { id: "aim2", role: "assistant", content: "Prioritize TE-9, TE-4, and TE-5 for the AI epic.", conversationId: aiConvo.id, createdAt: new Date("2024-02-15T10:01:00") },
    ],
  });

  console.log(`Seeded: ${users.length} users (password: ${DEMO_PASSWORD}), org ${organization.name}, ${projects.length} projects`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
