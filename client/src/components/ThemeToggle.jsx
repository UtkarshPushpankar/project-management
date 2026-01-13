import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, loadTheme } from '../features/themeSlice';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Theme toggle component for public pages (landing, signin, signup)
 * Uses the same Redux themeSlice as the main app
 */
const ThemeToggle = ({ className = "" }) => {
    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);

    // Load theme on mount
    useEffect(() => {
        dispatch(loadTheme());
    }, [dispatch]);

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className={`relative size-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${theme === 'dark'
                    ? 'bg-zinc-800 hover:bg-zinc-700 shadow-lg shadow-purple-500/20'
                    : 'bg-white hover:bg-gray-100 shadow-lg shadow-gray-300/50'
                } ${className}`}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <SunIcon className="size-5 text-yellow-400 transition-transform duration-300" />
            ) : (
                <MoonIcon className="size-5 text-gray-700 transition-transform duration-300" />
            )}
        </button>
    );
};

export default ThemeToggle;
