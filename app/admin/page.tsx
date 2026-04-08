import AdminPanel from "@/components/AdminPanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Dilshan & Sachini Wedding",
  description: "RSVP Admin Dashboard",
  robots: "noindex, nofollow",
};

export default function AdminPage() {
  return <AdminPanel />;
}
