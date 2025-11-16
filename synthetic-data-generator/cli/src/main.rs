use anyhow::Result;
use synthetic_data_core::domain::*;
use synthetic_data_core::DataGeneratorPort;
use synthetic_data_infrastructure::capabilities::generators::*;
use std::sync::Arc;
use tracing::{info, Level};
use tracing_subscriber;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_max_level(Level::INFO)
        .init();

    info!("🚀 Synthetic Data Generator CLI - Phase 1 Foundation");
    
    println!("\n{}", "=".repeat(60));
    println!("🎲 DEMONSTRAÇÃO: String Generator");
    println!("{}", "=".repeat(60));
    
    // ==========================================
    // 1. Criar schema usando builders
    // ==========================================
    println!("\n📋 1. Criando schema com builders...");
    
    let schema = DataSchemaBuilder::new("users".to_string(), "1.0".to_string())
        .add_field(
            FieldDefinitionBuilder::new("username".to_string(), FieldType::String {
                min_length: Some(5),
                max_length: Some(15),
                pattern: None,
            })
            .required(true)
            .with_description("User login name".to_string())
            .build()
        )
        .add_field(
            FieldDefinitionBuilder::new("email".to_string(), FieldType::String {
                min_length: None,
                max_length: None,
                pattern: Some(StringPattern::Email),
            })
            .required(true)
            .with_description("User email address".to_string())
            .build()
        )
        .add_field(
            FieldDefinitionBuilder::new("full_name".to_string(), FieldType::String {
                min_length: None,
                max_length: None,
                pattern: Some(StringPattern::Name(NameType::Full)),
            })
            .required(true)
            .with_description("User full name".to_string())
            .build()
        )
        .add_field(
            FieldDefinitionBuilder::new("phone".to_string(), FieldType::String {
                min_length: None,
                max_length: None,
                pattern: Some(StringPattern::Phone(PhoneFormat::US)),
            })
            .required(false)
            .with_description("User phone number".to_string())
            .build()
        )
        .build()?;
    
    println!("✅ Schema criado: '{}' v{}", schema.name, schema.version);
    println!("   Campos: {}", schema.fields.len());
    
    // ==========================================
    // 2. Validar schema
    // ==========================================
    println!("\n🔍 2. Validando schema...");
    match SchemaValidationService::validate_schema(&schema) {
        Ok(_) => println!("✅ Schema válido!"),
        Err(e) => {
            println!("❌ Erro na validação: {}", e);
            return Ok(());
        }
    }
    
    // ==========================================
    // 3. Criar generator e gerar dados
    // ==========================================
    println!("\n🎲 3. Gerando dados sintéticos...");
    
    let string_gen = Arc::new(StringGenerator::new(Some(42))); // Seed para reprodutibilidade
    let data_gen = DefaultDataGenerator::new(string_gen);
    
    println!("   Gerando 10 linhas de exemplo:");
    println!("   {}", "-".repeat(56));
    
    let rows = data_gen.generate_rows(&schema, 10).await?;
    
    // Create context from schema (needed for Small schemas)
    let ctx = GenerationContext::from_schema(&schema);
    
    for (i, row) in rows.iter().enumerate() {
        println!("\n   Linha {}:", i + 1);
        for field_def in &schema.fields {
            if let Some(value) = row.get_field_value(&field_def.name, Some(&ctx)) {
                let display = match value {
                    DataValue::String(s) => s.clone(),
                    _ => format!("{:?}", value),
                };
                println!("     {}: {}", field_def.name, display);
            }
        }
    }
    
    // ==========================================
    // 4. Teste de performance
    // ==========================================
    println!("\n⚡ 4. Teste de performance...");
    
    // ULTRA-OPTIMIZED: Warmup para estabilizar performance (cache, JIT, etc.)
    println!("   🔥 Warmup (100K linhas)...");
    let _warmup = data_gen.generate_rows(&schema, 100_000).await?;
    
    // Teste principal com 1M linhas para medição estável
    println!("   🚀 Teste principal (1M linhas)...");
    let start = std::time::Instant::now();
    let large_batch = data_gen.generate_rows(&schema, 1_000_000).await?;
    let duration = start.elapsed();
    
    let lines_per_second = large_batch.len() as f64 / duration.as_secs_f64();
    println!("   ✅ Geradas {} linhas em {:?}", large_batch.len(), duration);
    println!("   ⚡ Performance: {:.2} linhas/segundo", lines_per_second);
    
    // Análise de estabilidade
    if lines_per_second >= 1_000_000.0 {
        println!("   🎯 META ALCANÇADA! ✅ (>= 1M linhas/segundo)");
    } else {
        let gap = 1_000_000.0 - lines_per_second;
        let gap_percent = (gap / 1_000_000.0) * 100.0;
        println!("   📊 Gap para meta: {:.0} linhas/segundo ({:.1}%)", gap, gap_percent);
    }
    
    // ==========================================
    // 5. Teste de determinismo (seed)
    // ==========================================
    println!("\n🔢 5. Teste de determinismo (seed)...");
    
    let gen1 = StringGenerator::new(Some(123));
    let gen2 = StringGenerator::new(Some(123));
    
    let field = &schema.fields[0]; // username field
    let value1 = gen1.generate(field).await?;
    let value2 = gen2.generate(field).await?;
    
    println!("   Seed: 123");
    println!("   Generator 1: {}", value1);
    println!("   Generator 2: {}", value2);
    println!("   ✅ Determinístico? {}", if value1 == value2 { "SIM" } else { "NÃO" });
    
    // ==========================================
    // 6. Diferentes patterns
    // ==========================================
    println!("\n🎨 6. Diferentes patterns de geração:");
    println!("   {}", "-".repeat(56));
    
    let patterns = vec![
        ("Charset básico", FieldType::String {
            min_length: Some(10),
            max_length: Some(20),
            pattern: None,
        }),
        ("Email", FieldType::String {
            min_length: None,
            max_length: None,
            pattern: Some(StringPattern::Email),
        }),
        ("Nome completo", FieldType::String {
            min_length: None,
            max_length: None,
            pattern: Some(StringPattern::Name(NameType::Full)),
        }),
        ("Telefone US", FieldType::String {
            min_length: None,
            max_length: None,
            pattern: Some(StringPattern::Phone(PhoneFormat::US)),
        }),
    ];
    
    let test_gen = StringGenerator::new(None);
    for (label, field_type) in patterns {
        let test_field = FieldDefinition {
            name: "test".to_string(),
            field_type: field_type.clone(),
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let value = test_gen.generate(&test_field).await?;
        println!("   {}: {}", label, value);
    }
    
    println!("\n{}", "=".repeat(60));
    println!("✅ Demonstração concluída com sucesso!");
    println!("{}", "=".repeat(60));
    
    info!("✅ CLI demonstration completed!");
    
    Ok(())
}
