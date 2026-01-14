import { useEffect, useState } from "react";
import { ArrowRight, Clock, AlertTriangle, User, ListTodo } from "lucide-react";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";

export default function TasksSummary() {

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { user } = useUser()
    const [tasks, setTasks] = useState([]);

    // Get all tasks for all projects in current workspace
    useEffect(() => {
        if (currentWorkspace) {
            setTasks(currentWorkspace.projects.flatMap((project) => project.tasks));
        }
    }, [currentWorkspace]);

    const myTasks = tasks.filter(i => i.assigneeId === user?.id);
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE');
    const inProgressIssues = tasks.filter(i => i.status === 'IN_PROGRESS');

    const summaryCards = [
        {
            title: "My Tasks",
            count: myTasks.length,
            icon: User,
            gradient: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
            textColor: "text-emerald-600 dark:text-emerald-400",
            items: myTasks.slice(0, 3)
        },
        {
            title: "Overdue",
            count: overdueTasks.length,
            icon: AlertTriangle,
            gradient: "from-red-500 to-rose-500",
            bgColor: "bg-red-50 dark:bg-red-500/10",
            textColor: "text-red-600 dark:text-red-400",
            items: overdueTasks.slice(0, 3)
        },
        {
            title: "In Progress",
            count: inProgressIssues.length,
            icon: Clock,
            gradient: "from-blue-500 to-indigo-500",
            bgColor: "bg-blue-50 dark:bg-blue-500/10",
            textColor: "text-blue-600 dark:text-blue-400",
            items: inProgressIssues.slice(0, 3)
        }
    ];

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <ListTodo className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tasks Summary</h2>
                    <p className="text-xs text-gray-500 dark:text-zinc-500">{tasks.length} total tasks</p>
                </div>
            </div>

            {summaryCards.map((card) => (
                <div key={card.title} className="bg-white shadow-sm dark:shadow-none dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-cyan-500/10 group">
                    {/* Card Header */}
                    <div className="border-b border-gray-100 dark:border-zinc-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <card.icon className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{card.title}</h3>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${card.bgColor} ${card.textColor}`}>
                            {card.count}
                        </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                        {card.items.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-4">
                                No {card.title.toLowerCase()}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {card.items.map((issue) => (
                                    <div key={issue.id} className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer group/item">
                                        <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate group-hover/item:text-purple-600 dark:group-hover/item:text-cyan-400 transition-colors">
                                            {issue.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-zinc-500 capitalize mt-1">
                                            {issue.type?.toLowerCase()} • {issue.priority?.toLowerCase()} priority
                                        </p>
                                    </div>
                                ))}
                                {card.count > 3 && (
                                    <button className="flex items-center justify-center w-full text-sm text-purple-600 dark:text-cyan-400 hover:text-purple-700 dark:hover:text-cyan-300 mt-2 font-medium group/btn">
                                        View {card.count - 3} more <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
