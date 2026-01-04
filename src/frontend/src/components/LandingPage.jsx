import React from 'react';
import { Sparkles, Zap, Globe, ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import VideoUploader from './VideoUploader';

const LandingPage = ({ onUploadStart, onUploadComplete }) => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/20 text-blue-300 text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>Professional AI-Powered English Captions</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Studio-Quality Captions <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                            in Seconds.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Stop typing subtitles manually. LipiStudio uses advanced speech recognition to generate, translate, and styling captions for your videos instantly.
                    </p>

                    <div className="pt-8 w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
                        <VideoUploader onUploadComplete={onUploadComplete} />
                        <p className="mt-4 text-sm text-slate-500">No credit card required · Free for early access</p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-900/30 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Everything you need to go viral</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Professional tools simplified for content creators.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Globe,
                                title: "AI Transcription",
                                desc: "High-accuracy English speech recognition with automatic punctuation."
                            },
                            {
                                icon: CheckCircle2,
                                title: "Smart Timing",
                                desc: "Perfectly synced timestamps ensure your captions follow the speech flow."
                            },
                            {
                                icon: Zap,
                                title: "Hardcoded Subs",
                                desc: "Burn subtitles directly into your video for a professional look on any platform."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/50 transition-all group">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 glass rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
                            <span className="text-white font-bold text-[11px]">L</span>
                        </div>
                        <span className="text-slate-300 font-semibold">LipiStudio</span>
                        <span>© 2026</span>
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
