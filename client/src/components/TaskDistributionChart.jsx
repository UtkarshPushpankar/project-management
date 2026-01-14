import { useSelector } from "react-redux";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle, Clock, Circle, XCircle } from "lucide-react";

const COLORS = {
    TODO: { color: "#94a3b8", icon: Circle, label: "To Do" },
    IN_PROGRESS: { color: "#f59e0b", icon: Clock, label: "In Progress" },
    DONE: { color: "#10b981", icon: CheckCircle, label: "Completed" },
};

const TaskDistributionChart = () => {
    const { currentWorkspace } = useSelector((state) => state.workspace);

    // Get all tasks from all projects
    const allTasks = currentWorkspace?.projects?.flatMap(p => p.tasks) || [];

    // Count tasks by status
    const todoCount = allTasks.filter(t => t.status === "TODO").length;
    const inProgressCount = allTasks.filter(t => t.status === "IN_PROGRESS").length;
    const doneCount = allTasks.filter(t => t.status === "DONE").length;
    const totalTasks = allTasks.length;

    const data = [
        { name: "To Do", value: todoCount, status: "TODO" },
        { name: "In Progress", value: inProgressCount, status: "IN_PROGRESS" },
        { name: "Completed", value: doneCount, status: "DONE" },
    ].filter(item => item.value > 0);

    const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-zinc-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{payload[0].value} tasks</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white shadow-sm dark:shadow-none dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-cyan-500/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Task Distribution</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-500">{totalTasks} total tasks</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">{completionRate}%</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-500">Complete</p>
                </div>
            </div>

            {/* Chart */}
            {totalTasks > 0 ? (
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={35}
                                    outerRadius={55}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry) => (
                                        <Cell key={entry.status} fill={COLORS[entry.status].color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{doneCount}</p>
                                <p className="text-[10px] text-gray-500 dark:text-zinc-500">Done</p>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-3">
                        {Object.entries(COLORS).map(([status, { color, icon: Icon, label }]) => {
                            const count = status === "TODO" ? todoCount : status === "IN_PROGRESS" ? inProgressCount : doneCount;
                            const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                        <span className="text-sm text-gray-600 dark:text-zinc-400">{label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                                        <span className="text-xs text-gray-400 dark:text-zinc-500">({percentage}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <Circle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-zinc-600" />
                    <p className="text-sm text-gray-500 dark:text-zinc-400">No tasks yet</p>
                </div>
            )}
        </div>
    );
};

export default TaskDistributionChart;
