import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, UsersIcon, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import CreateProjectDialog from "./CreateProjectDialog";

const ProjectOverview = () => {
    const statusColors = {
        PLANNING: "bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300",
        ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
        ON_HOLD: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
        COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
        CANCELLED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
    };

    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        setProjects(currentWorkspace?.projects || []);
    }, [currentWorkspace]);

    return currentWorkspace && (
        <div className="bg-white shadow-sm dark:shadow-none dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-cyan-500/10">
            {/* Section Header */}
            <div className="border-b border-gray-100 dark:border-zinc-800 p-5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Project Overview</h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-500">{projects.length} projects</p>
                    </div>
                </div>
                <Link to={'/projects'} className="text-sm text-purple-600 hover:text-purple-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center font-medium group">
                    View all <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Content */}
            <div className="p-0">
                {projects.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center">
                            <FolderOpen size={32} className="text-purple-600 dark:text-cyan-400" />
                        </div>
                        <p className="text-gray-600 dark:text-zinc-400 mb-4">No projects yet</p>
                        <button onClick={() => setIsDialogOpen(true)} className="px-5 py-2.5 text-sm bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-500 hover:to-cyan-500 transition-all font-medium">
                            Create your First Project
                        </button>
                        <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {projects.slice(0, 5).map((project) => (
                            <Link key={project.id} to={`/projectsDetail?id=${project.id}&tab=tasks`} className="block p-5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all duration-200 group">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-cyan-400 transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2">
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${statusColors[project.status]}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-500 mb-3">
                                    <div className="flex items-center gap-4">
                                        {project.members?.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <UsersIcon className="w-3.5 h-3.5" />
                                                {project.members.length} members
                                            </div>
                                        )}
                                        {project.end_date && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(project.end_date), "MMM d, yyyy")}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 dark:text-zinc-500">Progress</span>
                                        <span className="text-gray-700 dark:text-zinc-300 font-medium">{project.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                        <div className="h-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${project.progress || 0}%` }} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectOverview;
