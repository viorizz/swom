// convex/navigation.ts - Updated for new structure
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getNavigationTree = query({
  args: { tenantId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const tenantFilter = args.tenantId || "default";
    
    // Get all projects for the tenant
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantFilter))
      .collect();
    
    // For each project, get orders and company info
    const projectsWithOrdersAndCompanies = await Promise.all(
      projects.map(async (project) => {
        // Get orders for this project
        const orders = await ctx.db
          .query("orders")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        
        // Get company information
        const [masonryCompany, architectCompany, engineerCompany, clientCompany] = await Promise.all([
          project.masonryCompanyId ? ctx.db.get(project.masonryCompanyId) : null,
          project.architectCompanyId ? ctx.db.get(project.architectCompanyId) : null,
          project.engineerCompanyId ? ctx.db.get(project.engineerCompanyId) : null,
          project.clientCompanyId ? ctx.db.get(project.clientCompanyId) : null,
        ]);
        
        return {
          ...project,
          orders,
          companies: {
            masonry: masonryCompany,
            architect: architectCompany,
            engineer: engineerCompany,
            client: clientCompany,
          },
        };
      })
    );
    
    return projectsWithOrdersAndCompanies;
  },
});

// Get companies navigation (for companies tab)
export const getCompaniesTree = query({
  args: { tenantId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const tenantFilter = args.tenantId || "default";
    
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantFilter))
      .collect();
    
    // Group companies by type
    const companiesByType = companies.reduce((acc, company) => {
      if (!acc[company.type]) {
        acc[company.type] = [];
      }
      acc[company.type].push(company);
      return acc;
    }, {} as Record<string, typeof companies>);
    
    return companiesByType;
  },
});

// Get pending companies for a project (companies that need to be completed)
export const getPendingCompanies = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pendingCompanies")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});