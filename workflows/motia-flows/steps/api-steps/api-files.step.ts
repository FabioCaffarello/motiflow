import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'api-process-files',
  path: '/api/process-files',
  method: 'POST',
  emits: [{topic: 'spark.process.csv'}],
  bodySchema: z.object({
    fileUri: z.string(),
  }),
  responseSchema: {
    200: z.object({ message: z.string() }),
  },
  flows: ['files-processing-flow'],
}

export const handler: Handlers['api-process-files'] = async (req, ctx) => {
  const { emit, logger } = ctx;
  const { fileUri } = req.body;
  logger.info('API Step - Processing file', { fileUri });
  await emit({
    topic: 'spark.process.csv',
    data: { fileUri },
  })
  return { status: 200, body: { message: 'Pipeline triggered',
    fileUri
   } }
}