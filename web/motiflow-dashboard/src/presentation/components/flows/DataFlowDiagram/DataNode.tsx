'use client';

import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FlowNodeWrapper, FlowHandle } from '@fabio.caffarello/react-design-system/atoms/Flow';
import { Badge } from '@fabio.caffarello/react-design-system';
import type { FlowNodeData } from '@fabio.caffarello/react-design-system/organisms/Flow';

/**
 * Data Node Data
 */
export interface DataNodeData extends FlowNodeData {
  dataType?: 'source' | 'transform' | 'sink' | 'filter' | 'aggregate';
  schema?: Record<string, string>;
  recordCount?: number;
}

/**
 * DataNode Component
 * 
 * Specialized node for data flow diagrams.
 */
export const DataNode = React.memo(({
  data,
  selected,
}: NodeProps<DataNodeData>) => {
  const variant = data.dataType === 'source' ? 'success' :
                  data.dataType === 'sink' ? 'primary' :
                  data.dataType === 'transform' ? 'info' :
                  data.variant || 'default';
  
  return (
    <FlowNodeWrapper
      variant={variant}
      size="lg"
      selected={selected}
    >
      {/* Target handles (only for non-source nodes) */}
      {data.dataType !== 'source' && (
        <FlowHandle
          type="target"
          position={Position.Top}
          variant={variant}
        />
      )}
      
      {/* Node content */}
      <div className="flex flex-col gap-2 min-w-[250px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {data.icon}
            <span className="font-semibold">{data.label}</span>
          </div>
          {data.dataType && (
            <Badge variant={variant} size="sm">
              {data.dataType}
            </Badge>
          )}
        </div>
        
        {data.description && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data.description}
          </div>
        )}
        
        {data.recordCount !== undefined && (
          <div className="text-xs text-gray-500">
            {data.recordCount.toLocaleString()} records
          </div>
        )}
        
        {data.schema && Object.keys(data.schema).length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium mb-1">Schema:</div>
            <div className="text-xs space-y-1">
              {Object.entries(data.schema).slice(0, 3).map(([key, type]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                  <span className="text-gray-500">{type}</span>
                </div>
              ))}
              {Object.keys(data.schema).length > 3 && (
                <div className="text-gray-500">
                  +{Object.keys(data.schema).length - 3} more fields
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Source handles (only for non-sink nodes) */}
      {data.dataType !== 'sink' && (
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

DataNode.displayName = 'DataNode';
