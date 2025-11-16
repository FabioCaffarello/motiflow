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
    "name": "spark.sql.execute",
    "description": "Execute SQL queries on CSV data using PySpark SQL engine",
    "subscribes": ["spark.sql.execute"],
    "emits": ["spark.analysis.completed"],
    "input": {
        "type": "object",
        "properties": {
            "csvPath": {"type": "string"},
            "sqlQuery": {"type": "string"},
            "sparkUrl": {"type": "string", "default": "sc://spark-connect:15002"},
            "appName": {"type": "string", "default": "motia-sql-executor"},
            "maxRows": {"type": "number", "default": 1000},
            "tableName": {"type": "string", "default": "data"},
        },
        "required": ["csvPath", "sqlQuery"],
    },
    "flows": ["spark-analysis"],
}


async def handler(input_data, context):
    """
    Execute SQL queries on CSV data using PySpark SQL engine

    Supports:
    - Complex SQL queries with aggregations, joins, window functions
    - Multiple output formats
    - Query execution statistics
    - Error handling with detailed messages
    """
    start_time = time.time()

    # Extract input parameters
    csv_path = input_data["csvPath"]
    sql_query = input_data["sqlQuery"]
    spark_url = input_data.get("sparkUrl", "sc://spark-connect:15002")
    app_name = input_data.get("appName", "motia-sql-executor")
    max_rows = input_data.get("maxRows", 1000)
    table_name = input_data.get("tableName", "data")

    log_step_execution(
        context,
        "spark.sql.execute",
        csvPath=csv_path,
        queryLength=len(sql_query),
        sparkUrl=spark_url,
        appName=app_name,
    )

    spark_util = None

    try:
        # Initialize Spark utility
        spark_util = SparkConnectUtil(spark_url=spark_url, app_name=app_name)

        # Load CSV file
        context.logger.info(
            "Loading CSV file",
            {
                "csvPath": csv_path,
                "isS3A": csv_path.startswith("s3a://"),
                "source": "MinIO/S3" if csv_path.startswith("s3a://") else "local",
            },
        )
        df = spark_util.load_csv(csv_path)
        context.logger.info(
            "CSV file loaded successfully",
            {
                "rowCount": df.count(),
                "columnCount": len(df.columns),
                "columns": df.columns,
            },
        )

        # Execute SQL query
        context.logger.info(
            "Executing SQL query",
            {
                "query": sql_query[:200] + "..." if len(sql_query) > 200 else sql_query,
                "tableName": table_name,
            },
        )

        query_start_time = time.time()
        result_df = spark_util.execute_sql_query(df, sql_query, table_name)
        query_execution_time = time.time() - query_start_time

        # Convert result to dictionary
        result_data = spark_util.df_to_dict(result_df, max_rows)

        # Add query execution metadata
        metadata = {
            "csvPath": csv_path,
            "sqlQuery": sql_query,
            "queryExecutionTime": query_execution_time,
            "tableName": table_name,
            "sparkUrl": spark_url,
            "appName": app_name,
            "analysisType": "sql_query",
        }

        # Add query analysis
        query_analysis = {
            "queryLength": len(sql_query),
            "hasAggregation": any(
                keyword in sql_query.upper()
                for keyword in ["GROUP BY", "SUM(", "COUNT(", "AVG(", "MAX(", "MIN("]
            ),
            "hasJoin": "JOIN" in sql_query.upper(),
            "hasWindow": "OVER(" in sql_query.upper(),
            "hasOrderBy": "ORDER BY" in sql_query.upper(),
            "hasLimit": "LIMIT" in sql_query.upper(),
        }

        result_data["queryAnalysis"] = query_analysis

        execution_time = time.time() - start_time

        # Create success response
        response = create_step_response(
            success=True,
            data=result_data,
            execution_time=execution_time,
            metadata=metadata,
        )

        context.logger.info(
            "SQL query executed successfully",
            {
                "executionTime": execution_time,
                "queryExecutionTime": query_execution_time,
                "resultRows": result_data.get("rowCount", 0),
                "resultColumns": len(result_data.get("schema", [])),
            },
        )

        # Emit completion event (optional - only if we need to chain to other steps)
        # await context.emit({
        #     "topic": "spark.analysis.completed",
        #     "data": {
        #         "stepName": "spark.sql.execute",
        #         "success": True,
        #         "executionTime": execution_time
        #     }
        # })

        return response

    except Exception as e:
        execution_time = time.time() - start_time

        # Enhanced error handling for SQL queries
        error_msg = str(e)
        if "AnalysisException" in error_msg:
            error_type = "SQL Analysis Error"
        elif "ParseException" in error_msg:
            error_type = "SQL Parse Error"
        elif "IllegalArgumentException" in error_msg:
            error_type = "Invalid Argument Error"
        else:
            error_type = "Execution Error"

        context.logger.error(
            f"SQL query failed: {error_type}",
            {
                "error": error_msg,
                "query": sql_query[:200] + "..." if len(sql_query) > 200 else sql_query,
                "errorType": error_type,
            },
        )

        error_response = create_step_response(
            success=False,
            execution_time=execution_time,
            error=f"{error_type}: {error_msg}",
            metadata={
                "csvPath": csv_path,
                "sqlQuery": sql_query,
                "errorType": error_type,
                "sparkUrl": spark_url,
                "appName": app_name,
            },
        )

        # Emit error event (optional - only if we need to chain to other steps)
        # await context.emit({
        #     "topic": "spark.analysis.completed",
        #     "data": {
        #         "stepName": "spark.sql.execute",
        #         "success": False,
        #         "error": f"{error_type}: {error_msg}",
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
