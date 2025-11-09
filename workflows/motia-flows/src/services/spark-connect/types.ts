import { z } from "zod";

// Spark Connect Configuration Schema - for TypeScript orchestration
export const sparkConnectConfigSchema = z.object({
  sparkUrl: z.string().default("sc://localhost:15002"),
  appName: z.string().default("motia-spark-connect"),
  timeout: z.number().optional().default(30000),
  maxRetries: z.number().optional().default(3),
  pythonPath: z.string().optional().default("python3"),
  sparkHome: z.string().optional(),
});

// Step Input/Output Schemas for Python steps
export const sparkStepInputSchema = z.object({
  csvPath: z.string(),
  sparkUrl: z.string().optional(),
  appName: z.string().optional(),
  outputFormat: z.enum(["json", "dict", "parquet"]).default("json"),
  maxRows: z.number().optional().default(1000),
});

export const sparkStepOutputSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  executionTime: z.number(),
  rowCount: z.number().optional(),
  schema: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
      })
    )
    .optional(),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Python Analysis Types
export const analysisTypeSchema = z.enum([
  "profile",
  "summary",
  "sample",
  "schema",
  "salary_by_department",
  "experience_distribution",
  "revenue_by_region",
  "monthly_trends",
  "sentiment_distribution",
  "rating_analysis",
]);

// Export Types
export type SparkConnectConfig = z.infer<typeof sparkConnectConfigSchema>;
export type SparkStepInput = z.infer<typeof sparkStepInputSchema>;
export type SparkStepOutput = z.infer<typeof sparkStepOutputSchema>;
export type AnalysisType = z.infer<typeof analysisTypeSchema>;

// Error Types for TypeScript orchestration
export class SparkConnectError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = "SparkConnectError";
  }
}

// Configuration helpers
export const getDefaultSparkConfig = (): SparkConnectConfig => {
  return sparkConnectConfigSchema.parse({});
};

export const validateStepInput = (input: any): SparkStepInput => {
  return sparkStepInputSchema.parse(input);
};

export const createSparkStepOutput = (
  success: boolean,
  data?: any,
  executionTime?: number,
  error?: string,
  metadata?: Record<string, any>
): SparkStepOutput => {
  return {
    success,
    data: data || null,
    executionTime: executionTime || 0,
    rowCount: Array.isArray(data) ? data.length : undefined,
    error,
    metadata,
  };
};
