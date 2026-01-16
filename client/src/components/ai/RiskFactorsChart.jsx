import { useMemo } from 'react'
import { BarChart3, TrendingDown, TrendingUp, AlertTriangle, Clock, Users, GitBranch } from 'lucide-react'

/**
 * RiskFactorsChart - Visual breakdown of what contributes to the risk score
 * Shows factors like overdue tasks, blocked dependencies, resource conflicts
 */
const RiskFactorsChart = ({
    analysis = {},
    tasks = [],
    className = ''
}) => {
    // Calculate risk factors from analysis and tasks
    const factors = useMemo(() => {
        const now = new Date()

        // Count overdue tasks
        const overdueTasks = tasks.filter(t =>
            new Date(t.due_date) < now && t.status !== 'DONE'
        ).length

        // Count tasks due soon (within 3 days)
        const dueSoonTasks = tasks.filter(t => {
            const dueDate = new Date(t.due_date)
            const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24)
            return daysUntilDue > 0 && daysUntilDue <= 3 && t.status !== 'DONE'
        }).length

        // Get alerts breakdown
        const alerts = analysis?.alerts || []
        const blockedAlerts = alerts.filter(a => a.type === 'blocked').length
        const resourceAlerts = alerts.filter(a => a.type === 'resource_conflict').length

        // Critical path length
        const criticalPathLength = analysis?.criticalPathIds?.length || 0

        // Bottlenecks
        const bottlenecks = analysis?.bottlenecks?.length || 0

        // Calculate impact scores (0-100 contribution to risk)
        const totalTasks = tasks.length || 1

        return [
            {
                id: 'overdue',
                label: 'Overdue Tasks',
                count: overdueTasks,
                impact: Math.min(100, (overdueTasks / totalTasks) * 150),
                severity: overdueTasks > 0 ? 'high' : 'none',
                icon: Clock,
                color: 'bg-red-500',
                description: `${overdueTasks} task${overdueTasks !== 1 ? 's' : ''} past due date`
            },
            {
                id: 'due-soon',
                label: 'Due Soon',
                count: dueSoonTasks,
                impact: Math.min(100, (dueSoonTasks / totalTasks) * 100),
                severity: dueSoonTasks > 2 ? 'medium' : dueSoonTasks > 0 ? 'low' : 'none',
                icon: AlertTriangle,
                color: 'bg-amber-500',
                description: `${dueSoonTasks} task${dueSoonTasks !== 1 ? 's' : ''} due within 3 days`
            },
            {
                id: 'blocked',
                label: 'Blocked Dependencies',
                count: blockedAlerts,
                impact: Math.min(100, blockedAlerts * 25),
                severity: blockedAlerts > 0 ? 'high' : 'none',
                icon: GitBranch,
                color: 'bg-purple-500',
                description: `${blockedAlerts} blocked dependency chain${blockedAlerts !== 1 ? 's' : ''}`
            },
            {
                id: 'conflicts',
                label: 'Resource Conflicts',
                count: resourceAlerts,
                impact: Math.min(100, resourceAlerts * 20),
                severity: resourceAlerts > 0 ? 'medium' : 'none',
                icon: Users,
                color: 'bg-orange-500',
                description: `${resourceAlerts} overlapping assignment${resourceAlerts !== 1 ? 's' : ''}`
            },
            {
                id: 'bottlenecks',
                label: 'Bottlenecks',
                count: bottlenecks,
                impact: Math.min(100, bottlenecks * 15),
                severity: bottlenecks > 2 ? 'medium' : bottlenecks > 0 ? 'low' : 'none',
                icon: TrendingDown,
                color: 'bg-cyan-500',
                description: `${bottlenecks} critical path bottleneck${bottlenecks !== 1 ? 's' : ''}`
            }
        ].sort((a, b) => b.impact - a.impact)
    }, [analysis, tasks])

    const totalRiskScore = analysis?.riskScore || 0
    const riskLevel = analysis?.riskLevel || 'unknown'

    const getRiskColor = () => {
        if (totalRiskScore >= 80) return 'text-emerald-500'
        if (totalRiskScore >= 60) return 'text-amber-500'
        if (totalRiskScore >= 40) return 'text-orange-500'
        return 'text-red-500'
    }

    return (
        <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-500" />
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Risk Factors Analysis</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Overall:</span>
                    <span className={`font-bold ${getRiskColor()}`}>{totalRiskScore}/100</span>
                </div>
            </div>

            {/* Factors */}
            <div className="p-4 space-y-4">
                {factors.map((factor) => (
                    <div key={factor.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <factor.icon className={`w-4 h-4 ${factor.severity === 'high' ? 'text-red-500' :
                                        factor.severity === 'medium' ? 'text-amber-500' :
                                            factor.severity === 'low' ? 'text-blue-500' :
                                                'text-zinc-400'
                                    }`} />
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    {factor.label}
                                </span>
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {factor.description}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${factor.color} transition-all duration-500`}
                                style={{ width: `${factor.impact}%` }}
                            />
                        </div>
                    </div>
                ))}

                {/* No issues message */}
                {factors.every(f => f.severity === 'none') && (
                    <div className="flex items-center justify-center gap-2 py-4 text-emerald-500">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm font-medium">Project is on track - no significant risks detected!</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RiskFactorsChart
