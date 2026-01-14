import { useEffect, useState } from "react";
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square, Activity } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";

const typeIcons = {
    BUG: { icon: Bug, color: "text-red-500 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/20" },
    FEATURE: { icon: Zap, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/20" },
    TASK: { icon: Square, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
    IMPROVEMENT: { icon: MessageSquare, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/20" },
    OTHER: { icon: GitCommit, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/20" },
};

const statusColors = {
    TODO: "bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300",
    IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
};

const RecentActivity = () => {
    const [tasks, setTasks] = useState([]);
    const { currentWorkspace } = useSelector((state) => state.workspace);

    const getTasksFromCurrentWorkspace = () => {
        if (!currentWorkspace) return;
        const tasks = currentWorkspace.projects.flatMap((project) => project.tasks.map((task) => task));
        setTasks(tasks);
    };

    useEffect(() => {
        getTasksFromCurrentWorkspace();
    }, [currentWorkspace]);

    return (
        <div className="bg-white shadow-sm dark:shadow-none dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-cyan-500/10">
            {/* Section Header */}
            <div className="border-b border-gray-100 dark:border-zinc-800 p-5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-500">{tasks.length} tasks total</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-0">
                {tasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center">
                            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-gray-600 dark:text-zinc-400">No recent activity</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {tasks.slice(0, 5).map((task) => {
                            const TypeIcon = typeIcons[task.type]?.icon || Square;
                            const iconColor = typeIcons[task.type]?.color || "text-gray-500 dark:text-gray-400";
                            const iconBg = typeIcons[task.type]?.bg || "bg-gray-100 dark:bg-zinc-800";

                            return (
                                <div key={task.id} className="p-5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all duration-200 group">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-xl ${iconBg} transition-transform group-hover:scale-110`}>
                                            <TypeIcon className={`w-4 h-4 ${iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-cyan-400 transition-colors">
                                                    {task.title}
                                                </h4>
                                                <span className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[task.status] || "bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300"}`}>
                                                    {task.status.replace("_", " ")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-500">
                                                <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md">{task.type.toLowerCase()}</span>
                                                {task.assignee && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-[10px] font-medium text-white">
                                                            {task.assignee.name[0].toUpperCase()}
                                                        </div>
                                                        <span>{task.assignee.name}</span>
                                                    </div>
                                                )}
                                                <span className="text-gray-400 dark:text-zinc-600">
                                                    {format(new Date(task.updatedAt), "MMM d, h:mm a")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
