#!/usr/bin/env python3
"""
Motiflow Spark Connect CSV Test Script
Tests loading and analyzing CSV files through mounted volume
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, sum as spark_sum, count, desc
import sys

def create_spark_session():
    """Create Spark Connect session"""
    try:
        spark = SparkSession.builder \
            .remote("sc://localhost:15002") \
            .appName("MotiflowCSVTest") \
            .getOrCreate()
        print("✅ Spark Connect session created successfully!")
        print(f" Spark Version: {spark.version}")
        return spark
    except Exception as e:
        print(f"❌ Failed to create Spark session: {e}")
        sys.exit(1)

def load_csv_datasets(spark):
    """Load CSV datasets from mounted volume"""
    print("\n📁 Loading CSV datasets from mounted volume...")
    
    # Base path for CSVs inside the container
    base_path = "/opt/spark/examples/"
    
    datasets = {}
    
    try:
        # Load employees.csv
        print("👥 Loading employees.csv...")
        datasets['employees'] = spark.read.csv(
            f"{base_path}employees.csv", 
            header=True, 
            inferSchema=True
        )
        
        # Load sales.csv
        print("💼 Loading sales.csv...")
        datasets['sales'] = spark.read.csv(
            f"{base_path}sales.csv", 
            header=True, 
            inferSchema=True
        )
        
        # Load metrics.csv
        print("📊 Loading metrics.csv...")
        datasets['metrics'] = spark.read.csv(
            f"{base_path}metrics.csv", 
            header=True, 
            inferSchema=True
        )
        
        # Load projects.csv
        print("🚀 Loading projects.csv...")
        datasets['projects'] = spark.read.csv(
            f"{base_path}projects.csv", 
            header=True, 
            inferSchema=True
        )
        
        # Load customer_reviews.csv
        print("⭐ Loading customer_reviews.csv...")
        datasets['reviews'] = spark.read.csv(
            f"{base_path}customer_reviews.csv", 
            header=True, 
            inferSchema=True
        )
        
        # Load website_analytics.csv
        print("🌐 Loading website_analytics.csv...")
        datasets['analytics'] = spark.read.csv(
            f"{base_path}website_analytics.csv", 
            header=True, 
            inferSchema=True
        )
        
        print("✅ All CSV datasets loaded successfully!")
        return datasets
        
    except Exception as e:
        print(f"❌ Error loading CSV datasets: {e}")
        return None

def show_dataset_info(datasets):
    """Show basic information about loaded datasets"""
    print("\n📋 Dataset Information:")
    print("=" * 60)
    
    for name, df in datasets.items():
        print(f"\n📄 {name.upper()}:")
        print(f"   📊 Rows: {df.count()}")
        print(f"   📋 Columns: {len(df.columns)}")
        print(f"   🏷️  Schema: {', '.join(df.columns)}")

def analyze_employees(df):
    """Analyze employee data"""
    print("\n👥 EMPLOYEE ANALYSIS")
    print("=" * 50)
    
    print("💰 Average salary by department:")
    df.groupBy("department") \
      .agg(avg("salary").alias("avg_salary"), 
           count("*").alias("employee_count")) \
      .orderBy(desc("avg_salary")) \
      .show()
    
    print("🌟 Top performers (performance_score > 8.5):")
    df.filter(col("performance_score") > 8.5) \
      .select("name", "department", "position", "performance_score", "salary") \
      .orderBy(desc("performance_score")) \
      .show()

def analyze_sales(df):
    """Analyze sales data"""
    print("\n💼 SALES ANALYSIS")
    print("=" * 50)
    
    print("🌍 Revenue by region:")
    df.groupBy("region") \
      .agg(spark_sum("total_amount").alias("total_revenue"),
           count("*").alias("order_count")) \
      .orderBy(desc("total_revenue")) \
      .show()
    
    print("📦 Top product categories:")
    df.groupBy("product_category") \
      .agg(spark_sum("total_amount").alias("total_revenue"),
           spark_sum("quantity").alias("total_quantity")) \
      .orderBy(desc("total_revenue")) \
      .show()

def analyze_projects(df):
    """Analyze project data"""
    print("\n🚀 PROJECT ANALYSIS")
    print("=" * 50)
    
    print("💰 Budget vs Actual Cost:")
    df.select("project_name", "budget", "actual_cost", 
              "completion_percentage", "status") \
      .withColumn("budget_utilization", 
                  (col("actual_cost") / col("budget") * 100)) \
      .orderBy(desc("budget")) \
      .show(truncate=False)
    
    print("📊 Projects by status:")
    df.groupBy("status").count().orderBy(desc("count")).show()

def analyze_reviews(df):
    """Analyze review data"""
    print("\n⭐ REVIEW ANALYSIS")
    print("=" * 50)
    
    print("📊 Average rating by product:")
    df.groupBy("product_name") \
      .agg(avg("rating").alias("avg_rating"),
           count("*").alias("review_count")) \
      .orderBy(desc("avg_rating")) \
      .show(truncate=False)
    
    print("👍 Most helpful reviews:")
    df.select("product_name", "rating", "helpful_votes") \
      .orderBy(desc("helpful_votes")) \
      .show(5)

def run_cross_dataset_analysis(datasets):
    """Run analysis across multiple datasets"""
    print("\n🔗 CROSS-DATASET ANALYSIS")
    print("=" * 50)
    
    # Projects by department budget
    projects = datasets['projects']
    employees = datasets['employees']
    
    print("🏢 Department project budgets:")
    projects.groupBy("department") \
            .agg(spark_sum("budget").alias("total_budget"),
                 count("*").alias("project_count")) \
            .orderBy(desc("total_budget")) \
            .show()

def main():
    """Main execution function"""
    print("🚀 MOTIFLOW SPARK CONNECT CSV TEST")
    print("=" * 60)
    
    # Create Spark session
    spark = create_spark_session()
    
    try:
        # Load all CSV datasets
        datasets = load_csv_datasets(spark)
        
        if not datasets:
            print("❌ Failed to load datasets")
            return 1
        
        # Show dataset information
        show_dataset_info(datasets)
        
        # Run individual analyses
        analyze_employees(datasets['employees'])
        analyze_sales(datasets['sales'])
        analyze_projects(datasets['projects'])
        analyze_reviews(datasets['reviews'])
        
        # Cross-dataset analysis
        run_cross_dataset_analysis(datasets)
        
        print("\n🎉 ALL ANALYSES COMPLETED SUCCESSFULLY!")
        print("✅ Spark Connect + CSV files working perfectly!")
        print("📊 Motiflow data analytics ready for production!")
        
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    finally:
        # Clean up
        spark.stop()
        print("🔌 Spark session stopped")
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)