import json
import time
from spark_utils import SparkConnectUtil, create_step_response, log_step_execution, handle_step_error

config = {
    "type": "event",
    "name": "spark.employees.analyze",
    "description": "Analyze employee data using PySpark with configurable analysis types",
    "subscribes": ["spark.employees.analyze"],
    "emits": ["spark.analysis.completed"],
    "input": {
        "type": "object",
        "properties": {
            "analysisType": {
                "type": "string",
                "enum": ["salary_by_department", "experience_distribution", "department_summary", "salary_statistics", "all"],
                "default": "salary_by_department"
            },
            "csvPath": {"type": "string", "default": "/datasets-examples/employees.csv"},
            "sparkUrl": {"type": "string", "default": "sc://spark-connect:15002"},
            "appName": {"type": "string", "default": "motia-employee-analyzer"}
        },
        "required": ["csvPath"]
    },
    "flows": ["spark-analysis"]
}

# Define analysis queries and insights
EMPLOYEE_ANALYSES = {
    "salary_by_department": {
        "query": """
            SELECT 
                department,
                COUNT(*) as employee_count,
                ROUND(AVG(salary), 2) as avg_salary,
                MIN(salary) as min_salary,
                MAX(salary) as max_salary,
                ROUND(STDDEV(salary), 2) as salary_stddev,
                PERCENTILE_APPROX(salary, 0.5) as median_salary
            FROM employees 
            GROUP BY department 
            ORDER BY avg_salary DESC
        """,
        "insights": [
            "Shows salary distribution across departments",
            "Identifies departments with highest compensation",
            "Reveals salary variance within departments",
            "Compares median vs average salaries by department"
        ]
    },
    
    "experience_distribution": {
        "query": """
            SELECT 
                department,
                CASE 
                    WHEN years_experience <= 2 THEN 'Junior (0-2 years)'
                    WHEN years_experience <= 5 THEN 'Mid-level (3-5 years)'
                    WHEN years_experience <= 10 THEN 'Senior (6-10 years)'
                    ELSE 'Expert (10+ years)'
                END as experience_level,
                COUNT(*) as employee_count,
                ROUND(AVG(salary), 2) as avg_salary,
                ROUND(AVG(years_experience), 1) as avg_years_experience
            FROM employees 
            GROUP BY department, experience_level
            ORDER BY department, avg_salary DESC
        """,
        "insights": [
            "Categorizes employees by experience level",
            "Shows salary progression with experience",
            "Identifies experience distribution by department",
            "Reveals compensation patterns across seniority levels"
        ]
    },
    
    "department_summary": {
        "query": """
            SELECT 
                department,
                COUNT(*) as total_employees,
                ROUND(AVG(years_experience), 1) as avg_experience,
                ROUND(AVG(salary), 2) as avg_salary,
                COUNT(CASE WHEN years_experience <= 2 THEN 1 END) as junior_count,
                COUNT(CASE WHEN years_experience > 10 THEN 1 END) as senior_count,
                ROUND(
                    COUNT(CASE WHEN years_experience <= 2 THEN 1 END) * 100.0 / COUNT(*), 1
                ) as junior_percentage
            FROM employees 
            GROUP BY department
            ORDER BY total_employees DESC
        """,
        "insights": [
            "Comprehensive departmental overview",
            "Shows team size and experience composition",
            "Compares departments by key metrics",
            "Identifies departments with junior vs senior talent"
        ]
    },
    
    "salary_statistics": {
        "query": """
            SELECT 
                'Overall' as category,
                COUNT(*) as employee_count,
                ROUND(AVG(salary), 2) as mean_salary,
                PERCENTILE_APPROX(salary, 0.5) as median_salary,
                MIN(salary) as min_salary,
                MAX(salary) as max_salary,
                ROUND(STDDEV(salary), 2) as salary_stddev,
                PERCENTILE_APPROX(salary, 0.25) as q1_salary,
                PERCENTILE_APPROX(salary, 0.75) as q3_salary
            FROM employees
            
            UNION ALL
            
            SELECT 
                department as category,
                COUNT(*) as employee_count,
                ROUND(AVG(salary), 2) as mean_salary,
                PERCENTILE_APPROX(salary, 0.5) as median_salary,
                MIN(salary) as min_salary,
                MAX(salary) as max_salary,
                ROUND(STDDEV(salary), 2) as salary_stddev,
                PERCENTILE_APPROX(salary, 0.25) as q1_salary,
                PERCENTILE_APPROX(salary, 0.75) as q3_salary
            FROM employees
            GROUP BY department
            ORDER BY mean_salary DESC
        """,
        "insights": [
            "Detailed salary statistics across the organization",
            "Compares median vs mean salary by department",
            "Shows salary quartiles and distribution",
            "Identifies potential salary inequities"
        ]
    }
}


