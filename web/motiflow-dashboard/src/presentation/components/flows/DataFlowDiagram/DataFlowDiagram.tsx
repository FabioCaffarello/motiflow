'use client';

import React from 'react';
import { FlowCanvas, FlowProvider, useFlowState } from '@fabio.caffarello/react-design-system';
import { DataNode } from './DataNode';
import type { Node, Edge } from '@xyflow/react';
import type { DataNodeData } from './DataNode';

/**
 * Data Flow Node
 */
export interface DataFlowNode {
  id: string;
  name: string;
  type: 'source' | 'transform' | 'sink' | 'filter' | 'aggregate';
  description?: string;
  schema?: Record<string, string>;
  recordCount?: number;
  position?: { x: number; y: number };
}

/**
 * Data Flow Connection
 */
export interface DataFlowConnection {
  from: string;
  to: string;
  label?: string;
}

/**
 * DataFlowDiagram Component
 * 
 * Specialized flow component for data flow diagrams.
 */
export interface DataFlowDiagramProps {
  nodes: DataFlowNode[];
  connections: DataFlowConnection[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export function DataFlowDiagram({
  nodes: dataNodes,
  connections,
  onNodeClick,
  className = '',
}: DataFlowDiagramProps) {
  // Convert to React Flow nodes
  const initialNodes: Node<DataNodeData>[] = dataNodes.map((node) => ({
    id: node.id,
    type: 'data',
    position: node.position || { x: 0, y: 0 },
    data: {
      label: node.name,
      dataType: node.type,
      description: node.description,
      schema: node.schema,
      recordCount: node.recordCount,
    },
  }));
  
  const initialEdges: Edge[] = connections.map((conn, index) => ({
    id: `edge-${conn.from}-${conn.to}-${index}`,
    type: 'default',
    source: conn.from,
    target: conn.to,
    data: {
      label: conn.label,
    },
  }));
  
  // Define node types
  const dataNodeTypes = {
    data: DataNode,
  };
  
  // Use flow state
  const flowState = useFlowState<DataNodeData>(initialNodes, initialEdges);
  
  return (
    <FlowProvider
      nodes={flowState.nodes}
      edges={flowState.edges}
      onNodesChange={flowState.onNodesChange}
      onEdgesChange={flowState.onEdgesChange}
      nodeTypes={dataNodeTypes}
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
