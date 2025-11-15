import json
import time
from spark_utils import (
    SparkConnectUtil,
    create_step_response,
    log_step_execution,
    handle_step_error,
)

config = {
    "type": "event",
    "name": "spark.generic.analyze",
    "description": "Generic data analysis using PySpark with multiple analysis modes",
    "subscribes": ["spark.generic.analyze"],
    "emits": ["spark.analysis.completed"],
    "input": {
        "type": "object",
        "properties": {
            "csvPath": {"type": "string"},
            "analysisType": {
                "type": "string",
                "enum": ["profile", "sample", "schema", "summary", "custom_sql"],
                "default": "profile",
            },
            "customSql": {"type": "string"},
            "sampleSize": {"type": "number", "default": 100},
            "sparkUrl": {"type": "string", "default": "sc://spark-connect:15002"},
            "appName": {"type": "string", "default": "motia-generic-analyzer"},
            "tableName": {"type": "string", "default": "data"},
        },
        "required": ["csvPath"],
    },
    "flows": ["spark-analysis"],
}


def generate_data_recommendations(df, spark_util):
    """Generate intelligent recommendations based on data analysis"""
    recommendations = []

    try:
        # Basic data info
        row_count = df.count()
        column_count = len(df.columns)

        # Row count recommendations
        if row_count > 1000000:
            recommendations.append(
                "Large dataset detected - consider using sampling for faster exploration"
            )
        elif row_count < 100:
            recommendations.append(
                "Small dataset - statistical analyses may have limited reliability"
            )

        # Column analysis
        if column_count > 50:
            recommendations.append(
                "High dimensionality dataset - consider feature selection or PCA"
            )

        # Data type analysis
        numeric_cols = []
        string_cols = []
        date_cols = []

        for field in df.schema.fields:
            if field.dataType.typeName() in ["integer", "double", "float", "long"]:
                numeric_cols.append(field.name)
            elif field.dataType.typeName() in ["string"]:
                string_cols.append(field.name)
            elif field.dataType.typeName() in ["date", "timestamp"]:
                date_cols.append(field.name)

        # Recommendations based on data types
        if len(numeric_cols) >= 2:
            recommendations.append(
                f"Multiple numeric columns detected - consider correlation analysis"
            )

        if len(date_cols) >= 1:
            recommendations.append(
                "Date columns found - time series analysis might be valuable"
            )

        if len(string_cols) >= 1:
            recommendations.append(
                "Categorical columns detected - consider groupby analyses"
            )

        # Null value analysis
        null_counts = {}
        for col in df.columns:
            null_count = df.filter(df[col].isNull()).count()
            if null_count > 0:
                null_percentage = (null_count / row_count) * 100
                null_counts[col] = null_percentage

                if null_percentage > 50:
                    recommendations.append(
                        f"Column '{col}' has {null_percentage:.1f}% missing values - consider dropping or imputation"
                    )
                elif null_percentage > 20:
                    recommendations.append(
                        f"Column '{col}' has {null_percentage:.1f}% missing values - investigate data quality"
                    )

        # Suggest useful queries based on data structure
        if len(numeric_cols) > 0 and len(string_cols) > 0:
            recommendations.append(
                f"Try aggregation queries: SELECT {string_cols[0]}, AVG({numeric_cols[0]}) FROM data GROUP BY {string_cols[0]}"
            )

        if len(date_cols) > 0 and len(numeric_cols) > 0:
            recommendations.append(
                f"Try time series analysis: SELECT DATE_FORMAT({date_cols[0]}, 'yyyy-MM'), SUM({numeric_cols[0]}) FROM data GROUP BY DATE_FORMAT({date_cols[0]}, 'yyyy-MM')"
            )

        return recommendations

    except Exception as e:
        recommendations.append(f"Error generating recommendations: {str(e)}")
        return recommendations


