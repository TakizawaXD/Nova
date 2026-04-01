'use client';

import { Heart, MessageCircle, Share2, Music, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const mockReels = [
  { id: 1, author: 'NeonVibe', handle: 'neon_vibe', music: 'Future Retro - Wave', likes: '1.2M', comments: '12k', image: 'https://picsum.photos/seed/r1/1080/1920' },
  { id: 2, author: 'Cyberscape', handle: 'scape_c', music: 'System Malfunction', likes: '840k', comments: '5.2k', image: 'https://picsum.photos/seed/r2/1080/1920' },
  { id: 3, author: 'Atlas One', handle: 'atlas_1', music: 'Interstellar Dreams', likes: '2.4M', comments: '45k', image: 'https://picsum.photos/seed/r3/1080/1920' },
];

export default function ReelsPage() {
  const [activeReel, setActiveReel] = useState(0);

  return (
    <div className="flex flex-col items-center gap-8 h-[calc(100vh-120px)] overflow-y-scroll scroll-hide snap-y snap-mandatory px-4">
      {mockReels.map((reel, idx) => (
        <div key={reel.id} className="relative w-full max-w-[400px] aspect-[9/16] rounded-3xl overflow-hidden snap-center flex-shrink-0 shadow-2xl shadow-primary/10 border border-white/10">
          <img src={reel.image} className="absolute inset-0 w-full h-full object-cover" alt="Reel Content" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          
          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex justify-between items-end">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white/20">
                  <AvatarImage src={`https://picsum.photos/seed/ra${reel.id}/100/100`} />
                  <AvatarFallback>{reel.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-white flex items-center gap-2">
                    {reel.author}
                    <Button variant="outline" size="sm" className="h-6 text-[10px] font-bold rounded-full border-white/30 text-white hover:bg-white hover:text-black">Follow</Button>
                  </p>
                  <p className="text-xs text-white/70">@{reel.handle}</p>
                </div>
              </div>
              <p className="text-sm text-white line-clamp-2">Exploring the boundaries of digital reality in NovaSphere 2.0. Join the revolution! 🚀✨</p>
              <div className="flex items-center gap-2 text-white/80">
                <Music className="w-4 h-4 animate-bounce" />
                <span className="text-xs">{reel.music}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 ml-4">
              <div className="flex flex-col items-center gap-1 group cursor-pointer">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-red-500 transition-colors">
                  <Heart className="w-6 h-6 text-white group-hover:fill-current" />
                </div>
                <span className="text-[10px] font-bold text-white">{reel.likes}</span>
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-pointer">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-primary transition-colors">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-white">{reel.comments}</span>
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-pointer">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-accent transition-colors">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-white">Share</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full text-white/60">
                <MoreVertical className="w-6 h-6" />
              </Button>
              <div className="w-10 h-10 rounded-lg border-2 border-white/40 overflow-hidden animate-[spin_4s_linear_infinite]">
                <img src={`https://picsum.photos/seed/mus${reel.id}/100/100`} className="w-full h-full object-cover" alt="Album Art" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
