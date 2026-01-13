import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import gsap from 'gsap';
import { Bot, ArrowLeft, Sparkles, Lock, Zap } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const SignInPage = () => {
    const { theme } = useSelector(state => state.theme);
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.from(".back-link", { x: -30, opacity: 0, duration: 0.5 })
                .from(".logo-container", { scale: 0.8, opacity: 0, duration: 0.6 }, "-=0.3")
                .from(".welcome-text", { y: 30, opacity: 0, duration: 0.5 }, "-=0.3")
                .from(".feature-pill", { y: 20, opacity: 0, stagger: 0.1, duration: 0.4 }, "-=0.2")
                .from(".signin-form", { y: 40, opacity: 0, scale: 0.98, duration: 0.6 }, "-=0.2")
                .from(".signup-link", { opacity: 0, duration: 0.4 }, "-=0.2");
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const isDark = theme === 'dark';

    return (
        <div ref={containerRef} className={`min-h-screen ${isDark ? 'bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900' : 'bg-gradient-to-b from-slate-50 via-white to-slate-100'} flex flex-col`}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-1/2 -left-1/2 w-full h-full ${isDark ? 'bg-gradient-to-br from-purple-900/30' : 'bg-gradient-to-br from-purple-200/40'} via-transparent to-transparent rounded-full blur-3xl animate-float`} />
                <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full ${isDark ? 'bg-gradient-to-tl from-blue-900/30' : 'bg-gradient-to-tl from-blue-200/40'} via-transparent to-transparent rounded-full blur-3xl animate-float-delayed`} />
            </div>

            {/* Header */}
            <div className="relative z-10 p-6 flex items-center justify-between">
                <Link to="/landing" className={`back-link group inline-flex items-center gap-2 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-all hover:gap-3`}>
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to home</span>
                </Link>
                <ThemeToggle />
            </div>

            {/* Main */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="logo-container relative mb-8">
                    <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 blur-2xl ${isDark ? 'opacity-30' : 'opacity-20'} animate-pulse-slow`} />
                    <div className="relative flex items-center gap-3 group cursor-pointer">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:shadow-purple-500/80 transition-all group-hover:scale-110">
                            <Bot className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">OrchestrAI</span>
                    </div>
                </div>

                <div className="welcome-text text-center mb-8">
                    <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Welcome back</h1>
                    <p className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} text-lg`}>Sign in to your AI-powered dashboard</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                    {[{ icon: Lock, text: "Secure", color: "text-emerald-500" }, { icon: Zap, text: "Fast", color: "text-yellow-500" }, { icon: Sparkles, text: "AI-Powered", color: "text-purple-500" }].map((item, i) => (
                        <div key={i} className={`feature-pill flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'} border`}>
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                            <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>{item.text}</span>
                        </div>
                    ))}
                </div>

                <div className="signin-form relative w-full max-w-md">
                    <SignIn afterSignInUrl="/" signUpUrl="/sign-up" appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: isDark ? "bg-zinc-900/90 border-2 border-zinc-800/80 shadow-2xl backdrop-blur-xl rounded-2xl" : "bg-white border-2 border-gray-200 shadow-2xl rounded-2xl",
                            headerTitle: isDark ? "text-white text-2xl font-bold" : "text-gray-900 text-2xl font-bold",
                            headerSubtitle: isDark ? "text-zinc-400" : "text-gray-500",
                            socialButtonsBlockButton: isDark ? "bg-zinc-800/80 border-2 border-zinc-700/50 text-white hover:bg-zinc-700/80" : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100",
                            formFieldInput: isDark ? "bg-zinc-800/80 border-2 border-zinc-700/50 text-white" : "bg-gray-50 border-2 border-gray-200 text-gray-900",
                            formButtonPrimary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg font-semibold",
                        }
                    }} />
                </div>

                <p className={`signup-link mt-10 ${isDark ? 'text-zinc-400' : 'text-gray-500'} text-sm`}>
                    Don't have an account? <Link to="/sign-up" className="text-purple-500 hover:text-purple-400 font-semibold">Sign up free</Link>
                </p>
            </div>

            <div className="relative z-10 p-6 text-center">
                <p className={`text-xs ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>© 2026 OrchestrAI</p>
            </div>
        </div>
    );
};

export default SignInPage;
