import { SidebarProvider } from "@/components/ui/sidebar";
import { DMSidebar } from "./_components/sidebar";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DMSidebar />
      {children}
    </SidebarProvider>
  );
}
