import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    AlertTriangle, X, ChevronRight, Clock,
    Users, GitBranch, AlertCircle
} from 'lucide-react'

// Helper to get dismissed IDs from localStorage
const getStoredDismissedIds = (projectId) => {
    try {
        return JSON.parse(localStorage.getItem(`dismissed_alerts_${projectId}`) || '[]')
    } catch {
        return []
    }
}

/**
 * AlertBanner - Dismissible notification banner for project risks
 * Shows alerts like overdue tasks, blocked dependencies, resource conflicts
 */
const AlertBanner = ({ projectId, alerts = [], onDismiss, className = '' }) => {
    // Initialize directly from localStorage to avoid race condition
    const [dismissedIds, setDismissedIds] = useState(() => getStoredDismissedIds(projectId))
    const [showAll, setShowAll] = useState(false)

    // Generate stable alert ID
    const getAlertId = useCallback((alert) => {
        const message = alert.message || ''
        const taskIds = alert.taskIds?.sort().join(',') || ''
        return `${alert.type}-${message.slice(0, 50)}-${taskIds}`
    }, [])

    // Reload from localStorage when projectId changes
    useEffect(() => {
        setDismissedIds(getStoredDismissedIds(projectId))
        setShowAll(false)
    }, [projectId])

    // Calculate visible alerts using useMemo (no race condition)
    const visibleAlerts = useMemo(() => {
        if (showAll) return alerts
        return alerts.filter(alert => !dismissedIds.includes(getAlertId(alert)))
    }, [alerts, dismissedIds, showAll, getAlertId])

    const handleDismiss = useCallback((alert, e) => {
        e?.preventDefault?.()
        e?.stopPropagation?.()

        const alertId = getAlertId(alert)
        if (dismissedIds.includes(alertId)) return

        // Reset showAll so the filter works correctly
        setShowAll(false)

        const newDismissed = [...dismissedIds, alertId]
        setDismissedIds(newDismissed)
        localStorage.setItem(`dismissed_alerts_${projectId}`, JSON.stringify(newDismissed))
        onDismiss?.(alert)
    }, [dismissedIds, projectId, getAlertId, onDismiss])

    const handleClearDismissed = useCallback(() => {
        setDismissedIds([])
        setShowAll(true)
        localStorage.removeItem(`dismissed_alerts_${projectId}`)
    }, [projectId])

    // If all alerts dismissed but there are alerts, show reset option
    if (visibleAlerts.length === 0 && alerts.length > 0) {
        return (
            <div className={`p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 ${className}`}>
                <button
                    onClick={handleClearDismissed}
                    className="text-sm text-purple-500 hover:text-purple-600 flex items-center gap-2"
                >
                    <AlertTriangle className="w-4 h-4" />
                    Show {alerts.length} dismissed alert{alerts.length > 1 ? 's' : ''}
                </button>
            </div>
        )
    }

    if (visibleAlerts.length === 0) return null

    // Get alert config based on type
    const getAlertConfig = (type, severity) => {
        const configs = {
            overdue: {
                icon: Clock,
                bgColor: severity === 'high' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-orange-50 dark:bg-orange-900/20',
                borderColor: severity === 'high' ? 'border-red-200 dark:border-red-800' : 'border-orange-200 dark:border-orange-800',
                iconColor: severity === 'high' ? 'text-red-500' : 'text-orange-500',
                textColor: severity === 'high' ? 'text-red-700 dark:text-red-300' : 'text-orange-700 dark:text-orange-300'
            },
            blocked: {
                icon: GitBranch,
                bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                borderColor: 'border-yellow-200 dark:border-yellow-800',
                iconColor: 'text-yellow-600',
                textColor: 'text-yellow-700 dark:text-yellow-300'
            },
            conflict: {
                icon: Users,
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                borderColor: 'border-purple-200 dark:border-purple-800',
                iconColor: 'text-purple-500',
                textColor: 'text-purple-700 dark:text-purple-300'
            },
            critical_path: {
                icon: AlertTriangle,
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                borderColor: 'border-red-200 dark:border-red-800',
                iconColor: 'text-red-500',
                textColor: 'text-red-700 dark:text-red-300'
            }
        }
        return configs[type] || {
            icon: AlertCircle,
            bgColor: 'bg-gray-50 dark:bg-zinc-800',
            borderColor: 'border-gray-200 dark:border-zinc-700',
            iconColor: 'text-gray-500',
            textColor: 'text-gray-700 dark:text-gray-300'
        }
    }

    // Show first alert prominently, others in compact mode
    const primaryAlert = visibleAlerts[0]
    const secondaryAlerts = visibleAlerts.slice(1, 3)
    const remainingCount = visibleAlerts.length - 3

    const primaryConfig = getAlertConfig(primaryAlert.type, primaryAlert.severity)
    const PrimaryIcon = primaryConfig.icon

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Primary Alert Banner */}
            <div className={`
                relative flex items-center gap-3 p-4 rounded-xl border
                ${primaryConfig.bgColor} ${primaryConfig.borderColor}
                animate-in slide-in-from-top-2 duration-300
            `}>
                {/* Icon */}
                <div className={`
                    flex-shrink-0 p-2 rounded-lg
                    ${primaryAlert.severity === 'high' || primaryAlert.severity === 'critical'
                        ? 'bg-red-100 dark:bg-red-900/40'
                        : 'bg-white/50 dark:bg-zinc-800/50'
                    }
                `}>
                    <PrimaryIcon className={`w-5 h-5 ${primaryConfig.iconColor}`} />
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${primaryConfig.textColor}`}>
                        {primaryAlert.message}
                    </p>
                    {primaryAlert.taskIds?.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                            {primaryAlert.taskIds.length} task{primaryAlert.taskIds.length > 1 ? 's' : ''} affected
                        </p>
                    )}
                </div>

                {/* Dismiss button */}
                <button
                    type="button"
                    onClick={(e) => handleDismiss(primaryAlert, e)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Secondary Alerts (compact) */}
            {secondaryAlerts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {secondaryAlerts.map((alert, index) => {
                        const config = getAlertConfig(alert.type, alert.severity)
                        const Icon = config.icon
                        return (
                            <div
                                key={index}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs
                                    ${config.bgColor} ${config.borderColor}
                                `}
                            >
                                <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                                <span className={`${config.textColor} truncate max-w-[200px]`}>
                                    {alert.message}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => handleDismiss(alert, e)}
                                    className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                                >
                                    <X className="w-3 h-3 text-gray-400" />
                                </button>
                            </div>
                        )
                    })}

                    {/* More alerts indicator */}
                    {remainingCount > 0 && (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-xs text-gray-600 dark:text-zinc-400">
                            +{remainingCount} more alert{remainingCount > 1 ? 's' : ''}
                            <ChevronRight className="w-3 h-3" />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AlertBanner
