import { useState } from 'react'
import {
    Check, X, Sparkles, GitBranch,
    ChevronDown, ChevronUp, Lightbulb
} from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import api from '../../configs/api'

/**
 * AISuggestionsPanel - Panel to accept/reject AI-suggested dependencies
 */
const AISuggestionsPanel = ({
    projectId,
    suggestions = [],
    tasks = {},
    onAccept,
    onReject,
    className = ''
}) => {
    const { getToken } = useAuth()
    const [loading, setLoading] = useState({})
    const [expanded, setExpanded] = useState(true)
    const [localSuggestions, setLocalSuggestions] = useState(suggestions)

    // Update when props change
    useState(() => {
        setLocalSuggestions(suggestions)
    }, [suggestions])

    const handleAccept = async (suggestion) => {
        if (loading[suggestion.id]) return

        setLoading(prev => ({ ...prev, [suggestion.id]: 'accepting' }))
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        try {
            await api.patch(`/api/ai/dependencies/${suggestion.id}/accept`, {}, { headers })
            setLocalSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
            onAccept?.(suggestion)
        } catch (err) {
            console.error('Failed to accept suggestion:', err)
        } finally {
            setLoading(prev => ({ ...prev, [suggestion.id]: null }))
        }
    }

    const handleReject = async (suggestion) => {
        if (loading[suggestion.id]) return

        setLoading(prev => ({ ...prev, [suggestion.id]: 'rejecting' }))
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        try {
            await api.patch(`/api/ai/dependencies/${suggestion.id}/reject`, {}, { headers })
            setLocalSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
            onReject?.(suggestion)
        } catch (err) {
            console.error('Failed to reject suggestion:', err)
        } finally {
            setLoading(prev => ({ ...prev, [suggestion.id]: null }))
        }
    }

    const getTaskTitle = (taskId) => {
        return tasks[taskId]?.title || taskId.slice(0, 8) + '...'
    }

    if (localSuggestions.length === 0) {
        return (
            <div className={`
                p-4 rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm 
                border border-gray-100 dark:border-zinc-700 ${className}
            `}>
                <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">No AI suggestions pending</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`
            rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm 
            border border-gray-100 dark:border-zinc-700 overflow-hidden ${className}
        `}>
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                        <Lightbulb className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                            AI Suggestions
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                            {localSuggestions.length} pending review
                        </p>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
            </button>

            {/* Suggestions List */}
            {expanded && (
                <div className="border-t border-gray-100 dark:border-zinc-700">
                    {localSuggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.id || index}
                            className="p-4 border-b border-gray-50 dark:border-zinc-800 last:border-b-0"
                        >
                            {/* Dependency visualization */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate max-w-[120px]">
                                    {getTaskTitle(suggestion.dependsOnTaskId)}
                                </span>
                                <GitBranch className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate max-w-[120px]">
                                    {getTaskTitle(suggestion.taskId)}
                                </span>
                            </div>

                            {/* Reason */}
                            {suggestion.reason && (
                                <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3 line-clamp-2">
                                    <Sparkles className="w-3 h-3 inline mr-1 text-purple-400" />
                                    {suggestion.reason}
                                </p>
                            )}

                            {/* Confidence badge + Actions */}
                            <div className="flex items-center justify-between">
                                <span className={`
                                    text-xs px-2 py-0.5 rounded-full
                                    ${suggestion.confidence >= 0.9
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : suggestion.confidence >= 0.8
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-400'
                                    }
                                `}>
                                    {Math.round(suggestion.confidence * 100)}% confident
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleReject(suggestion)}
                                        disabled={loading[suggestion.id]}
                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                        title="Reject suggestion"
                                    >
                                        {loading[suggestion.id] === 'rejecting' ? (
                                            <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin block" />
                                        ) : (
                                            <X className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleAccept(suggestion)}
                                        disabled={loading[suggestion.id]}
                                        className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-500 transition-colors disabled:opacity-50"
                                        title="Accept suggestion"
                                    >
                                        {loading[suggestion.id] === 'accepting' ? (
                                            <span className="w-4 h-4 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin block" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AISuggestionsPanel
