// convex/projects.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
});

export const listByTenant = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get project with populated company information
export const getWithCompanies = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const [masonryCompany, architectCompany, engineerCompany, clientCompany] = await Promise.all([
      project.masonryCompanyId ? ctx.db.get(project.masonryCompanyId) : null,
      project.architectCompanyId ? ctx.db.get(project.architectCompanyId) : null,
      project.engineerCompanyId ? ctx.db.get(project.engineerCompanyId) : null,
      project.clientCompanyId ? ctx.db.get(project.clientCompanyId) : null,
    ]);

    return {
      ...project,
      companies: {
        masonry: masonryCompany,
        architect: architectCompany,
        engineer: engineerCompany,
        client: clientCompany,
      },
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    number: v.string(),
    description: v.optional(v.string()),
    masonryCompanyId: v.optional(v.id("companies")),
    architectCompanyId: v.optional(v.id("companies")),
    engineerCompanyId: v.optional(v.id("companies")),
    clientCompanyId: v.optional(v.id("companies")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("on_hold")
    )),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      ...args,
      status: args.status || "planning",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    number: v.optional(v.string()),
    description: v.optional(v.string()),
    masonryCompanyId: v.optional(v.id("companies")),
    architectCompanyId: v.optional(v.id("companies")),
    engineerCompanyId: v.optional(v.id("companies")),
    clientCompanyId: v.optional(v.id("companies")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("on_hold")
    )),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Create project with potential new companies
export const createWithNewCompanies = mutation({
  args: {
    name: v.string(),
    number: v.string(),
    description: v.optional(v.string()),
    companies: v.object({
      masonry: v.optional(v.union(v.id("companies"), v.string())),
      architect: v.optional(v.union(v.id("companies"), v.string())),
      engineer: v.optional(v.union(v.id("companies"), v.string())),
      client: v.optional(v.union(v.id("companies"), v.string())),
    }),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const { companies, ...projectData } = args;
    
    // Collect new company names that need to be created
    const newCompanies: Array<{ name: string; type: string }> = [];
    const companyIds: Record<string, string | undefined> = {};
    
    // Process each company assignment
    for (const [type, value] of Object.entries(companies)) {
      if (value) {
        if (typeof value === "string" && !value.startsWith("j")) {
          // It's a new company name
          newCompanies.push({ name: value, type });
          companyIds[`${type}CompanyId`] = undefined; // Will be set later
        } else {
          // It's an existing company ID
          companyIds[`${type}CompanyId`] = value as string;
        }
      }
    }
    
    // Create the project first
    const projectId = await ctx.db.insert("projects", {
      ...projectData,
      status: "planning",
      masonryCompanyId: companyIds.masonryCompanyId as any,
      architectCompanyId: companyIds.architectCompanyId as any,
      engineerCompanyId: companyIds.engineerCompanyId as any,
      clientCompanyId: companyIds.clientCompanyId as any,
    });
    
    // Store pending companies for later completion
    for (const newCompany of newCompanies) {
      await ctx.db.insert("pendingCompanies", {
        projectId,
        name: newCompany.name,
        type: newCompany.type as any,
        tenantId: args.tenantId,
        createdAt: new Date().toISOString(),
      });
    }
    
    return { projectId, pendingCompanies: newCompanies };
  },
});