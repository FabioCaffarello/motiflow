# 📊 Motiflow Example Datasets

This directory contains realistic sample datasets for testing and demonstrating Motiflow's capabilities with Spark Connect and data analytics.

## 📁 Available Datasets

### 👥 `employees.csv`

- **20 records** of employee data
- **Fields**: employee_id, name, department, position, salary, hire_date, age, city, country, performance_score, projects_completed, team_size
- **Use Cases**: HR analytics, salary analysis, performance tracking, team size optimization

### 💼 `sales.csv`  

- **20 sales transactions** with customer and product details
- **Fields**: order_id, customer_id, customer_name, product_category, product_name, quantity, unit_price, total_amount, order_date, ship_date, status, payment_method, region, sales_rep_id
- **Use Cases**: Sales performance, revenue analysis, regional trends, product popularity

### 📈 `metrics.csv`

- **20 business metrics** across different departments
- **Fields**: metric_id, date, department, metric_name, metric_value, target_value, variance_percent, notes
- **Use Cases**: KPI tracking, department performance, goal achievement analysis

### 🚀 `projects.csv`

- **15 company projects** with timeline and budget data
- **Fields**: project_id, project_name, department, start_date, end_date, status, budget, actual_cost, team_lead_id, team_members, priority, completion_percentage
- **Use Cases**: Project management, budget analysis, resource allocation, timeline tracking

### ⭐ `customer_reviews.csv` (Customer Reviews)

- **15 product reviews** with ratings and text analysis
- **Fields**: review_id, customer_name, product_name, rating, review_text, review_date, verified_purchase, helpful_votes
- **Use Cases**: Sentiment analysis, product feedback, customer satisfaction, text processing

### 🌐 `website_analytics.csv`

- **20 user interaction events** from website analytics
- **Fields**: event_id, user_id, session_id, event_type, page_url, timestamp, device_type, browser, country, duration_seconds  
- **Use Cases**: User behavior analysis, conversion tracking, geographic insights, device/browser trends

## 🧪 Testing with Spark Connect

### Quick Start

```bash
# Start Spark Connect infrastructure
make start-infra

# Test with sample data
make test-spark-infra

# Interactive PySpark session
make pyspark
```

### Example Spark Queries

#### Employee Analysis

```python
# Load employee data
df_employees = spark.read.csv("examples/employees.csv", header=True, inferSchema=True)

# Average salary by department
df_employees.groupBy("department").avg("salary").show()

# Top performers by department
df_employees.filter("performance_score > 8.5").select("name", "department", "performance_score").show()
```

#### Sales Analysis  

```python
# Load sales data
df_sales = spark.read.csv("examples/sales.csv", header=True, inferSchema=True)

# Revenue by region
df_sales.groupBy("region").sum("total_amount").show()

# Monthly sales trend
df_sales.withColumn("month", month("order_date")).groupBy("month").sum("total_amount").show()
```

#### Cross-Dataset Joins

```python
# Join employees and projects
df_employees = spark.read.csv("examples/employees.csv", header=True, inferSchema=True)
df_projects = spark.read.csv("examples/projects.csv", header=True, inferSchema=True)

# Find project leaders and their details
df_projects.join(df_employees, df_projects.team_lead_id == df_employees.employee_id) \
           .select("project_name", "name", "department", "budget", "completion_percentage") \
           .show()
```

## 🔄 Data Upload to MinIO

You can upload these datasets to MinIO for persistent storage and Spark processing:

```bash
# Access MinIO console
make open-minio

# Or use the web interface to upload files
# Navigate to http://localhost:4000 and use the file upload feature
```

## 📊 Analytics Ideas

### Business Intelligence Queries

- **Department Performance**: Compare metrics across Engineering, Sales, Marketing
- **Project ROI**: Analyze budget vs actual costs and completion rates  
- **Customer Insights**: Review sentiment analysis and purchase patterns
- **Operational Metrics**: Track KPIs and variance from targets

### Machine Learning Opportunities

- **Salary Prediction**: Based on department, experience, performance
- **Sales Forecasting**: Using historical sales and seasonal patterns
- **Customer Segmentation**: Based on purchase behavior and reviews
- **Project Success Prediction**: Using team size, budget, and timeline data

### Real-time Analytics

- **Website Traffic**: User behavior and conversion funnels
- **Performance Dashboards**: Live metrics tracking and alerting
- **Resource Utilization**: Team allocation and project workloads

## 🚀 Getting Started

1. **Start Infrastructure**: `make start-infra`
2. **Upload Data**: Use the web interface or MinIO console
3. **Run Analytics**: Use PySpark shell with `make pyspark`
4. **Visualize Results**: Process data and export results

Happy analyzing! 🎉
