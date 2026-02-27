'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createStory } from '@/adapters/driving/actions/story.actions';
import { listEpics } from '@/adapters/driving/actions/epic.actions';
import { StoryForm } from '@/presentation/components';
import { Text, Breadcrumb } from '@fabio.caffarello/react-design-system';

export default function NewStoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const epicId = searchParams.get('epicId');
  
  const [state, formAction, isPending] = useActionState(createStoryAction, null);
  const [epics, setEpics] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    // Load epics for dropdown using Server Action
    listEpics().then(result => {
      if (result.success) {
        const epicsData = Array.isArray(result.data) 
          ? result.data 
          : result.data.epics;
        setEpics(epicsData.map((epic: any) => ({ id: epic.id, title: epic.title })));
      }
    });
  }, []);

  useEffect(() => {
    if (state?.success) {
      if (state.data.epicId) {
        router.push(`/epics/${state.data.epicId}`);
      } else {
        router.push('/stories');
      }
    }
  }, [state, router]);

  async function createStoryAction(
    prevState: any,
    formData: FormData
  ): Promise<any> {
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || undefined;
    const as = formData.get('as') as string;
    const iWant = formData.get('iWant') as string;
    const soThat = formData.get('soThat') as string;
    
    // Extract acceptance criteria from form data
    const acceptanceCriteriaList: string[] = [];
    let index = 0;
    while (formData.get(`acceptanceCriteria_${index}`)) {
      const criteria = formData.get(`acceptanceCriteria_${index}`) as string;
      if (criteria.trim().length > 0) {
        acceptanceCriteriaList.push(criteria);
      }
      index++;
    }
    
    const storyPoints = formData.get('storyPoints') 
      ? parseInt(formData.get('storyPoints') as string) 
      : undefined;
    const status = (formData.get('status') as string) || 'BACKLOG';
    const priority = (formData.get('priority') as string) || 'MEDIUM';
    const epicIdValue = (formData.get('epicId') as string) || undefined;

    return createStory(
      title,
      as,
      iWant,
      soThat,
      description,
      acceptanceCriteriaList.length > 0 ? acceptanceCriteriaList : undefined,
      storyPoints,
      priority,
      epicIdValue
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Stories', href: '/stories' },
            { label: 'Create New Story' },
          ]}
          className="mb-4"
        />
        <Text as="h1" className="text-3xl font-bold text-gray-900">
          Create New User Story
        </Text>
        <Text as="p" className="mt-2 text-sm text-gray-600">
          Create a new user story following the "As a... I want... So that..." format
        </Text>
      </div>

      <StoryForm
        formAction={formAction}
        loading={isPending}
        error={state?.success === false ? state.error : null}
        submitLabel="Create Story"
        cancelHref={epicId ? `/epics/${epicId}` : '/stories'}
        epics={epics}
        initialData={epicId ? { epicId } : undefined}
      />
    </div>
  );
}
