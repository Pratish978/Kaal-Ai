"use client";
import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface PlayerProps {
  onClose: () => void;
  title: string;
  audioSrc: string; // New Prop
}

export default function MeditationPlayer({ onClose, title, audioSrc }: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    
    // Auto-play when modal opens
    audio.play().then(() => setIsPlaying(true)).catch(e => console.log("Autoplay blocked"));

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  }, [audioSrc]); // Re-run if source changes

  const togglePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedValue = (x / rect.width) * duration;
    if (audioRef.current) audioRef.current.currentTime = clickedValue;
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#6B6B6B] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl flex justify-center items-center relative mb-6">
        <div className="text-center text-white">
          <h2 className="text-[18px] font-medium">{title}</h2>
          <p className="text-[12px] opacity-80">Listening Now</p>
        </div>
        <button onClick={onClose} className="absolute right-0 text-white p-2">
          <X size={28} />
        </button>
      </div>

      <div className="relative w-full max-w-[850px] h-[50vh] md:h-auto md:aspect-[16/10] rounded-3xl overflow-hidden">
        <img src="/meditate.png" alt="Meditation" className="w-full h-full object-cover" />
        
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-24 bg-gradient-to-t from-black/70 to-transparent">
          {/* DYNAMIC AUDIO SOURCE HERE */}
          <audio ref={audioRef} src={audioSrc} />

          <div className="w-full mb-6">
            <div className="flex justify-between text-white text-[13px] mb-3">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div onClick={handleSeek} className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#5E5CE6] to-[#BF5AF2] rounded-full"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 text-white">
            <button><SkipBack size={26} fill="currentColor" /></button>
            <button onClick={togglePlay} className="bg-white/10 p-4 rounded-full backdrop-blur-md">
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
            <button><SkipForward size={26} fill="currentColor" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}