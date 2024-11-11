"use client";

import { Id } from "../../convex/_generated/dataModel";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import {
  LoaderIcon,
  MoreVerticalIcon,
  PaperclipIcon,
  SendIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { useImageUpload } from "@/hooks/use-image-upload";

export function Messages({ id }: { id: Id<"directMessages" | "channels"> }) {
  const messages = useQuery(api.functions.message.list, { dmOrChannelId: id });
  return (
    <>
      <ScrollArea className="h-full py-4">
        {messages?.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
      </ScrollArea>
      <TypingIndicator id={id} />
      <MessageInput id={id} />
    </>
  );
}

function TypingIndicator({ id }: { id: Id<"directMessages" | "channels"> }) {
  const usernames = useQuery(api.functions.typing.list, { dmOrChannelId: id });
  if (!usernames || usernames.length === 0) return null;

  return (
    <div className="text-sm text-muted-foreground px-4 py-2">
      {usernames.join(", ")} is typing...
    </div>
  );
}

type Message = FunctionReturnType<typeof api.functions.message.list>[number];

function MessageItem({ message }: { message: Message }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Avatar className="size-8 border">
        {message.sender && <AvatarImage src={message.sender.image} />}
        <AvatarFallback />
      </Avatar>
      <div className="flex flex-col mr-auto">
        <p className="text-xs text-muted-foreground">
          {message.sender?.username ?? "Deleted User"}
        </p>
        <p className="text-sm">{message.content}</p>
        {message.attachment && (
          <Image
            src={message.attachment}
            width={300}
            height={300}
            alt="Attachment"
            className="rounded border overflow-hidden"
          />
        )}
      </div>
      <MessageActions message={message} />
    </div>
  );
}

function MessageActions({ message }: { message: Message }) {
  const user = useQuery(api.functions.user.get);
  const removeMessage = useMutation(api.functions.message.remove);
  if (!user || user._id !== message.sender?._id) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVerticalIcon className="size-4 text-muted-foreground" />
          <span className="sr-only">Message actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => removeMessage({ id: message._id })}
        >
          <TrashIcon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageInput({ id }: { id: Id<"directMessages" | "channels"> }) {
  const [content, setContent] = useState("");
  const sendMessage = useMutation(api.functions.message.create);
  const imageUpload = useImageUpload();

  const sendTypingIndicator = useMutation(api.functions.typing.upsert);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendMessage({
        dmOrChannelId: id,
        attachment: imageUpload.storageId,
        content,
      });
      setContent("");
      imageUpload.reset();
    } catch (error) {
      toast.error("Failed to send message", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <>
      <form className="flex items-end gap-2 p-4" onSubmit={handleSubmit}>
        <Button type="button" size="icon" onClick={imageUpload.open}>
          <PaperclipIcon />
          <span className="sr-only">Attach file</span>
        </Button>
        <div className="flex flex-col flex-1 gap-2">
          {imageUpload.previewUrl && (
            <ImagePreview
              url={imageUpload.previewUrl}
              isUploading={imageUpload.isUploading}
            />
          )}
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Message"
            onKeyDown={() => {
              if (content.length > 0) {
                sendTypingIndicator({ dmOrChannelId: id });
              }
            }}
          />
        </div>
        <Button size="icon">
          <SendIcon />
        </Button>
      </form>
      <input {...imageUpload.inputProps} />
    </>
  );
}

function ImagePreview({ url, isUploading }: { url: string; isUploading: boolean }) {
  return (
    <div className="relative size-40 overflow-hidden rounded border ">
      <Image
        src={url}
        width={300}
        height={300}
        alt="Attachment"
      />
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <LoaderIcon className="size-8 animate-spin" />
        </div>
      )}
    </div>
  );
}
