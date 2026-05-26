import { InboxView } from "@/components/inbox-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inbox" };

export default function InboxPage() {
  return <InboxView />;
}
