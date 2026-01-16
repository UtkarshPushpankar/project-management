import { useMemo } from 'react'
import { Calendar, AlertTriangle } from 'lucide-react'

/**
 * GanttTimeline - Visual timeline of tasks with dependency awareness
 * Shows task durations, critical path, and deadline proximity
 */
const GanttTimeline = ({
    tasks = [],
    criticalPath = [],
    dependencies = [],
    className = ''
}) => {
    // Calculate timeline bounds
    const { minDate, maxDate, totalDays, bars } = useMemo(() => {
        if (tasks.length === 0) return { minDate: null, maxDate: null, totalDays: 0, bars: [] }

        const dates = tasks.map(t => new Date(t.due_date))
        const createdDates = tasks.map(t => new Date(t.createdAt))

        const min = new Date(Math.min(...createdDates, ...dates))
        const max = new Date(Math.max(...dates))

        // Add padding
        min.setDate(min.getDate() - 2)
        max.setDate(max.getDate() + 2)

        const days = Math.ceil((max - min) / (1000 * 60 * 60 * 24))

        const criticalSet = new Set(criticalPath)
        const now = new Date()

        const taskBars = tasks.map(task => {
            const created = new Date(task.createdAt)
            const due = new Date(task.due_date)
            const startOffset = Math.max(0, Math.ceil((created - min) / (1000 * 60 * 60 * 24)))
            const duration = Math.max(1, Math.ceil((due - created) / (1000 * 60 * 60 * 24)))

            const isOverdue = now > due && task.status !== 'DONE'
            const isDueSoon = !isOverdue && (due - now) / (1000 * 60 * 60 * 24) <= 3 && task.status !== 'DONE'
            const isCritical = criticalSet.has(task.id)

            return {
                ...task,
                startOffset,
                duration,
                widthPercent: (duration / days) * 100,
                leftPercent: (startOffset / days) * 100,
                isOverdue,
                isDueSoon,
                isCritical
            }
        })

        return { minDate: min, maxDate: max, totalDays: days, bars: taskBars }
    }, [tasks, criticalPath])

    // Generate date markers
    const dateMarkers = useMemo(() => {
        if (!minDate || totalDays === 0) return []

        const markers = []
        const markerInterval = Math.max(1, Math.floor(totalDays / 7))

        for (let i = 0; i <= totalDays; i += markerInterval) {
            const date = new Date(minDate)
            date.setDate(date.getDate() + i)
            markers.push({
                date,
                leftPercent: (i / totalDays) * 100,
                label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            })
        }

        return markers
    }, [minDate, totalDays])

    // Today marker position
    const todayPosition = useMemo(() => {
        if (!minDate || !maxDate) return null
        const now = new Date()
        if (now < minDate || now > maxDate) return null

        const daysFromStart = Math.ceil((now - minDate) / (1000 * 60 * 60 * 24))
        return (daysFromStart / totalDays) * 100
    }, [minDate, maxDate, totalDays])

    if (tasks.length === 0) {
        return (
            <div className={`flex items-center justify-center h-40 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 ${className}`}>
                <div className="text-center text-zinc-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No tasks to display</p>
                </div>
            </div>
        )
    }

    const getBarColor = (bar) => {
        if (bar.status === 'DONE') return 'bg-emerald-500'
        if (bar.isOverdue) return 'bg-red-500'
        if (bar.isDueSoon) return 'bg-amber-500'
        if (bar.isCritical) return 'bg-purple-500'
        if (bar.status === 'IN_PROGRESS') return 'bg-blue-500'
        return 'bg-zinc-400 dark:bg-zinc-600'
    }

    return (
        <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Project Timeline</h3>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-purple-500"></div>
                        <span className="text-zinc-600 dark:text-zinc-400">Critical Path</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span className="text-zinc-600 dark:text-zinc-400">Overdue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-amber-500"></div>
                        <span className="text-zinc-600 dark:text-zinc-400">Due Soon</span>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="p-4 relative">
                {/* Date markers */}
                <div className="relative h-6 mb-2 border-b border-zinc-200 dark:border-zinc-700">
                    {dateMarkers.map((marker, i) => (
                        <div
                            key={i}
                            className="absolute text-xs text-zinc-500 dark:text-zinc-400 transform -translate-x-1/2"
                            style={{ left: `${marker.leftPercent}%` }}
                        >
                            {marker.label}
                        </div>
                    ))}
                </div>

                {/* Today indicator */}
                {todayPosition !== null && (
                    <div
                        className="absolute top-14 bottom-4 w-0.5 bg-cyan-500 z-10"
                        style={{ left: `${todayPosition}%` }}
                    >
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-cyan-500 bg-zinc-900 px-1 rounded">
                            Today
                        </div>
                    </div>
                )}

                {/* Task bars */}
                <div className="relative space-y-2 mt-4">
                    {bars.map((bar, index) => (
                        <div key={bar.id} className="relative h-10 flex items-center">
                            {/* Task label */}
                            <div className="w-40 flex-shrink-0 pr-3 truncate text-sm text-zinc-700 dark:text-zinc-300">
                                {bar.isCritical && <AlertTriangle className="w-3 h-3 inline mr-1 text-purple-500" />}
                                {bar.title}
                            </div>

                            {/* Bar container */}
                            <div className="flex-1 relative h-full flex items-center bg-zinc-100 dark:bg-zinc-800/50 rounded">
                                {/* Bar */}
                                <div
                                    className={`absolute h-7 rounded ${getBarColor(bar)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                                    style={{
                                        left: `${bar.leftPercent}%`,
                                        width: `${Math.max(bar.widthPercent, 2)}%`
                                    }}
                                    title={`${bar.title}\nDue: ${new Date(bar.due_date).toLocaleDateString()}\nStatus: ${bar.status}`}
                                >
                                    {bar.widthPercent > 10 && (
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white truncate px-2">
                                            {bar.status === 'DONE' ? '✓' : bar.isOverdue ? '!' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GanttTimeline
