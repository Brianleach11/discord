import { api } from "../../../../../convex/_generated/api";
import "@livekit/components-styles";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useQuery } from "convex/react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Phone } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useState } from "react";

export function Voice({ serverId }: { serverId: Id<"servers"> }) {
  const token = useQuery(api.functions.livekit.getToken, { serverId });
  const [open, setOpen] = useState(false);
  if (!token) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton>
          <Phone />
          Voice
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="max-w-screen-lg">
        <DialogTitle className="sr-only">Voice</DialogTitle>
        <LiveKitRoom
          token={token}
          serverUrl="wss://discord-ba7u77il.livekit.cloud"
          onDisconnected={() => setOpen(false)}
        >
          <VideoConference />
        </LiveKitRoom>
      </DialogContent>
    </Dialog>
  );
}
