/**
 * Script para criar as Tasks do Badge Component
 * 
 * Execute: npx tsx scripts/create-badge-tasks.ts <storyId>
 */

import { CreateTaskUseCase } from '../src/core/application/use-cases/task/create-task.use-case';
import { TaskPrismaRepository } from '../src/adapters/driven/persistence/prisma/task-prisma-repository';
import { StoryPrismaRepository } from '../src/adapters/driven/persistence/prisma/story-prisma-repository';
import { EventBusAdapter } from '../src/adapters/driven/events/event-bus.adapter';
import { StoryId } from '../src/core/domain/value-objects/identifier';

const tasks = [
  {
    title: 'Criar componente Badge no react-design-system usando Plop',
    description: 'Usar o gerador Plop para criar a estrutura base do componente Badge seguindo o padrão Atomic Design (Atom)',
    priority: 'MEDIUM',
  },
  {
    title: 'Implementar variantes (success, warning, error, info, neutral)',
    description: 'Criar as diferentes variantes visuais do Badge usando TailwindCSS e class-variance-authority',
    priority: 'HIGH',
  },
  {
    title: 'Adicionar Storybook stories',
    description: 'Criar stories no Storybook documentando todas as variantes e casos de uso do Badge',
    priority: 'MEDIUM',
  },
  {
    title: 'Escrever testes unitários',
    description: 'Criar testes unitários usando Vitest/Jest para garantir a qualidade do componente',
    priority: 'HIGH',
  },
  {
    title: 'Documentar uso e props',
    description: 'Adicionar documentação JSDoc e README explicando como usar o componente e suas props',
    priority: 'MEDIUM',
  },
  {
    title: 'Publicar nova versão no npm (1.1.0)',
    description: 'Atualizar versão do package.json, build e publicar no npm registry',
    priority: 'MEDIUM',
  },
  {
    title: 'Atualizar dependência no motiflow-dashboard',
    description: 'Atualizar package.json do dashboard para usar a nova versão do design system',
    priority: 'LOW',
  },
  {
    title: 'Migrar spans inline para usar Badge',
    description: 'Substituir todos os spans inline de status e prioridade nos componentes EpicCard, StoryCard e TaskCard',
    priority: 'MEDIUM',
  },
];

async function createBadgeTasks(storyId: string) {
  try {
    // Verificar se a Story existe
    const storyRepository = new StoryPrismaRepository();
    const story = await storyRepository.findById(StoryId.create(storyId));
    
    if (!story) {
      throw new Error(`Story com ID ${storyId} não encontrada`);
    }

    const taskRepository = new TaskPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new CreateTaskUseCase(taskRepository, storyRepository, eventBus);

    const createdTasks = [];

    for (const taskData of tasks) {
      // Verificar se a task já existe
      const existingTasks = await taskRepository.findByStoryId(StoryId.create(storyId));
      const existingTask = existingTasks.find(t => t.getTitle() === taskData.title);
      
      if (existingTask) {
        console.log(`ℹ️  Task já existe: ${taskData.title}`);
        createdTasks.push(existingTask);
        continue;
      }

      const task = await useCase.execute({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        storyId,
      });

      console.log(`✅ Task criada: ${task.getTitle()}`);
      createdTasks.push(task);
    }

    console.log(`\n✅ Total de ${createdTasks.length} tasks processadas`);
    console.log(`\nAcesse: http://localhost:5001/epics/${story.getEpicId()?.getValue() || 'N/A'}`);
    
    return createdTasks;
  } catch (error) {
    console.error('❌ Erro ao criar Tasks:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const storyId = process.argv[2];
  
  if (!storyId) {
    console.error('❌ Por favor, forneça o ID da Story como argumento');
    console.log('Uso: npx tsx scripts/create-badge-tasks.ts <storyId>');
    process.exit(1);
  }

  createBadgeTasks(storyId)
    .then(() => {
      console.log('\n✅ Script concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro no script:', error);
      process.exit(1);
    });
}

export { createBadgeTasks };
