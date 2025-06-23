// convex/companies.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // For now, we'll get all companies. Later you might want to filter by tenantId
    return await ctx.db.query("companies").collect();
  },
});

export const get = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});


export const create = mutation({
  args: {
    name: v.string(),
    tenantId: v.string(),
    engineeringCompany: v.object({
      name: v.string(),
      address: v.string(),
      phone: v.string(),
    }),
    masonryCompany: v.object({
      name: v.string(),
      address: v.string(),
      phone: v.string(),
    }),
    defaultInitials: v.object({
      designer: v.string(),
      engineer: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("companies", args);
  },
});