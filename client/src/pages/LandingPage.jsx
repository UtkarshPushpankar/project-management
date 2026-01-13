import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Brain,
    Zap,
    Users,
    Network,
    FileText,
    Activity,
    ArrowRight,
    Sparkles,
    GitBranch,
    BarChart3,
    Bot,
    Target,
    Rocket,
    CheckCircle2
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const { theme } = useSelector(state => state.theme);
    const heroRef = useRef(null);
    const statsRef = useRef(null);
    const benefitsRef = useRef(null);
    const featuresRef = useRef(null);
    const differentiatorRef = useRef(null);
    const ctaRef = useRef(null);

    const features = [
        {
            icon: Brain,
            title: "AI Dependency Brain",
            description: "Automatically detect hidden dependencies, predict delays, and get real-time risk scoring for your projects.",
            gradient: "from-purple-500 to-indigo-600"
        },
        {
            icon: Zap,
            title: "AI Sprint Designer",
            description: "Generate complete sprint plans with tasks, priorities, and smart deadlines based on your team's capacity.",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: Users,
            title: "Workload Balancer",
            description: "AI analyzes skills, availability, and past performance to auto-assign tasks optimally.",
            gradient: "from-emerald-500 to-teal-500"
        },
        {
            icon: Network,
            title: "Knowledge Graph",
            description: "A living graph connecting people, tasks, files, and decisions. Search semantically across everything.",
            gradient: "from-orange-500 to-amber-500"
        },
        {
            icon: FileText,
            title: "Auto-Documentation",
            description: "AI generates meeting summaries, release notes, progress reports, and decision logs automatically.",
            gradient: "from-pink-500 to-rose-500"
        },
        {
            icon: Activity,
            title: "Project Health Score",
            description: "Real-time health analytics with actionable suggestions to prevent burnout and delays.",
            gradient: "from-violet-500 to-purple-600"
        }
    ];

    const stats = [
        { value: "10x", label: "Faster Planning", icon: Zap },
        { value: "85%", label: "Risk Detection", icon: Target },
        { value: "3hrs", label: "Saved Daily", icon: Rocket },
        { value: "100%", label: "AI-Native", icon: Sparkles }
    ];

    const benefits = [
        "Predict project delays before they happen",
        "Automated sprint planning and task assignment",
        "Real-time workload balancing across teams",
        "Auto-generated documentation and reports",
        "Semantic search across your entire org",
        "Personal AI assistant for every team member"
    ];

    // GSAP Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero section animations
            const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

            heroTimeline
                .from(".hero-badge", { y: -30, opacity: 0, duration: 0.6 })
                .from(".hero-title-1", { y: 50, opacity: 0, duration: 0.8 }, "-=0.3")
                .from(".hero-title-2", { y: 50, opacity: 0, duration: 0.8 }, "-=0.5")
                .from(".hero-description", { y: 30, opacity: 0, duration: 0.6 }, "-=0.4")
                .from(".hero-cta", { y: 30, opacity: 0, stagger: 0.15, duration: 0.6 }, "-=0.3");

            // Stats animation on scroll
            gsap.from(".stat-card", {
                scrollTrigger: {
                    trigger: statsRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                y: 60,
                opacity: 0,
                scale: 0.9,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.7)"
            });

            // Benefits section animation
            gsap.from(".benefit-item", {
                scrollTrigger: {
                    trigger: benefitsRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                x: -40,
                opacity: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: "power2.out"
            });

            // Features grid animation
            gsap.from(".feature-card", {
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: "top 75%",
                    toggleActions: "play none none none"
                },
                y: 80,
                opacity: 0,
                scale: 0.95,
                duration: 0.7,
                stagger: 0.1,
                ease: "power3.out"
            });

            // Differentiator section animation
            gsap.from(".differentiator-content", {
                scrollTrigger: {
                    trigger: differentiatorRef.current,
                    start: "top 75%",
                    toggleActions: "play none none none"
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });

            // CTA section animation
            gsap.from(".cta-content", {
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                y: 50,
                opacity: 0,
                scale: 0.95,
                duration: 0.8,
                ease: "power3.out"
            });

        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900' : 'bg-gradient-to-b from-slate-50 via-white to-slate-100'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'} overflow-x-hidden`}>
            {/* Enhanced Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-1/2 -left-1/2 w-[100%] h-[100%] ${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/30' : 'bg-gradient-to-br from-purple-200/40'} via-transparent to-transparent rounded-full blur-3xl animate-float`} />
                <div className={`absolute -bottom-1/2 -right-1/2 w-[100%] h-[100%] ${theme === 'dark' ? 'bg-gradient-to-tl from-blue-900/30' : 'bg-gradient-to-tl from-blue-200/40'} via-transparent to-transparent rounded-full blur-3xl animate-float-delayed`} />
                <div className={`absolute top-1/4 right-1/4 w-96 h-96 ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-900/20' : 'bg-gradient-to-br from-cyan-200/30'} to-transparent rounded-full blur-3xl animate-pulse-slow`} />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-6 lg:px-16 py-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/80 transition-all group-hover:scale-110">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        OrchestrAI
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link
                        to="/sign-in"
                        className={`px-5 py-2.5 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-all hover:scale-105`}
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/sign-up"
                        className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative z-10 px-6 lg:px-16 pt-12 lg:pt-20 pb-20">
                <div className="max-w-6xl mx-auto text-center">
                    <div className={`hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30' : 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300/50'} border mb-8 backdrop-blur-sm hover:scale-105 transition-all`}>
                        <Sparkles className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} animate-spin-slow`} />
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                            AI-Native Project Management
                        </span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.1] mb-8">
                        <span className={`hero-title-1 block ${theme === 'dark' ? 'text-white' : 'text-gray-900'} drop-shadow-sm`}>
                            The Future of
                        </span>
                        <span className="hero-title-2 block bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent animate-gradient-shift">
                            Project Intelligence
                        </span>
                    </h1>

                    <p className={`hero-description text-lg lg:text-xl ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} max-w-3xl mx-auto mb-12 leading-relaxed`}>
                        OrchestrAI doesn't just track your work — it{' '}
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>predicts delays</span>,{' '}
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>auto-plans sprints</span>,{' '}
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>balances workloads</span>, and{' '}
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>generates documentation</span> automatically.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Link
                            to="/sign-up"
                            className="hero-cta group relative flex items-center gap-2 px-10 py-4 text-base font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                            <span className="relative">Start Free Trial</span>
                            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/sign-in"
                            className={`hero-cta group flex items-center gap-2 px-10 py-4 text-base font-semibold ${theme === 'dark' ? 'text-zinc-300 bg-zinc-900/50 border-zinc-700/50 hover:bg-zinc-800/80 hover:border-zinc-600' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'} border-2 rounded-xl backdrop-blur-sm transition-all hover:scale-105`}
                        >
                            Sign In to Dashboard
                            <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </Link>
                    </div>

                    {/* Stats */}
                    <div ref={statsRef} className="max-w-5xl mx-auto mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className={`stat-card group relative p-6 lg:p-8 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800/50 hover:border-zinc-700' : 'bg-white/80 border-gray-200 hover:border-purple-300 hover:shadow-xl'} border backdrop-blur-sm transition-all duration-500 hover:scale-110 cursor-pointer`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 rounded-2xl transition-all duration-500`} />
                                <div className="relative">
                                    <stat.icon className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} mb-3 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all`} />
                                    <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                                        {stat.value}
                                    </div>
                                    <div className={`text-sm ${theme === 'dark' ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-gray-500 group-hover:text-gray-700'} transition-colors`}>
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section ref={benefitsRef} className="relative z-10 px-6 lg:px-16 py-16">
                <div className="max-w-5xl mx-auto">
                    <div className={`relative p-8 lg:p-12 rounded-3xl ${theme === 'dark' ? 'bg-gradient-to-br from-zinc-900/60 to-zinc-900/30 border-zinc-800/50' : 'bg-white/70 border-gray-200 shadow-xl'} border backdrop-blur-xl overflow-hidden`}>
                        <div className={`absolute -top-24 -right-24 w-64 h-64 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-500/20' : 'bg-gradient-to-br from-purple-300/30'} to-transparent rounded-full blur-3xl`} />
                        <div className={`absolute -bottom-24 -left-24 w-64 h-64 ${theme === 'dark' ? 'bg-gradient-to-tl from-blue-500/20' : 'bg-gradient-to-tl from-blue-300/30'} to-transparent rounded-full blur-3xl`} />

                        <div className="relative z-10">
                            <h3 className={`text-2xl lg:text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Why teams choose OrchestrAI
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {benefits.map((benefit, i) => (
                                    <div
                                        key={i}
                                        className={`benefit-item group flex items-start gap-3 p-4 rounded-xl ${theme === 'dark' ? 'hover:bg-zinc-800/30' : 'hover:bg-purple-50/50'} transition-all duration-300`}
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                        <span className={`${theme === 'dark' ? 'text-zinc-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'} transition-colors`}>
                                            {benefit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="relative z-10 px-6 lg:px-16 py-20 lg:py-32">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-block mb-6">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-yellow-50 border-yellow-200'} border backdrop-blur-sm`}>
                                <Zap className="w-4 h-4 text-yellow-500" />
                                <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-yellow-700'}`}>Powered by Advanced AI</span>
                            </div>
                        </div>
                        <h2 className={`text-4xl lg:text-6xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            AI That Actually Works
                        </h2>
                        <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed`}>
                            Features that transform how teams plan, execute, and deliver projects.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className={`feature-card group relative p-8 rounded-3xl ${theme === 'dark' ? 'bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800/50 hover:border-zinc-700/80' : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-2xl'} border backdrop-blur-sm transition-all duration-500 hover:scale-105 cursor-pointer`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 rounded-3xl transition-all duration-500" />

                                <div className="relative">
                                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}>
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className={`text-xl lg:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-blue-500 group-hover:bg-clip-text transition-all`}>
                                        {feature.title}
                                    </h3>
                                    <p className={`${theme === 'dark' ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-gray-600 group-hover:text-gray-700'} leading-relaxed transition-colors`}>
                                        {feature.description}
                                    </p>
                                </div>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 rounded-full blur-2xl transition-all duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Differentiators Section */}
            <section ref={differentiatorRef} className="relative z-10 px-6 lg:px-16 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className={`differentiator-content relative p-10 lg:p-16 rounded-3xl ${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/30 via-zinc-900/50 to-blue-900/30 border-zinc-800/50 hover:border-purple-500/30' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50 border-purple-200 hover:border-purple-400 shadow-xl'} border overflow-hidden group transition-all duration-500`}>
                        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-500/5 to-blue-500/5 group-hover:from-purple-500/10 group-hover:to-blue-500/10' : 'bg-gradient-to-r from-purple-100/20 to-blue-100/20 group-hover:from-purple-100/40 group-hover:to-blue-100/40'} transition-all duration-500`} />
                        <div className={`absolute top-0 right-0 w-96 h-96 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-500/10' : 'bg-gradient-to-br from-purple-300/20'} to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000`} />
                        <div className={`absolute bottom-0 left-0 w-96 h-96 ${theme === 'dark' ? 'bg-gradient-to-tl from-blue-500/10' : 'bg-gradient-to-tl from-blue-300/20'} to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000`} />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                                    <GitBranch className="w-8 h-8 text-white" />
                                </div>
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform" style={{ transitionDelay: '0.1s' }}>
                                    <BarChart3 className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-3xl lg:text-5xl font-bold mb-6">
                                <span className="bg-gradient-to-r from-purple-500 via-purple-400 to-blue-500 bg-clip-text text-transparent">
                                    AI Conflict Resolution & Personal Agents
                                </span>
                            </h3>
                            <p className={`${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'} text-lg lg:text-xl leading-relaxed mb-8 max-w-3xl`}>
                                When tasks conflict or deadlines overlap, AI detects and suggests solutions automatically.
                                Plus, every team member gets a <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>personal AI agent</span> that manages their day, summarizes tasks,
                                and learns their productivity patterns.
                            </p>
                            <Link
                                to="/sign-up"
                                className="group/link inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:scale-105"
                            >
                                Experience the future
                                <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section ref={ctaRef} className="relative z-10 px-6 lg:px-16 py-24 lg:py-40">
                <div className="cta-content max-w-5xl mx-auto text-center">
                    <div className="relative inline-block mb-8">
                        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 blur-3xl ${theme === 'dark' ? 'opacity-30' : 'opacity-20'} animate-pulse-slow`} />
                        <h2 className={`relative text-4xl lg:text-6xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Ready to transform
                            <br />
                            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                your workflow?
                            </span>
                        </h2>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} text-lg lg:text-xl mb-12 max-w-2xl mx-auto leading-relaxed`}>
                        Join teams who are already using AI to predict, plan, and deliver projects faster than ever.
                    </p>
                    <Link
                        to="/sign-up"
                        className="group relative inline-flex items-center gap-3 px-12 py-5 text-lg font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                        <span className="relative">Get Started Free</span>
                        <ArrowRight className="relative w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                    <p className={`mt-6 text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                        No credit card required • 14-day free trial • Cancel anytime
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className={`relative z-10 px-6 lg:px-16 py-12 ${theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'} border-t backdrop-blur-sm`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                OrchestrAI
                            </span>
                        </div>
                        <div className={`flex items-center gap-8 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                            <a href="#" className={`${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'} transition-colors hover:underline`}>
                                Privacy
                            </a>
                            <a href="#" className={`${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'} transition-colors hover:underline`}>
                                Terms
                            </a>
                            <a href="#" className={`${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'} transition-colors hover:underline`}>
                                Contact
                            </a>
                            <a href="#" className={`${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'} transition-colors hover:underline`}>
                                Documentation
                            </a>
                        </div>
                    </div>
                    <div className={`text-center text-sm ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`}>
                        © 2026 OrchestrAI. All rights reserved. Built with AI, for AI-powered teams.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
