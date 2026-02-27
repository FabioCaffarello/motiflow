'use client';

import React from 'react';
import { FlowCanvas, FlowProvider, useFlowState } from '@fabio.caffarello/react-design-system';
import { WorkflowNode } from './WorkflowNode';
import { WorkflowEdge } from './WorkflowEdge';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData, WorkflowEdgeData } from './WorkflowNode';

/**
 * Workflow type (simplified - adjust based on actual Motia workflow structure)
 */
export interface Workflow {
  id: string;
  name: string;
  steps: Array<{
    id: string;
    name: string;
    type: 'api' | 'event' | 'ui' | 'cron' | 'virtual';
    status?: 'pending' | 'running' | 'completed' | 'failed';
    position?: { x: number; y: number };
  }>;
  connections: Array<{
    from: string;
    to: string;
    condition?: string;
  }>;
}

/**
 * WorkflowFlow Component
 * 
 * Specialized flow component for visualizing Motia workflows.
 */
export interface WorkflowFlowProps {
  workflow: Workflow;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  className?: string;
}

export function WorkflowFlow({
  workflow,
  onNodeClick,
  onEdgeClick,
  className = '',
}: WorkflowFlowProps) {
  // Convert workflow to nodes and edges
  const initialNodes: Node<WorkflowNodeData>[] = workflow.steps.map((step) => ({
    id: step.id,
    type: 'workflow',
    position: step.position || { x: 0, y: 0 },
    data: {
      label: step.name,
      stepType: step.type,
      status: step.status || 'pending',
      stepName: step.name,
    },
  }));
  
  const initialEdges: Edge<WorkflowEdgeData>[] = workflow.connections.map((conn, index) => ({
    id: `edge-${conn.from}-${conn.to}-${index}`,
    type: 'workflow',
    source: conn.from,
    target: conn.to,
    data: {
      label: conn.condition ? 'Condition' : undefined,
      condition: conn.condition,
      type: conn.condition ? 'conditional' : 'default',
    },
  }));
  
  // Define node and edge types
  const workflowNodeTypes = {
    workflow: WorkflowNode,
  };
  
  const workflowEdgeTypes = {
    workflow: WorkflowEdge,
  };
  
  // Use flow state
  const flowState = useFlowState<WorkflowNodeData, WorkflowEdgeData>(
    initialNodes,
    initialEdges
  );
  
  return (
    <FlowProvider
      nodes={flowState.nodes}
      edges={flowState.edges}
      onNodesChange={flowState.onNodesChange}
      onEdgesChange={flowState.onEdgesChange}
      nodeTypes={workflowNodeTypes}
      edgeTypes={workflowEdgeTypes}
      theme="light"
    >
      <div className={`w-full h-full ${className}`}>
        <FlowCanvas.Root
          onNodeClick={(event) => {
            const nodeId = event.node?.id;
            if (nodeId) {
              onNodeClick?.(nodeId);
            }
          }}
          onEdgeClick={(event) => {
            const edgeId = event.edge?.id;
            if (edgeId) {
              onEdgeClick?.(edgeId);
            }
          }}
        >
          <FlowCanvas.Background />
          <FlowCanvas.Controls />
          <FlowCanvas.MiniMap />
        </FlowCanvas.Root>
      </div>
    </FlowProvider>
  );
}
