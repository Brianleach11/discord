import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SidebarContent } from "@/components/ui/sidebar";
import { UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { CreateServer } from "./create-server";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
export function MainSidebar() {
  const pathname = usePathname();
  const servers = useQuery(api.functions.server.list);
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Direct Messages"
                  isActive={pathname.startsWith("/dms")}
                  asChild
                >
                  <Link href="/dms">
                    <UserIcon />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {servers?.map((server) => (
                <SidebarMenuItem key={server._id}>
                  <SidebarMenuButton
                    tooltip={server.name}
                    isActive={pathname.startsWith(`/servers/${server._id}`)}
                    asChild
                    className="group-data-[collapsible=icon]:!p-0"
                  >
                    <Link
                      href={`/servers/${server._id}/channels/${server.defaultChannelId}`}
                    >
                      <Avatar className="rounded-none">
                        {server.iconUrl && (
                          <AvatarImage src={server.iconUrl} />
                        )}
                        <AvatarFallback>{server.name[0]}</AvatarFallback>
                      </Avatar>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <CreateServer />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
