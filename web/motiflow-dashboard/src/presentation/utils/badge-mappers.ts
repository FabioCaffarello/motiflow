/**
 * Utility functions to map domain values to Badge variants
 */

export type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

/**
 * Maps Epic/Story/Task status to Badge variant
 */
export function statusToBadgeVariant(status: string): BadgeVariant {
  const statusMap: Record<string, BadgeVariant> = {
    // Epic Status
    DRAFT: "neutral",
    ACTIVE: "info",
    COMPLETED: "success",
    ARCHIVED: "neutral",
    
    // Story Status
    BACKLOG: "neutral",
    PLANNED: "info",
    IN_PROGRESS: "info",
    REVIEW: "warning",
    DONE: "success",
    
    // Task Status
    TODO: "neutral",
    IN_PROGRESS: "info",
    REVIEW: "warning",
    DONE: "success",
    
    // Sprint Status
    PLANNED: "neutral",
    ACTIVE: "info",
    COMPLETED: "success",
    CANCELLED: "error",
  };

  return statusMap[status] || "neutral";
}

/**
 * Maps Priority to Badge variant
 */
export function priorityToBadgeVariant(priority: string): BadgeVariant {
  const priorityMap: Record<string, BadgeVariant> = {
    LOW: "neutral",
    MEDIUM: "warning",
    HIGH: "error",
    CRITICAL: "error",
  };

  return priorityMap[priority] || "neutral";
}
