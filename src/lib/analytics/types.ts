export interface AnalyticsSummary {
  totalIssues: number;
  completedIssues: number;
  openIssues: number;
  openBugs: number;
  completionRate: number;
  avgResolutionDays: number | null;
  activeSprints: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  inProgressCount: number;
}

export interface BurndownPoint {
  date: string;
  ideal: number;
  remaining: number | null;
  completed: number;
}

export interface VelocityPoint {
  sprint: string;
  sprintId: string;
  committed: number;
  completed: number;
  status: string;
}

export interface DistributionPoint {
  key: string;
  label: string;
  count: number;
  color: string;
}

export interface ProjectHealthRow {
  projectId: string;
  name: string;
  icon: string;
  total: number;
  completed: number;
  rate: number;
}

export interface WeeklyCreatedPoint {
  week: string;
  count: number;
}

export interface DailyThroughputPoint {
  date: string;
  completed: number;
}

export interface AssigneeLoadRow {
  userId: string;
  name: string;
  avatarUrl?: string;
  open: number;
  done: number;
}

export interface ActiveSprintSummary {
  id: string;
  name: string;
  projectName: string;
  progress: number;
  daysRemaining: number;
  issueCount: number;
  completedCount: number;
}

export interface OrgAnalytics {
  summary: AnalyticsSummary;
  burndown: BurndownPoint[];
  velocity: VelocityPoint[];
  statusDistribution: DistributionPoint[];
  priorityDistribution: DistributionPoint[];
  typeDistribution: DistributionPoint[];
  projectHealth: ProjectHealthRow[];
  weeklyCreated: WeeklyCreatedPoint[];
  dailyThroughput: DailyThroughputPoint[];
  assigneeLoad: AssigneeLoadRow[];
  activeSprint: ActiveSprintSummary | null;
}
