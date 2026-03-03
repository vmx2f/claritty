"use client";

import { useState, useCallback, useRef, DragEvent, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
    Handle,
    Position,
    MarkerType,
    ReactFlowProvider,
    useReactFlow,
    NodeTypes,
    Panel,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import {
    PlusIcon,
    PlayCircleIcon,
    StopCircleIcon,
    QuestionMarkCircleIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftOnRectangleIcon,
    CubeIcon,
    TrashIcon,
    XMarkIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import { FLOW_HANDLE_STYLE } from '@/app/_constants/flow-chart';

// --- Custom Node Components ---

// Common styles for handles
const GenericHandle = ({ type, position, id }: { type: 'source' | 'target', position: Position, id?: string }) => (
    <Handle
        type={type}
        position={position}
        id={id || `${type}-${position}`}
        style={FLOW_HANDLE_STYLE}
        // Handles are hidden by default and shown on hover ("group-hover") of the node
        className="!border-2 !border-main opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    />
);

const NodeWrapper = ({ children, selected, className }: { children: React.ReactNode, selected?: boolean, className?: string }) => (
    <div className={`relative group transition-all duration-200 ${selected ? 'ring-2 ring-accent-color shadow-lg' : 'shadow-sm'} ${className}`}>
        {children}
    </div>
);

const StartNode = ({ data, selected }: { data: { label: string }, selected?: boolean }) => (
    <NodeWrapper selected={selected} className={`w-[140px] h-[50px] rounded-full border-2 bg-card flex items-center justify-center ${selected ? 'border-accent-color' : 'border-primary-text'}`}>
        <PlayCircleIcon className={`w-5 h-5 mr-2 ${selected ? 'text-accent-color' : 'text-primary-text'}`} />
        <span className={`text-sm font-bold truncate ${selected ? 'text-accent-color' : 'text-primary-text'}`}>{data.label}</span>
        {/* Start can only be a source */}
        <GenericHandle type="source" position={Position.Top} />
        <GenericHandle type="source" position={Position.Right} />
        <GenericHandle type="source" position={Position.Bottom} />
        <GenericHandle type="source" position={Position.Left} />
    </NodeWrapper>
);

const EndNode = ({ data, selected }: { data: { label: string }, selected?: boolean }) => (
    <NodeWrapper selected={selected} className={`w-[140px] h-[50px] rounded-full border-2 bg-card flex items-center justify-center ${selected ? 'border-accent-color' : 'border-primary-text'}`}>
        <StopCircleIcon className={`w-5 h-5 mr-2 ${selected ? 'text-accent-color' : 'text-primary-text'}`} />
        <span className={`text-sm font-bold truncate ${selected ? 'text-accent-color' : 'text-primary-text'}`}>{data.label}</span>
        {/* End can only be a target */}
        <GenericHandle type="target" position={Position.Top} />
        <GenericHandle type="target" position={Position.Right} />
        <GenericHandle type="target" position={Position.Bottom} />
        <GenericHandle type="target" position={Position.Left} />
    </NodeWrapper>
);

const DecisionNode = ({ data, selected }: { data: { label: string }, selected?: boolean }) => (
    <div className="relative w-32 h-32 flex items-center justify-center group">
        <div className={`absolute inset-0 rotate-45 border-2 bg-card shadow-sm rounded-sm transition-all duration-200 group-hover:shadow-md ${selected ? 'border-accent-color ring-2 ring-accent-color' : 'border-primary-text'}`}></div>
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none p-2">
            <QuestionMarkCircleIcon className={`w-6 h-6 mb-1 ${selected ? 'text-accent-color' : 'text-primary-text'}`} />
            <span className={`text-xs font-bold text-center leading-tight max-w-[80px] break-words ${selected ? 'text-accent-color' : 'text-primary-text'}`}>{data.label}</span>
        </div>
        <GenericHandle type="target" position={Position.Top} />
        <GenericHandle type="source" position={Position.Right} />
        <GenericHandle type="source" position={Position.Bottom} />
        <GenericHandle type="target" position={Position.Left} />
    </div>
);

const InputNode = ({ data, selected }: { data: { label: string }, selected?: boolean }) => (
    <div className={`w-[160px] h-[60px] transform -skew-x-12 border-2 bg-card shadow-sm flex items-center justify-center relative group hover:shadow-md transition-all duration-200 ${selected ? 'border-accent-color ring-2 ring-accent-color' : 'border-primary-text'}`}>
        <div className="transform skew-x-12 flex items-center justify-center w-full px-4">
            <ArrowRightOnRectangleIcon className={`w-5 h-5 mr-2 shrink-0 ${selected ? 'text-accent-color' : 'text-primary-text'}`} />
            <span className={`text-sm font-medium truncate ${selected ? 'text-accent-color' : 'text-primary-text'}`}>{data.label}</span>
        </div>
        <GenericHandle type="target" position={Position.Top} />
        <GenericHandle type="target" position={Position.Left} />
        <GenericHandle type="source" position={Position.Bottom} />
        <GenericHandle type="source" position={Position.Right} />
    </div>
);

const OutputNode = ({ data, selected }: { data: { label: string }, selected?: boolean }) => (
    <div className={`w-[160px] h-[60px] transform skew-x-12 border-2 bg-card shadow-sm flex items-center justify-center relative group hover:shadow-md transition-all duration-200 ${selected ? 'border-accent-color ring-2 ring-accent-color' : 'border-primary-text'}`}>
        <div className="transform -skew-x-12 flex items-center justify-center w-full px-4">
            <ArrowLeftOnRectangleIcon className={`w-5 h-5 mr-2 shrink-0 ${selected ? 'text-accent-color' : 'text-primary-text'}`} />
            <span className={`text-sm font-medium truncate ${selected ? 'text-accent-color' : 'text-primary-text'}`}>{data.label}</span>
        </div>
        <GenericHandle type="target" position={Position.Top} />
        <GenericHandle type="target" position={Position.Left} />
        <GenericHandle type="source" position={Position.Bottom} />
        <GenericHandle type="source" position={Position.Right} />
    </div>
);

const ProcessNode = ({ data, selected }: { data: { label: string }, selected?: boolean }) => (
    <NodeWrapper selected={selected} className={`w-[160px] min-h-[60px] border-2 bg-card rounded-lg p-3 flex items-center justify-center ${selected ? 'border-accent-color' : 'border-primary-text'}`}>
        <CubeIcon className={`w-5 h-5 mr-2 ${selected ? 'text-accent-color' : 'text-primary-text'}`} />
        <span className={`text-sm font-medium break-words ${selected ? 'text-accent-color' : 'text-primary-text'}`}>{data.label}</span>

        <GenericHandle type="target" position={Position.Top} />
        <GenericHandle type="target" position={Position.Left} />
        <GenericHandle type="source" position={Position.Bottom} />
        <GenericHandle type="source" position={Position.Right} />
    </NodeWrapper>
);

const nodeTypes: NodeTypes = {
    start: StartNode,
    end: EndNode,
    decision: DecisionNode,
    input: InputNode,
    output: OutputNode,
    process: ProcessNode,
};

// --- Context Menu Component ---

const ContextMenu = ({
    type,
    top,
    left,
    right,
    bottom,
    onDelete,
    onRename,
    onClose
}: {
    type: string;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    onDelete: () => void;
    onRename: () => void;
    onClose: () => void;
}) => {
    const isProtected = type === 'start' || type === 'end';

    return (
        <div
            style={{ top, left, right, bottom }}
            className="absolute z-50 bg-card border border-border shadow-md rounded-lg p-1 min-w-[150px] animate-in fade-in zoom-in duration-200"
        >
            <div className="flex items-center justify-between px-2 py-1 border-b border-border mb-1">
                <span className="text-xs font-semibold text-secondary-text">Options</span>
                <button onClick={onClose} className="text-secondary-text hover:text-primary-text">
                    <XMarkIcon className="w-3 h-3" />
                </button>
            </div>

            <button
                onClick={onRename}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm text-primary-text hover:bg-hover rounded transition-colors"
            >
                <PencilIcon className="w-4 h-4" />
                Rename
            </button>

            {!isProtected && (
                <button
                    onClick={onDelete}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm text-error hover:bg-error/10 rounded transition-colors"
                >
                    <TrashIcon className="w-4 h-4" />
                    Delete Node
                </button>
            )}
        </div>
    );
};

// --- Rename Dialog ---

const RenameDialog = ({
    initialValue,
    onSave,
    onCancel
}: {
    initialValue: string;
    onSave: (val: string) => void;
    onCancel: () => void;
}) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="bg-card p-4 rounded-xl border border-border shadow-2xl w-[300px] animate-in fade-in zoom-in duration-200">
                <h3 className="text-sm font-bold text-primary-text mb-3">Rename Node</h3>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onSave(value);
                        if (e.key === 'Escape') onCancel();
                    }}
                    className="w-full px-3 py-2 bg-main border border-border rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-accent-color mb-4"
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-xs font-medium text-secondary-text hover:text-primary-text"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(value)}
                        className="px-3 py-1.5 text-xs font-medium bg-accent-color text-main rounded-lg hover:brightness-90 transition-all"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Config ---

