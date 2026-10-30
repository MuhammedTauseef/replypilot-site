import type { Metadata } from "next";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSubNav from "@/components/DashboardSubNav";

/** Client dashboard — private, never indexed by search engines. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardHeader />
      <DashboardSubNav />
      {children}
    </>
  );
}
