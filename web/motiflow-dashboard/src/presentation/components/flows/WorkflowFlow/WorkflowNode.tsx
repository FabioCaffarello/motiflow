'use client';

import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FlowNodeWrapper, FlowHandle } from '@fabio.caffarello/react-design-system/atoms/Flow';
import { Badge } from '@fabio.caffarello/react-design-system';
import type { FlowNodeData } from '@fabio.caffarello/react-design-system/organisms/Flow';

/**
 * Workflow Node Data
 */
export interface WorkflowNodeData extends FlowNodeData {
  stepType?: 'api' | 'event' | 'ui' | 'cron' | 'virtual';
  status?: 'pending' | 'running' | 'completed' | 'failed';
  stepName?: string;
}

/**
 * WorkflowNode Component
 * 
 * Specialized node for Motia workflows.
 */
export const WorkflowNode = React.memo(({
  data,
  selected,
}: NodeProps<WorkflowNodeData>) => {
  const variant = data.status === 'failed' ? 'error' :
                  data.status === 'completed' ? 'success' :
                  data.status === 'running' ? 'primary' :
                  data.variant || 'default';
  
  return (
    <FlowNodeWrapper
      variant={variant}
      size="md"
      selected={selected}
    >
      {/* Target handles */}
      <FlowHandle
        type="target"
        position={Position.Top}
        variant={variant}
      />
      
      {/* Node content */}
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {data.icon}
            <span className="font-semibold">{data.label || data.stepName}</span>
          </div>
          {data.stepType && (
            <Badge variant={variant} size="sm">
              {data.stepType}
            </Badge>
          )}
        </div>
        
        {data.description && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data.description}
          </div>
        )}
        
        {data.status && (
          <div className="flex items-center gap-2 text-xs">
            <span className={`capitalize ${getStatusColor(data.status)}`}>
              {data.status}
            </span>
          </div>
        )}
      </div>
      
      {/* Source handles */}
      <FlowHandle
        type="source"
        position={Position.Bottom}
        variant={variant}
      />
    </FlowNodeWrapper>
  );
}, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.selected === next.selected &&
    prev.position.x === next.position.x &&
    prev.position.y === next.position.y
  );
});

WorkflowNode.displayName = 'WorkflowNode';

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'running':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}
