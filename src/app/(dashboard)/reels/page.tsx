
'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Music, MoreVertical, Play, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { subscribeToReels, Reel } from '@/lib/db';
import { cn } from '@/lib/utils';

const PUBLIC_VIDEOS = [
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4'
];

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToReels((data) => {
      if (data.length === 0) {
        setReels([
          { id: '1', authorId: 'u1', authorName: 'Nova Vision', authorHandle: 'nova_v', musicName: 'Quantum Waves', likes: 12400, comments: 345, videoUrl: PUBLIC_VIDEOS[0], description: 'Acelerando a la máxima velocidad en los valles del planeta rojo. #Marte #NovaTrip' },
          { id: '2', authorId: 'u2', authorName: 'Ciber Punk', authorHandle: 'punk_c', musicName: 'Neon Nights', likes: 8520, comments: 112, videoUrl: PUBLIC_VIDEOS[1], description: 'Las calles de Nova City nunca duermen, puro neón. #Cyberpunk #Nova' },
          { id: '3', authorId: 'u3', authorName: 'Aero Dynamics', authorHandle: 'aero_d', musicName: 'Sky Drift', likes: 5200, comments: 89, videoUrl: PUBLIC_VIDEOS[2], description: 'Probando el nuevo propulsor en órbita baja. ¡Funciona increíble!' },
          { id: '4', authorId: 'u4', authorName: 'Cosmic Dreamer', authorHandle: 'cosmic', musicName: 'LoFi Stars', likes: 21000, comments: 890, videoUrl: PUBLIC_VIDEOS[3], description: 'El cortometraje animado que está rompiendo récords en visualizaciones. Obra maestra.' }
        ] as any[]);
      } else {
        setReels(data.map((r, i) => ({ ...r, videoUrl: r.videoUrl || PUBLIC_VIDEOS[i % PUBLIC_VIDEOS.length] })));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Sincronizando Reels de Video...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-[calc(100vh-140px)] overflow-y-scroll snap-y snap-mandatory scroll-smooth w-full py-4 pb-20">
      {reels.map((reel) => (
        <ReelItem key={reel.id} reel={reel} />
      ))}
    </div>
  );
}

function ReelItem({ reel }: { reel: Reel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    // Intersection Observer to autoplay when in view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          videoRef.current?.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay prevent", e));
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      });
    }, { threshold: 0.7 });

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const isYouTube = reel.videoUrl?.includes('youtube.com') || reel.videoUrl?.includes('youtu.be');
  const getYTId = (url: string) => {
    // Detect regular video or shorts
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = isYouTube ? getYTId(reel.videoUrl) : null;

  return (
    <div className="relative w-full max-w-[400px] h-[calc(100vh-160px)] min-h-[600px] rounded-[2.5rem] overflow-hidden snap-center flex-shrink-0 mb-8 border border-white/10 shadow-2xl group bg-black">
      
      {isYouTube && ytId ? (
          <div className="absolute inset-0 w-full h-full pointer-events-auto">
            <iframe
              className="w-full h-full scale-[1.02] origin-center"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1`}
              title="YouTube Reels Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
            {/* Transparent click layer for mobile */}
            <div className="absolute inset-0 z-10 bg-transparent" />
          </div>
      ) : (
          <video 
            ref={videoRef}
            src={reel.videoUrl} 
            className="absolute inset-0 w-full h-full object-cover" 
            loop 
            playsInline
            onClick={togglePlay}
          />
      )}
      
      {/* Overlay play button when paused */}
      {!isYouTube && (
          <div 
            onClick={togglePlay}
            className={cn("absolute inset-0 z-10 flex items-center justify-center transition-all bg-black/20", isPlaying ? "opacity-0" : "opacity-100")}
          >
            <div className="w-20 h-20 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
              <Play className="w-10 h-10 text-white fill-current ml-1" />
            </div>
          </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/10 pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 z-20 flex justify-between items-end gap-4 pointer-events-none">
        <div className="flex-1 space-y-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/20 shadow-xl">
              <AvatarImage src={reel.authorAvatar || `https://ui-avatars.com/api/?name=${reel.authorName}`} />
              <AvatarFallback>{reel.authorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tighter uppercase">{reel.authorName}</span>
                <Button variant="outline" size="sm" className="h-5 text-[9px] font-black rounded-full border-primary/50 text-white bg-primary/20 hover:bg-primary uppercase px-3">Seguir</Button>
              </div>
              <p className="text-xs text-white/70 font-medium">@{reel.authorHandle}</p>
            </div>
          </div>
          
          <p className="text-sm text-white/90 leading-tight line-clamp-2 md:line-clamp-3 font-medium">{reel.description}</p>
          
          <div className="flex items-center gap-3 text-white/80">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/5">
              <Music className="w-3 h-3 animate-[spin_4s_linear_infinite]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{reel.musicName}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-5 pointer-events-auto">
          <div className="flex flex-col items-center gap-1 group/btn">
            <div className="p-3.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all cursor-pointer group-hover/btn:scale-110">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-tighter shadow-black/50 drop-shadow-md">{reel.likes}</span>
          </div>

          <div className="flex flex-col items-center gap-1 group/btn">
            <div className="p-3.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-primary hover:border-primary hover:text-white transition-all cursor-pointer group-hover/btn:scale-110">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-tighter shadow-black/50 drop-shadow-md">{reel.comments}</span>
          </div>

          <div className="flex flex-col items-center gap-1 group/btn">
            <div className="p-3.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-accent hover:border-accent hover:text-white transition-all cursor-pointer group-hover/btn:scale-110">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-tighter shadow-black/50 drop-shadow-md">SHARE</span>
          </div>

          <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-black/20 rounded-full h-12 w-12">
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
