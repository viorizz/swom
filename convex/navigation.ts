// convex/navigation.ts - Optimized query for tree navigation
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getNavigationTree = query({
  args: {},
  handler: async (ctx) => {
    // Get all companies first
    const companies = await ctx.db.query("companies").collect();
    
    // For each company, get projects and orders in one go
    const tree = await Promise.all(
      companies.map(async (company) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_company", (q) => q.eq("companyId", company._id))
          .collect();
        
        const projectsWithOrders = await Promise.all(
          projects.map(async (project) => {
            const orders = await ctx.db
              .query("orders")
              .withIndex("by_project", (q) => q.eq("projectId", project._id))
              .collect();
            
            return {
              ...project,
              orders,
            };
          })
        );
        
        return {
          ...company,
          projects: projectsWithOrders,
        };
      })
    );
    
    return tree;
  },
});