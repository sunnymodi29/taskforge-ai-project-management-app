export const ACTIVE_PROJECT_COOKIE = "tf_project";

export function projectCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 365) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
