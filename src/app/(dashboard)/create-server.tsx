import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageIcon, PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateServer() {
  const imageUpload = useImageUpload();
  const createServer = useMutation(api.functions.server.create);
  const [name, setName] = useState("");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { serverId, defaultChannelId } = await createServer({
        name: name,
        iconId: imageUpload.storageId,
      });
      setOpen(false);
      router.push(`/servers/${serverId}/channels/${defaultChannelId}`);
    } catch (error) {
      toast.error("Failed to create server", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton tooltip="Create Server">
          <PlusIcon />
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
        </DialogHeader>
        <form className="contents" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Server Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Icon</Label>
            <div className="flex items-center">
              <input {...imageUpload.inputProps} />
              <Avatar className="size-10 border mr-2 relative">
                {imageUpload.previewUrl && (
                  <AvatarImage
                    src={imageUpload.previewUrl}
                    className="absolute inset-0"
                  />
                )}
                <AvatarFallback>
                  <ImageIcon className="text-muted-foreground size-4" />
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={imageUpload.open}
                disabled={imageUpload.isUploading}
              >
                {imageUpload.isUploading ? "Uploading..." : "Upload Icon"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Server</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
