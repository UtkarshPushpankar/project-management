import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Panel,
    Handle,
    Position
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
    CheckCircle, Clock, PlayCircle, AlertTriangle,
    ZoomIn, ZoomOut, Maximize2
} from 'lucide-react'

/**
 * Custom node component for tasks
 */
const TaskNode = ({ data }) => {
    const statusConfig = {
        TODO: {
            bg: 'bg-gray-100 dark:bg-zinc-700',
            border: 'border-gray-300 dark:border-zinc-600',
            icon: Clock,
            iconColor: 'text-gray-500'
        },
        IN_PROGRESS: {
            bg: 'bg-blue-50 dark:bg-blue-900/30',
            border: 'border-blue-300 dark:border-blue-700',
            icon: PlayCircle,
            iconColor: 'text-blue-500'
        },
        DONE: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/30',
            border: 'border-emerald-300 dark:border-emerald-700',
            icon: CheckCircle,
            iconColor: 'text-emerald-500'
        }
    }

    const config = statusConfig[data.status] || statusConfig.TODO
    const StatusIcon = config.icon

    return (
        <div className={`
            relative px-4 py-3 rounded-xl border-2 shadow-lg min-w-[180px] max-w-[220px]
            ${config.bg} ${config.border}
            ${data.isCriticalPath ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-zinc-900' : ''}
            ${data.isBlocked ? 'opacity-60' : ''}
            transition-all hover:shadow-xl cursor-pointer
        `}>
            {/* Input Handle - left side (target for incoming edges) */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-purple-500 border-2 border-white dark:border-zinc-900"
            />

            {/* Output Handle - right side (source for outgoing edges) */}
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 !bg-cyan-500 border-2 border-white dark:border-zinc-900"
            />

            {/* Critical path indicator */}
            {data.isCriticalPath && (
                <div className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-white" />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
                <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
                <span className={`text-xs font-medium ${config.iconColor}`}>
                    {data.status?.replace('_', ' ')}
                </span>
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                {data.title}
            </h4>

            {/* Assignee */}
            {data.assigneeName && (
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 truncate">
                    {data.assigneeName}
                </p>
            )}

            {/* Due date */}
            {data.due_date && (
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                    Due: {new Date(data.due_date).toLocaleDateString()}
                </p>
            )}
        </div>
    )
}

const nodeTypes = {
    task: TaskNode
}

/**
 * DependencyGraph - Interactive visualization of task dependencies
 */
const DependencyGraph = ({
    tasks = [],
    dependencies = [],
    criticalPath = [],
    onNodeClick,
    className = ''
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    // Critical path set for quick lookup
    const criticalPathSet = useMemo(() => new Set(criticalPath), [criticalPath])

    // Build nodes and edges from tasks and dependencies
    useEffect(() => {
        console.log('DependencyGraph received:', {
            tasksCount: tasks.length,
            dependenciesCount: dependencies.length,
            dependencies: dependencies
        })

        if (tasks.length === 0) {
            setNodes([])
            setEdges([])
            return
        }

        // Create task lookup
        const taskMap = new Map(tasks.map(t => [t.id, t]))

        // Build dependency graph for layout
        const dependsOn = new Map()
        const dependents = new Map()

        dependencies.forEach(dep => {
            if (!dependsOn.has(dep.taskId)) dependsOn.set(dep.taskId, [])
            if (!dependents.has(dep.dependsOnTaskId)) dependents.set(dep.dependsOnTaskId, [])
            dependsOn.get(dep.taskId).push(dep.dependsOnTaskId)
            dependents.get(dep.dependsOnTaskId).push(dep.taskId)
        })

        // Calculate levels for hierarchical layout
        const levels = new Map()
        const visited = new Set()

        const calculateLevel = (taskId, level = 0) => {
            if (visited.has(taskId)) return
            visited.add(taskId)

            const currentLevel = levels.get(taskId) || 0
            levels.set(taskId, Math.max(currentLevel, level))

            const deps = dependents.get(taskId) || []
            deps.forEach(depId => calculateLevel(depId, level + 1))
        }

        // Start from tasks with no dependencies
        tasks.forEach(task => {
            if (!dependsOn.has(task.id) || dependsOn.get(task.id).length === 0) {
                calculateLevel(task.id, 0)
            }
        })

        // Handle disconnected tasks
        tasks.forEach(task => {
            if (!levels.has(task.id)) {
                levels.set(task.id, 0)
            }
        })

        // Group by level
        const levelGroups = new Map()
        tasks.forEach(task => {
            const level = levels.get(task.id) || 0
            if (!levelGroups.has(level)) levelGroups.set(level, [])
            levelGroups.get(level).push(task)
        })

        // Create nodes with positions
        const newNodes = []
        const xSpacing = 280
        const ySpacing = 120

        levelGroups.forEach((levelTasks, level) => {
            levelTasks.forEach((task, index) => {
                const yOffset = (levelTasks.length - 1) / 2
                newNodes.push({
                    id: task.id,
                    type: 'task',
                    position: {
                        x: level * xSpacing + 50,
                        y: (index - yOffset) * ySpacing + 200
                    },
                    data: {
                        ...task,
                        isCriticalPath: criticalPathSet.has(task.id),
                        isBlocked: (dependsOn.get(task.id) || []).some(depId => {
                            const depTask = taskMap.get(depId)
                            return depTask && depTask.status !== 'DONE'
                        })
                    }
                })
            })
        })

        // Create edges
        const newEdges = dependencies.map(dep => {
            const isCriticalEdge = criticalPathSet.has(dep.taskId) && criticalPathSet.has(dep.dependsOnTaskId)
            const isAISuggested = dep.isAISuggested && dep.acceptedByUser === null

            return {
                id: dep.id || `${dep.dependsOnTaskId}-${dep.taskId}`,
                source: dep.dependsOnTaskId,
                target: dep.taskId,
                type: 'smoothstep',
                animated: isAISuggested,
                style: {
                    stroke: isCriticalEdge
                        ? '#ef4444'
                        : isAISuggested
                            ? '#a855f7'
                            : '#94a3b8',
                    strokeWidth: isCriticalEdge ? 3 : 2,
                    strokeDasharray: isAISuggested ? '5,5' : undefined
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isCriticalEdge ? '#ef4444' : isAISuggested ? '#a855f7' : '#94a3b8'
                }
            }
        })

        setNodes(newNodes)
        setEdges(newEdges)
    }, [tasks, dependencies, criticalPathSet, setNodes, setEdges])

    const handleNodeClick = useCallback((event, node) => {
        onNodeClick?.(node.data)
    }, [onNodeClick])

    if (tasks.length === 0) {
        return (
            <div className={`
                flex items-center justify-center h-64 rounded-xl 
                bg-gray-50 dark:bg-zinc-800/50 border border-dashed 
                border-gray-200 dark:border-zinc-700 ${className}
            `}>
                <p className="text-gray-500 dark:text-zinc-400 text-sm">
                    No tasks to visualize
                </p>
            </div>
        )
    }

    return (
        <div className={`h-[500px] rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 ${className}`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.3}
                maxZoom={1.5}
                className="bg-gray-50 dark:bg-zinc-900"
            >
                <Background color="#94a3b8" gap={20} size={1} />
                <Controls
                    showInteractive={false}
                    className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg"
                />

                {/* Legend */}
                <Panel position="top-right" className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm p-3 rounded-lg border border-gray-200 dark:border-zinc-700">
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-red-500 rounded-full" />
                            <span className="text-gray-600 dark:text-zinc-400">Critical Path</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-purple-500 rounded-full" style={{ borderStyle: 'dashed' }} />
                            <span className="text-gray-600 dark:text-zinc-400">AI Suggested</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-gray-400 rounded-full" />
                            <span className="text-gray-600 dark:text-zinc-400">Confirmed</span>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    )
}

export default DependencyGraph
