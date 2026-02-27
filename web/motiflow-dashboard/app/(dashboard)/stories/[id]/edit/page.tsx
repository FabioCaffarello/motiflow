'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getStory, updateStory } from '@/adapters/driving/actions/story.actions';
import { listEpics } from '@/adapters/driving/actions/epic.actions';
import { StoryForm } from '@/presentation/components';
import { Text, Breadcrumb } from '@fabio.caffarello/react-design-system';
import { StoryPrismaRepository } from '@/adapters/driven/persistence/prisma/story-prisma-repository';
import { StoryId } from '@/core/domain/value-objects/identifier';

export default function EditStoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [state, formAction, isPending] = useActionState(updateStoryAction, null);
  const [story, setStory] = useState<any>(null);
  const [epics, setEpics] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load story and epics data
    const loadData = async () => {
      const [storyResult, epicsResult] = await Promise.all([
        getStory(id),
        listEpics()
      ]);

      if (storyResult.success) {
        const storyData = storyResult.data;
        // Load acceptance criteria from entity
        try {
          const repository = new StoryPrismaRepository();
          const storyEntity = await repository.findById(StoryId.create(id));
          if (storyEntity) {
            storyData.acceptanceCriteria = storyEntity.getAcceptanceCriteria().map(ac => ac.getDescription());
          }
        } catch (err) {
          console.error('Error loading acceptance criteria:', err);
        }
        setStory(storyData);
      }
      if (epicsResult.success) {
        const epicsData = Array.isArray(epicsResult.data) 
          ? epicsResult.data 
          : epicsResult.data.epics;
        setEpics(epicsData.map((epic: any) => ({ id: epic.id, title: epic.title })));
      }
      setLoading(false);
    };

    loadData();
  }, [id]);

  useEffect(() => {
    if (state?.success) {
      router.push(`/stories/${id}`);
    }
  }, [state, router, id]);

  async function updateStoryAction(
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
    const epicId = (formData.get('epicId') as string) || undefined;

    return updateStory(id, {
      title,
      description,
      as,
      iWant,
      soThat,
      acceptanceCriteria: acceptanceCriteriaList.length > 0 ? acceptanceCriteriaList : undefined,
      storyPoints,
      status,
      priority,
      epicId,
    });
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <Text as="p">Loading...</Text>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <Text as="h1" className="text-2xl font-bold text-gray-900 mb-4">
          Story Not Found
        </Text>
        <Text as="p" className="text-gray-600 mb-6">
          The story you are looking for does not exist.
        </Text>
        <a
          href="/stories"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Stories
        </a>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Stories', href: '/stories' },
            { label: story.title, href: `/stories/${id}` },
            { label: 'Edit' },
          ]}
          className="mb-4"
        />
        <Text as="h1" className="text-3xl font-bold text-gray-900">
          Edit Story
        </Text>
        <Text as="p" className="mt-2 text-sm text-gray-600">
          Update story information
        </Text>
      </div>

      <StoryForm
        formAction={formAction}
        loading={isPending}
        error={state?.success === false ? state.error : null}
        submitLabel="Update Story"
        cancelHref={`/stories/${id}`}
        epics={epics}
        initialData={{
          title: story.title,
          description: story.description,
          as: story.as,
          iWant: story.iWant,
          soThat: story.soThat,
          storyPoints: story.storyPoints,
          status: story.status,
          priority: story.priority,
          epicId: story.epicId,
        }}
      />
    </div>
  );
}
