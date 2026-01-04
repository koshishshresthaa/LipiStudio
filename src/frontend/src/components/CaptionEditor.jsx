import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import {
    Play, Pause, Save, Type, Languages, ArrowRight, Loader2,
    Download, RefreshCw, ChevronLeft, Film, Wand2, Check
} from 'lucide-react';

const CaptionEditor = ({ videoData, onBack }) => {
    const [segments, setSegments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [burnStatus, setBurnStatus] = useState(null);
    const [outputVideoPath, setOutputVideoPath] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showBurned, setShowBurned] = useState(false);

    const playerRef = useRef(null);
    const scrollRef = useRef(null);
    const activeSegmentRef = useRef(null);

    const handleTranscribe = async () => {
        setIsLoading(true);
        setSegments([]); // Clear previous
        setOutputVideoPath(null); // Clear previous burn
        setBurnStatus(null);
        try {
            const formData = new FormData();
            formData.append('video_path', videoData.path);
            formData.append('language', 'en');
            formData.append('mode', 'transcribe');

            const response = await axios.post('http://localhost:8000/transcribe', formData);
            setSegments(response.data.segments);
        } catch (err) {
            console.error(err);
            alert("Transcription failed. Please check backend logs.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSegmentChange = (index, field, value) => {
        const newSegments = [...segments];
        newSegments[index][field] = value;
        setSegments(newSegments);
    };

    const handleSegmentClick = (start) => {
        if (playerRef.current) {
            playerRef.current.seekTo(start, 'seconds');
            setPlaying(true);
        }
    };

    const activeSegmentIndex = segments.findIndex(
        seg => currentTime >= seg.start && currentTime <= seg.end
    );

    useEffect(() => {
        if (activeSegmentIndex !== -1 && activeSegmentRef.current) {
            activeSegmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeSegmentIndex]);

    const handleBurn = async () => {
        setBurnStatus('burning');
        try {
            const payload = {
                video_path: videoData.path,
                segments: segments.map(({ start, end, text }) => ({ start, end, text }))
            };
            const response = await axios.post('http://localhost:8000/burn', payload);
            setOutputVideoPath(response.data.output_path);
            setPreviewUrl(response.data.download_url);
            setBurnStatus('done');
            setShowBurned(true); // Automatically switch to burned preview
        } catch (err) {
            console.error(err);
            setBurnStatus('error');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500">

            {/* --- Toolbar --- */}
            <div className="glass px-6 py-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5"
                        title="Go Back"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                            <Film className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white tracking-wide truncate max-w-[200px]">
                                {videoData.filename}
                            </h2>
                            <p className="text-xs text-slate-500">Project Workspace</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleTranscribe}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-white hover:bg-blue-50 text-slate-900 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {isLoading ? "Process English Audio" : "Generate Captions"}
                    </button>
                </div>
            </div>

            {/* --- Main Workspace --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* Left: Player (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="flex-1 bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 group">
                        <ReactPlayer
                            ref={playerRef}
                            src={showBurned ? previewUrl : videoData.url}
                            width="100%"
                            height="100%"
                            controls
                            playing={playing}
                            onPlay={() => setPlaying(true)}
                            onPause={() => setPlaying(false)}
                            onProgress={(p) => setCurrentTime(p.playedSeconds)}
                            style={{ position: 'absolute', top: 0, left: 0 }}
                        />

                        {/* Floating Caption Overlay Preview (Only show when NOT viewing burned video) */}
                        {!showBurned && (
                            <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none">
                                <div className={`
                                    transition-all duration-300 transform
                                    ${activeSegmentIndex !== -1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                                `}>
                                    <span className="bg-black/80 backdrop-blur text-white px-4 py-2 text-sm rounded-lg font-medium shadow-xl border border-white/10 tracking-wide">
                                        {activeSegmentIndex !== -1 ? segments[activeSegmentIndex].text : ""}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Preview Mode Toggle */}
                        {previewUrl && (
                            <div className="absolute top-4 right-4 flex bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-2xl z-20">
                                <button
                                    onClick={() => setShowBurned(false)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!showBurned ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Draft
                                </button>
                                <button
                                    onClick={() => setShowBurned(true)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showBurned ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Burned
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions / Burn Status */}
                    {burnStatus === 'done' && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-3 text-emerald-400">
                                <div className="p-2 bg-emerald-500/20 rounded-full"><Check className="w-4 h-4" /></div>
                                <div>
                                    <p className="font-semibold text-sm">Rendering Complete!</p>
                                    <p className="text-xs opacity-70">Your video is ready for download.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewUrl}
                                    download
                                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    <Download className="w-4 h-4" />
                                    Download MP4
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Editor (5 cols) */}
                <div className="lg:col-span-5 glass-panel rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-2">
                            <Type className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-white">Subtitles</h3>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-400">{segments.length}</span>
                        </div>

                        {segments.length > 0 && (
                            <button
                                onClick={handleBurn}
                                disabled={burnStatus === 'burning'}
                                className="bg-white text-slate-900 hover:bg-blue-50 text-xs px-4 py-2 rounded-lg font-semibold transition shadow-lg shadow-white/10 flex items-center gap-2 disabled:opacity-50"
                            >
                                {burnStatus === 'burning' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                Burn to Video
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" ref={scrollRef}>
                        {segments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm p-8 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <Wand2 className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="font-medium text-slate-400">Ready to Generate</p>
                                <p className="text-xs text-slate-600 max-w-[200px] mt-2">Select your language mode and hit the Generate button above.</p>
                            </div>
                        ) : (
                            segments.map((seg, idx) => (
                                <div
                                    key={idx}
                                    ref={idx === activeSegmentIndex ? activeSegmentRef : null}
                                    onClick={() => handleSegmentClick(seg.start)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer group relative
                                ${idx === activeSegmentIndex
                                            ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/5'
                                            : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-white/5'
                                        }
                            `}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${idx === activeSegmentIndex ? 'bg-primary/20 text-blue-200' : 'bg-white/5 text-slate-500'}`}>
                                            {new Date(seg.start * 1000).toISOString().substr(14, 5)} - {new Date(seg.end * 1000).toISOString().substr(14, 5)}
                                        </span>
                                    </div>
                                    <textarea
                                        value={seg.text}
                                        onChange={(e) => handleSegmentChange(idx, 'text', e.target.value)}
                                        className="w-full bg-transparent resize-none outline-none text-sm text-slate-200 placeholder:text-slate-600 focus:text-white transition-colors"
                                        rows={Math.max(1, Math.ceil(seg.text.length / 32))}
                                        spellCheck="false"
                                    />

                                    {/* Active indicator bar */}
                                    {idx === activeSegmentIndex && (
                                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaptionEditor;
