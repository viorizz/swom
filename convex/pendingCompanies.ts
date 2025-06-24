// convex/pendingCompanies.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pendingCompanies")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const listByTenant = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pendingCompanies")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});

// Complete a pending company by creating the actual company and updating the project
export const completePendingCompany = mutation({
  args: {
    pendingCompanyId: v.id("pendingCompanies"),
    companyData: v.object({
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const pendingCompany = await ctx.db.get(args.pendingCompanyId);
    if (!pendingCompany) {
      throw new Error("Pending company not found");
    }

    // Create the actual company
    const companyId = await ctx.db.insert("companies", {
      name: pendingCompany.name,
      type: pendingCompany.type,
      address: args.companyData.address,
      phone: args.companyData.phone,
      email: args.companyData.email,
      tenantId: pendingCompany.tenantId,
    });

    // Update the project to reference the new company
    const project = await ctx.db.get(pendingCompany.projectId);
    if (project) {
      const updates: any = {};
      
      switch (pendingCompany.type) {
        case "masonry":
          updates.masonryCompanyId = companyId;
          break;
        case "architect":
          updates.architectCompanyId = companyId;
          break;
        case "engineer":
          updates.engineerCompanyId = companyId;
          break;
        case "client":
          updates.clientCompanyId = companyId;
          break;
      }
      
      await ctx.db.patch(pendingCompany.projectId, updates);
    }

    // Remove the pending company
    await ctx.db.delete(args.pendingCompanyId);

    return companyId;
  },
});

// Remove a pending company without creating it
export const removePendingCompany = mutation({
  args: { pendingCompanyId: v.id("pendingCompanies") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.pendingCompanyId);
  },
});