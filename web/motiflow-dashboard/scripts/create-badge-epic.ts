/**
 * Script para criar o Epic do Badge Component no dashboard
 * 
 * Execute: npx tsx scripts/create-badge-epic.ts
 */

import { CreateEpicUseCase } from '../src/core/application/use-cases/epic/create-epic.use-case';
import { EpicPrismaRepository } from '../src/adapters/driven/persistence/prisma/epic-prisma-repository';
import { EventBusAdapter } from '../src/adapters/driven/events/event-bus.adapter';

const epicDescription = `Criar componente Badge no design system para exibir status e prioridade de forma consistente em toda a aplicação. O Badge substituirá os spans inline atuais e padronizará a visualização de estados.

## Objetivo
Desenvolver um componente Badge reutilizável que possa exibir diferentes variantes (success, warning, error, info) para representar status e prioridade de Epics, Stories e Tasks de forma consistente.

## Benefícios
- Consistência visual em toda a aplicação
- Facilita manutenção e evolução
- Melhora acessibilidade
- Segue padrões do design system`;

async function createBadgeEpic() {
  try {
    const repository = new EpicPrismaRepository();
    const eventBus = new EventBusAdapter();
    const useCase = new CreateEpicUseCase(repository, eventBus);

    const epic = await useCase.execute({
      title: 'Evoluir Design System - Badge Component',
      description: epicDescription,
      priority: 'MEDIUM',
    });

    console.log('✅ Epic criado com sucesso!');
    console.log(`ID: ${epic.id.getValue()}`);
    console.log(`Title: ${epic.getTitle()}`);
    console.log(`Status: ${epic.getStatus().getValue()}`);
    console.log(`Priority: ${epic.getPriority().getValue()}`);
    console.log(`\nAcesse: http://localhost:5001/epics/${epic.id.getValue()}`);
    
    return epic;
  } catch (error) {
    console.error('❌ Erro ao criar Epic:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createBadgeEpic()
    .then(() => {
      console.log('\n✅ Script concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro no script:', error);
      process.exit(1);
    });
}

export { createBadgeEpic };
