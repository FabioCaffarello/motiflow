import { ApiRouteConfig, Handlers } from "motia";
import { z } from "zod";

// Define request body schema
const requestBodySchema = z.object({
  type: z.enum(["employees", "sales", "generic", "sql"]),
  csvPath: z
    .string()
    .min(1, "CSV path is required")
    .refine(
      (path) => {
        // Validate path format - accept local paths, S3A paths, or HDFS paths
        return (
          path.startsWith("s3a://") ||
          path.startsWith("s3://") ||
          path.startsWith("hdfs://") ||
          path.startsWith("/") ||
          path.match(/^[a-zA-Z]:\\/) // Windows paths
        );
      },
      {
        message:
          "CSV path must be a valid path: s3a://bucket/key, s3://bucket/key, hdfs://path, or local path",
      }
    ),
  analysisType: z.string().optional(),
  sqlQuery: z.string().optional(), // Required only for 'sql' type
  sparkUrl: z.string().default("sc://spark-connect:15002"),
  appName: z.string().optional(),
  maxRows: z.number().positive().default(1000),
  tableName: z.string().default("data"),
});

export const config: ApiRouteConfig = {
  name: "spark-analyze",
  type: "api",
  path: "/spark/analyze",
  method: "POST",
  description: "Trigger Spark data analysis workflows using PySpark",
  emits: [
    { topic: "spark.employees.analyze" },
    { topic: "spark.sales.analyze" },
    { topic: "spark.generic.analyze" },
    { topic: "spark.sql.execute" },
  ],
  flows: ["spark-analysis"],
  bodySchema: requestBodySchema,
  responseSchema: {
    202: z.object({
      message: z.string(),
      analysisId: z.string(),
      type: z.string(),
      status: z.literal("queued"),
    }),
    400: z.object({
      error: z.string(),
    }),
    500: z.object({
      error: z.string(),
    }),
  },
};

export const handler: Handlers["spark-analyze"] = async (req, ctx) => {
  const { emit, logger } = ctx;

  try {
    const requestData = req.body;

    // Additional validation for SQL type
    if (requestData.type === "sql" && !requestData.sqlQuery) {
      logger.warn("SQL query required for SQL analysis type");
      return {
        status: 400,
        body: {
          error: "sqlQuery is required for SQL analysis type",
        },
      };
    }

    // Normalize S3 paths to S3A
    let normalizedCsvPath = requestData.csvPath;
    if (normalizedCsvPath.startsWith("s3://")) {
      normalizedCsvPath = normalizedCsvPath.replace("s3://", "s3a://");
      logger.info("Converted s3:// to s3a:// path", {
        original: requestData.csvPath,
        normalized: normalizedCsvPath,
      });
    }

    logger.info("Received Spark analysis request", {
      type: requestData.type,
      csvPath: normalizedCsvPath,
      isS3A: normalizedCsvPath.startsWith("s3a://"),
    });

    // Generate unique analysis ID
    const analysisId = `spark_${requestData.type}_${Date.now()}`;

    // Emit event to trigger the appropriate Event Step based on type
    switch (requestData.type) {
      case "employees":
        await emit({
          topic: "spark.employees.analyze",
          data: {
            analysisType:
              (requestData.analysisType as any) || "salary_by_department",
            csvPath: normalizedCsvPath,
            sparkUrl: requestData.sparkUrl,
            appName:
              requestData.appName || `motia-employee-analyzer-${analysisId}`,
          },
        });
        break;

      case "sales":
        await emit({
          topic: "spark.sales.analyze",
          data: {
            analysisType:
              (requestData.analysisType as any) || "revenue_by_region",
            csvPath: normalizedCsvPath,
            sparkUrl: requestData.sparkUrl,
            appName:
              requestData.appName || `motia-sales-analyzer-${analysisId}`,
          },
        });
        break;

      case "generic":
        await emit({
          topic: "spark.generic.analyze",
          data: {
            csvPath: normalizedCsvPath,
            analysisType: (requestData.analysisType as any) || "profile",
            sparkUrl: requestData.sparkUrl,
            appName:
              requestData.appName || `motia-generic-analyzer-${analysisId}`,
            tableName: requestData.tableName,
          },
        });
        break;

      case "sql":
        await emit({
          topic: "spark.sql.execute",
          data: {
            csvPath: normalizedCsvPath,
            sqlQuery: requestData.sqlQuery!,
            sparkUrl: requestData.sparkUrl,
            appName: requestData.appName || `motia-sql-executor-${analysisId}`,
            maxRows: requestData.maxRows,
            tableName: requestData.tableName,
          },
        });
        break;

      default:
        logger.warn("Invalid analysis type requested", {
          type: requestData.type,
        });
        return {
          status: 400,
          body: {
            error: `Invalid analysis type: ${requestData.type}. Supported types: employees, sales, generic, sql`,
          },
        };
    }

    logger.info("Spark analysis queued successfully", {
      analysisId,
      type: requestData.type,
    });

    return {
      status: 202, // Accepted
      body: {
        message: `Spark ${requestData.type} analysis has been queued successfully`,
        analysisId,
        type: requestData.type,
        status: "queued" as const,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Error processing Spark analysis request", {
      error: errorMessage,
      body: req.body,
    });

    return {
      status: 500,
      body: {
        error: "Internal server error while processing analysis request",
      },
    };
  }
};
