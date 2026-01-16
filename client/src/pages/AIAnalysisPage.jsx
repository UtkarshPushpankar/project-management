import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import {
    Brain, ArrowLeft, RefreshCw, Download,
    GitBranch, AlertTriangle, Users, Zap
} from 'lucide-react'
import api from '../configs/api'

import RiskScoreBadge from '../components/ai/RiskScoreBadge'
import AlertBanner from '../components/ai/AlertBanner'
import DependencyGraph from '../components/ai/DependencyGraph'
import AISuggestionsPanel from '../components/ai/AISuggestionsPanel'
import GanttTimeline from '../components/ai/GanttTimeline'
import RiskFactorsChart from '../components/ai/RiskFactorsChart'

/**
 * AIAnalysisPage - Full AI analysis dashboard for a project
 */
const AIAnalysisPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const projectId = searchParams.get('projectId')

    // Get project from Redux store
    const projects = useSelector((state) => state?.workspace?.currentWorkspace?.projects || [])
    const project = useMemo(() =>
        projects.find(p => p.id === projectId),
        [projects, projectId]
    )
    const { getToken } = useAuth()

    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const [dependencies, setDependencies] = useState({ confirmed: [], pending: [] })
    const [error, setError] = useState(null)

    // Fetch analysis data
    const fetchData = useCallback(async () => {
        if (!projectId) return

        setLoading(true)
        setError(null)
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        try {
            // Fetch latest analysis
            const analysisRes = await api.get(`/api/ai/risk/${projectId}`, { headers })
            if (analysisRes.data.hasAnalysis) {
                setAnalysis(analysisRes.data.analysis)
            }

            // Fetch dependencies
            const depsRes = await api.get(`/api/ai/dependencies/${projectId}`, { headers })
            setDependencies(depsRes.data)

        } catch (err) {
            console.error('Failed to fetch data:', err)
            // Don't show error for 404 on first load (no analysis yet)
            if (err.response?.status !== 404) {
                setError(err.response?.data?.message || 'Failed to load data')
            }
        } finally {
            setLoading(false)
        }
    }, [projectId, getToken])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Trigger new analysis
    const triggerAnalysis = async () => {
        if (analyzing) return

        setAnalyzing(true)
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        try {
            const response = await api.post(`/api/ai/analyze/${projectId}`, {}, { headers })
            if (response.data.success) {
                setAnalysis({
                    ...response.data.analysis,
                    analyzedAt: new Date().toISOString()
                })
                // Refresh dependencies to get new suggestions
                const depsRes = await api.get(`/api/ai/dependencies/${projectId}`, { headers })
                setDependencies(depsRes.data)
            }
        } catch (err) {
            console.error('Analysis failed:', err)
            setError('Analysis failed. Please try again.')
        } finally {
            setAnalyzing(false)
        }
    }

    // Create task lookup
    const taskMap = project?.tasks?.reduce((acc, task) => {
        acc[task.id] = task
        return acc
    }, {}) || {}

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Brain className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-zinc-400">Loading AI Analysis...</p>
                </div>
            </div>
        )
    }

    if (!projectId || !project) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-700 dark:text-zinc-300 mb-4">No project selected</p>
                    <button
                        onClick={() => navigate('/projects')}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                        Go to Projects
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Brain className="w-6 h-6 text-purple-500" />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                AI Analysis
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm">
                            {project.name}
                        </p>
                    </div>
                </div>

                <button
                    onClick={triggerAnalysis}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                    {analyzing ? 'Analyzing...' : 'Run Analysis'}
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Alert Banner */}
            {analysis?.alerts?.length > 0 && (
                <AlertBanner
                    projectId={projectId}
                    alerts={analysis.alerts}
                />
            )}

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Graph */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dependency Graph */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-purple-500" />
                                <h2 className="font-semibold text-gray-800 dark:text-white">
                                    Dependency Graph
                                </h2>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                                Visual representation of task dependencies and critical path
                            </p>
                        </div>
                        <DependencyGraph
                            tasks={project?.tasks || []}
                            dependencies={[...(dependencies?.confirmed || []), ...(dependencies?.pending || [])]}
                            criticalPath={analysis?.criticalPathIds || []}
                            onNodeClick={(task) => navigate(`/taskDetails?id=${task.id}`)}
                        />
                    </div>

                    {/* Bottlenecks */}
                    {analysis?.bottlenecks?.length > 0 && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-orange-500" />
                                <h2 className="font-semibold text-gray-800 dark:text-white">
                                    Bottlenecks
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {analysis.bottlenecks.map((bottleneck, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-orange-800 dark:text-orange-300">
                                                {bottleneck.taskTitle}
                                            </h4>
                                            <span className="text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-full">
                                                {bottleneck.delayImpactDays} day impact
                                            </span>
                                        </div>
                                        <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                                            {bottleneck.reason}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gantt Timeline */}
                    <GanttTimeline
                        tasks={project?.tasks || []}
                        criticalPath={analysis?.criticalPathIds || []}
                        dependencies={[...(dependencies?.confirmed || []), ...(dependencies?.pending || [])]}
                    />

                    {/* Risk Factors Chart */}
                    <RiskFactorsChart
                        analysis={analysis}
                        tasks={project?.tasks || []}
                    />
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Risk Score */}
                    <RiskScoreBadge
                        projectId={projectId}
                        size="lg"
                        onAnalysisComplete={fetchData}
                    />

                    {/* AI Suggestions */}
                    <AISuggestionsPanel
                        projectId={projectId}
                        suggestions={dependencies?.pending || []}
                        tasks={taskMap}
                        onAccept={fetchData}
                        onReject={fetchData}
                    />

                    {/* Resource Conflicts */}
                    {analysis?.resourceConflicts?.length > 0 && (
                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-purple-500" />
                                <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                                    Resource Conflicts
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {analysis.resourceConflicts.map((conflict, index) => (
                                    <div key={index} className="text-sm text-purple-700 dark:text-purple-400">
                                        <span className="font-medium">{conflict.userName || 'User'}</span>
                                        <span> has {conflict.taskIds.length} overlapping tasks</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Analysis Info */}
                    {analysis && (
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 text-xs text-gray-500 dark:text-zinc-400">
                            <p>Last analyzed: {new Date(analysis.analyzedAt).toLocaleString()}</p>
                            <p className="mt-1">Critical path: {analysis.criticalPathIds?.length || 0} tasks</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AIAnalysisPage
