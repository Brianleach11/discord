import { getCurrentUser } from "./user";
import { Doc, Id } from "../_generated/dataModel";
import {
  customQuery,
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { mutation, query, QueryCtx } from "../_generated/server";

export interface AuthenticatedQueryCtx extends QueryCtx {
  user: Doc<"users">;
}

export const authenticatedQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    return { user };
  })
);

export const authenticatedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    return { user };
  })
);

export const assertMember = async (
  ctx: AuthenticatedQueryCtx,
  dmOrChannelId: Id<"directMessages" | "channels">
) => {
  const dmOrChannel = await ctx.db.get(dmOrChannelId);
  if (!dmOrChannel) {
    throw new Error("Direct message or channel not found");
  } else if ("serverId" in dmOrChannel) {
    const serverMember = await ctx.db
      .query("serverMembers")
      .withIndex("by_serverId_userId", (q) =>
        q.eq("serverId", dmOrChannel.serverId).eq("userId", ctx.user._id)
      )
      .unique();
    if (!serverMember) {
      throw new Error("You are not a member of this server");
    }
  } else {
    const directMessageMember = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_user", (q) =>
        q.eq("directMessage", dmOrChannel._id).eq("user", ctx.user._id)
      )
      .unique();
    if (!directMessageMember) {
      throw new Error("You are not a member of this direct message");
    }
  }
};
