import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import MyTasksSidebar from './MyTasksSidebar'
import ProjectSidebar from './ProjectsSidebar'
import WorkspaceDropdown from './WorkspaceDropdown'
import { FolderOpenIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import { useClerk } from '@clerk/clerk-react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const { openUserProfile } = useClerk()

    const menuItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
        { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
        { name: 'Team', href: '/team', icon: UsersIcon },
    ]

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    return (
        <div ref={sidebarRef} className={`z-10 bg-white dark:bg-zinc-900 dark:bg-gradient-to-b dark:from-zinc-900 dark:to-zinc-950 min-w-68 flex flex-col h-screen border-r border-gray-200 dark:border-zinc-800 max-sm:absolute transition-all ${isSidebarOpen ? 'left-0' : '-left-full'} `} >
            <WorkspaceDropdown />
            <hr className='border-gray-200 dark:border-zinc-800' />
            <div className='flex-1 overflow-y-scroll no-scrollbar flex flex-col'>
                <div>
                    <div className='p-4'>
                        {menuItems.map((item) => (
                            <NavLink to={item.href} key={item.name} className={({ isActive }) => `flex items-center gap-3 py-2.5 px-4 text-gray-700 dark:text-zinc-300 cursor-pointer rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 dark:from-cyan-500/10 dark:to-purple-500/10 text-purple-600 dark:text-cyan-400 font-medium border-l-3 border-purple-500 dark:border-cyan-500' : 'hover:bg-gray-100 dark:hover:bg-zinc-800/60 hover:translate-x-1'}`} >
                                <item.icon size={18} className="transition-transform" />
                                <p className='text-sm'>{item.name}</p>
                            </NavLink>
                        ))}
                        <button onClick={openUserProfile} className='flex w-full items-center gap-3 py-2.5 px-4 text-gray-700 dark:text-zinc-300 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/60 hover:translate-x-1 transition-all duration-200'>
                            <SettingsIcon size={18} />
                            <p className='text-sm'>Settings</p>
                        </button>
                    </div>
                    <MyTasksSidebar />
                    <ProjectSidebar />
                </div>


            </div>

        </div>
    )
}

export default Sidebar
