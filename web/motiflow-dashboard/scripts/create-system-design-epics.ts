/**
 * Script to create all epics, stories, and tasks for system design evolution
 * 
 * Run with: npx tsx scripts/create-system-design-epics.ts
 */

import { CreateEpicUseCase } from '../src/core/application/use-cases/epic/create-epic.use-case';
import { CreateStoryUseCase } from '../src/core/application/use-cases/story/create-story.use-case';
import { LinkStoryToEpicUseCase } from '../src/core/application/use-cases/story/link-story-to-epic.use-case';
import { CreateTaskUseCase } from '../src/core/application/use-cases/task/create-task.use-case';
import { EpicPrismaRepository } from '../src/adapters/driven/persistence/prisma/epic-prisma-repository';
import { StoryPrismaRepository } from '../src/adapters/driven/persistence/prisma/story-prisma-repository';
import { TaskPrismaRepository } from '../src/adapters/driven/persistence/prisma/task-prisma-repository';
import { EventBusAdapter } from '../src/adapters/driven/events/event-bus.adapter';
import { EpicId, StoryId } from '../src/core/domain/value-objects/identifier';

interface EpicData {
  title: string;
  description: string;
  priority: string;
  stories: StoryData[];
}

interface StoryData {
  title: string;
  as: string;
  iWant: string;
  soThat: string;
  description?: string;
  storyPoints?: number;
  priority: string;
  tasks: TaskData[];
}

interface TaskData {
  title: string;
  description?: string;
  priority: string;
  estimate?: number;
}

