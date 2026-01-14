import { Plus, Sparkles, TrendingUp, Calendar } from 'lucide-react'
import { useState } from 'react'
import StatsGrid from '../components/StatsGrid'
import ProjectOverview from '../components/ProjectOverview'
import RecentActivity from '../components/RecentActivity'
import TasksSummary from '../components/TasksSummary'
import TaskDistributionChart from '../components/TaskDistributionChart'
import QuickActions from '../components/QuickActions'
import DeadlineTracker from '../components/DeadlineTracker'
import CreateProjectDialog from '../components/CreateProjectDialog'
import { useUser } from "@clerk/clerk-react"

const Dashboard = () => {

    const { user } = useUser()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Get current time greeting
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    // Get current date
    const today = new Date()
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className='max-w-7xl mx-auto'>
            {/* Premium Header Section */}
            <div className="relative mb-8">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 rounded-3xl blur-3xl" />

                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-gray-100 dark:border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-4">
                        {/* Avatar with ring */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20">
                                <img
                                    src={user?.imageUrl}
                                    alt={user?.fullName}
                                    className="w-full h-full rounded-2xl object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-500 mb-0.5">{getGreeting()}</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {user?.fullName || 'User'}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-gray-500 dark:text-zinc-400 text-sm flex items-center gap-1.5">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                    Projects on track
                                </p>
                                <span className="text-gray-300 dark:text-zinc-700">•</span>
                                <p className="text-gray-400 dark:text-zinc-500 text-sm flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {dateString}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 text-sm rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-500 hover:to-cyan-500 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        New Project
                    </button>

                    <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                </div>
            </div>

            {/* Stats Grid */}
            <StatsGrid />

            {/* Quick Actions + Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <QuickActions />
                <TaskDistributionChart />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Projects & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <ProjectOverview />
                    <RecentActivity />
                </div>

                {/* Right Column - Deadlines & Tasks */}
                <div className="space-y-6">
                    <DeadlineTracker />
                    <TasksSummary />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
