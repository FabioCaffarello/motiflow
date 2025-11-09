import {
  SparkConnectConfig,
  SparkStepInput,
  SparkStepOutput,
  AnalysisType,
  getDefaultSparkConfig,
  validateStepInput,
  createSparkStepOutput,
} from "./types";

export * from "./types";

/**
 * Spark Connect Service - TypeScript orchestration layer for Python PySpark steps
 *
 * This service provides configuration management and step orchestration for
 * Python-based PySpark analysis steps. It focuses on:
 * - Configuration validation and defaults
 * - Step input/output standardization
 * - Error handling and logging
 * - Integration with Motia workflow system
 *
 * @example
 * ```typescript
 * import { sparkOrchestrationService } from './services/spark-connect/orchestration';
 *
 * // Get default configuration
 * const config = sparkOrchestrationService.getDefaultConfig();
 *
 * // Validate step input
 * const input = sparkOrchestrationService.validateInput({
 *   csvPath: '/datasets-examples/sales.csv',
 *   sparkUrl: 'sc://localhost:15002'
 * });
 *
 * // Create standardized response
 * const response = sparkOrchestrationService.createResponse(true, data, 1500);
 * ```
 */
export const sparkOrchestrationService = {
  /**
   * Get default Spark Connect configuration
   */
  getDefaultConfig: (): SparkConnectConfig => {
    return getDefaultSparkConfig();
  },

  /**
   * Validate and normalize step input
   */
  validateInput: (input: any): SparkStepInput => {
    return validateStepInput(input);
  },

  /**
   * Create standardized step response
   */
  createResponse: (
    success: boolean,
    data?: any,
    executionTime?: number,
    error?: string,
    metadata?: Record<string, any>
  ): SparkStepOutput => {
    return createSparkStepOutput(success, data, executionTime, error, metadata);
  },

  /**
   * Get configuration for specific analysis type
   */
  getAnalysisConfig: (
    analysisType: AnalysisType,
    baseConfig?: Partial<SparkConnectConfig>
  ): SparkConnectConfig => {
    const config = { ...getDefaultSparkConfig(), ...baseConfig };

    // Customize config based on analysis type
    switch (analysisType) {
      case "profile":
        config.appName = "motia-data-profiler";
        config.timeout = 60000; // Longer timeout for profiling
        break;
      case "summary":
        config.appName = "motia-data-summarizer";
        break;
      case "salary_by_department":
      case "experience_distribution":
        config.appName = "motia-hr-analyzer";
        break;
      case "revenue_by_region":
      case "monthly_trends":
        config.appName = "motia-sales-analyzer";
        break;
      case "sentiment_distribution":
      case "rating_analysis":
        config.appName = "motia-reviews-analyzer";
        break;
      default:
        config.appName = "motia-generic-analyzer";
    }

    return config;
  },

  /**
   * Prepare input for Python step execution
   */
  prepareStepInput: (
    csvPath: string,
    analysisType: AnalysisType,
    additionalParams?: Record<string, any>
  ): Record<string, any> => {
    const config = sparkOrchestrationService.getAnalysisConfig(analysisType);

    return {
      csvPath,
      analysisType,
      sparkUrl: config.sparkUrl,
      appName: config.appName,
      ...additionalParams,
    };
  },

  /**
   * Generate workflow step configuration for specific analysis
   */
  createWorkflowStep: (
    stepId: string,
    analysisType: AnalysisType,
    csvPath: string,
    additionalConfig?: Record<string, any>
  ) => {
    const stepNames = {
      profile: "spark.generic.analyze",
      summary: "spark.generic.analyze",
      sample: "spark.generic.analyze",
      schema: "spark.generic.analyze",
      salary_by_department: "spark.employees.analyze",
      experience_distribution: "spark.employees.analyze",
      revenue_by_region: "spark.sales.analyze",
      monthly_trends: "spark.sales.analyze",
      sentiment_distribution: "spark.generic.analyze",
      rating_analysis: "spark.generic.analyze",
    };

    const stepName = stepNames[analysisType] || "spark.generic.analyze";

    return {
      id: stepId,
      step: stepName,
      input: sparkOrchestrationService.prepareStepInput(
        csvPath,
        analysisType,
        additionalConfig
      ),
    };
  },

  /**
   * Create a complete workflow for CSV analysis
   */
  createAnalysisWorkflow: (csvPath: string, analyses: AnalysisType[]) => {
    const steps = analyses.map((analysisType, index) =>
      sparkOrchestrationService.createWorkflowStep(
        `analysis_${index + 1}`,
        analysisType,
        csvPath
      )
    );

    return {
      name: `csv-analysis-${Date.now()}`,
      description: `Automated analysis workflow for ${csvPath}`,
      steps,
      metadata: {
        csvPath,
        analysisTypes: analyses,
        createdAt: new Date().toISOString(),
      },
    };
  },

  /**
   * Suggest appropriate analyses based on CSV structure
   */
  suggestAnalyses: (csvPath: string): AnalysisType[] => {
    const suggestions: AnalysisType[] = ["profile"]; // Always suggest profiling

    // Suggest based on file name patterns
    const filename = csvPath.toLowerCase();

    if (filename.includes("employee") || filename.includes("hr")) {
      suggestions.push("salary_by_department", "experience_distribution");
    } else if (filename.includes("sales") || filename.includes("revenue")) {
      suggestions.push("revenue_by_region", "monthly_trends");
    } else if (filename.includes("review") || filename.includes("feedback")) {
      suggestions.push("sentiment_distribution", "rating_analysis");
    } else {
      suggestions.push("summary", "sample");
    }

    return suggestions;
  },

  /**
   * Validate Spark Connect server availability
   */
  validateSparkConnection: async (
    config?: Partial<SparkConnectConfig>
  ): Promise<boolean> => {
    const sparkConfig = { ...getDefaultSparkConfig(), ...config };

    try {
      // Convert sc:// URL to http:// for health check
      const httpUrl = sparkConfig.sparkUrl.replace("sc://", "http://");
      const response = await fetch(`${httpUrl}/api/v1/sessions`, {
        method: "GET",
        signal: AbortSignal.timeout(sparkConfig.timeout),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  },
};