const EPICS: EpicData[] = [
  {
    title: 'Evolução do Design System',
    description: 'Evoluir o design system (react-design-system) para ser mais robusto, escalável e alinhado com princípios de design system moderno.',
    priority: 'HIGH',
    stories: [
      {
        title: 'Sistema de Tokens Centralizado',
        as: 'desenvolvedor',
        iWant: 'um sistema de tokens centralizado e tipado',
        soThat: 'garantir consistência visual e facilitar manutenção',
        description: 'Criar um sistema completo de tokens para espaçamento, tipografia, cores e breakpoints responsivos.',
        storyPoints: 5,
        priority: 'HIGH',
        tasks: [
          {
            title: 'Criar tokens para espaçamento (spacing scale)',
            description: 'Definir escala de espaçamento consistente (4px, 8px, 12px, 16px, etc.)',
            priority: 'HIGH',
            estimate: 2
          },
          {
            title: 'Criar tokens para tipografia (font families, sizes, weights)',
            description: 'Definir sistema tipográfico completo com famílias, tamanhos e pesos',
            priority: 'HIGH',
            estimate: 3
          },
          {
            title: 'Criar tokens para cores (semantic color system)',
            description: 'Implementar sistema de cores semântico (primary, secondary, success, error, etc.)',
            priority: 'HIGH',
            estimate: 3
          },
          {
            title: 'Criar tokens para breakpoints responsivos',
            description: 'Definir breakpoints consistentes para mobile, tablet e desktop',
            priority: 'MEDIUM',
            estimate: 2
          },
          {
            title: 'Documentar sistema de tokens',
            description: 'Criar documentação completa do sistema de tokens no Storybook',
            priority: 'MEDIUM',
            estimate: 2
          }
        ]
      },
      {
        title: 'Componentes Atômicos Completos',
        as: 'desenvolvedor',
        iWant: 'componentes atômicos completos e bem documentados',
        soThat: 'construir interfaces de forma eficiente',
        description: 'Completar biblioteca de componentes atômicos com variantes, estados e documentação.',
        storyPoints: 8,
        priority: 'HIGH',
        tasks: [
          {
            title: 'Completar biblioteca de componentes atômicos (Button, Input, Select, etc.)',
            description: 'Garantir que todos os componentes básicos estejam implementados',
            priority: 'HIGH',
            estimate: 5
          },
          {
            title: 'Adicionar variantes e estados para cada componente',
            description: 'Implementar variantes (primary, secondary) e estados (hover, focus, disabled)',
            priority: 'HIGH',
            estimate: 4
          },
          {
            title: 'Criar Storybook stories para todos os componentes',
            description: 'Documentar cada componente no Storybook com exemplos de uso',
            priority: 'MEDIUM',
            estimate: 3
          },
          {
            title: 'Adicionar testes unitários para componentes críticos',
            description: 'Implementar testes para componentes que são base de outros',
            priority: 'MEDIUM',
            estimate: 3
          }
        ]
      },
      {
        title: 'Sistema de Temas (Dark Mode)',
        as: 'usuário',
        iWant: 'poder alternar entre tema claro e escuro',
        soThat: 'melhorar a experiência visual',
        description: 'Implementar sistema completo de temas com suporte a dark mode.',
        storyPoints: 5,
        priority: 'MEDIUM',
        tasks: [
          {
            title: 'Implementar sistema de temas no design system',
            description: 'Criar infraestrutura para múltiplos temas',
            priority: 'MEDIUM',
            estimate: 3
          },
          {
            title: 'Criar tokens de cores para dark mode',
            description: 'Definir paleta de cores para tema escuro',
            priority: 'MEDIUM',
            estimate: 2
          },
          {
            title: 'Adicionar toggle de tema na aplicação',
            description: 'Implementar botão/switch para alternar entre temas',
            priority: 'MEDIUM',
            estimate: 2
          },
          {
            title: 'Testar acessibilidade em ambos os temas',
            description: 'Garantir contraste e legibilidade em ambos os temas',
            priority: 'MEDIUM',
            estimate: 2
          }
        ]
      }
    ]
  },
  {
    title: 'Arquitetura e Performance',
    description: 'Melhorar a arquitetura da aplicação seguindo princípios de system design, otimizar performance e escalabilidade.',
    priority: 'HIGH',
    stories: [
      {
        title: 'Cache e Revalidação Estratégica',
        as: 'desenvolvedor',
        iWant: 'um sistema de cache inteligente',
        soThat: 'melhorar performance e reduzir carga no servidor',
        description: 'Implementar sistema de cache com revalidação estratégica usando ISR e on-demand revalidation.',
        storyPoints: 8,
        priority: 'HIGH',
        tasks: [
          {
            title: 'Implementar cache em memória para queries frequentes',
            description: 'Usar cache para reduzir queries ao banco de dados',
            priority: 'HIGH',
            estimate: 4
          },
          {
            title: 'Configurar revalidação estratégica (ISR, on-demand)',
            description: 'Implementar ISR para páginas estáticas e on-demand para conteúdo dinâmico',
            priority: 'HIGH',
            estimate: 3
          },
          {
            title: 'Adicionar cache headers apropriados',
            description: 'Configurar headers HTTP para cache do cliente',
            priority: 'MEDIUM',
            estimate: 2
          },
          {
            title: 'Monitorar hit rates de cache',
            description: 'Adicionar métricas para monitorar eficiência do cache',
            priority: 'LOW',
            estimate: 2
          }
        ]
      },
      {
        title: 'Otimização de Queries e N+1',
        as: 'desenvolvedor',
        iWant: 'queries otimizadas sem problemas N+1',
        soThat: 'melhorar performance do banco de dados',
        description: 'Auditar e otimizar todas as queries do Prisma, eliminando problemas N+1.',
        storyPoints: 5,
        priority: 'HIGH',
        tasks: [
          {
            title: 'Auditar todas as queries do Prisma',
            description: 'Identificar queries lentas e problemas N+1',
            priority: 'HIGH',
            estimate: 3
          },
          {
            title: 'Implementar eager loading onde necessário',
            description: 'Usar include/select do Prisma para carregar relacionamentos',
            priority: 'HIGH',
            estimate: 3
          },
          {
            title: 'Adicionar índices estratégicos no banco',
            description: 'Criar índices para campos frequentemente consultados',
            priority: 'MEDIUM',
            estimate: 2
          },
          {
            title: 'Criar queries agregadas para dashboards',
            description: 'Otimizar queries de dashboards com agregações no banco',
            priority: 'MEDIUM',
            estimate: 3
          }
        ]
      },
      {
        title: 'Event-Driven Architecture',
        as: 'desenvolvedor',
        iWant: 'uma arquitetura orientada a eventos',
        soThat: 'desacoplar componentes e melhorar escalabilidade',
        description: 'Expandir sistema de eventos existente para suportar arquitetura orientada a eventos completa.',
        storyPoints: 8,
        priority: 'MEDIUM',
        tasks: [
          {
            title: 'Expandir sistema de eventos existente',
            description: 'Adicionar mais tipos de eventos e handlers',
            priority: 'MEDIUM',
            estimate: 4
          },
          {
            title: 'Criar event handlers para operações assíncronas',
            description: 'Implementar handlers para tarefas que podem ser processadas assincronamente',
            priority: 'MEDIUM',
            estimate: 3
          },
          {
            title: 'Implementar event sourcing para auditoria',
            description: 'Armazenar eventos para histórico e auditoria',
            priority: 'LOW',
            estimate: 5
          },
          {
            title: 'Documentar fluxo de eventos',
            description: 'Criar diagramas e documentação do sistema de eventos',
            priority: 'LOW',
            estimate: 2
          }
        ]
      }
    ]
  },
  {
    title: 'Funcionalidades Core',
    description: 'Implementar funcionalidades essenciais para gestão ágil completa.',
    priority: 'MEDIUM',
    stories: [
      {
        title: 'Sistema de Sprints Completo',
        as: 'product owner',
        iWant: 'gerenciar sprints completos',
        soThat: 'organizar o trabalho em iterações',
        description: 'Implementar funcionalidades completas de gerenciamento de sprints.',
        storyPoints: 13,
        priority: 'MEDIUM',
        tasks: [
          {
            title: 'Implementar criação e edição de sprints',
            description: 'CRUD completo para sprints com validações',
            priority: 'MEDIUM',
            estimate: 5
          },
          {
            title: 'Adicionar capacidade de adicionar stories a sprints',
            description: 'Interface para associar stories a sprints',
            priority: 'MEDIUM',
            estimate: 3
          },
          {
            title: 'Criar visualização de burndown chart',
            description: 'Gráfico mostrando progresso do sprint ao longo do tempo',
            priority: 'MEDIUM',
            estimate: 5
          },
          {
            title: 'Implementar fechamento de sprint',
            description: 'Workflow para finalizar sprint e gerar relatório',
            priority: 'MEDIUM',
            estimate: 3
          }
        ]
      },
      {
        title: 'Sistema de Kanban Interativo',
        as: 'desenvolvedor',
        iWant: 'um board Kanban interativo',
        soThat: 'visualizar e gerenciar o fluxo de trabalho',
        description: 'Implementar board Kanban completo com drag-and-drop e métricas.',
        storyPoints: 13,
        priority: 'MEDIUM',
        tasks: [
          {
            title: 'Implementar drag-and-drop de cards',
            description: 'Permitir arrastar cards entre colunas do Kanban',
            priority: 'MEDIUM',
            estimate: 5
          },
          {
            title: 'Adicionar filtros e busca no board',
            description: 'Filtrar cards por epic, story, assignee, etc.',
            priority: 'MEDIUM',
            estimate: 3
          },
          {
            title: 'Criar visualização de swimlanes',
            description: 'Organizar cards em swimlanes por epic ou assignee',
            priority: 'LOW',
            estimate: 4
          },
          {
            title: 'Adicionar métricas de fluxo (lead time, cycle time)',
            description: 'Calcular e exibir métricas de performance do fluxo',
            priority: 'LOW',
            estimate: 3
          }
        ]
      },
      {
        title: 'Sistema de Notificações',
        as: 'usuário',
        iWant: 'receber notificações sobre mudanças importantes',
        soThat: 'me manter atualizado',
        description: 'Implementar sistema completo de notificações in-app e por email.',
        storyPoints: 8,
        priority: 'MEDIUM',
        tasks: [
          {
            title: 'Implementar sistema de notificações in-app',
            description: 'Criar componente de notificações e armazenar no banco',
            priority: 'MEDIUM',
            estimate: 4
          },
          {
            title: 'Adicionar preferências de notificação',
            description: 'Permitir usuário configurar quais notificações receber',
            priority: 'MEDIUM',
            estimate: 2
          },
          {
            title: 'Criar notificações por email (opcional)',
            description: 'Enviar emails para notificações importantes',
            priority: 'LOW',
            estimate: 3
          },
          {
            title: 'Adicionar badge de contagem de notificações',
            description: 'Mostrar número de notificações não lidas',
            priority: 'MEDIUM',
            estimate: 2
          }
        ]
      }
    ]
  },
  {
    title: 'Qualidade e Testes',
    description: 'Garantir qualidade do código através de testes, documentação e práticas de desenvolvimento.',
    priority: 'MEDIUM',
    stories: [
      {
        title: 'Cobertura de Testes',
        as: 'desenvolvedor',
        iWant: 'alta cobertura de testes',
        soThat: 'garantir confiabilidade do código',
        description: 'Implementar testes em todas as camadas da aplicação.',
        storyPoints: 13,
        priority: 'MEDIUM',
        tasks: [
          {
            title: 'Adicionar testes unitários para use cases',
            description: 'Testar lógica de negócio isoladamente',
            priority: 'MEDIUM',
            estimate: 5
          },
          {
            title: 'Criar testes de integração para server actions',
            description: 'Testar fluxo completo de server actions',
            priority: 'MEDIUM',
            estimate: 4
          },
          {
            title: 'Implementar testes E2E para fluxos críticos',
            description: 'Testar fluxos completos do usuário (Playwright/Cypress)',
            priority: 'MEDIUM',
            estimate: 5
          },
          {
            title: 'Configurar CI/CD com testes automatizados',
            description: 'Executar testes automaticamente no pipeline',
            priority: 'MEDIUM',
            estimate: 2
          }
        ]
      },
      {
        title: 'Documentação Técnica',
        as: 'desenvolvedor',
        iWant: 'documentação técnica completa',
        soThat: 'facilitar onboarding e manutenção',
        description: 'Criar documentação completa da arquitetura e decisões técnicas.',
        storyPoints: 8,
        priority: 'MEDIUM',
        tasks: [
          {
            title: 'Documentar arquitetura do sistema',
            description: 'Criar diagramas e documentação da arquitetura hexagonal',
            priority: 'MEDIUM',
            estimate: 3
          },
          {
            title: 'Criar ADRs (Architecture Decision Records)',
            description: 'Documentar decisões arquiteturais importantes',
            priority: 'MEDIUM',
            estimate: 3
          },
          {
            title: 'Documentar APIs e contratos',
            description: 'Documentar server actions e seus contratos',
            priority: 'MEDIUM',
            estimate: 2
          },
          {
            title: 'Criar guias de contribuição',
            description: 'Documentar como contribuir para o projeto',
            priority: 'LOW',
            estimate: 2
          }
        ]
      }
    ]
  },
  {
    title: 'UX e Acessibilidade',
    description: 'Melhorar experiência do usuário e garantir acessibilidade.',
    priority: 'MEDIUM',
    stories: [
      {
        title: 'Acessibilidade (WCAG 2.1)',
        as: 'usuário com necessidades especiais',
        iWant: 'uma aplicação acessível',
        soThat: 'poder usar todas as funcionalidades',
        description: 'Garantir que a aplicação atenda aos padrões WCAG 2.1.',
        storyPoints: 8,
        priority: 'MEDIUM',
        tasks: [
          {
            title: 'Auditar acessibilidade com ferramentas',
            description: 'Usar axe, Lighthouse, etc. para identificar problemas',
            priority: 'MEDIUM',
            estimate: 2
          },
          {
            title: 'Adicionar ARIA labels onde necessário',
            description: 'Melhorar navegação para screen readers',
            priority: 'MEDIUM',
            estimate: 3
          },
          {
            title: 'Garantir navegação por teclado',
            description: 'Todas as funcionalidades devem ser acessíveis via teclado',
            priority: 'MEDIUM',
            estimate: 3
          },
          {
            title: 'Testar com screen readers',
            description: 'Validar experiência com NVDA, JAWS, VoiceOver',
            priority: 'MEDIUM',
            estimate: 2
          }
        ]
      },
      {
        title: 'Responsividade Completa',
        as: 'usuário mobile',
        iWant: 'uma experiência otimizada em dispositivos móveis',
        soThat: 'usar a aplicação em qualquer lugar',
        description: 'Otimizar aplicação para todos os tamanhos de tela.',
        storyPoints: 5,
        priority: 'MEDIUM',
        tasks: [
          {
            title: 'Otimizar layouts para mobile',
            description: 'Garantir que todos os layouts funcionem bem em mobile',
            priority: 'MEDIUM',
            estimate: 3
          },
          {
            title: 'Melhorar performance em dispositivos móveis',
            description: 'Otimizar carregamento e renderização em mobile',
            priority: 'MEDIUM',
            estimate: 2
          },
          {
            title: 'Adicionar gestos touch onde apropriado',
            description: 'Implementar swipe, pinch, etc. para melhor UX mobile',
            priority: 'LOW',
            estimate: 2
          },
          {
            title: 'Testar em diferentes tamanhos de tela',
            description: 'Validar em diversos dispositivos e resoluções',
            priority: 'MEDIUM',
            estimate: 2
          }
        ]
      }
    ]
  }
];

