'use client';

import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FlowNodeWrapper, FlowHandle } from '@fabio.caffarello/react-design-system/atoms/Flow';
import { Badge } from '@fabio.caffarello/react-design-system';
import type { FlowNodeData } from '@fabio.caffarello/react-design-system/organisms/Flow';

/**
 * Process Node Data
 */
export interface ProcessNodeData extends FlowNodeData {
  processType?: 'start' | 'process' | 'decision' | 'end' | 'subprocess';
  owner?: string;
  duration?: string;
  participants?: string[];
}

/**
 * ProcessNode Component
 * 
 * Specialized node for business process diagrams.
 */
export const ProcessNode = React.memo(({
  data,
  selected,
}: NodeProps<ProcessNodeData>) => {
  const variant = data.processType === 'start' ? 'success' :
                  data.processType === 'end' ? 'error' :
                  data.processType === 'decision' ? 'warning' :
                  data.variant || 'default';
  
  // Shape based on process type
  const shapeClass = data.processType === 'decision' ? 'rounded-full' :
                     data.processType === 'start' || data.processType === 'end' ? 'rounded-full' :
                     'rounded-lg';
  
  return (
    <FlowNodeWrapper
      variant={variant}
      size="md"
      selected={selected}
      className={shapeClass}
    >
      {/* Target handles (not for start nodes) */}
      {data.processType !== 'start' && (
        <FlowHandle
          type="target"
          position={Position.Top}
          variant={variant}
        />
      )}
      
      {/* Node content */}
      <div className="flex flex-col gap-2 min-w-[180px] text-center">
        <div className="flex items-center justify-center gap-2">
          {data.icon}
          <span className="font-semibold">{data.label}</span>
        </div>
        
        {data.description && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data.description}
          </div>
        )}
        
        {data.processType && (
          <Badge variant={variant} size="sm">
            {data.processType}
          </Badge>
        )}
        
        {data.owner && (
          <div className="text-xs text-gray-500">
            Owner: {data.owner}
          </div>
        )}
        
        {data.duration && (
          <div className="text-xs text-gray-500">
            Duration: {data.duration}
          </div>
        )}
        
        {data.participants && data.participants.length > 0 && (
          <div className="text-xs text-gray-500">
            {data.participants.length} participant{data.participants.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Source handles (not for end nodes) */}
      {data.processType !== 'end' && (
        <FlowHandle
          type="source"
          position={Position.Bottom}
          variant={variant}
        />
      )}
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

ProcessNode.displayName = 'ProcessNode';
