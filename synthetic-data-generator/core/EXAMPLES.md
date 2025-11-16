# Exemplos de Uso - Synthetic Data Generator

Este documento fornece exemplos práticos de como usar o `synthetic-data-generator`.

## 📋 Índice

1. [Criando Schemas com Builders](#criando-schemas-com-builders)
2. [Geração de Dados](#geração-de-dados)
3. [Validação de Dados](#validação-de-dados)
4. [Análise de Qualidade](#análise-de-qualidade)
5. [Exportação de Dados](#exportação-de-dados)

---

## 🏗️ Criando Schemas com Builders

### Exemplo Básico: Schema de Usuários

```rust
use synthetic_data_core::domain::*;

// Criar um schema simples usando builders
let schema = DataSchemaBuilder::new("users".to_string(), "1.0".to_string())
    .add_field(
        FieldDefinitionBuilder::new("id".to_string(), FieldType::Integer { min: None, max: None })
            .required(true)
            .add_constraint(FieldConstraint::Unique)
            .with_description("User unique identifier".to_string())
            .build()
    )
    .add_field(
        FieldDefinitionBuilder::new("name".to_string(), FieldType::String { 
            min_length: Some(1), 
            max_length: Some(100), 
            pattern: None 
        })
            .required(true)
            .with_description("User full name".to_string())
            .build()
    )
    .add_field(
        FieldDefinitionBuilder::new("email".to_string(), FieldType::String { 
            min_length: None, 
            max_length: None, 
            pattern: Some(StringPattern::Regex(r"^[^@]+@[^@]+\.[^@]+$".to_string()))
        })
            .required(true)
            .add_constraint(FieldConstraint::Unique)
            .with_description("User email address".to_string())
            .build()
    )
    .add_field(
        FieldDefinitionBuilder::new("age".to_string(), FieldType::Integer { 
            min: Some(18), 
            max: Some(100) 
        })
            .required(false)
            .with_description("User age".to_string())
            .build()
    )
    .with_metadata("author".to_string(), "synthetic-data-generator".to_string())
    .with_metadata("version".to_string(), "1.0".to_string())
    .build()?;
```

### Exemplo Avançado: Schema com Referências e Constraints

```rust
use synthetic_data_core::domain::*;

// Schema com referências entre campos e constraints complexas
let schema = DataSchemaBuilder::new("orders".to_string(), "1.0".to_string())
    .add_field(
        FieldDefinitionBuilder::new("order_id".to_string(), FieldType::Integer { min: Some(1), max: None })
            .required(true)
            .add_constraint(FieldConstraint::Unique)
            .with_default(DefaultStrategy::Counter { start: 1, step: 1 })
            .build()
    )
    .add_field(
        FieldDefinitionBuilder::new("customer_id".to_string(), FieldType::Integer { min: Some(1), max: None })
            .required(true)
            .build()
    )
    .add_field(
        FieldDefinitionBuilder::new("order_date".to_string(), FieldType::DateTime { 
            start: Some(chrono::Utc::now() - chrono::Duration::days(365)),
            end: Some(chrono::Utc::now()),
            format: None
        })
            .required(true)
            .with_default(DefaultStrategy::CurrentTimestamp)
            .build()
    )
    .add_field(
        FieldDefinitionBuilder::new("total_amount".to_string(), FieldType::Float { 
            min: Some(0.0), 
            max: Some(10000.0),
            precision: Some(2)
        })
            .required(true)
            .add_constraint(FieldConstraint::Range { min: Some(0.0), max: Some(10000.0) })
            .build()
    )
    .add_field(
        FieldDefinitionBuilder::new("status".to_string(), FieldType::String { 
            min_length: None, 
            max_length: None, 
            pattern: Some(StringPattern::Enum(vec![
                "pending".to_string(),
                "processing".to_string(),
                "shipped".to_string(),
                "delivered".to_string(),
                "cancelled".to_string()
            ]))
        })
            .required(true)
            .build()
    )
    .add_constraint(SchemaConstraint::Unique { 
        fields: vec!["order_id".to_string(), "customer_id".to_string()] 
    })
    .build()?;
```

### Exemplo: Schema com Tipos Complexos

```rust
use synthetic_data_core::domain::*;

// Schema com arrays e objetos aninhados
let schema = DataSchemaBuilder::new("products".to_string(), "1.0".to_string())
    .add_field(
        FieldDefinitionBuilder::new("product_id".to_string(), FieldType::Uuid { version: UuidVersion::Random })
            .required(true)
            .add_constraint(FieldConstraint::Unique)
            .build()
    )
    .add_field(
        FieldDefinitionBuilder::new("tags".to_string(), FieldType::Array {
            element_type: Box::new(FieldType::String { 
                min_length: Some(1), 
                max_length: Some(50), 
                pattern: None 
            }),
            min_length: Some(0),
            max_length: Some(10)
        })
            .required(false)
            .build()
    )
    .add_field(
        FieldDefinitionBuilder::new("metadata".to_string(), FieldType::Object {
            fields: vec![
                ObjectField {
                    name: "category".to_string(),
                    field_type: FieldType::String { min_length: None, max_length: None, pattern: None },
                    required: true,
                },
                ObjectField {
                    name: "rating".to_string(),
                    field_type: FieldType::Float { min: Some(0.0), max: Some(5.0), precision: Some(1) },
                    required: false,
                }
            ]
        })
            .required(false)
            .build()
    )
    .build()?;
```

---

## 🎲 Geração de Dados

### Exemplo Básico: Gerar Dataset Simples

```rust
use synthetic_data_core::*;
use std::sync::Arc;

// Assumindo que você tem implementações dos ports
// let repository = Arc::new(MemoryRepository::new());
// let generator = Arc::new(DefaultGenerator::new());
// let validator = Arc::new(DefaultValidator::new());
// let metrics = Arc::new(DefaultMetrics::new());

let config = GenerationConfig {
    max_memory_bytes: 1024 * 1024 * 1024, // 1GB
    worker_threads: 4,
    batch_size: 1000,
    enable_validation: true,
    random_seed: Some(42), // Para reprodutibilidade
    quality_thresholds: QualityThresholds {
        min_quality_score: 0.8,
        max_null_percentage: 0.1,
        min_type_consistency: 0.95,
        max_constraint_violations: 10,
    },
    export_settings: ExportSettings::default(),
};

let service = GenerationService::new(
    generator,
    repository.clone(),
    validator.clone(),
    metrics.clone(),
    config,
);

// Gerar 10.000 linhas
let dataset_id = service.generate_dataset(
    schema.id,
    10_000,
    Some("Generated Users Dataset".to_string())
).await?;

println!("Dataset gerado com ID: {}", dataset_id);
```

### Exemplo: Geração com Validação de Qualidade

```rust
// Gerar e validar qualidade automaticamente
let (dataset_id, quality_report) = service.generate_validated_dataset(
    schema.id,
    5_000,
    Some("Validated Dataset".to_string())
).await?;

println!("Dataset ID: {}", dataset_id);
println!("Quality Score: {:.2}", quality_report.overall_score);
println!("Total Rows: {}", quality_report.total_rows);
println!("Violations: {}", quality_report.constraint_violations.len());

// Verificar se qualidade atende requisitos
if quality_report.overall_score >= 0.9 {
    println!("✅ Qualidade excelente!");
} else if quality_report.overall_score >= 0.8 {
    println!("⚠️ Qualidade aceitável");
} else {
    println!("❌ Qualidade abaixo do esperado");
}
```

---

## ✅ Validação de Dados

### Exemplo: Validar Schema

```rust
use synthetic_data_core::*;

let schema_service = SchemaService::new(
    repository.clone(),
    validator.clone(),
);

// Validar schema antes de usar
let errors = schema_service.validate_schema(&schema).await?;

if errors.is_empty() {
    println!("✅ Schema válido!");
} else {
    println!("❌ Erros encontrados:");
    for error in errors {
        println!("  - {}", error);
    }
}
```

### Exemplo: Validar Dataset Completo

```rust
let quality_service = QualityService::new(
    validator.clone(),
    repository.clone(),
    metrics.clone(),
);

// Validar dataset existente
let validation_errors = quality_service.validate_dataset(dataset_id).await?;

if validation_errors.is_empty() {
    println!("✅ Dataset válido!");
} else {
    println!("❌ {} erros encontrados:", validation_errors.len());
    for error in validation_errors {
        println!("  - {}", error);
    }
}
```

---

## 📊 Análise de Qualidade

### Exemplo: Análise Completa de Qualidade

```rust
let quality_service = QualityService::new(
    validator.clone(),
    repository.clone(),
    metrics.clone(),
);

// Analisar qualidade do dataset
let report = quality_service.analyze_dataset(dataset_id).await?;

println!("📊 Relatório de Qualidade");
println!("  Score Geral: {:.2}%", report.overall_score * 100.0);
println!("  Total de Linhas: {}", report.total_rows);
println!("  Violações: {}", report.constraint_violations.len());

// Analisar cada campo
for (field_name, analysis) in &report.field_analyses {
    println!("\n  Campo: {}", field_name);
    println!("    Valores Nulos: {}", analysis.null_count);
    println!("    Valores Únicos: {}", analysis.unique_count);
    println!("    Consistência de Tipo: {:.2}%", analysis.type_consistency * 100.0);
    println!("    Conformidade com Constraints: {:.2}%", analysis.constraint_compliance * 100.0);
}

// Verificar violações específicas
if !report.constraint_violations.is_empty() {
    println!("\n  Violações de Constraints:");
    for violation in &report.constraint_violations {
        println!("    Linha {}: {} - {}", 
            violation.row_index, 
            violation.constraint_type, 
            violation.message
        );
    }
}
```

### Exemplo: Resumo Rápido de Qualidade

```rust
let summary = quality_service.get_quality_summary(dataset_id).await?;

println!("📈 Resumo de Qualidade");
println!("  Dataset ID: {}", summary.dataset_id);
println!("  Score: {:.2}%", summary.overall_score * 100.0);
println!("  Linhas: {}", summary.total_rows);
println!("  Violações: {}", summary.total_violations);
println!("  Campos: {}", summary.field_count);
println!("  Análise em: {}", summary.analysis_timestamp);
```

---

## 📤 Exportação de Dados

### Exemplo: Exportar para CSV

```rust
let export_service = ExportService::new(
    repository.clone(),
    exporter.clone(),
    metrics.clone(),
);

let result = export_service.export_dataset(
    dataset_id,
    "csv",
    "/path/to/output.csv"
).await?;

println!("✅ Exportação concluída!");
println!("  Formato: {}", result.format);
println!("  Arquivo: {}", result.output_path);
println!("  Tamanho: {} bytes", result.file_size_bytes);
println!("  Linhas: {}", result.rows_exported);
println!("  Tempo: {}ms", result.export_time_ms);
```

### Exemplo: Exportar para JSON

```rust
let result = export_service.export_dataset(
    dataset_id,
    "json",
    "/path/to/output.json"
).await?;

println!("✅ JSON exportado com sucesso!");
```

### Exemplo: Exportar Schema

```rust
export_service.export_schema(
    schema.id,
    "/path/to/schema.json"
).await?;

println!("✅ Schema exportado!");
```

### Exemplo: Verificar Formatos Suportados

```rust
let formats = export_service.supported_formats();
println!("Formatos suportados: {:?}", formats);
// Output: ["csv", "json", "parquet"]
```

---

## 🔄 Fluxo Completo: Do Schema à Exportação

```rust
use synthetic_data_core::*;
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<()> {
    // 1. Criar schema
    let schema = DataSchemaBuilder::new("users".to_string(), "1.0".to_string())
        .add_field(
            FieldDefinitionBuilder::new("id".to_string(), FieldType::Integer { min: None, max: None })
                .required(true)
                .add_constraint(FieldConstraint::Unique)
                .build()
        )
        .add_field(
            FieldDefinitionBuilder::new("name".to_string(), FieldType::String { 
                min_length: Some(1), 
                max_length: Some(100), 
                pattern: None 
            })
                .required(true)
                .build()
        )
        .build()?;
    
    // 2. Salvar schema
    let schema_service = SchemaService::new(repository.clone(), validator.clone());
    let schema_id = schema_service.create_schema(schema).await?;
    println!("✅ Schema criado: {}", schema_id);
    
    // 3. Gerar dados
    let gen_service = GenerationService::new(
        generator.clone(),
        repository.clone(),
        validator.clone(),
        metrics.clone(),
        GenerationConfig::default(),
    );
    
    let dataset_id = gen_service.generate_dataset(
        schema_id,
        1000,
        Some("My Dataset".to_string())
    ).await?;
    println!("✅ Dataset gerado: {}", dataset_id);
    
    // 4. Analisar qualidade
    let quality_service = QualityService::new(
        validator.clone(),
        repository.clone(),
        metrics.clone(),
    );
    
    let report = quality_service.analyze_dataset(dataset_id).await?;
    println!("✅ Qualidade: {:.2}%", report.overall_score * 100.0);
    
    // 5. Exportar
    let export_service = ExportService::new(
        repository.clone(),
        exporter.clone(),
        metrics.clone(),
    );
    
    let result = export_service.export_dataset(
        dataset_id,
        "csv",
        "output.csv"
    ).await?;
    println!("✅ Exportado: {} linhas em {}ms", result.rows_exported, result.export_time_ms);
    
    Ok(())
}
```

---

## 💡 Dicas e Boas Práticas

### 1. Use Builders para Schemas Complexos
Builders tornam a criação de schemas muito mais legível e menos propensa a erros.

### 2. Valide Schemas Antes de Gerar
Sempre valide schemas antes de gerar grandes volumes de dados para evitar erros custosos.

### 3. Use Seeds para Reprodutibilidade
Configure `random_seed` no `GenerationConfig` para gerar dados consistentes entre execuções.

### 4. Monitore Qualidade Durante Geração
Use `generate_validated_dataset` para garantir que os dados gerados atendem aos padrões de qualidade.

### 5. Ajuste Batch Size para Performance
Para datasets grandes, ajuste `batch_size` no `GenerationConfig` baseado na memória disponível.

### 6. Exporte Schemas para Reutilização
Exporte schemas validados para reutilizar em diferentes projetos.

---

## 🐛 Troubleshooting

### Erro: "Schema validation failed"
- Verifique se todos os campos obrigatórios estão definidos
- Confirme que não há referências circulares
- Valide que constraints são compatíveis com tipos de campo

### Erro: "Quality score below threshold"
- Revise as constraints do schema
- Verifique se os geradores estão funcionando corretamente
- Considere ajustar `quality_thresholds` se apropriado

### Performance Lenta
- Reduza `batch_size` se houver problemas de memória
- Aumente `worker_threads` se CPU não estiver sendo totalmente utilizada
- Desabilite validação durante geração se não for crítica (`enable_validation: false`)

---

**Última Atualização:** 2024