async def handler(input_data, context):
    """
    Generic CSV analysis using PySpark - flexible analysis for any dataset

    Analysis types:
    - profile: Comprehensive data profiling
    - sample: Random sample of data
    - schema: Data structure and types
    - summary: Statistical summary
    - custom_sql: Execute custom SQL query
    """
    start_time = time.time()

    # Extract input parameters
    csv_path = input_data["csvPath"]
    analysis_type = input_data.get("analysisType", "profile")
    custom_sql = input_data.get("customSql")
    sample_size = input_data.get("sampleSize", 100)
    spark_url = input_data.get("sparkUrl", "sc://spark-connect:15002")
    app_name = input_data.get("appName", "motia-generic-analyzer")
    table_name = input_data.get("tableName", "data")

    log_step_execution(
        context,
        "spark.generic.analyze",
        csvPath=csv_path,
        analysisType=analysis_type,
        sparkUrl=spark_url,
    )

    spark_util = None

    try:
        # Initialize Spark utility
        spark_util = SparkConnectUtil(spark_url=spark_url, app_name=app_name)

        # Load CSV file
        context.logger.info("Loading CSV file", {"csvPath": csv_path})
        df = spark_util.load_csv(csv_path)

        # Register as temporary view for SQL queries
        df.createOrReplaceTempView(table_name)

        result_data = {}
        recommendations = []

        # Execute analysis based on type
        if analysis_type == "profile":
            context.logger.info("Generating comprehensive data profile")

            # Basic info
            result_data["basic"] = {
                "rowCount": df.count(),
                "columnCount": len(df.columns),
                "columns": df.columns,
            }

            # Schema
            result_data["schema"] = [
                {
                    "name": field.name,
                    "type": field.dataType.typeName(),
                    "nullable": field.nullable,
                }
                for field in df.schema.fields
            ]

            # Comprehensive profiling
            result_data["profile"] = spark_util.profile_dataframe(df)

            # Generate recommendations
            recommendations = generate_data_recommendations(df, spark_util)

        elif analysis_type == "sample":
            context.logger.info(f"Collecting random sample of {sample_size} rows")

            # Get random sample
            sample_df = df.sample(fraction=0.1).limit(sample_size)
            result_data = spark_util.df_to_dict(sample_df, sample_size)

            recommendations = [
                f"Showing random sample of {sample_size} rows",
                "Use this sample to understand data structure before running larger analyses",
            ]

        elif analysis_type == "schema":
            context.logger.info("Analyzing data schema and structure")

            result_data = {
                "schema": [
                    {
                        "name": field.name,
                        "type": field.dataType.typeName(),
                        "nullable": field.nullable,
                        "metadata": field.metadata,
                    }
                    for field in df.schema.fields
                ],
                "rowCount": df.count(),
                "columnCount": len(df.columns),
            }

            recommendations = [
                "Schema analysis completed",
                "Use this information to design appropriate SQL queries",
            ]

        elif analysis_type == "summary":
            context.logger.info("Generating statistical summary")

            # Use Spark's describe function for numeric columns
            summary_df = df.describe()
            result_data = spark_util.df_to_dict(summary_df)

            recommendations = [
                "Statistical summary for numeric columns",
                "Consider profiling analysis for more detailed insights",
            ]

        elif analysis_type == "custom_sql" and custom_sql:
            context.logger.info("Executing custom SQL query")

            if not custom_sql:
                raise ValueError(
                    "Custom SQL query is required for custom_sql analysis type"
                )

            # Execute custom SQL
            result_df = spark_util.execute_sql_query(df, custom_sql, table_name)
            result_data = spark_util.df_to_dict(result_df)

            recommendations = [
                "Custom SQL query executed successfully",
                "Consider saving useful queries for future use",
            ]

        else:
            raise ValueError(f"Unknown analysis type: {analysis_type}")

        execution_time = time.time() - start_time

        # Prepare metadata
        metadata = {
            "csvPath": csv_path,
            "analysisType": analysis_type,
            "sparkUrl": spark_url,
            "appName": app_name,
            "tableName": table_name,
        }

        if custom_sql:
            metadata["customSql"] = (
                custom_sql[:200] + "..." if len(custom_sql) > 200 else custom_sql
            )

        # Create success response
        response = create_step_response(
            success=True,
            data=result_data,
            execution_time=execution_time,
            metadata=metadata,
        )

        response["recommendations"] = recommendations

        context.logger.info(
            "Generic analysis completed successfully",
            {
                "executionTime": execution_time,
                "analysisType": analysis_type,
                "dataSize": len(str(result_data)),
                "recommendationCount": len(recommendations),
            },
        )

        # Emit completion event (optional - only if we need to chain to other steps)
        # await context.emit({
        #     "topic": "spark.analysis.completed",
        #     "data": {
        #         "stepName": "spark.generic.analyze",
        #         "analysisType": analysis_type,
        #         "success": True,
        #         "executionTime": execution_time
        #     }
        # })

        return response

    except Exception as e:
        execution_time = time.time() - start_time
        error_response = handle_step_error(context, "spark.generic.analyze", e)
        error_response["executionTime"] = execution_time
        error_response["recommendations"] = []

        # Emit error event (optional - only if we need to chain to other steps)
        # await context.emit({
        #     "topic": "spark.analysis.completed",
        #     "data": {
        #         "stepName": "spark.generic.analyze",
        #         "success": False,
        #         "error": str(e),
        #         "executionTime": execution_time
        #     }
        # })

        return error_response

    finally:
        # Always cleanup Spark session
        if spark_util:
            try:
                spark_util.stop_spark_session()
            except Exception as cleanup_error:
                context.logger.warn(
                    "Error during Spark session cleanup", {"error": str(cleanup_error)}
                )
