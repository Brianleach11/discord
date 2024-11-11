import { authenticatedQuery, authenticatedMutation, assertServerOwner } from "./helpers";
import { v } from "convex/values";
import { assertServerMember } from "./helpers";

export const list = authenticatedQuery({
  args: {
    id: v.id("servers"),
  },
  handler: async (ctx, { id }) => {
    await assertServerMember(ctx, id);
    return await ctx.db
      .query("channels")
      .withIndex("by_serverId", (q) => q.eq("serverId", id))
      .collect();
  },
});

export const get = authenticatedQuery({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, { id }) => {
    const channel = await ctx.db.get(id);
    if (!channel) {
      throw new Error("Channel not found");
    }
    await assertServerMember(ctx, channel.serverId);
    return channel;
  },
});

export const create = authenticatedMutation({
  args: {
    name: v.string(),
    serverId: v.id("servers"),
  },
  handler: async (ctx, { name, serverId }) => {
    await assertServerOwner(ctx, serverId);
    const existingChannel = await ctx.db
      .query("channels")
      .withIndex("by_serverId_name", (q) => q.eq("serverId", serverId).eq("name", name))
      .unique();
    if (existingChannel) {
      throw new Error("Channel already exists");
    }
    const channelId = await ctx.db.insert("channels", { name, serverId });
    return channelId;
  },
});

export const remove = authenticatedMutation({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, { id }) => {
    const channel = await get(ctx, { id });
    if (!channel) {
      throw new Error("Channel not found");
    }
    const server = await ctx.db.get(channel.serverId);
    if (!server) {
      throw new Error("Server not found");
    } else if (server.ownerId !== ctx.user._id) {
      throw new Error("You are not the owner of this server");
    } else if (channel._id === server.defaultChannelId) {
      throw new Error("Cannot delete default channel");
    }
    await ctx.db.delete(id);
  },
});
