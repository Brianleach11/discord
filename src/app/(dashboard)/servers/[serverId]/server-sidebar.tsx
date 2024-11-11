"use client";

import { Id } from "../../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { TrashIcon } from "lucide-react";
import { CreateChannel } from "./create-channel";
import { toast } from "sonner";
import { Voice } from "./voice";

export function ServerSidebar({ id }: { id: Id<"servers"> }) {
  const server = useQuery(api.functions.server.get, { id });
  const channels = useQuery(api.functions.channel.list, { id });
  const pathname = usePathname();
  const removeChannel = useMutation(api.functions.channel.remove);
  const router = useRouter();
  const handleChannelDelete = async (id: Id<"channels">) => {
    try {
      await removeChannel({ id });
      if (server) {
        router.push(`/servers/${server._id}/channels/${server.defaultChannelId}`);
      }
      toast.success("Channel deleted");
    } catch (_) {
      toast.error("Failed to delete channel");
    }
  };
  return (
    <Sidebar className="left-12">
      <SidebarHeader>{server?.name}</SidebarHeader>
      <SidebarContent>
        <SidebarGroupLabel>Channels</SidebarGroupLabel>
        <CreateChannel serverId={id} />
        <SidebarGroupContent>
          <SidebarMenu>
            {channels?.map((channel) => (
              <SidebarMenuItem key={channel._id}>
                <SidebarMenuButton
                  isActive={
                    pathname === `/servers/${id}/channels/${channel._id}`
                  }
                  tooltip={channel.name}
                  asChild
                >
                  <Link href={`/servers/${id}/channels/${channel._id}`}>
                    {channel.name}
                  </Link>
                </SidebarMenuButton>
                {channel._id !== server?.defaultChannelId && (
                  <SidebarMenuAction
                    onClick={() => handleChannelDelete(channel._id)}
                  >
                    <TrashIcon />
                  </SidebarMenuAction>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Voice serverId={id} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
