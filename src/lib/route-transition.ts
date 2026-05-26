/** True when the current URL matches the navigation target. */
export function routeTransitionReached(
  pathname: string,
  targetPath: string,
): boolean {
  if (pathname === targetPath) return true;
  if (targetPath === "/dashboard") return pathname === "/dashboard";
  if (targetPath === "/dashboard/projects") {
    return pathname === "/dashboard/projects";
  }
  return (
    pathname.startsWith(`${targetPath}/`) || pathname === targetPath
  );
}