async def handler(input_data, context):
    """
    Analyze employee data using PySpark with predefined HR analytics queries
    
    Supports multiple analysis types:
    - Salary analysis by department
    - Experience level distribution  
    - Department summaries
    - Comprehensive salary statistics
    """
    start_time = time.time()
    
    # Extract input parameters
    analysis_type = input_data.get("analysisType", "salary_by_department")
    csv_path = input_data.get("csvPath", "/datasets-examples/employees.csv")
    spark_url = input_data.get("sparkUrl", "sc://spark-connect:15002")
    app_name = input_data.get("appName", "motia-employee-analyzer")
    
    log_step_execution(context, "spark.employees.analyze",
                      analysisType=analysis_type,
                      csvPath=csv_path,
                      sparkUrl=spark_url)
    
    spark_util = None
    
    try:
        # Initialize Spark utility
        spark_util = SparkConnectUtil(spark_url=spark_url, app_name=app_name)
        
        # Load employee data
        context.logger.info("Loading employee data", {"csvPath": csv_path})
        df = spark_util.load_csv(csv_path)
        
        # Register as temporary view
        df.createOrReplaceTempView("employees")
        
        results = {}
        all_insights = []
        
        # Determine which analyses to run
        if analysis_type == "all":
            analyses_to_run = list(EMPLOYEE_ANALYSES.keys())
        else:
            analyses_to_run = [analysis_type]
        
        # Execute selected analyses
        for analysis_name in analyses_to_run:
            if analysis_name in EMPLOYEE_ANALYSES:
                context.logger.info(f"Running {analysis_name} analysis")
                
                analysis_config = EMPLOYEE_ANALYSES[analysis_name]
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
                    "insights": insights
                }
                
                all_insights.extend(insights)
        
        # Generate summary insights
        employee_count = df.count()
        department_count = df.select("department").distinct().count()
        avg_salary = df.agg({"salary": "avg"}).collect()[0][0]
        
        summary_insights = [
            f"Dataset contains {employee_count} employees across {department_count} departments",
            f"Overall average salary is ${avg_salary:,.2f}",
            f"Analysis completed in {time.time() - start_time:.2f} seconds"
        ]
        
        execution_time = time.time() - start_time
        
        # Prepare response data
        response_data = {
            "analysisType": analysis_type,
            "results": results,
            "summary": {
                "totalEmployees": employee_count,
                "totalDepartments": department_count,
                "overallAvgSalary": round(avg_salary, 2)
            }
        }
        
        metadata = {
            "csvPath": csv_path,
            "analysisType": analysis_type,
            "analysesRun": analyses_to_run,
            "sparkUrl": spark_url,
            "appName": app_name
        }
        
        # Create success response
        response = create_step_response(
            success=True,
            data=response_data,
            execution_time=execution_time,
            metadata=metadata
        )
        
        response["insights"] = all_insights + summary_insights
        
        context.logger.info("Employee analysis completed successfully", {
            "executionTime": execution_time,
            "analysesRun": len(analyses_to_run),
            "totalInsights": len(response["insights"]),
            "employeesAnalyzed": employee_count
        })
        
        # Emit completion event (optional - only if we need to chain to other steps)
        # await context.emit({
        #     "topic": "spark.analysis.completed",
        #     "data": {
        #         "stepName": "spark.employees.analyze",
        #         "analysisType": analysis_type,
        #         "success": True,
        #         "executionTime": execution_time
        #     }
        # })
        
        return response
        
    except Exception as e:
        execution_time = time.time() - start_time
        error_response = handle_step_error(context, "spark.employees.analyze", e)
        error_response["executionTime"] = execution_time
        error_response["insights"] = []
        
        # Emit error event (optional - only if we need to chain to other steps)
        # await context.emit({
        #     "topic": "spark.analysis.completed", 
        #     "data": {
        #         "stepName": "spark.employees.analyze",
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
                context.logger.warn("Error during Spark session cleanup", 
                                   {"error": str(cleanup_error)})