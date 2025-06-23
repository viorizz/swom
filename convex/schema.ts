import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  companies: defineTable({
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
  }).index("by_tenant", ["tenantId"]),

  projects: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    number: v.string(),
    tenantId: v.string(),
  }).index("by_company", ["companyId"]),

  orders: defineTable({
    projectId: v.id("projects"),
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
  }).index("by_project", ["projectId"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    position: v.number(),
    articleNumber: v.string(),
    description: v.string(),
    quantity: v.number(),
    dimensions: v.object({
      diameter: v.optional(v.number()),
      length: v.optional(v.number()),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    }),
    manufacturerData: v.any(),
    tenantId: v.string(),
  }).index("by_order", ["orderId"]).index("by_order_position", ["orderId", "position"]),
});