const initialNodes: Node[] = [
    { id: 'start', position: { x: 300, y: 50 }, data: { label: 'Start' }, type: 'start', deletable: false },
    { id: 'end', position: { x: 300, y: 500 }, data: { label: 'End' }, type: 'end', deletable: false },
];

let id = 1;
const getId = () => `node_${id++}_${Date.now()}`;

// --- Components ---

const ToolboxItem = ({ type, label, icon: Icon, disabled }: { type: string, label: string, icon: any, disabled?: boolean }) => {
    const onDragStart = (event: DragEvent, nodeType: string) => {
        if (disabled) return;
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className={`flex items-center gap-2 p-2 rounded-lg border border-border bg-main transition-all cursor-grab active:cursor-grabbing hover:bg-hover hover:border-accent-color
            ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'shadow-sm'}`}
            onDragStart={(event) => onDragStart(event, type)}
            draggable={!disabled}
            title={label}
        >
            <Icon className="w-5 h-5 text-primary-text" />
            <span className="text-xs font-medium text-primary-text hidden xl:block">{label}</span>
        </div>
    );
};

function FlowChart() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [menu, setMenu] = useState<{ id: string, type: string, top?: number, left?: number, right?: number, bottom?: number } | null>(null);
    const [editingNode, setEditingNode] = useState<{ id: string, label: string } | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition, deleteElements } = useReactFlow();

    // Check for Start/End existence
    const hasStart = nodes.some(n => n.type === 'start');
    const hasEnd = nodes.some(n => n.type === 'end');

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({
            ...params,
            animated: true,
            style: { stroke: 'var(--primary-text)', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--primary-text)' }
        }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            if (type === 'start' && hasStart) return;
            if (type === 'end' && hasEnd) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)}` },
                deletable: (type !== 'start' && type !== 'end'), // explicit safety
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, hasStart, hasEnd, setNodes],
    );

    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
            event.preventDefault();

            // Calculate position relative to container
            const pane = ref.current?.getBoundingClientRect();
            if (!pane) return;

            setMenu({
                id: node.id,
                type: node.type || 'default',
                top: event.clientY - pane.top,
                left: event.clientX - pane.left,
            });
        },
        [setMenu],
    );

    const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
        setEditingNode({ id: node.id, label: node.data.label as string });
    }, []);

    const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

    const onDeleteNode = useCallback(() => {
        if (menu) {
            // Extra safety check (though button is hidden)
            if (menu.type === 'start' || menu.type === 'end') return;
            deleteElements({ nodes: [{ id: menu.id }] });
            setMenu(null);
        }
    }, [menu, deleteElements]);

    const onStartRename = useCallback(() => {
        if (menu) {
            const node = nodes.find(n => n.id === menu.id);
            if (node) {
                setEditingNode({ id: node.id, label: node.data.label as string });
            }
            setMenu(null);
        }
    }, [menu, nodes]);

    const onSaveRename = useCallback((newLabel: string) => {
        if (editingNode) {
            setNodes((nds) => nds.map((node) => {
                if (node.id === editingNode.id) {
                    return { ...node, data: { ...node.data, label: newLabel } };
                }
                return node;
            }));
            setEditingNode(null);
        }
    }, [editingNode, setNodes]);

    const onSave = useCallback(() => {
        const currentHasStart = nodes.some((n) => n.type === 'start');
        const currentHasEnd = nodes.some((n) => n.type === 'end');

        if (!currentHasStart || !currentHasEnd) {
            alert('Validation Error: Flow must have both a Start and End node.');
            return;
        }

        console.log('Flow saved:', { nodes, edges });
        alert('Flow state logged to console successfully!');
    }, [nodes, edges]);


    return (
        <div className="h-full w-full bg-main border border-border rounded-xl  overflow-hidden relative shadow-sm" ref={ref}>
            {editingNode && (
                <RenameDialog
                    initialValue={editingNode.label}
                    onSave={onSaveRename}
                    onCancel={() => setEditingNode(null)}
                />
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onNodeContextMenu={onNodeContextMenu}
                onNodeDoubleClick={onNodeDoubleClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                deleteKeyCode={['Delete', 'Backspace']}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: 'var(--primary-text)', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--primary-text)' }
                }}
                fitView
                className="bg-main"
            >
                <Controls className="!bg-card !border-border !shadow-sm [&>button]:!bg-card [&>button]:!border-border [&>button:hover]:!bg-hover [&>button_path]:!fill-primary-text" />
                <MiniMap
                    className="!bg-card !border-border"
                    nodeColor="var(--primary-text)"
                    maskColor="var(--main)"
                />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--secondary-text)" className="opacity-20" />

                {menu && (
                    <ContextMenu
                        {...menu}
                        onDelete={onDeleteNode}
                        onRename={onStartRename}
                        onClose={() => setMenu(null)}
                    />
                )}

                {/* Toolbox Panel */}
                <Panel position="top-left" className="bg-card border border-border p-2 rounded-xl shadow-lg flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
                    <div className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-1 px-1">Toolbox</div>
                    <ToolboxItem type="start" label="Start" icon={PlayCircleIcon} disabled={hasStart} />
                    <ToolboxItem type="input" label="Input" icon={ArrowRightOnRectangleIcon} />
                    <ToolboxItem type="process" label="Process" icon={CubeIcon} />
                    <ToolboxItem type="decision" label="Decision" icon={QuestionMarkCircleIcon} />
                    <ToolboxItem type="output" label="Output" icon={ArrowLeftOnRectangleIcon} />
                    <ToolboxItem type="end" label="End" icon={StopCircleIcon} disabled={hasEnd} />
                </Panel>

                <Panel position="top-right">
                    <button
                        onClick={onSave}
                        className="flex items-center justify-center gap-2 bg-accent-color text-main px-4 py-2 rounded-lg hover:brightness-90 transition-all shadow-sm font-medium"
                    >
                        Save Flow
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default function FlowChartEditor() {
    return (
        <ReactFlowProvider>
            <div className="h-[calc(100vh-100px)] w-full">
                <FlowChart />
            </div>
        </ReactFlowProvider>
    );
}
