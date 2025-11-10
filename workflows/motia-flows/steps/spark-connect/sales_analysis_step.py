import time
from spark_utils import (
    SparkConnectUtil,
    create_step_response,
    log_step_execution,
    handle_step_error,
)

config = {
    "type": "event",
    "name": "spark.sales.analyze",
    "description": "Analyze sales data using PySpark with configurable analysis types",
    "subscribes": ["spark.sales.analyze"],
    "emits": ["spark.analysis.completed"],
    "input": {
        "type": "object",
        "properties": {
            "analysisType": {
                "type": "string",
                "enum": [
                    "revenue_by_region",
                    "monthly_trends",
                    "product_performance",
                    "sales_rep_analysis",
                    "all",
                ],
                "default": "revenue_by_region",
            },
            "csvPath": {"type": "string", "default": "/datasets-examples/sales.csv"},
            "sparkUrl": {"type": "string", "default": "sc://spark-connect:15002"},
            "appName": {"type": "string", "default": "motia-sales-analyzer"},
        },
        "required": ["csvPath"],
    },
    "flows": ["spark-analysis"],
}

# Define sales analysis queries and insights
SALES_ANALYSES = {
    "revenue_by_region": {
        "query": """
            SELECT 
                region,
                COUNT(*) as total_sales,
                ROUND(SUM(total_amount), 2) as total_revenue,
                ROUND(AVG(total_amount), 2) as avg_sale_amount,
                MIN(total_amount) as min_sale,
                MAX(total_amount) as max_sale,
                COUNT(DISTINCT sales_rep_id) as unique_reps,
                COUNT(DISTINCT product_name) as unique_products
            FROM sales 
            GROUP BY region 
            ORDER BY total_revenue DESC
        """,
        "insights": [
            "Shows revenue performance across different regions",
            "Identifies top-performing geographic markets",
            "Reveals regional sales team effectiveness",
            "Compares product diversity by region",
        ],
    },
    "monthly_trends": {
        "query": """
            SELECT 
                DATE_FORMAT(order_date, 'yyyy-MM') as month,
                COUNT(*) as total_sales,
                ROUND(SUM(total_amount), 2) as total_revenue,
                ROUND(AVG(total_amount), 2) as avg_sale_amount,
                COUNT(DISTINCT product_name) as unique_products,
                COUNT(DISTINCT sales_rep_id) as active_reps,
                COUNT(DISTINCT region) as active_regions
            FROM sales 
            GROUP BY DATE_FORMAT(order_date, 'yyyy-MM')
            ORDER BY month
        """,
        "insights": [
            "Tracks monthly sales performance trends",
            "Identifies seasonal patterns in revenue",
            "Shows sales team activity over time",
            "Reveals product portfolio evolution",
        ],
    },
    "product_performance": {
        "query": """
            SELECT 
                product_name,
                COUNT(*) as total_sales,
                ROUND(SUM(total_amount), 2) as total_revenue,
                ROUND(AVG(total_amount), 2) as avg_price,
                COUNT(DISTINCT region) as regions_sold,
                COUNT(DISTINCT sales_rep_id) as reps_selling,
                ROUND(STDDEV(total_amount), 2) as price_variance,
                MIN(order_date) as first_sale_date,
                MAX(order_date) as last_sale_date
            FROM sales 
            GROUP BY product_name
            ORDER BY total_revenue DESC
        """,
        "insights": [
            "Ranks products by revenue performance",
            "Shows product market penetration",
            "Identifies price consistency across sales",
            "Reveals product lifecycle patterns",
        ],
    },
    "sales_rep_analysis": {
        "query": """
            SELECT 
                sales_rep_id,
                COUNT(*) as total_sales,
                ROUND(SUM(total_amount), 2) as total_revenue,
                ROUND(AVG(total_amount), 2) as avg_sale_amount,
                COUNT(DISTINCT product_name) as products_sold,
                COUNT(DISTINCT region) as regions_covered,
                MIN(order_date) as first_sale_date,
                MAX(order_date) as last_sale_date,
                DATEDIFF(MAX(order_date), MIN(order_date)) as active_days
            FROM sales 
            GROUP BY sales_rep_id
            ORDER BY total_revenue DESC
        """,
        "insights": [
            "Evaluates individual sales representative performance",
            "Shows portfolio diversity by rep",
            "Identifies top performers and activity periods",
            "Reveals geographic coverage patterns",
        ],
    },
}


