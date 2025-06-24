// convex/companies.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect();
  },
});

export const listByType = query({
  args: { type: v.union(v.literal("masonry"), v.literal("architect"), v.literal("engineer"), v.literal("client")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const listByTenant = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});

export const listByTenantAndType = query({
  args: { 
    tenantId: v.string(),
    type: v.union(v.literal("masonry"), v.literal("architect"), v.literal("engineer"), v.literal("client"))
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_tenant_type", (q) => q.eq("tenantId", args.tenantId).eq("type", args.type))
      .collect();
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
    type: v.union(v.literal("masonry"), v.literal("architect"), v.literal("engineer"), v.literal("client")),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("companies", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("masonry"), v.literal("architect"), v.literal("engineer"), v.literal("client"))),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Filter out undefined values and handle type specifically
    const cleanUpdates: any = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.type !== undefined) cleanUpdates.type = updates.type;
    if (updates.address !== undefined) cleanUpdates.address = updates.address;
    if (updates.phone !== undefined) cleanUpdates.phone = updates.phone;
    if (updates.email !== undefined) cleanUpdates.email = updates.email;
    
    return await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Function to search companies by name (for combobox filtering)
export const searchByName = query({
  args: { 
    tenantId: v.string(),
    type: v.optional(v.union(v.literal("masonry"), v.literal("architect"), v.literal("engineer"), v.literal("client"))),
    searchTerm: v.string()
  },
  handler: async (ctx, args) => {
    let companies;
    
    if (args.type) {
      companies = await ctx.db
        .query("companies")
        .withIndex("by_tenant_type", (q) => q.eq("tenantId", args.tenantId).eq("type", args.type!))
        .collect();
    } else {
      companies = await ctx.db
        .query("companies")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .collect();
    }
    
    // Filter by search term (case insensitive)
    return companies.filter(company => 
      company.name.toLowerCase().includes(args.searchTerm.toLowerCase())
    );
  },
});