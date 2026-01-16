import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Brain, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
    RefreshCw, ChevronRight, Zap
} from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import api from '../../configs/api'

/**
 * RiskScoreBadge - Circular progress indicator showing project health
 * Displays risk score with color-coded levels and trend indicators
 */
const RiskScoreBadge = ({ projectId, size = 'md', showLabel = true, onAnalysisComplete }) => {
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const [error, setError] = useState(null)

    // Size configurations
    const sizes = {
        sm: { circle: 48, stroke: 4, fontSize: 'text-sm', iconSize: 12 },
        md: { circle: 72, stroke: 6, fontSize: 'text-xl', iconSize: 16 },
        lg: { circle: 96, stroke: 8, fontSize: 'text-2xl', iconSize: 20 }
    }

    const config = sizes[size] || sizes.md
    const radius = (config.circle - config.stroke) / 2
    const circumference = radius * 2 * Math.PI

    // Fetch latest analysis
    const fetchAnalysis = useCallback(async () => {
        if (!projectId) return

        setLoading(true)
        setError(null)
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        try {
            const response = await api.get(`/api/ai/risk/${projectId}`, { headers })
            if (response.data.hasAnalysis) {
                setAnalysis(response.data.analysis)
            }
        } catch (err) {
            console.error('Failed to fetch analysis:', err)
            setError('Failed to load')
        } finally {
            setLoading(false)
        }
    }, [projectId, getToken])

    // Trigger new analysis
    const triggerAnalysis = async () => {
        if (!projectId || analyzing) return

        setAnalyzing(true)
        setError(null)
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        try {
            const response = await api.post(`/api/ai/analyze/${projectId}`, {}, { headers })
            if (response.data.success) {
                setAnalysis({
                    riskScore: response.data.analysis.riskScore,
                    riskLevel: response.data.analysis.riskLevel,
                    analyzedAt: new Date().toISOString()
                })
                onAnalysisComplete?.(response.data.analysis)
            }
        } catch (err) {
            console.error('Analysis failed:', err)
            setError('Analysis failed')
        } finally {
            setAnalyzing(false)
        }
    }

    useEffect(() => {
        fetchAnalysis()
    }, [fetchAnalysis])

    // Risk level colors and icons
    const getRiskConfig = (level) => {
        const configs = {
            low: {
                color: 'text-emerald-500',
                bgColor: 'bg-emerald-500',
                gradient: 'from-emerald-400 to-emerald-600',
                icon: CheckCircle,
                label: 'Healthy'
            },
            medium: {
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-500',
                gradient: 'from-yellow-400 to-orange-500',
                icon: TrendingUp,
                label: 'Monitor'
            },
            high: {
                color: 'text-orange-500',
                bgColor: 'bg-orange-500',
                gradient: 'from-orange-400 to-red-500',
                icon: TrendingDown,
                label: 'At Risk'
            },
            critical: {
                color: 'text-red-500',
                bgColor: 'bg-red-500',
                gradient: 'from-red-500 to-red-700',
                icon: AlertTriangle,
                label: 'Critical'
            }
        }
        return configs[level] || configs.low
    }

    const riskConfig = analysis ? getRiskConfig(analysis.riskLevel) : getRiskConfig('low')
    const score = analysis?.riskScore ?? 0
    const strokeDashoffset = circumference - (score / 100) * circumference

    // Loading state
    if (loading || analyzing) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-gray-100 dark:border-zinc-700">
                <div
                    className="relative"
                    style={{ width: config.circle, height: config.circle }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className={`w-6 h-6 text-purple-500 animate-spin`} />
                    </div>
                </div>
                {showLabel && (
                    <div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                            {analyzing ? 'Analyzing...' : 'Loading...'}
                        </p>
                    </div>
                )}
            </div>
        )
    }

    // No analysis yet
    if (!analysis && !error) {
        return (
            <button
                onClick={triggerAnalysis}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-gray-100 dark:border-zinc-700 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all group"
            >
                <div
                    className="relative flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full"
                    style={{ width: config.circle, height: config.circle }}
                >
                    <Brain className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                </div>
                {showLabel && (
                    <div className="text-left">
                        <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                            AI Analysis
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                            Click to analyze
                        </p>
                    </div>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
        )
    }

    const IconComponent = riskConfig.icon

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-gray-100 dark:border-zinc-700">
            {/* Circular Progress */}
            <div className="relative" style={{ width: config.circle, height: config.circle }}>
                <svg
                    className="transform -rotate-90"
                    width={config.circle}
                    height={config.circle}
                >
                    {/* Background circle */}
                    <circle
                        cx={config.circle / 2}
                        cy={config.circle / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={config.stroke}
                        fill="none"
                        className="text-gray-200 dark:text-zinc-700"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={config.circle / 2}
                        cy={config.circle / 2}
                        r={radius}
                        stroke="url(#riskGradient)"
                        strokeWidth={config.stroke}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    />
                    <defs>
                        <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" className={`${riskConfig.color}`} style={{ stopColor: 'currentColor' }} />
                            <stop offset="100%" className={`${riskConfig.color}`} style={{ stopColor: 'currentColor', opacity: 0.6 }} />
                        </linearGradient>
                    </defs>
                </svg>
                {/* Score in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`${config.fontSize} font-bold ${riskConfig.color}`}>
                        {score}
                    </span>
                </div>
            </div>

            {/* Labels */}
            {showLabel && (
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <IconComponent className={`w-4 h-4 ${riskConfig.color}`} />
                        <span className={`text-sm font-semibold ${riskConfig.color}`}>
                            {riskConfig.label}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                        {analysis?.analyzedAt
                            ? `Updated ${new Date(analysis.analyzedAt).toLocaleDateString()}`
                            : 'Risk Score'
                        }
                    </p>
                </div>
            )}

            {/* Refresh button */}
            <button
                onClick={triggerAnalysis}
                disabled={analyzing}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                title="Refresh analysis"
            >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${analyzing ? 'animate-spin' : ''}`} />
            </button>
        </div>
    )
}

export default RiskScoreBadge
