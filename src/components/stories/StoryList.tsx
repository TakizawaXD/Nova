
'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, Heart, Trash2, Edit2, MoreVertical, AlertTriangle, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { subscribeToActiveStories, createStory, setUserStatus, Story } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import NextImage from 'next/image';
import { Smile, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadToSupabase } from '@/lib/supabase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { toggleLikeStory, deleteStory, updateStory } from '@/lib/db';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function StoryList() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingType, setUploadingType] = useState<'image' | 'video'>('image');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToActiveStories((data) => {
      setStories(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Agrupar historias por autor
  const groupedStories = stories.reduce((acc, story) => {
    if (!acc[story.authorId]) {
      acc[story.authorId] = {
        authorId: story.authorId,
        authorName: story.authorName,
        authorAvatar: story.authorAvatar,
        stories: []
      };
    }
    acc[story.authorId].stories.push(story);
    return acc;
  }, {} as Record<string, { authorId: string, authorName: string, authorAvatar: string, stories: Story[] }>);

  const authorGroups = Object.values(groupedStories);

  const handleAddStory = (type: 'image' | 'video' = 'image') => {
    setUploadingType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    setIsUploading(true);
    try {
      const url = await uploadToSupabase(file, 'media', `stories/${user.uid}/${Date.now()}`);
      await createStory(user.uid, profile.displayName, profile.photoURL, url, uploadingType);
      toast({ title: "Destello publicado", description: "Tu frecuencia visual ha sido emitida." });
    } catch (error) {
      console.error("Error posting story:", error);
      toast({ variant: "destructive", title: "Error", description: "Fallo en la emisión cuántica." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetStatus = async (emoji: string) => {
    if (!user) return;
    try {
      await setUserStatus(user.uid, emoji);
      toast({ title: "Estado actualizado", description: "Tu burbuja emocional ha sido sincronizada." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el estado." });
    }
  };

  const handleLike = async (story: Story) => {
    if (!user || !story.id) return;
    const isLiked = story.likedBy?.includes(user.uid);
    try {
      await toggleLikeStory(story.id, user.uid, isLiked);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      if (selectedAuthorId && groupedStories[selectedAuthorId]?.stories.length <= 1) {
          setSelectedAuthorId(null);
      } else if (selectedAuthorId) {
          setSelectedStoryIndex(Math.max(0, selectedStoryIndex - 1));
      }
      toast({ title: "Destello eliminado", description: "El momento ha regresado al vacío." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el destello." });
    }
  };

  const handleEdit = async (story: Story) => {
    const newContent = prompt("Actualiza el contenido/URL de tu destello:", story.content);
    if (!newContent || newContent === story.content) return;
    try {
      await updateStory(story.id!, newContent);
      toast({ title: "Destello actualizado", description: "La frecuencia ha sido sintonizada." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo editar el destello." });
    }
  };

  const EMOJIS = ['😊', '🚀', '🔥', '💻', '🧘', '🎧', '🎨', '🔋', '✨', '🌑'];

  const currentStories = selectedAuthorId ? groupedStories[selectedAuthorId]?.stories || [] : [];
  const currentStory = currentStories[selectedStoryIndex];

  if (loading) {
    return (
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scroll-hide">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 overflow-x-auto pb-6 scroll-hide px-2 relative">
      {/* ADD DESTELLO SLOT */}
      <div className="flex flex-col items-center gap-2 shrink-0 group relative">
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative h-20 w-20 rounded-full border-2 border-dashed border-white/20 p-1 group-hover:border-primary transition-all duration-300 cursor-pointer">
              <Avatar className="h-full w-full bg-[#050510]">
                <AvatarImage src={profile?.photoURL} alt="Destello Nova" className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">{profile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 border-4 border-[#030303] shadow-lg shadow-primary/20">
                <Plus className="w-3.5 h-3.5 font-bold" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-[#050510]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] w-80">
            <DialogHeader><DialogTitle className="text-center font-black uppercase tracking-widest text-xs py-4 text-white">Nuevo Destello</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept={uploadingType === 'image' ? 'image/*' : 'video/*'} 
                onChange={handleFileChange}
              />
              <Button 
                onClick={() => handleAddStory('image')} 
                disabled={isUploading}
                className="flex flex-col gap-2 h-24 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/20"
              >
                {isUploading && uploadingType === 'image' ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="text-2xl">📸</span>}
                <span className="text-[10px] font-black uppercase">Foto</span>
              </Button>
              <Button 
                onClick={() => handleAddStory('video')} 
                disabled={isUploading}
                className="flex flex-col gap-2 h-24 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/20"
              >
                {isUploading && uploadingType === 'video' ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="text-2xl">📹</span>}
                <span className="text-[10px] font-black uppercase">Video</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Burbuja Emocional */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="absolute top-0 -right-2 w-8 h-8 bg-[#050510] border-2 border-primary rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-transform z-10">
              <span className="text-sm">{profile?.statusEmoji || '💭'}</span>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-[#050510]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] w-80">
            <DialogHeader>
              <DialogTitle className="text-center font-black uppercase tracking-widest text-xs py-4 text-white">Sintonía Emocional (12h)</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-5 gap-3 p-4">
              {EMOJIS.map(e => (
                <button 
                  key={e} 
                  onClick={() => handleSetStatus(e)}
                  className="text-2xl hover:bg-white/5 p-2 rounded-xl transition-all active:scale-90"
                >
                  {e}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-white transition-colors">Estado</span>
      </div>

      {/* STORY LIST - Grouped by Author */}
      {authorGroups.map((group) => {
        const storyCount = group.stories.length;
        
        return (
          <div 
            key={group.authorId} 
            onClick={() => {
              setSelectedAuthorId(group.authorId);
              setSelectedStoryIndex(0);
            }}
            className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
          >
            {/* Segmented Ring around Avatar */}
            <div className="relative h-20 w-20 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r="38"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-primary/20"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r="38"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={storyCount > 1 ? `${(2 * Math.PI * 38) / storyCount - 4} 4` : `${2 * Math.PI * 38}`}
                        className="text-primary transition-all duration-500"
                    />
                </svg>
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#030303] z-10 transition-all group-hover:scale-105">
                    <Avatar className="h-full w-full">
                        <AvatarImage src={group.authorAvatar} alt={group.authorName} className="object-cover" />
                        <AvatarFallback className="bg-primary/20 text-primary font-black uppercase">
                            {group.authorName[0]}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
            <span className="text-[11px] font-black text-white uppercase tracking-widest truncate w-20 text-center italic">
              {group.authorName.split(' ')[0]}
            </span>
          </div>
        );
      })}

      {/* STORY VIEWER MODAL - With Navigation */}
      <Dialog open={!!selectedAuthorId} onOpenChange={(open) => !open && setSelectedAuthorId(null)}>
        <DialogContent className="max-w-md h-[85vh] bg-black border-none p-0 overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
          <DialogHeader className="sr-only">
            <DialogTitle>Visor de Destellos Nova</DialogTitle>
            <DialogDescription>Visualización de historias efímeras de la red.</DialogDescription>
          </DialogHeader>
          {currentStory && (
            <div className="relative w-full h-full flex flex-col">
              
              {/* Top Navigation Segments (Instagram style) */}
              <div className="absolute top-4 left-0 right-0 z-50 flex gap-1.5 px-6">
                 {currentStories.map((_, i) => (
                   <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                            "h-full transition-all duration-300",
                            i < selectedStoryIndex ? "bg-white" : 
                            i === selectedStoryIndex ? "bg-white animate-[progress_5s_linear]" : "bg-transparent"
                        )} 
                      />
                   </div>
                 ))}
              </div>

              {/* Author Header */}
              <div className="absolute top-10 left-8 z-50 flex items-center gap-4">
                 <Avatar className="h-11 w-11 border-2 border-white/20 shadow-xl">
                    <AvatarImage src={currentStory.authorAvatar} />
                    <AvatarFallback>{currentStory.authorName[0]}</AvatarFallback>
                 </Avatar>
                 <div className="drop-shadow-lg">
                    <p className="text-sm font-black text-white tracking-widest uppercase italic">{currentStory.authorName}</p>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">{selectedStoryIndex + 1} de {currentStories.length} • EMISIÓN ACTIVA</p>
                 </div>
              </div>

              {/* Interaction Buttons (Next/Prev) */}
              <button 
                onClick={() => setSelectedStoryIndex(prev => Math.max(0, prev - 1))}
                disabled={selectedStoryIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-3/4 z-40 cursor-prev opacity-0 disabled:hidden"
              />
              <button 
                onClick={() => {
                  if (selectedStoryIndex < currentStories.length - 1) {
                    setSelectedStoryIndex(prev => prev + 1);
                  } else {
                    setSelectedAuthorId(null);
                  }
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-3/4 z-40 cursor-next opacity-0"
              />

              {/* Media Content */}
              <div className="flex-1 bg-[#030303] flex items-center justify-center p-0 overflow-hidden relative">
                {(currentStory.type === 'image' || !currentStory.type) && currentStory.content && (
                  <NextImage 
                    src={currentStory.content} 
                    alt="Story content" 
                    fill 
                    className="object-contain" 
                    priority
                  />
                )}
                {currentStory.type === 'video' && currentStory.content && (
                  <video 
                    src={currentStory.content} 
                    autoPlay 
                    loop 
                    muted
                    playsInline
                    className="w-full h-full object-contain" 
                  />
                )}

                {/* LIKE INTERACTION */}
                <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 z-50">
                   <Button 
                    onClick={() => handleLike(currentStory)}
                    className={cn(
                        "rounded-full h-20 w-20 shadow-2xl transition-all duration-500",
                        currentStory.likedBy?.includes(user?.uid || '') 
                          ? "bg-primary text-white scale-110 shadow-primary/40 border-4 border-white/20" 
                          : "bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 border border-white/10"
                    )}
                   >
                     <Heart className={cn("w-10 h-10 transition-transform", currentStory.likedBy?.includes(user?.uid || '') ? "fill-current scale-110" : "")} />
                   </Button>
                   <span className="font-black text-[10px] uppercase tracking-[0.4em] text-white/50 bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md">
                      {currentStory.likes || 0} RESONANCIAS
                   </span>
                </div>

                {/* AUTHOR CONTROLS */}
                {user?.uid === currentStory.authorId && (
                  <div className="absolute top-10 right-8 z-50 flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 border border-white/10">
                          <MoreVertical className="w-6 h-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#050510]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-56 text-white p-3 shadow-2xl">
                         <DropdownMenuItem onClick={() => handleEdit(currentStory)} className="gap-3 rounded-2xl py-4 focus:bg-primary/20 cursor-pointer font-black uppercase text-[10px] tracking-widest">
                           <Edit2 className="w-4 h-4" /> RECALIBRAR FRECUENCIA
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleDelete(currentStory.id!)} className="gap-3 rounded-2xl py-4 text-red-500 focus:bg-red-500/10 cursor-pointer font-black uppercase text-[10px] tracking-widest mt-1">
                           <Trash2 className="w-4 h-4" /> DISOLVER DESTELLO
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Navigation Indicators (Custom CSS needed or icons) */}
              <div className="absolute bottom-6 left-8 flex items-center gap-2 opacity-40 pointer-events-none">
                 <Zap className="w-4 h-4 text-primary" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">INTERFAZ NOVA SPHARE</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
