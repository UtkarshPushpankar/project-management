import { useSelector } from "react-redux";
import { CalendarClock, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { format, differenceInDays, isPast, isToday, isTomorrow } from "date-fns";
import { Link } from "react-router-dom";

const DeadlineTracker = () => {
    const { currentWorkspace } = useSelector((state) => state.workspace);

    // Get all tasks with due dates
    const allTasks = currentWorkspace?.projects?.flatMap(p =>
        p.tasks.map(t => ({ ...t, projectId: p.id, projectName: p.name }))
    ) || [];

    // Filter tasks with upcoming deadlines (not done)
    const upcomingTasks = allTasks
        .filter(t => t.due_date && t.status !== "DONE")
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5);

    const getDeadlineStatus = (dueDate) => {
        const date = new Date(dueDate);
        const daysUntil = differenceInDays(date, new Date());

        if (isPast(date) && !isToday(date)) {
            return { label: "Overdue", color: "text-red-500", bg: "bg-red-100 dark:bg-red-500/20", icon: AlertTriangle };
        }
        if (isToday(date)) {
            return { label: "Today", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20", icon: Clock };
        }
        if (isTomorrow(date)) {
            return { label: "Tomorrow", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20", icon: Clock };
        }
        if (daysUntil <= 7) {
            return { label: `${daysUntil}d`, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20", icon: CalendarClock };
        }
        return { label: format(date, "MMM d"), color: "text-gray-500", bg: "bg-gray-100 dark:bg-zinc-700", icon: CalendarClock };
    };

    return (
        <div className="bg-white shadow-sm dark:shadow-none dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-cyan-500/10">
            {/* Header */}
            <div className="border-b border-gray-100 dark:border-zinc-800 p-5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                        <CalendarClock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-500">{upcomingTasks.length} tasks due</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-0">
                {upcomingTasks.length === 0 ? (
                    <div className="p-8 text-center">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                        <p className="text-sm text-gray-600 dark:text-zinc-400">All caught up!</p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">No upcoming deadlines</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {upcomingTasks.map((task) => {
                            const status = getDeadlineStatus(task.due_date);
                            const StatusIcon = status.icon;

                            return (
                                <Link
                                    key={task.id}
                                    to={`/projectsDetail?id=${task.projectId}&tab=tasks`}
                                    className="block p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${status.bg}`}>
                                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-cyan-400 transition-colors">
                                                {task.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-zinc-500 truncate">
                                                {task.projectName}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${status.bg} ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeadlineTracker;
