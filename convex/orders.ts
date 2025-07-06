// convex/orders.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByPart = query({
  args: { partId: v.id("parts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_part", (q) => q.eq("partId", args.partId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    partId: v.id("parts"),
    draftName: v.string(),
    draftNumber: v.string(),
    orderNumber: v.string(),
    manufacturerId: v.string(),
    templateName: v.string(),
    metadata: v.object({
      projectName: v.string(),
      projectNumber: v.string(),
      designerInitials: v.string(),
      engineerInitials: v.string(),
    }),
    status: v.union(v.literal("draft"), v.literal("submitted")),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", args);
  },
});