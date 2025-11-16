//! Exemplo prático de uso do StringGenerator
//!
//! Execute com: cargo run --example string_generator_demo --package synthetic_data_infrastructure

use synthetic_data_core::domain::*;
use synthetic_data_core::DataGeneratorPort;
use synthetic_data_infrastructure::capabilities::generators::string::StringGenerator;
use synthetic_data_infrastructure::capabilities::generators::DefaultDataGenerator;
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🎲 String Generator Demo\n");
    
    // ==========================================
    // Teste 1: Geração básica com charset
    // ==========================================
    println!("📝 Teste 1: Geração básica (charset alphanumeric)");
    println!("{}", "=".repeat(50));
    
    let generator = StringGenerator::new(None);
    
    let field = FieldDefinition {
        name: "username".to_string(),
        field_type: FieldType::String {
            min_length: Some(5),
            max_length: Some(15),
            pattern: None,
        },
        constraints: vec![],
        required: true,
        default: None,
        description: None,
    };
    
    for i in 1..=5 {
        let value = generator.generate(&field).await?;
        println!("  {}. {}", i, value);
    }
    println!();
    
    // ==========================================
    // Teste 2: Geração determinística (seed)
    // ==========================================
    println!("🔢 Teste 2: Geração determinística (seed=42)");
    println!("{}", "=".repeat(50));
    
    let gen1 = StringGenerator::new(Some(42));
    let gen2 = StringGenerator::new(Some(42));
    
    let value1 = gen1.generate(&field).await?;
    let value2 = gen2.generate(&field).await?;
    
    println!("  Generator 1: {}", value1);
    println!("  Generator 2: {}", value2);
    println!("  ✅ São iguais? {}", if value1 == value2 { "SIM" } else { "NÃO" });
    println!();
    
    // ==========================================
    // Teste 3: Enum pattern
    // ==========================================
    println!("📋 Teste 3: Enum pattern (seleção de valores)");
    println!("{}", "=".repeat(50));
    
    let enum_field = FieldDefinition {
        name: "status".to_string(),
        field_type: FieldType::String {
            min_length: None,
            max_length: None,
            pattern: Some(StringPattern::Enum(vec![
                "active".to_string(),
                "inactive".to_string(),
                "pending".to_string(),
                "suspended".to_string(),
            ])),
        },
        constraints: vec![],
        required: true,
        default: None,
        description: None,
    };
    
    for i in 1..=10 {
        let value = generator.generate(&enum_field).await?;
        println!("  {}. {}", i, value);
    }
    println!();
    
    // ==========================================
    // Teste 4: Email generation
    // ==========================================
    println!("📧 Teste 4: Geração de emails");
    println!("{}", "=".repeat(50));
    
    let email_field = FieldDefinition {
        name: "email".to_string(),
        field_type: FieldType::String {
            min_length: None,
            max_length: None,
            pattern: Some(StringPattern::Email),
        },
        constraints: vec![],
        required: true,
        default: None,
        description: None,
    };
    
    for i in 1..=5 {
        let email = generator.generate(&email_field).await?;
        println!("  {}. {}", i, email);
    }
    println!();
    
    // ==========================================
    // Teste 5: Name generation
    // ==========================================
    println!("👤 Teste 5: Geração de nomes");
    println!("{}", "=".repeat(50));
    
    let name_types = vec![
        (NameType::First, "First Name"),
        (NameType::Last, "Last Name"),
        (NameType::Full, "Full Name"),
    ];
    
    for (name_type, label) in name_types {
        let name_field = FieldDefinition {
            name: "name".to_string(),
            field_type: FieldType::String {
                min_length: None,
                max_length: None,
                pattern: Some(StringPattern::Name(name_type)),
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        println!("  {}:", label);
        for i in 1..=3 {
            let name = generator.generate(&name_field).await?;
            println!("    {}. {}", i, name);
        }
    }
    println!();
    
    // ==========================================
    // Teste 6: Phone generation
    // ==========================================
    println!("📞 Teste 6: Geração de telefones");
    println!("{}", "=".repeat(50));
    
    let phone_formats = vec![
        (PhoneFormat::US, "US Format"),
        (PhoneFormat::International, "International Format"),
    ];
    
    for (format, label) in phone_formats {
        let phone_field = FieldDefinition {
            name: "phone".to_string(),
            field_type: FieldType::String {
                min_length: None,
                max_length: None,
                pattern: Some(StringPattern::Phone(format)),
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        println!("  {}:", label);
        for i in 1..=3 {
            let phone = generator.generate(&phone_field).await?;
            println!("    {}. {}", i, phone);
        }
    }
    println!();
    
    // ==========================================
    // Teste 7: Batch generation
    // ==========================================
    println!("📦 Teste 7: Geração em batch (100 strings)");
    println!("{}", "=".repeat(50));
    
    let start = std::time::Instant::now();
    let batch = generator.generate_batch(&field, 100).await?;
    let duration = start.elapsed();
    
    println!("  ✅ Geradas {} strings em {:?}", batch.len(), duration);
    println!("  ⚡ Performance: {:.2} strings/ms", 
        batch.len() as f64 / duration.as_millis() as f64);
    println!("  Primeiras 5:");
    for (i, value) in batch.iter().take(5).enumerate() {
        println!("    {}. {}", i + 1, value);
    }
    println!();
    
    // ==========================================
    // Teste 8: Integração com DefaultDataGenerator
    // ==========================================
    println!("🔗 Teste 8: Integração com DefaultDataGenerator");
    println!("{}", "=".repeat(50));
    
    let string_gen = Arc::new(StringGenerator::new(None));
    let data_gen = DefaultDataGenerator::new(string_gen);
    
    // Criar schema usando builders
    let schema = DataSchemaBuilder::new("users".to_string(), "1.0".to_string())
        .add_field(
            FieldDefinitionBuilder::new("username".to_string(), FieldType::String {
                min_length: Some(5),
                max_length: Some(15),
                pattern: None,
            })
            .required(true)
            .build()
        )
        .add_field(
            FieldDefinitionBuilder::new("email".to_string(), FieldType::String {
                min_length: None,
                max_length: None,
                pattern: Some(StringPattern::Email),
            })
            .required(true)
            .build()
        )
        .add_field(
            FieldDefinitionBuilder::new("full_name".to_string(), FieldType::String {
                min_length: None,
                max_length: None,
                pattern: Some(StringPattern::Name(NameType::Full)),
            })
            .required(true)
            .build()
        )
        .build()?;
    
    println!("  Schema criado: {} ({} campos)", schema.name, schema.fields.len());
    println!();
    
    // Gerar algumas linhas
    println!("  Gerando 5 linhas:");
    // Create context from schema (needed for Small schemas)
    let ctx = GenerationContext::from_schema(&schema);
    for i in 1..=5 {
        let row = data_gen.generate_row(&schema).await?;
        println!("  Linha {}:", i);
        for field_name in ["username", "email", "full_name"] {
            if let Some(value) = row.get_field_value(field_name, Some(&ctx)) {
                println!("    {}: {:?}", field_name, value);
            }
        }
    }
    println!();
    
    // Gerar batch de linhas
    println!("  Gerando batch de 10 linhas:");
    let start = std::time::Instant::now();
    let rows = data_gen.generate_rows(&schema, 10).await?;
    let duration = start.elapsed();
    
    println!("  ✅ Geradas {} linhas em {:?}", rows.len(), duration);
    println!("  ⚡ Performance: {:.2} linhas/ms", 
        rows.len() as f64 / duration.as_millis() as f64);
    println!();
    
    println!("✅ Todos os testes concluídos com sucesso!");
    
    Ok(())
}

