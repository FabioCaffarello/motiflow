'use client';

import React from 'react';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import type { FlowEdgeData } from '@fabio.caffarello/react-design-system/organisms/Flow';

/**
 * Workflow Edge Data
 */
export interface WorkflowEdgeData extends FlowEdgeData {
  condition?: string;
  type?: 'default' | 'conditional' | 'error';
}

/**
 * WorkflowEdge Component
 * 
 * Specialized edge for Motia workflows.
 */
export const WorkflowEdge = React.memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style,
  markerEnd,
  markerStart,
}: EdgeProps<WorkflowEdgeData>) => {
  const edgeType = data?.type || 'default';
  const isConditional = edgeType === 'conditional';
  const isError = edgeType === 'error';
  
  const edgeColor = isError ? 'red' : isConditional ? 'orange' : 'gray';
  const strokeWidth = selected ? 3 : 2;
  
  const edgeStyle: React.CSSProperties = {
    ...style,
    stroke: edgeColor,
    strokeWidth,
    strokeDasharray: isConditional ? '5 5' : undefined,
  };
  
  return (
    <>
      <BaseEdge
        id={id}
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        sourcePosition={sourcePosition}
        targetPosition={targetPosition}
        style={edgeStyle}
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2}px)`,
            }}
            className={`
              px-2 py-1
              bg-white dark:bg-gray-800
              rounded
              text-xs
              border
              ${isError ? 'border-red-500 text-red-600' : ''}
              ${isConditional ? 'border-orange-500 text-orange-600' : ''}
            `}
          >
            {data.label}
            {data.condition && (
              <div className="text-xs text-gray-500 mt-1">
                {data.condition}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.sourceX === next.sourceX &&
    prev.sourceY === next.sourceY &&
    prev.targetX === next.targetX &&
    prev.targetY === next.targetY &&
    prev.selected === next.selected &&
    prev.data === next.data
  );
});

WorkflowEdge.displayName = 'WorkflowEdge';
