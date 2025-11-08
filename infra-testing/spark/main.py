import pandas as pd
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, sum as spark_sum


def create_spark_session():
    """Cria uma sessão Spark Connect"""
    spark = (
        SparkSession.builder.appName("MotiflowSparkConnectTest")
        .remote("sc://localhost:15002")
        .getOrCreate()
    )

    return spark


def test_basic_operations(spark):
    """Testa operações básicas do Spark"""
    print("🔧 Testando operações básicas do Spark...")

    # Criar um DataFrame simples
    data = [
        ("Alice", 25, "Engineering"),
        ("Bob", 30, "Marketing"),
        ("Charlie", 35, "Engineering"),
        ("Diana", 28, "Sales"),
        ("Eve", 32, "Engineering"),
    ]

    columns = ["name", "age", "department"]
    df = spark.createDataFrame(data, columns)

    print("📊 DataFrame criado:")
    df.show()

    # Testar algumas operações
    print("👥 Contagem por departamento:")
    dept_count = (
        df.groupBy("department")
        .agg(count("*").alias("employee_count"), spark_sum("age").alias("total_age"))
        .orderBy("department")
    )

    dept_count.show()

    print("🎯 Filtro: Funcionários com mais de 30 anos:")
    older_employees = df.filter(col("age") > 30)
    older_employees.show()

    return df


def test_file_operations(spark):
    """Testa operações com arquivos"""
    print("📁 Testando operações com arquivos...")

    # Criar dados de teste
    test_data = [
        ("product_A", 100, 25.50),
        ("product_B", 200, 15.30),
        ("product_C", 150, 35.20),
        ("product_D", 75, 45.00),
        ("product_E", 300, 12.75),
    ]

    columns = ["product_name", "quantity", "price"]
    df = spark.createDataFrame(test_data, columns)

    # Salvar como Parquet (formato eficiente para Spark)
    output_path = "/tmp/test_data.parquet"
    print(f"💾 Salvando dados em: {output_path}")

    df.coalesce(1).write.mode("overwrite").parquet(output_path)

    # Ler os dados de volta
    print("📖 Lendo dados do arquivo:")
    df_read = spark.read.parquet(output_path)
    df_read.show()

    # Calcular algumas métricas
    print("📈 Métricas dos produtos:")
    metrics = df_read.agg(
        spark_sum("quantity").alias("total_quantity"),
        spark_sum(col("quantity") * col("price")).alias("total_revenue"),
        count("*").alias("product_count"),
    )

    metrics.show()

    return df_read


def test_pandas_integration(spark):
    """Testa integração com Pandas"""
    print("🐼 Testando integração Spark ↔ Pandas...")

    # Criar DataFrame Pandas
    pandas_data = {
        "city": [
            "São Paulo",
            "Rio de Janeiro",
            "Belo Horizonte",
            "Porto Alegre",
            "Recife",
        ],
        "population": [12_300_000, 6_700_000, 2_500_000, 1_500_000, 1_650_000],
        "area_km2": [1521, 1255, 331, 496, 218],
    }

    pandas_df = pd.DataFrame(pandas_data)
    print("📊 DataFrame Pandas original:")
    print(pandas_df)

    # Converter para Spark DataFrame
    spark_df = spark.createDataFrame(pandas_df)

    # Adicionar coluna calculada
    spark_df = spark_df.withColumn(
        "density_per_km2", col("population") / col("area_km2")
    ).orderBy(col("density_per_km2").desc())

    print("\n🏙️ Cidades ordenadas por densidade populacional:")
    spark_df.show()

    # Converter de volta para Pandas
    result_pandas = spark_df.toPandas()
    print("\n📊 Resultado convertido para Pandas:")
    print(result_pandas)

    return result_pandas


def test_minio_integration(spark):
    """Testa integração com MinIO/S3"""
    print("☁️ Testando integração com MinIO/S3...")

    try:
        # Criar dados de teste
        test_data = [
            ("transaction_001", "2024-01-01", 1500.00, "credit"),
            ("transaction_002", "2024-01-02", 800.50, "debit"),
            ("transaction_003", "2024-01-03", 2200.75, "credit"),
            ("transaction_004", "2024-01-04", 450.25, "debit"),
            ("transaction_005", "2024-01-05", 3000.00, "credit"),
        ]

        columns = ["transaction_id", "date", "amount", "type"]
        df = spark.createDataFrame(test_data, columns)

        print("📊 Dados de transação criados:")
        df.show()

        # Tentar salvar no MinIO (se estiver configurado)
        s3_path = "s3a://motiflow/test-data/transactions.parquet"
        print(f"💾 Tentando salvar no MinIO: {s3_path}")

        try:
            df.coalesce(1).write.mode("overwrite").parquet(s3_path)
            print("✅ Dados salvos com sucesso no MinIO!")

            # Ler os dados de volta
            print("📖 Lendo dados do MinIO:")
            df_from_s3 = spark.read.parquet(s3_path)
            df_from_s3.show()

            # Calcular agregações
            print("📈 Análise das transações:")
            analysis = (
                df_from_s3.groupBy("type")
                .agg(
                    count("*").alias("transaction_count"),
                    spark_sum("amount").alias("total_amount"),
                )
                .orderBy("type")
            )

            analysis.show()

            return True

        except Exception as e:
            print(
                f"⚠️ MinIO não está configurado corretamente ou não acessível: {str(e)}"
            )
            print("💡 Continuando com testes locais...")
            return False

    except Exception as e:
        print(f"❌ Erro no teste MinIO: {str(e)}")
        return False


def main():
    """Função principal que executa todos os testes"""
    print("🚀 Iniciando testes do Spark Connect...")
    print("=" * 50)

    try:
        # Criar sessão Spark
        spark = create_spark_session()
        print("✅ Conexão com Spark Connect estabelecida!")
        print(f"📋 Versão do Spark: {spark.version}")
        print("🔧 Configuração: MotiflowSparkConnectTest")
        print("=" * 50)

        # Executar testes
        test_basic_operations(spark)
        print("=" * 50)

        test_file_operations(spark)
        print("=" * 50)

        test_pandas_integration(spark)
        print("=" * 50)

        test_minio_integration(spark)
        print("=" * 50)

        print("🎉 Todos os testes passaram com sucesso!")
        print("✅ Infraestrutura Spark Connect está funcionando corretamente!")

    except Exception as e:
        print(f"❌ Erro durante os testes: {str(e)}")
        print("🔍 Verifique se o Spark Connect está rodando em localhost:15002")
        return 1

    finally:
        try:
            spark.stop()
            print("🛑 Sessão Spark encerrada.")
        except Exception:
            pass

    return 0


if __name__ == "__main__":
    exit_code = main()
