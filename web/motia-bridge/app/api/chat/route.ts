import { streamText, convertToModelMessages, type UIMessage, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const maxDuration = 30;

// Motia-flows API endpoint
// In Docker: use service name, in local dev: use localhost
const MOTIA_FLOWS_URL =
  process.env.MOTIA_FLOWS_URL ||
  (process.env.NODE_ENV === "production" || process.env.MOTIA_DOCKER
    ? "http://motia-flows:3000"
    : "http://localhost:3000");

/**
 * Execute SQL query on CSV data using Spark Connect
 */
async function executeSparkSQL(csvPath: string, sqlQuery: string) {
  try {
    console.log(
      `🔍 Executing SQL query on ${csvPath}: ${sqlQuery.substring(0, 100)}...`,
    );

    const response = await fetch(`${MOTIA_FLOWS_URL}/spark/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "sql",
        csvPath: csvPath,
        sqlQuery: sqlQuery,
      }),
      // Add timeout to avoid hanging
      signal: AbortSignal.timeout(15000), // 15 seconds timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Spark SQL execution failed: ${response.status} - ${errorText}`,
      );
      throw new Error(
        `Spark analysis failed (${response.status}): ${errorText}`,
      );
    }

    const result = await response.json();
    console.log(`✅ SQL query queued: ${result.analysisId}`);

    return {
      success: true,
      analysisId: result.analysisId,
      type: result.type,
      message:
        "SQL query has been queued for execution. The analysis is being processed by Spark Connect. Note: Results are processed asynchronously and will be available in the motia-flows logs.",
    };
  } catch (error) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage =
          "Request timed out - motia-flows may be unavailable or taking too long to respond";
      } else if (error.message.includes("ECONNREFUSED")) {
        errorMessage =
          "Cannot connect to motia-flows service - please ensure it is running";
      } else {
        errorMessage = error.message;
      }
    }

    console.error(`❌ Error executing Spark SQL: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function POST(request: Request) {
  const { messages, webSearch } = (await request.json()) as {
    messages: UIMessage[];
    webSearch?: boolean;
  };

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a helpful assistant that helps users with their questions about Motia, the AI workflow platform.${
      webSearch
        ? " You have access to web search capabilities when needed."
        : ""
    }

When users ask to analyze CSV data or run SQL queries, you can use the executeSparkSQL tool.
The csvPath should be in S3A format (e.g., s3a://bucket/path/to/file.csv).
If the user mentions a CSV file they uploaded, look for S3A paths in the conversation context.`,
    messages: convertToModelMessages(messages),
    tools: {
      executeSparkSQL: tool({
        description:
          "Execute a SQL query on CSV data using Spark Connect. Use this when users want to analyze CSV files or run SQL queries on data.",
        parameters: z.object({
          csvPath: z
            .string()
            .describe(
              "The S3A path to the CSV file (e.g., s3a://motiflow/uploads/2024-01-01/file.csv)",
            ),
          sqlQuery: z
            .string()
            .describe("The SQL query to execute on the CSV data"),
        }),
        execute: async ({ csvPath, sqlQuery }: { csvPath: string; sqlQuery: string }) => {
          const result = await executeSparkSQL(csvPath, sqlQuery);
          return result;
        },
      } as any), // Type assertion needed due to AI SDK typing issue
    },
  });

  return result.toUIMessageStreamResponse();
}
