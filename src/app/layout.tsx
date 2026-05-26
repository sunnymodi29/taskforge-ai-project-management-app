import type { Metadata } from "next";
import "@/app/globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "TaskForge AI – Build Faster. Track Smarter. Ship Better.",
    template: "%s | TaskForge AI",
  },
  description:
    "Enterprise-grade project management and bug tracking powered by AI. Inspired by Linear, ClickUp, and Jira.",
  keywords: ["project management", "bug tracking", "kanban", "sprints", "AI", "SaaS"],
  authors: [{ name: "TaskForge AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "TaskForge AI",
    description: "Build Faster. Track Smarter. Ship Better.",
    siteName: "TaskForge AI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
