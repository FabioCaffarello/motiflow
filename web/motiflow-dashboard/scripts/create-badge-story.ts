/**
 * Script para criar a Story do Badge Component
 * 
 * Execute: npx tsx scripts/create-badge-story.ts <epicId>
 */

import { CreateStoryUseCase } from '../src/core/application/use-cases/story/create-story.use-case';
import { StoryPrismaRepository } from '../src/adapters/driven/persistence/prisma/story-prisma-repository';
import { EpicPrismaRepository } from '../src/adapters/driven/persistence/prisma/epic-prisma-repository';
import { EventBusAdapter } from '../src/adapters/driven/events/event-bus.adapter';
import { EpicId } from '../src/core/domain/value-objects/identifier';

const acceptanceCriteria = [
  'Badge deve ter variantes: success, warning, error, info, neutral',
  'Badge deve aceitar children para conteúdo customizado',
  'Badge deve ser acessível (ARIA labels apropriados)',
  'Badge deve ter Storybook stories documentando todas as variantes',
  'Badge deve ter testes unitários',
  'Badge deve seguir o padrão de Atomic Design (Atom)',
  'Badge deve ser publicado no npm como parte do design system',
];

async function createBadgeStory(epicId: string) {
  try {
    // Verificar se o Epic existe
    const epicRepository = new EpicPrismaRepository();
    const epic = await epicRepository.findById(EpicId.create(epicId));
    
    if (!epic) {
      throw new Error(`Epic com ID ${epicId} não encontrado`);
    }

    // Verificar se já existe uma story com o mesmo título
    const storyRepository = new StoryPrismaRepository();
    const existingStories = await storyRepository.findByEpicId(EpicId.create(epicId));
    const storyTitle = 'Como desenvolvedor, quero um componente Badge para exibir status e prioridade';
    
    const existingStory = existingStories.find(s => s.getTitle() === storyTitle);
    if (existingStory) {
      console.log('ℹ️  Story já existe!');
      console.log(`ID: ${existingStory.id.getValue()}`);
      console.log(`Title: ${existingStory.getTitle()}`);
      return existingStory;
    }

    const eventBus = new EventBusAdapter();
    const useCase = new CreateStoryUseCase(storyRepository, epicRepository, eventBus);

    const story = await useCase.execute({
      title: 'Como desenvolvedor, quero um componente Badge para exibir status e prioridade',
      description: 'Preciso de um componente Badge reutilizável que possa exibir diferentes variantes (success, warning, error, info) para representar status e prioridade de Epics, Stories e Tasks de forma consistente.',
      as: 'Desenvolvedor',
      iWant: 'um componente Badge reutilizável',
      soThat: 'possa exibir status e prioridade de forma consistente em toda a aplicação',
      acceptanceCriteria,
      storyPoints: 3,
      priority: 'MEDIUM',
      epicId,
    });

    console.log('✅ Story criada com sucesso!');
    console.log(`ID: ${story.id.getValue()}`);
    console.log(`Title: ${story.getTitle()}`);
    console.log(`Status: ${story.getStatus().getValue()}`);
    console.log(`Priority: ${story.getPriority().getValue()}`);
    console.log(`Story Points: ${story.getStoryPoints()?.getValue() || 'N/A'}`);
    console.log(`Epic ID: ${story.getEpicId()?.getValue() || 'N/A'}`);
    console.log(`Acceptance Criteria: ${acceptanceCriteria.length} itens`);
    console.log(`\nAcesse: http://localhost:5001/epics/${epicId}`);
    
    return story;
  } catch (error) {
    console.error('❌ Erro ao criar Story:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const epicId = process.argv[2];
  
  if (!epicId) {
    console.error('❌ Por favor, forneça o ID do Epic como argumento');
    console.log('Uso: npx tsx scripts/create-badge-story.ts <epicId>');
    process.exit(1);
  }

  createBadgeStory(epicId)
    .then(() => {
      console.log('\n✅ Script concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro no script:', error);
      process.exit(1);
    });
}

export { createBadgeStory };
