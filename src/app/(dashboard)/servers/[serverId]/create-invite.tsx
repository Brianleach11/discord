import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export function CreateInvite({ serverId }: { serverId: Id<"servers"> }) {
  const [inviteId, setInviteId] = useState<Id<"invites"> | null>(null);
  const createInvite = useMutation(api.functions.invite.create);

  const handleSubmit = async (
    maxUses: number | undefined,
    expiresAt: number | undefined
  ) => {
    try {
      const inviteId = await createInvite({ maxUses, expiresAt, serverId });
      setInviteId(inviteId);
    } catch (error) {
      toast.error("Failed to create invite", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Create Invite
        </Button>
      </DialogTrigger>
      {inviteId ? (
        <CreatedInvite inviteId={inviteId} onClose={() => setInviteId(null)} />
      ) : (
        <CreateInviteForm onSubmit={handleSubmit} />
      )}
    </Dialog>
  );
}

const EXPIRES_AT_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "1 Hour", value: 1 },
  { label: "6 Hours", value: 6 },
  { label: "12 Hours", value: 12 },
  { label: "1 Day", value: 24 },
  { label: "3 Days", value: 72 },
  { label: "1 Week", value: 168 },
];

const MAX_USES_OPTIONS = [
  { label: "Unlimited", value: 0 },
  { label: "1 Use", value: 1 },
  { label: "5 Uses", value: 5 },
  { label: "10 Uses", value: 10 },
  { label: "25 Uses", value: 25 },
  { label: "50 Uses", value: 50 },
  { label: "100 Uses", value: 100 },
];

function CreateInviteForm({
  onSubmit,
}: {
  onSubmit: (
    maxUses: number | undefined,
    expiresAt: number | undefined
  ) => Promise<void>;
}) {
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const parseNumber = (str: string) => {
    const value = parseInt(str);
    if (!value) return undefined;
    return value;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedMaxUses = parseNumber(maxUses);
    const parsedExpiresAt = parseNumber(expiresAt);
    onSubmit(
      parsedMaxUses,
      parsedExpiresAt
        ? Date.now() + parsedExpiresAt * 60 * 60 * 1000
        : undefined
    );
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Invite</DialogTitle>
      </DialogHeader>
      <form className="contents" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="expiresAt">Expires At</Label>
          <Select
            value={expiresAt}
            onValueChange={(value) => setExpiresAt(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Expiration" />
            </SelectTrigger>
            <SelectContent>
              {EXPIRES_AT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="maxUses">Max Uses</Label>
          <Select value={maxUses} onValueChange={(value) => setMaxUses(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Max Uses" />
            </SelectTrigger>
            <SelectContent>
              {MAX_USES_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="submit">Create Invite</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function CreatedInvite({
  inviteId,
  onClose,
}: {
  inviteId: Id<"invites">;
  onClose: () => void;
}) {
  const url = new URL(`/join/${inviteId}`, window.location.href).toString();
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite Created</DialogTitle>
        <DialogDescription>
          You can send this invite to your friends.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor="url">Invite URL</Label>
        <Input id="url" type="text" readOnly value={url} />
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Back
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(url);
            toast.success("Copied to URL");
          }}
        >
          <Copy className="w-4 h-4" />
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
