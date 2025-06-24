import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  companies: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("masonry"),
      v.literal("architect"), 
      v.literal("engineer"),
      v.literal("client")
    ),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    tenantId: v.string(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_type", ["type"])
    .index("by_tenant_type", ["tenantId", "type"]),

  projects: defineTable({
    name: v.string(),
    number: v.string(),
    description: v.optional(v.string()),
    // Company assignments by role
    masonryCompanyId: v.optional(v.id("companies")),
    architectCompanyId: v.optional(v.id("companies")),
    engineerCompanyId: v.optional(v.id("companies")),
    clientCompanyId: v.optional(v.id("companies")),
    // Project metadata
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("on_hold")
    ),
    tenantId: v.string(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_status", ["status"])
    .index("by_masonry_company", ["masonryCompanyId"])
    .index("by_architect_company", ["architectCompanyId"])
    .index("by_engineer_company", ["engineerCompanyId"])
    .index("by_client_company", ["clientCompanyId"]),

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
  })
    .index("by_order", ["orderId"])
    .index("by_order_position", ["orderId", "position"]),

  // New table to track pending company creations during project setup
  pendingCompanies: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    type: v.union(
      v.literal("masonry"),
      v.literal("architect"), 
      v.literal("engineer"),
      v.literal("client")
    ),
    tenantId: v.string(),
    createdAt: v.string(),
  }).index("by_project", ["projectId"]).index("by_tenant", ["tenantId"]),
});