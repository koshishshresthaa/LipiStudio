import React, { useCallback, useState } from 'react';
import { Upload, FileVideo, AlertCircle, Sparkles } from 'lucide-react';
import axios from 'axios';

const VideoUploader = ({ onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0]);
        }
    };

    const uploadFile = async (file) => {
        if (!file.type.startsWith('video/')) {
            setError("Please upload a valid MP4, MOV, or AVI video file.");
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            if (onUploadComplete) {
                onUploadComplete({
                    filename: file.name,
                    path: response.data.path,
                    url: URL.createObjectURL(file)
                });
            }
        } catch (err) {
            console.error(err);
            setError("Server error during upload. Is the backend running?");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto relative group">

            {/* Glow Effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 ${isUploading ? 'animate-pulse opacity-50' : ''}`}></div>

            <div
                className={`relative glass-panel rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragging
                        ? 'scale-[1.02] border-primary bg-primary/10'
                        : 'hover:border-primary/50 hover:bg-card/60'
                    }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileSelect}
                    accept="video/*"
                    disabled={isUploading}
                />

                <div className="flex flex-col items-center justify-center space-y-6">

                    <div className="relative">
                        {isUploading ? (
                            <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                        ) : (
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform duration-300 ${isDragging ? 'scale-110 rotate-3' : 'group-hover:scale-105'}`}>
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight text-white">
                            {isUploading ? "Uploading Video..." : "Upload your video"}
                        </h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">
                            Drag & drop or click to browse. We support mostly all video formats.
                        </p>
                    </div>

                    {!isUploading && !error && (
                        <div className="flex items-center gap-2 text-xs text-blue-200/50 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/10">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Ready</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {isUploading && (
                    <div className="absolute bottom-10 left-12 right-12">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="absolute -bottom-16 left-0 right-0 animate-in slide-in-from-top-2 fade-in">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg backdrop-blur-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoUploader;
