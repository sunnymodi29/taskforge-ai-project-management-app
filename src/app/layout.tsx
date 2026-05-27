import type { Metadata } from "next";
import "@/app/globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "TrackEzz – Build Faster. Track Smarter. Ship Better.",
    template: "%s | TrackEzz",
  },
  description:
    "Enterprise-grade project management and bug tracking powered by AI. Inspired by Linear, ClickUp, and Jira.",
  keywords: ["project management", "bug tracking", "kanban", "sprints", "AI", "SaaS"],
  authors: [{ name: "TrackEzz" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "TrackEzz",
    description: "Build Faster. Track Smarter. Ship Better.",
    siteName: "TrackEzz",
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
