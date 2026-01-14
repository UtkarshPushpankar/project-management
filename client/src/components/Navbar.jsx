import { SearchIcon, PanelLeft, User } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { MoonIcon, SunIcon } from 'lucide-react'
import { assets } from '../assets/assets'
import { UserButton } from '@clerk/clerk-react'

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);

    return (
        <div className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                {/* Left section */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Sidebar Trigger */}
                    <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="sm:hidden p-2 rounded-lg transition-all duration-200 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95" >
                        <PanelLeft size={20} />
                    </button>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm group">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 size-4 transition-colors group-focus-within:text-purple-500 dark:group-focus-within:text-cyan-400" />
                        <input
                            type="text"
                            placeholder="Search projects, tasks..."
                            className="pl-9 pr-4 py-2.5 w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-purple-400 dark:focus:border-cyan-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-cyan-500/20 transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">

                    {/* Theme Toggle */}
                    <button onClick={() => dispatch(toggleTheme())} className="size-9 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group">
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-4 text-gray-600 group-hover:text-purple-600 transition-colors" />)
                                : (<SunIcon className="size-4 text-zinc-400 group-hover:text-cyan-400 transition-colors" />)
                        }
                    </button>

                    {/* User Button */}
                    <UserButton />
                </div>
            </div>
        </div>
    )
}

export default Navbar
