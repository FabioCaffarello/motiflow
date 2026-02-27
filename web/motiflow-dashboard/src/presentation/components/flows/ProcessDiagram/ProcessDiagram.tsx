'use client';

import React from 'react';
import { FlowCanvas, FlowProvider, useFlowState } from '@fabio.caffarello/react-design-system';
import { ProcessNode } from './ProcessNode';
import type { Node, Edge } from '@xyflow/react';
import type { ProcessNodeData } from './ProcessNode';

/**
 * Process Node
 */
export interface ProcessDiagramNode {
  id: string;
  name: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'subprocess';
  description?: string;
  owner?: string;
  duration?: string;
  participants?: string[];
  position?: { x: number; y: number };
}

/**
 * Process Connection
 */
export interface ProcessConnection {
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

/**
 * ProcessDiagram Component
 * 
 * Specialized flow component for business process diagrams.
 */
export interface ProcessDiagramProps {
  nodes: ProcessDiagramNode[];
  connections: ProcessConnection[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export function ProcessDiagram({
  nodes: processNodes,
  connections,
  onNodeClick,
  className = '',
}: ProcessDiagramProps) {
  // Convert to React Flow nodes
  const initialNodes: Node<ProcessNodeData>[] = processNodes.map((node) => ({
    id: node.id,
    type: 'process',
    position: node.position || { x: 0, y: 0 },
    data: {
      label: node.name,
      processType: node.type,
      description: node.description,
      owner: node.owner,
      duration: node.duration,
      participants: node.participants,
    },
  }));
  
  const initialEdges: Edge[] = connections.map((conn, index) => ({
    id: `edge-${conn.from}-${conn.to}-${index}`,
    type: 'default',
    source: conn.from,
    target: conn.to,
    data: {
      label: conn.label || conn.condition,
    },
  }));
  
  // Define node types
  const processNodeTypes = {
    process: ProcessNode,
  };
  
  // Use flow state
  const flowState = useFlowState<ProcessNodeData>(initialNodes, initialEdges);
  
  return (
    <FlowProvider
      nodes={flowState.nodes}
      edges={flowState.edges}
      onNodesChange={flowState.onNodesChange}
      onEdgesChange={flowState.onEdgesChange}
      nodeTypes={processNodeTypes}
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
        >
          <FlowCanvas.Background />
          <FlowCanvas.Controls />
          <FlowCanvas.MiniMap />
        </FlowCanvas.Root>
      </div>
    </FlowProvider>
  );
}
