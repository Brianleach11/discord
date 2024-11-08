import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("messages").collect();
  },
});

export const create = mutation({
  args: {
    sender: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { sender, content }) => {
    return await ctx.db.insert("messages", { sender, content });
  },
});
