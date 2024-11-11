import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Id } from "../../../../../convex/_generated/dataModel";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";

export function CreateChannel({ serverId }: { serverId: Id<"servers"> }) {
  const [name, setName] = useState("");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const createChannel = useMutation(api.functions.channel.create);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const channelId = await createChannel({ serverId, name });
      setOpen(false);
      router.push(`/servers/${serverId}/channels/${channelId}`);
    } catch (error) {
      toast.error("Failed to create channel", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction>
          <PlusIcon />
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Create a new channel for your channel.
          </DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Channel Name"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
