import { Plus, FolderPlus, UserPlus, ListPlus, Zap } from "lucide-react";
import { useState } from "react";
import CreateProjectDialog from "./CreateProjectDialog";

const QuickActions = () => {
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

    const actions = [
        {
            icon: FolderPlus,
            label: "New Project",
            description: "Create a project",
            gradient: "from-purple-500 to-indigo-500",
            onClick: () => setIsProjectDialogOpen(true)
        },
        {
            icon: ListPlus,
            label: "Add Task",
            description: "Quick add task",
            gradient: "from-cyan-500 to-blue-500",
            onClick: () => { }
        },
        {
            icon: UserPlus,
            label: "Invite Member",
            description: "Add team member",
            gradient: "from-emerald-500 to-teal-500",
            onClick: () => { }
        },
    ];

    return (
        <>
            <div className="bg-white shadow-sm dark:shadow-none dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-cyan-500/10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-500">Get things done faster</p>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            className="group flex flex-col items-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 hover:scale-[1.02]"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                <action.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-800 dark:text-white mb-0.5">{action.label}</span>
                            <span className="text-[10px] text-gray-500 dark:text-zinc-500">{action.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            <CreateProjectDialog isDialogOpen={isProjectDialogOpen} setIsDialogOpen={setIsProjectDialogOpen} />
        </>
    );
};

export default QuickActions;
