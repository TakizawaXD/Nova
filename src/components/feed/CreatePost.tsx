
'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, MapPin, Smile, Send, Film, BarChart3, Loader2, X, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { createPost } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { uploadToSupabase } from '@/lib/supabase';

type AttachmentType = 'none' | 'media' | 'poll' | 'location';

export function CreatePost() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<AttachmentType>('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [locationStr, setLocationStr] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) setPollOptions([...pollOptions, '']);
  };

  const handleUpdatePollOption = (index: number, val: string) => {
    const newOpts = [...pollOptions];
    newOpts[index] = val;
    setPollOptions(newOpts);
  };

  const handleSubmit = async () => {
    if ((!content.trim() && activeAttachment === 'none') || !user || !profile) return;

    setIsSubmitting(true);
    try {
      let finalContent = content;

      if (activeAttachment === 'location' && locationStr.trim()) {
        finalContent += `\n\n📍 En: ${locationStr}`;
      } else if (activeAttachment === 'poll' && pollOptions[0].trim() && pollOptions[1].trim()) {
        finalContent += `\n\n📊 Encuesta:\n` + pollOptions.filter(o => o.trim()).map(o => `🔹 ${o}`).join('\n');
      }

      const postPayload: any = {
        authorId: user.uid,
        authorName: profile.username || profile.displayName,
        authorHandle: profile.username || profile.displayName?.toLowerCase().replace(/\s/g, '_') || 'socio_nova',
        authorAvatar: profile.photoURL || '',
        content: finalContent,
        likes: 0,
        comments: 0,
        shares: 0,
      };

      if (activeAttachment === 'poll' && pollOptions.some(o => o.trim())) {
        postPayload.poll = {
          question: content || "¿Qué opinas?",
          options: pollOptions.filter(o => o.trim()).map(o => ({ text: o, votes: 0 })),
          votedBy: []
        };
      }

      if (activeAttachment === 'media' && selectedFile) {
        try {
          const uploadedUrl = await uploadToSupabase(selectedFile, 'media', `posts/${user.uid}/${Date.now()}`);
          if (mediaType === 'video') {
            postPayload.videoUrl = uploadedUrl;
          } else {
            postPayload.imageUrl = uploadedUrl;
          }
        } catch (uploadError) {
          console.error("Error uploading media:", uploadError);
          toast({ variant: 'destructive', title: 'Error de subida', description: 'No se pudo subir el archivo.' });
          setIsSubmitting(false);
          return;
        }
      } else if (activeAttachment === 'media' && mediaUrl.trim()) {
        // Fallback or external URL logic (naive detection)
        if (mediaUrl.match(/\.(mp4|webm|ogg)$/i)) {
            postPayload.videoUrl = mediaUrl.trim();
        } else {
            postPayload.imageUrl = mediaUrl.trim();
        }
      }

      await createPost(postPayload);
      
      setContent('');
      setActiveAttachment('none');
      setMediaUrl('');
      setSelectedFile(null);
      setLocationStr('');
      setPollOptions(['', '']);
      
      toast({ title: '¡Publicado!', description: 'Tu señal fue emitida al universo Nova.' });
    } catch (error) {
      console.error("Error al publicar:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo publicar. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAttachment = (type: AttachmentType) => {
    if (type === 'media' && activeAttachment !== 'media') {
      fileInputRef.current?.click();
    }
    setActiveAttachment(prev => prev === type ? 'none' : type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setActiveAttachment('media');
    
    // Detect type
    if (file.type.startsWith('video/')) {
        setMediaType('video');
    } else {
        setMediaType('image');
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setMediaUrl(ev.target?.result as string); // Using mediaUrl for preview
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <div className="bg-[#050510]/80 backdrop-blur-3xl border border-white/[0.07] rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-xl relative group/create">
      {/* Accent top bar */}
      <div className="h-px bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0" />

      <div className="p-4 sm:p-6">
        {/* Header: Avatar + textarea */}
        <div className="flex gap-3 sm:gap-4">
          <Avatar className="h-9 w-9 sm:h-11 sm:w-11 shrink-0 border border-white/10 mt-1">
            <AvatarImage src={profile?.photoURL} className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-primary font-black text-sm">
              {(profile?.username || profile?.displayName)?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 mb-1.5">
              @{profile?.username || 'nova_user'}
            </p>
            <Textarea
              placeholder={`¿Qué emites hoy?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-transparent border-none focus-visible:ring-0 text-base sm:text-lg font-medium resize-none min-h-[60px] sm:min-h-[80px] p-0 placeholder:text-muted-foreground/30 text-white scroll-hide leading-relaxed"
            />
          </div>
        </div>

        {/* Dynamic Attachment Area */}
        {activeAttachment !== 'none' && (
          <div className="mt-4 p-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl relative animate-fade-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white"
              onClick={() => setActiveAttachment('none')}
            >
              <X className="w-3.5 h-3.5" />
            </Button>

            {activeAttachment === 'media' && (
              <div className="space-y-3 pr-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" /> Multimedia Seleccionada
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  onChange={handleFileChange}
                />
                {!selectedFile && (
                  <Input
                    placeholder="URL de imagen o video..."
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    className="bg-white/5 border-white/5 rounded-xl text-sm h-11 px-4 focus:bg-white/10"
                  />
                )}
                {mediaUrl && (
                  <div className="aspect-video w-full bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                    {mediaType === 'video' ? (
                       <video src={mediaUrl} className="w-full h-full object-cover" controls muted />
                    ) : (
                       /* eslint-disable-next-line @next/next/no-img-element */
                       <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    )}
                  </div>
                )}
              </div>
            )}

            {activeAttachment === 'poll' && (
              <div className="space-y-2.5 pr-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" /> Encuesta
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pollOptions.map((opt, i) => (
                    <Input
                      key={i}
                      placeholder={`Opción ${i + 1}`}
                      value={opt}
                      onChange={e => handleUpdatePollOption(i, e.target.value)}
                      className="bg-white/5 border-white/5 rounded-xl text-sm h-10 px-3"
                    />
                  ))}
                </div>
                {pollOptions.length < 4 && (
                  <Button variant="ghost" size="sm" onClick={handleAddPollOption}
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-amber-400 w-full border border-dashed border-white/10 rounded-xl h-9">
                    <PlusCircle className="w-3.5 h-3.5 mr-2" /> Añadir opción
                  </Button>
                )}
              </div>
            )}

            {activeAttachment === 'location' && (
              <div className="space-y-2.5 pr-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Ubicación
                </p>
                <Input
                  placeholder="¿Desde dónde transmites?"
                  value={locationStr}
                  onChange={e => setLocationStr(e.target.value)}
                  className="bg-white/5 border-white/5 rounded-xl text-sm h-10 px-3"
                />
              </div>
            )}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
          {/* Action buttons — scrollable on mobile */}
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar">
            <Button onClick={() => toggleAttachment('media')} variant="ghost" size="icon"
              className={cn("rounded-xl w-9 h-9 sm:w-10 sm:h-10 shrink-0", activeAttachment === 'media' ? "bg-primary/20 text-primary" : "text-violet-400 hover:bg-primary/10 hover:text-primary")}>
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button onClick={() => toggleAttachment('media')} variant="ghost" size="icon"
              className={cn("rounded-xl w-9 h-9 sm:w-10 sm:h-10 shrink-0", activeAttachment === 'media' ? "bg-cyan-500/20 text-cyan-400" : "text-cyan-500/70 hover:bg-cyan-500/10 hover:text-cyan-400")}>
              <Film className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button onClick={() => toggleAttachment('poll')} variant="ghost" size="icon"
              className={cn("rounded-xl w-9 h-9 sm:w-10 sm:h-10 shrink-0", activeAttachment === 'poll' ? "bg-amber-500/20 text-amber-400" : "text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-400")}>
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button onClick={() => setContent(prev => prev + '🚀')} variant="ghost" size="icon"
              className="rounded-xl text-yellow-400/70 hover:bg-yellow-500/10 hover:text-yellow-400 w-9 h-9 sm:w-10 sm:h-10 shrink-0">
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button onClick={() => toggleAttachment('location')} variant="ghost" size="icon"
              className={cn("rounded-xl w-9 h-9 sm:w-10 sm:h-10 shrink-0", activeAttachment === 'location' ? "bg-green-500/20 text-green-400" : "text-green-500/70 hover:bg-green-500/10 hover:text-green-400")}>
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Publish button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && activeAttachment === 'none')}
            className="rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 px-4 sm:px-7 gap-2 font-black uppercase tracking-widest text-[10px] sm:text-[11px] h-9 sm:h-11 shadow-lg shadow-primary/20 shrink-0 ml-2 transition-all hover:scale-105 active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <span className="hidden sm:inline">Publicar</span>
                <Send className="w-4 h-4 rotate-45" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
