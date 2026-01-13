import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import gsap from 'gsap';
import { Bot, ArrowLeft, Sparkles, Rocket, CheckCircle2, Zap } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const SignUpPage = () => {
    const { theme } = useSelector(state => state.theme);
    const containerRef = useRef(null);
    const benefits = ["AI-powered sprint planning", "Smart task assignment", "Predictive analytics", "Personal AI assistant"];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.timeline({ defaults: { ease: "power3.out" } })
                .from(".left-back-link", { x: -30, opacity: 0, duration: 0.5 })
                .from(".left-logo", { scale: 0.8, opacity: 0, duration: 0.6 }, "-=0.3")
                .from(".left-heading", { y: 40, opacity: 0, duration: 0.6 }, "-=0.3")
                .from(".benefit-item", { x: -30, opacity: 0, stagger: 0.1, duration: 0.4 }, "-=0.2")
                .from(".trial-card", { y: 30, opacity: 0, duration: 0.5 }, "-=0.2");

            gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.2 })
                .from(".form-heading", { y: 30, opacity: 0, duration: 0.5 })
                .from(".form-pill", { y: 20, opacity: 0, stagger: 0.1, duration: 0.4 }, "-=0.2")
                .from(".signup-form", { y: 40, opacity: 0, scale: 0.98, duration: 0.6 }, "-=0.2");
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const isDark = theme === 'dark';

    return (
        <div ref={containerRef} className={`min-h-screen ${isDark ? 'bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900' : 'bg-gradient-to-b from-slate-50 via-white to-slate-100'} flex`}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-1/2 -left-1/2 w-full h-full ${isDark ? 'bg-gradient-to-br from-purple-900/30' : 'bg-gradient-to-br from-purple-200/40'} via-transparent to-transparent rounded-full blur-3xl animate-float`} />
                <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full ${isDark ? 'bg-gradient-to-tl from-blue-900/30' : 'bg-gradient-to-tl from-blue-200/40'} via-transparent to-transparent rounded-full blur-3xl animate-float-delayed`} />
            </div>

            {/* Left Side */}
            <div className="hidden lg:flex relative z-10 flex-1 flex-col justify-between p-12 max-w-xl">
                <div>
                    <Link to="/landing" className={`left-back-link group inline-flex items-center gap-2 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-all hover:gap-3 mb-16`}>
                        <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Back to home</span>
                    </Link>

                    <div className="left-logo flex items-center gap-3 mb-8 group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:scale-110 transition-all">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">OrchestrAI</span>
                    </div>

                    <h1 className="left-heading text-5xl font-bold mb-6 leading-tight">
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>Start building</span><br />
                        <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">smarter projects</span>
                    </h1>

                    <div className="space-y-4 mb-12">
                        {benefits.map((b, i) => (
                            <div key={i} className="benefit-item flex items-center gap-3 group">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                                <span className={`${isDark ? 'text-zinc-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'} text-lg transition-colors`}>{b}</span>
                            </div>
                        ))}
                    </div>

                    <div className={`trial-card p-6 rounded-2xl ${isDark ? 'bg-zinc-900/60 border-zinc-800/50' : 'bg-white border-gray-200 shadow-lg'} border`}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500"><Zap className="w-5 h-5 text-white" /></div>
                            <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold text-lg`}>Free Trial</span>
                        </div>
                        <p className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} text-sm`}>14-day free trial. No credit card required.</p>
                    </div>
                </div>
                <div className={`text-sm ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>© 2026 OrchestrAI</div>
            </div>

            {/* Right Side */}
            <div className="flex-1 flex flex-col relative z-10">
                <div className="lg:hidden p-6 flex items-center justify-between">
                    <Link to="/landing" className={`group inline-flex items-center gap-2 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-all`}>
                        <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Back</span>
                    </Link>
                    <ThemeToggle />
                </div>
                <div className="hidden lg:block absolute top-6 right-6"><ThemeToggle /></div>

                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                    <div className="form-heading text-center mb-8">
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Create your account</h1>
                        <p className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} text-lg`}>Start with AI-powered project management</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                        {[{ icon: Rocket, text: "Quick Setup", color: "text-blue-500" }, { icon: Sparkles, text: "14-Day Trial", color: "text-purple-500" }].map((item, i) => (
                            <div key={i} className={`form-pill flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'} border`}>
                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="signup-form relative w-full max-w-md">
                        <SignUp afterSignUpUrl="/" signInUrl="/sign-in" appearance={{
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

                    <p className={`form-pill mt-10 ${isDark ? 'text-zinc-400' : 'text-gray-500'} text-sm`}>
                        Already have an account? <Link to="/sign-in" className="text-purple-500 hover:text-purple-400 font-semibold">Sign in</Link>
                    </p>
                </div>

                <div className="lg:hidden p-6 text-center">
                    <p className={`text-xs ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>© 2026 OrchestrAI</p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
