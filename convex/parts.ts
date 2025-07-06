
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPart = mutation({
  args: {
    name: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const part = await ctx.db.insert("parts", {
      name: args.name,
      projectId: args.projectId,
      tenantId: identity.subject,
    });

    return part;
  },
});

export const getPartsForProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const parts = await ctx.db
      .query("parts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return parts;
  },
});
