# Spark Connect Utilities for Python Steps
# Common functions and configurations for PySpark-based Motia steps

import json
import time
import logging
import math
from typing import Dict, List, Any, Optional, Union
from pyspark.sql import SparkSession, DataFrame
from pyspark.sql.functions import col, min, max, avg, stddev
from pyspark.sql.types import IntegerType, DoubleType, FloatType, LongType


def sanitize_for_json(value):
    """Convert problematic values (NaN, Infinity) to JSON-safe values"""
    if isinstance(value, float):
        if math.isnan(value):
            return None
        elif math.isinf(value):
            return None
    return value


def sanitize_dict_for_json(data):
    """Recursively sanitize dictionary for JSON serialization"""
    if isinstance(data, dict):
        return {k: sanitize_dict_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_dict_for_json(item) for item in data]
    else:
        return sanitize_for_json(data)


class SparkConnectUtil:
    """Utility class for Spark Connect operations in Motia steps"""

    def __init__(
        self,
        spark_url: str = "sc://spark-connect:15002",
        app_name: str = "motia-spark-step",
    ):
        self.spark_url = spark_url
        self.app_name = app_name
        self.spark = None

    def get_spark_session(self) -> SparkSession:
        """Get or create Spark session"""
        if self.spark is None:
            self.spark = (
                SparkSession.builder.appName(self.app_name)
                .remote(self.spark_url)
                .getOrCreate()
            )
        return self.spark

    def stop_spark_session(self):
        """Stop the Spark session"""
        if self.spark:
            try:
                self.spark.stop()
                self.spark = None
            except Exception as e:
                # In Spark Connect, stopping might not always work cleanly
                # Just set to None to create a new session next time
                self.spark = None

    def load_csv(
        self,
        csv_path: str,
        header: bool = True,
        infer_schema: bool = True,
        delimiter: str = ",",
    ) -> DataFrame:
        """
        Load CSV file into Spark DataFrame
        
        Supports:
        - Local paths: /path/to/file.csv
        - S3A paths: s3a://bucket/path/to/file.csv (for MinIO/S3)
        - HDFS paths: hdfs://path/to/file.csv
        
        For S3A paths, ensure Spark is configured with S3A credentials.
        """
        spark = self.get_spark_session()

        # Validate and log path type
        if csv_path.startswith("s3a://"):
            # S3A path - validate format
            path_parts = csv_path.split("/")
            if len(path_parts) < 4:
                raise ValueError(
                    f"Invalid S3A path format: {csv_path}. Expected format: s3a://bucket/key/path/to/file.csv"
                )
            bucket = csv_path.split("/")[2]
            key = "/".join(csv_path.split("/")[3:])
            logging.info(
                f"Loading CSV from S3A: bucket={bucket}, key={key[:100]}..."
                if len(key) > 100
                else f"Loading CSV from S3A: bucket={bucket}, key={key}"
            )
        elif csv_path.startswith("s3://"):
            # Convert s3:// to s3a:// for compatibility
            csv_path = csv_path.replace("s3://", "s3a://", 1)
            logging.warning(
                f"Converted s3:// to s3a:// path: {csv_path}"
            )
        else:
            logging.info(f"Loading CSV from local path: {csv_path}")

        try:
            df = (
                spark.read.option("header", str(header).lower())
                .option("inferSchema", str(infer_schema).lower())
                .option("delimiter", delimiter)
                .csv(csv_path)
            )
            
            # Log successful load
            if csv_path.startswith("s3a://"):
                logging.info(f"Successfully loaded CSV from S3A: {csv_path}")
            else:
                logging.info(f"Successfully loaded CSV from local path: {csv_path}")
            
            return df
        except Exception as e:
            error_msg = str(e)
            if "s3a" in csv_path.lower() or "s3" in csv_path.lower():
                raise Exception(
                    f"Failed to load CSV from S3A path {csv_path}. "
                    f"Ensure: 1) Spark is configured with S3A credentials, "
                    f"2) The file exists in MinIO/S3, 3) The path is correct. "
                    f"Original error: {error_msg}"
                )
            else:
                raise Exception(
                    f"Failed to load CSV from {csv_path}. "
                    f"Ensure the file exists and is accessible. "
                    f"Original error: {error_msg}"
                )

    def df_to_dict(self, df: DataFrame, max_rows: int = 1000) -> Dict[str, Any]:
        """Convert Spark DataFrame to dictionary for JSON serialization"""
        # Get schema info
        schema = [
            {"name": field.name, "type": str(field.dataType)}
            for field in df.schema.fields
        ]

        # Get data (limit to max_rows)
        data = df.limit(max_rows).toPandas().to_dict("records")

        # Sanitize data for JSON serialization
        data = sanitize_dict_for_json(data)

        # Get row count (full dataset)
        row_count = df.count()

        return {
            "data": data,
            "schema": schema,
            "rowCount": row_count,
            "limitedTo": max_rows if row_count > max_rows else row_count,
        }

    def profile_dataframe(self, df: DataFrame) -> Dict[str, Any]:
        """Generate comprehensive data profile for DataFrame"""
        start_time = time.time()

        # Basic info
        row_count = df.count()
        column_count = len(df.columns)

        # Column analysis
        columns_info = []
        for field in df.schema.fields:
            col_name = field.name
            col_type = str(field.dataType)

            # Basic stats
            null_count = df.filter(col(col_name).isNull()).count()
            unique_count = df.select(col_name).distinct().count()

            # Get sample values
            samples = [row[0] for row in df.select(col_name).limit(5).collect()]

            col_info = {
                "name": col_name,
                "type": col_type,
                "nullCount": null_count,
                "uniqueCount": unique_count,
                "samples": [str(s) if s is not None else None for s in samples],
            }

            # Numeric statistics
            if isinstance(
                field.dataType, (IntegerType, DoubleType, FloatType, LongType)
            ):
                try:
                    stats = df.select(
                        min(col_name).alias("min"),
                        max(col_name).alias("max"),
                        avg(col_name).alias("mean"),
                        stddev(col_name).alias("stddev"),
                    ).collect()[0]

                    col_info.update(
                        {
                            "min": sanitize_for_json(
                                float(stats["min"])
                                if stats["min"] is not None
                                else None
                            ),
                            "max": sanitize_for_json(
                                float(stats["max"])
                                if stats["max"] is not None
                                else None
                            ),
                            "mean": sanitize_for_json(
                                float(stats["mean"])
                                if stats["mean"] is not None
                                else None
                            ),
                            "stddev": sanitize_for_json(
                                float(stats["stddev"])
                                if stats["stddev"] is not None
                                else None
                            ),
                        }
                    )
                except Exception as e:
                    col_info["numericStatsError"] = str(e)

            columns_info.append(col_info)

        processing_time = time.time() - start_time

        return {
            "columnCount": column_count,
            "rowCount": row_count,
            "columns": columns_info,
            "processingTime": processing_time,
            "timestamp": time.time(),
        }

    def execute_sql_query(
        self, df: DataFrame, query: str, table_name: str = "data"
    ) -> DataFrame:
        """Execute SQL query on DataFrame"""
        spark = self.get_spark_session()

        # Register DataFrame as temporary view
        df.createOrReplaceTempView(table_name)

        # Execute query
        return spark.sql(query)


def create_step_response(
    success: bool,
    data: Any = None,
    execution_time: float = 0,
    error: str = None,
    metadata: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """Create standardized response for Motia steps"""
    response = {
        "success": success,
        "data": sanitize_dict_for_json(data) if data is not None else None,
        "executionTime": execution_time,
        "error": error,
        "metadata": sanitize_dict_for_json(metadata or {}),
        "timestamp": time.time(),
    }
    return response


def log_step_execution(context, step_name: str, **kwargs):
    """Standardized logging for step execution"""
    context.logger.info(f"Executing {step_name}", kwargs)


def handle_step_error(context, step_name: str, error: Exception) -> Dict[str, Any]:
    """Standardized error handling for steps"""
    error_msg = str(error)
    context.logger.error(f"Error in {step_name}: {error_msg}", {"error": error_msg})

    return create_step_response(success=False, error=error_msg)
