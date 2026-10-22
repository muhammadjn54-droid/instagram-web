'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';

export interface VideoPlayerProps {
  src?: string | null;
  poster?: string;
  className?: string;
  aspectClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  className,
  aspectClassName = 'aspect-square',
  autoPlay = false,
  loop = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const url = getMediaUrl(src);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay with sound might require user gesture in some browsers
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
    }
  }, [autoPlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden bg-neutral-900 select-none cursor-pointer',
        aspectClassName,
        className,
      )}
      onClick={togglePlay}
    >
      {/* Instagram Lazy Loading Placeholder */}
      {isLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md animate-pulse">
            <span className="absolute inset-[3px] rounded-[11px] border-2 border-white/90" />
            <span className="h-3.5 w-3.5 rounded-full border-2 border-white/90" />
            <span className="absolute right-[6px] top-[6px] h-1.5 w-1.5 rounded-full bg-white/90" />
          </div>
        </div>
      ) : null}

      {url ? (
        <video
          ref={videoRef}
          src={url}
          poster={poster}
          loop={loop}
          playsInline
          preload="metadata"
          muted={isMuted}
          onLoadedData={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
          )}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-neutral-400">
          Видео недоступно
        </div>
      )}

      {/* Play Icon Overlay when paused */}
      {!isPlaying && !isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition-transform duration-200">
            <Play className="h-8 w-8 fill-white translate-x-0.5" />
          </div>
        </div>
      ) : null}

      {/* Sound / Volume Toggle Button */}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
        className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white shadow-md backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
