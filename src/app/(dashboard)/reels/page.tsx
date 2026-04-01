
'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Music, MoreVertical, Play, Pause, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { subscribeToReels, Reel } from '@/lib/db';
import { cn } from '@/lib/utils';

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToReels((data) => {
      // Si no hay datos, usamos mock para rellenar
      if (data.length === 0) {
        setReels([
          { id: '1', authorId: 'u1', authorName: 'Nova Vision', authorHandle: 'nova_v', musicName: 'Quantum Waves', likes: 1200, comments: 45, videoUrl: '', description: 'Explorando el metaverso NovaSphere 2.0. ¡Bienvenidos al futuro!' },
          { id: '2', authorId: 'u2', authorName: 'Ciber Punk', authorHandle: 'punk_c', musicName: 'Neon Nights', likes: 850, comments: 12, videoUrl: '', description: 'Las calles de Nova City nunca duermen. #Cyberpunk #Nova' }
        ] as any[]);
      } else {
        setReels(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Sincronizando Reels...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-[calc(100vh-140px)] overflow-y-scroll snap-y snap-mandatory scroll-hide">
      {reels.map((reel) => (
        <ReelItem key={reel.id} reel={reel} isPlaying={playingId === reel.id} onToggle={() => setPlayingId(playingId === reel.id ? null : reel.id!)} />
      ))}
    </div>
  );
}

function ReelItem({ reel, isPlaying, onToggle }: { reel: Reel, isPlaying: boolean, onToggle: () => void }) {
  const videoRef = useRef<HTMLImageElement>(null); // Usamos img para el mock, video real en prod

  return (
    <div className="relative w-full max-w-[420px] h-[calc(100vh-160px)] rounded-[3rem] overflow-hidden snap-center flex-shrink-0 mb-6 border border-white/10 shadow-2xl shadow-primary/10 group">
      {/* Background Media */}
      <img 
        src={`https://picsum.photos/seed/r${reel.id}/1080/1920`} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
        alt="Reel content" 
      />
      
      {/* Overlay controls */}
      <div 
        onClick={onToggle}
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10 cursor-pointer flex items-center justify-center"
      >
        {!isPlaying && (
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 animate-pulse">
            <Play className="w-10 h-10 text-white fill-current ml-1" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex justify-between items-end gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/20 shadow-xl">
              <AvatarImage src={reel.authorAvatar} />
              <AvatarFallback>{reel.authorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-lg tracking-tighter uppercase">{reel.authorName}</span>
                <Button variant="outline" size="sm" className="h-6 text-[9px] font-black rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white uppercase px-3">Seguir</Button>
              </div>
              <p className="text-xs text-white/70 font-medium">@{reel.authorHandle}</p>
            </div>
          </div>
          
          <p className="text-sm text-white/90 leading-relaxed line-clamp-2">{reel.description}</p>
          
          <div className="flex items-center gap-3 text-white/80">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/5">
              <Music className="w-3 h-3 animate-[spin_4s_linear_infinite]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{reel.musicName}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1 group/btn">
            <div className="p-4 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-red-500 hover:text-white transition-all cursor-pointer group-hover/btn:scale-110">
              <Heart className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{reel.likes}</span>
          </div>

          <div className="flex flex-col items-center gap-1 group/btn">
            <div className="p-4 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-primary hover:text-white transition-all cursor-pointer group-hover/btn:scale-110">
              <MessageCircle className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{reel.comments}</span>
          </div>

          <div className="flex flex-col items-center gap-1 group/btn">
            <div className="p-4 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-accent hover:text-white transition-all cursor-pointer group-hover/btn:scale-110">
              <Share2 className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">SHARE</span>
          </div>

          <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
            <MoreVertical className="w-6 h-6" />
          </Button>

          <div className="w-12 h-12 rounded-2xl border-2 border-white/20 overflow-hidden animate-[spin_6s_linear_infinite] shadow-xl">
            <img src={`https://picsum.photos/seed/music${reel.id}/100/100`} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
