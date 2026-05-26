/** Next issue key preview — uses DB counter, not live issue count (gaps after delete). */
export function previewNextIssueKey(projectKey: string, issueCounter: number): string {
  return `${projectKey}-${issueCounter + 1}`;
}

export function parseIssueNumberFromKey(issueKey: string): number | null {
  const match = issueKey.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}