async def handler(input_data, context):
    """
    Analyze sales data using PySpark with predefined business analytics queries

    Supports multiple analysis types:
    - Revenue analysis by region
    - Monthly sales trends
    - Product performance metrics
    - Sales representative analysis
    """
    start_time = time.time()

    # Extract input parameters
    analysis_type = input_data.get("analysisType", "revenue_by_region")
    csv_path = input_data.get("csvPath", "/datasets-examples/sales.csv")
    spark_url = input_data.get("sparkUrl", "sc://spark-connect:15002")
    app_name = input_data.get("appName", "motia-sales-analyzer")

    log_step_execution(
        context,
        "spark.sales.analyze",
        analysisType=analysis_type,
        csvPath=csv_path,
        sparkUrl=spark_url,
    )

    spark_util = None

    try:
        # Initialize Spark utility
        spark_util = SparkConnectUtil(spark_url=spark_url, app_name=app_name)

        # Load sales data
        context.logger.info("Loading sales data", {"csvPath": csv_path})
        df = spark_util.load_csv(csv_path)

        # Register as temporary view
        df.createOrReplaceTempView("sales")

        results = {}
        all_insights = []

        # Determine which analyses to run
        if analysis_type == "all":
            analyses_to_run = list(SALES_ANALYSES.keys())
        else:
            analyses_to_run = [analysis_type]

        # Execute selected analyses
        for analysis_name in analyses_to_run:
            if analysis_name in SALES_ANALYSES:
                context.logger.info(f"Running {analysis_name} analysis")

                analysis_config = SALES_ANALYSES[analysis_name]
                query = analysis_config["query"]
                insights = analysis_config["insights"]

                # Execute query
                query_start_time = time.time()
                result_df = spark_util.get_spark_session().sql(query)
                query_result = spark_util.df_to_dict(result_df)
                query_time = time.time() - query_start_time

                # Store result
                results[analysis_name] = {
                    "data": query_result["data"],
                    "schema": query_result["schema"],
                    "rowCount": query_result["rowCount"],
                    "executionTime": query_time,
                    "insights": insights,
                }

                all_insights.extend(insights)

        # Generate summary insights from data
        total_sales = df.count()
        total_revenue = df.agg({"total_amount": "sum"}).collect()[0][0]
        avg_sale = df.agg({"total_amount": "avg"}).collect()[0][0]
        unique_products = df.select("product_name").distinct().count()
        unique_regions = df.select("region").distinct().count()
        unique_reps = df.select("sales_rep_id").distinct().count()

        summary_insights = [
            f"Dataset contains {total_sales} sales transactions",
            f"Total revenue: ${total_revenue:,.2f}",
            f"Average sale amount: ${avg_sale:,.2f}",
            f"Portfolio includes {unique_products} products across {unique_regions} regions",
            f"Sales team consists of {unique_reps} representatives",
        ]

        execution_time = time.time() - start_time

        # Prepare response data
        response_data = {
            "analysisType": analysis_type,
            "results": results,
            "summary": {
                "totalSales": total_sales,
                "totalRevenue": round(total_revenue, 2),
                "avgSaleAmount": round(avg_sale, 2),
                "uniqueProducts": unique_products,
                "uniqueRegions": unique_regions,
                "uniqueReps": unique_reps,
            },
        }

        metadata = {
            "csvPath": csv_path,
            "analysisType": analysis_type,
            "analysesRun": analyses_to_run,
            "sparkUrl": spark_url,
            "appName": app_name,
        }

        # Create success response
        response = create_step_response(
            success=True,
            data=response_data,
            execution_time=execution_time,
            metadata=metadata,
        )

        response["insights"] = all_insights + summary_insights

        context.logger.info(
            "Sales analysis completed successfully",
            {
                "executionTime": execution_time,
                "analysesRun": len(analyses_to_run),
                "totalInsights": len(response["insights"]),
                "salesAnalyzed": total_sales,
                "totalRevenue": total_revenue,
            },
        )

        # Emit completion event (optional - only if we need to chain to other steps)
        # await context.emit({
        #     "topic": "spark.analysis.completed",
        #     "data": {
        #         "stepName": "spark.sales.analyze",
        #         "analysisType": analysis_type,
        #         "success": True,
        #         "executionTime": execution_time
        #     }
        # })

        return response

    except Exception as e:
        execution_time = time.time() - start_time
        error_response = handle_step_error(context, "spark.sales.analyze", e)
        error_response["executionTime"] = execution_time
        error_response["insights"] = []

        # Emit error event (optional - only if we need to chain to other steps)
        # await context.emit({
        #     "topic": "spark.analysis.completed",
        #     "data": {
        #         "stepName": "spark.sales.analyze",
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
