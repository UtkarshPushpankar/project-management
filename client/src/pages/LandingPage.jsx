import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NET from 'vanta/dist/vanta.net.min';
import GLOBE from 'vanta/dist/vanta.globe.min';
import * as THREE from 'three';
import {
    Brain, Zap, Users, Network, FileText, Activity,
    ArrowRight, Sparkles, GitBranch, BarChart3, Bot,
    Target, Rocket, CheckCircle2
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const { theme } = useSelector(state => state.theme);
    const isDark = theme === 'dark';
    const heroRef = useRef(null);
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);
    const statsRef = useRef(null);
    const benefitsRef = useRef(null);
    const featuresRef = useRef(null);
    const differentiatorRef = useRef(null);
    const ctaRef = useRef(null);

    const features = [
        { icon: Brain, title: "AI Dependency Brain", description: "Automatically detect hidden dependencies, predict delays, and get real-time risk scoring.", gradient: "from-purple-500 to-indigo-600" },
        { icon: Zap, title: "AI Sprint Designer", description: "Generate complete sprint plans with smart deadlines based on your team's capacity.", gradient: "from-blue-500 to-cyan-500" },
        { icon: Users, title: "Workload Balancer", description: "AI analyzes skills and availability to auto-assign tasks optimally.", gradient: "from-emerald-500 to-teal-500" },
        { icon: Network, title: "Knowledge Graph", description: "A living graph connecting people, tasks, and decisions. Search semantically.", gradient: "from-orange-500 to-amber-500" },
        { icon: FileText, title: "Auto-Documentation", description: "AI generates meeting summaries, release notes, and progress reports automatically.", gradient: "from-pink-500 to-rose-500" },
        { icon: Activity, title: "Project Health Score", description: "Real-time health analytics with actionable suggestions to prevent burnout.", gradient: "from-violet-500 to-purple-600" }
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

    // Vanta.js Effect - NET for dark, HALO for light
    useEffect(() => {
        if (vantaEffect) {
            vantaEffect.destroy();
            setVantaEffect(null);
        }

        if (vantaRef.current) {
            let effect;

            if (isDark) {
                // GLOBE effect for dark mode - cyan/purple globe
                effect = GLOBE({
                    el: vantaRef.current,
                    THREE: THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    color: 0x06b6d4,             // Cyan
                    color2: 0x8b5cf6,            // Purple
                    backgroundColor: 0x09090b,   // zinc-950
                    size: 1.2,
                    scale: 1.0
                });
            } else {
                // GLOBE effect for light mode - rotating globe
                effect = GLOBE({
                    el: vantaRef.current,
                    THREE: THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    color: 0x8b5cf6,             // Purple
                    color2: 0x06b6d4,            // Cyan
                    backgroundColor: 0xf4f4f5,  // zinc-100
                    size: 1.2,
                    scale: 1.0
                });
            }

            setVantaEffect(effect);
        }

        return () => { if (vantaEffect) vantaEffect.destroy(); };
    }, [isDark]);

    // GSAP Animations
    useEffect(() => {
        gsap.from(".hero-badge", { y: -50, opacity: 0, duration: 0.8, delay: 0.3, ease: "back.out(1.7)" });
        gsap.from(".hero-title-word", { y: 100, opacity: 0, rotateX: -90, stagger: 0.1, duration: 1, delay: 0.5, ease: "back.out(1.7)" });
        gsap.from(".hero-subtitle", { y: 40, opacity: 0, duration: 0.8, delay: 1.2, ease: "power3.out" });
        gsap.from(".hero-cta", { y: 30, opacity: 0, stagger: 0.15, duration: 0.6, delay: 1.5, ease: "power3.out" });
        gsap.from(".hero-trust", { y: 20, opacity: 0, duration: 0.5, delay: 1.8, ease: "power3.out" });

        gsap.set(".stat-card", { y: 60, opacity: 0, scale: 0.9 });
        ScrollTrigger.create({ trigger: statsRef.current, start: "top 85%", onEnter: () => gsap.to(".stat-card", { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }) });

        gsap.set(".benefit-item", { x: -40, opacity: 0 });
        ScrollTrigger.create({ trigger: benefitsRef.current, start: "top 85%", onEnter: () => gsap.to(".benefit-item", { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }) });

        gsap.set(".feature-card", { y: 80, opacity: 0, scale: 0.95 });
        ScrollTrigger.create({ trigger: featuresRef.current, start: "top 80%", onEnter: () => gsap.to(".feature-card", { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }) });

        gsap.set(".differentiator-content", { y: 60, opacity: 0 });
        ScrollTrigger.create({ trigger: differentiatorRef.current, start: "top 80%", onEnter: () => gsap.to(".differentiator-content", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }) });

        gsap.set(".cta-content", { y: 50, opacity: 0, scale: 0.95 });
        ScrollTrigger.create({ trigger: ctaRef.current, start: "top 85%", onEnter: () => gsap.to(".cta-content", { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }) });

        return () => ScrollTrigger.getAll().forEach(t => t.kill());
    }, []);

    return (
        <div ref={heroRef} className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors ${isDark ? 'bg-zinc-950/70 border-white/5' : 'bg-white/70 border-zinc-200'}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-16 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/80 transition-all group-hover:scale-110">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <span className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-white via-purple-200 to-blue-200' : 'from-purple-600 via-purple-500 to-blue-600'}`}>OrchestrAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link to="/sign-in" className={`px-5 py-2.5 text-sm font-medium transition-all hover:scale-105 ${isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'}`}>Sign In</Link>
                        <Link to="/sign-up" className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                <div ref={vantaRef} className="absolute inset-0 z-0" />
                <div className={`absolute inset-0 z-10 ${isDark ? 'bg-gradient-to-b from-zinc-950/30 via-transparent to-zinc-950' : 'bg-gradient-to-b from-zinc-100/30 via-transparent to-zinc-100'}`} />

                <div className="relative z-20 w-full px-6 lg:px-16 pt-32 pb-20 max-w-5xl mx-auto text-center">
                    <div className="absolute inset-0 rounded-3xl" style={{ background: isDark ? 'radial-gradient(ellipse at center, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.5) 40%, transparent 70%)' : 'radial-gradient(ellipse at center, rgba(244,244,245,0.9) 0%, rgba(244,244,245,0.5) 40%, transparent 70%)' }} />

                    <div className={`hero-badge relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-xl border mb-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-purple-500/10 border-purple-300/30'}`}>
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>Meet Your AI Project Manager</span>
                    </div>

                    <h1 className={`relative text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.1] mb-8 ${isDark ? 'drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]' : 'drop-shadow-[0_4px_20px_rgba(255,255,255,0.8)]'}`}>
                        <div className="overflow-hidden">
                            <span className={`hero-title-word inline-block ${isDark ? 'text-white' : 'text-zinc-900'}`}>The</span>{' '}
                            <span className={`hero-title-word inline-block ${isDark ? 'text-white' : 'text-zinc-900'}`}>Future</span>{' '}
                            <span className={`hero-title-word inline-block ${isDark ? 'text-white' : 'text-zinc-900'}`}>of</span>
                        </div>
                        <div className="overflow-hidden">
                            <span className={`hero-title-word inline-block bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-purple-400 via-blue-400 to-cyan-400' : 'from-purple-600 via-blue-600 to-cyan-600'}`}>Project</span>{' '}
                            <span className={`hero-title-word inline-block bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-cyan-400 via-blue-400 to-purple-400' : 'from-cyan-600 via-blue-600 to-purple-600'}`}>Intelligence</span>
                        </div>
                    </h1>

                    <p className={`hero-subtitle relative text-xl max-w-2xl mx-auto mb-12 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        OrchestrAI doesn't just track work — it{' '}
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>predicts</span>,{' '}
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>plans</span>,{' '}
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>balances</span>, and{' '}
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>documents</span> everything automatically.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                        <Link to="/sign-up" className="hero-cta group relative flex items-center gap-2 px-10 py-4 text-base font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 overflow-hidden">
                            <span className="relative">Get in touch</span>
                            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/sign-in" className={`hero-cta group flex items-center gap-2 px-10 py-4 text-base font-semibold border backdrop-blur-sm rounded-xl transition-all hover:scale-105 ${isDark ? 'text-zinc-300 bg-white/5 border-white/10' : 'text-zinc-700 bg-zinc-900/5 border-zinc-300'}`}>
                            Sign In to Dashboard
                            <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </Link>
                    </div>

                    <div className={`hero-trust relative flex flex-wrap items-center justify-center gap-6 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                        {["No credit card required", "14-day free trial", "Cancel anytime"].map((text, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section ref={statsRef} className={`relative z-10 px-6 lg:px-16 py-24 transition-colors ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
                <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className={`stat-card group relative p-8 rounded-2xl border transition-all duration-500 hover:scale-110 cursor-pointer ${isDark ? 'bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800/50 hover:border-purple-500/30' : 'bg-white border-zinc-200 hover:border-purple-400/50 shadow-lg'}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 rounded-2xl transition-all duration-500" />
                            <div className="relative">
                                <stat.icon className="w-6 h-6 text-purple-500 mb-4 group-hover:scale-110 transition-all" />
                                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">{stat.value}</div>
                                <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits Section */}
            <section ref={benefitsRef} className={`relative z-10 px-6 lg:px-16 py-16 transition-colors ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
                <div className="max-w-5xl mx-auto">
                    <div className={`relative p-10 lg:p-12 rounded-3xl border backdrop-blur-xl overflow-hidden ${isDark ? 'bg-gradient-to-br from-zinc-900/60 to-zinc-900/30 border-zinc-800/50' : 'bg-white/80 border-zinc-200 shadow-xl'}`}>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tl from-blue-500/20 to-transparent rounded-full blur-3xl" />
                        <div className="relative z-10">
                            <h3 className={`text-2xl lg:text-3xl font-bold mb-8 text-center ${isDark ? '' : 'text-zinc-900'}`}>Why teams choose OrchestrAI</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {benefits.map((benefit, i) => (
                                    <div key={i} className={`benefit-item group flex items-start gap-3 p-4 rounded-xl transition-all duration-300 ${isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-purple-50'}`}>
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                        <span className={`transition-colors ${isDark ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-700 group-hover:text-zinc-900'}`}>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className={`relative z-10 px-6 lg:px-16 py-20 lg:py-32 transition-colors ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Powered by Advanced AI</span>
                        </div>
                        <h2 className={`text-4xl lg:text-6xl font-bold mb-6 ${isDark ? '' : 'text-zinc-900'}`}>AI That Actually Works</h2>
                        <p className={`text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Features that transform how teams plan, execute, and deliver projects.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className={`feature-card group relative p-8 rounded-3xl border backdrop-blur-sm transition-all duration-500 hover:scale-105 cursor-pointer ${isDark ? 'bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800/50 hover:border-zinc-700/80' : 'bg-white border-zinc-200 hover:border-purple-300 shadow-lg'}`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 rounded-3xl transition-all duration-500" />
                                <div className="relative">
                                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg group-hover:scale-110 transition-all duration-500`}>
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className={`text-xl lg:text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{feature.title}</h3>
                                    <p className={`leading-relaxed transition-colors ${isDark ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-zinc-600 group-hover:text-zinc-700'}`}>{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Differentiator Section */}
            <section ref={differentiatorRef} className={`relative z-10 px-6 lg:px-16 py-20 transition-colors ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
                <div className="max-w-6xl mx-auto">
                    <div className={`differentiator-content relative p-10 lg:p-16 rounded-3xl border overflow-hidden group transition-all duration-500 ${isDark ? 'bg-gradient-to-br from-purple-900/30 via-zinc-900/50 to-blue-900/30 border-zinc-800/50 hover:border-purple-500/30' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50 border-zinc-200 hover:border-purple-300 shadow-xl'}`}>
                        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform"><GitBranch className="w-8 h-8 text-white" /></div>
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform"><BarChart3 className="w-8 h-8 text-white" /></div>
                            </div>
                            <h3 className="text-3xl lg:text-5xl font-bold mb-6">
                                <span className="bg-gradient-to-r from-purple-500 via-purple-400 to-blue-500 bg-clip-text text-transparent">AI Conflict Resolution & Personal Agents</span>
                            </h3>
                            <p className={`text-lg lg:text-xl leading-relaxed mb-8 max-w-3xl ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                When tasks conflict or deadlines overlap, AI detects and suggests solutions automatically. Plus, every team member gets a <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>personal AI agent</span> that manages their day.
                            </p>
                            <Link to="/sign-up" className="group/link inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:scale-105">
                                Experience the future
                                <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section ref={ctaRef} className={`relative z-10 px-6 lg:px-16 py-24 lg:py-40 transition-colors ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
                <div className="cta-content max-w-5xl mx-auto text-center">
                    <h2 className={`text-4xl lg:text-6xl font-bold mb-6 ${isDark ? '' : 'text-zinc-900'}`}>
                        Ready to transform<br />
                        <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">your workflow?</span>
                    </h2>
                    <p className={`text-lg lg:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Join teams who are already using AI to predict, plan, and deliver projects faster than ever.</p>
                    <Link to="/sign-up" className="group relative inline-flex items-center gap-3 px-12 py-5 text-lg font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110">
                        <span className="relative">Get Started Free</span>
                        <ArrowRight className="relative w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                    <p className={`mt-6 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>No credit card required • 14-day free trial • Cancel anytime</p>
                </div>
            </section>

            {/* Footer */}
            <footer className={`relative z-10 px-6 lg:px-16 py-12 border-t transition-colors ${isDark ? 'border-zinc-800/50 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">OrchestrAI</span>
                        </div>
                        <div className={`flex items-center gap-8 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {["Privacy", "Terms", "Contact", "Documentation"].map((link, i) => (
                                <a key={i} href="#" className="hover:text-purple-500 transition-colors">{link}</a>
                            ))}
                        </div>
                    </div>
                    <div className={`text-center text-sm ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>© 2026 OrchestrAI. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
