import { v } from "convex/values";
import { assertMember, authenticatedMutation, authenticatedQuery } from "./helpers";
import { internal } from "../_generated/api";

export const list = authenticatedQuery({
  args: {
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
  },
  handler: async (ctx, { dmOrChannelId }) => {
    await assertMember(ctx, dmOrChannelId);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_dmOrChannelId", (q) =>
        q.eq("dmOrChannelId", dmOrChannelId)
      )
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.sender);
        const attachment = message.attachment 
          ? await ctx.storage.getUrl(message.attachment)
          : undefined;
        return {
          ...message,
          sender,
          attachment,
        };
      })
    );
  },
});

export const create = authenticatedMutation({
  args: {
    dmOrChannelId: v.union(v.id("directMessages"), v.id("channels")),
    content: v.string(),
    attachment: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { dmOrChannelId, content, attachment }) => {
    await assertMember(ctx, dmOrChannelId);
    await ctx.db.insert("messages", {
      dmOrChannelId,
      sender: ctx.user._id,
      attachment,
      content,
    });
    await ctx.scheduler.runAfter(0, internal.functions.typing.remove, {
      dmOrChannelId,
      user: ctx.user._id,
    });
  },
});

export const remove = authenticatedMutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, { id }) => {
    const message = await ctx.db.get(id);
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.sender !== ctx.user._id) {
      throw new Error("You are not the sender of this message");
    }
    await ctx.db.delete(id);
    if (message.attachment) {
      await ctx.storage.delete(message.attachment);
    }
  },
});