async function createAllEpics() {
  console.log('🚀 Starting creation of epics, stories, and tasks...\n');

  // Initialize repositories and use cases
  const epicRepository = new EpicPrismaRepository();
  const storyRepository = new StoryPrismaRepository();
  const taskRepository = new TaskPrismaRepository();
  const eventBus = new EventBusAdapter();

  const createEpicUseCase = new CreateEpicUseCase(epicRepository, eventBus);
  const createStoryUseCase = new CreateStoryUseCase(storyRepository, epicRepository, eventBus);
  const linkStoryToEpicUseCase = new LinkStoryToEpicUseCase(storyRepository, epicRepository);
  const createTaskUseCase = new CreateTaskUseCase(taskRepository, storyRepository, eventBus);

  for (const epicData of EPICS) {
    try {
      console.log(`📦 Creating Epic: ${epicData.title}`);
      
      // Create epic
      const epic = await createEpicUseCase.execute({
        title: epicData.title,
        description: epicData.description,
        priority: epicData.priority,
      });

      const epicId = epic.id.getValue();
      console.log(`✅ Epic created with ID: ${epicId}`);

      // Get epic to check existing stories
      const epicEntity = await epicRepository.findById(EpicId.create(epicId));
      if (!epicEntity) {
        console.error(`  ❌ Epic not found: ${epicId}`);
        continue;
      }

      // Create stories for this epic
      for (const storyData of epicData.stories) {
        try {
          console.log(`  📝 Creating Story: ${storyData.title}`);
          
          // Check if story already exists in this epic
          const existingStories = epicEntity.getStories();
          const existingStory = existingStories.find(s => s.getTitle() === storyData.title);
          
          let storyId: string;
          if (existingStory) {
            storyId = existingStory.id.getValue();
            console.log(`  ℹ️  Story already exists with ID: ${storyId}`);
          } else {
            // Create story without linking to epic first
            const story = await createStoryUseCase.execute({
              title: storyData.title,
              as: storyData.as,
              iWant: storyData.iWant,
              soThat: storyData.soThat,
              description: storyData.description,
              acceptanceCriteria: undefined,
              storyPoints: storyData.storyPoints,
              priority: storyData.priority,
              epicId: undefined, // Don't link yet
            });

            storyId = story.id.getValue();
            console.log(`  ✅ Story created with ID: ${storyId}`);
            
            // Now link to epic using the use case
            await linkStoryToEpicUseCase.execute({
              storyId: storyId,
              epicId: epicId,
            });
          }

          // Create tasks for this story
          for (const taskData of storyData.tasks) {
            try {
              console.log(`    ✓ Creating Task: ${taskData.title}`);
              
              const task = await createTaskUseCase.execute({
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
                estimate: taskData.estimate,
                storyId: storyId,
              });

              console.log(`    ✅ Task created with ID: ${task.id.getValue()}`);
            } catch (error) {
              console.error(`    ❌ Failed to create task: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        } catch (error) {
          console.error(`  ❌ Failed to create story: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Failed to create epic: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('✨ All epics, stories, and tasks created successfully!');
}

// Run the script
createAllEpics().catch((error) => {
  console.error('💥 Error running script:', error);
  process.exit(1);
});
