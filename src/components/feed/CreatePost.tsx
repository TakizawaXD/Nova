
'use client';

import { useState } from 'react';
import { Image as ImageIcon, MapPin, Smile, Send, Film, BarChart3, Loader2, X, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { createPost } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AttachmentType = 'none' | 'media' | 'poll' | 'location';

export function CreatePost() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeAttachment, setActiveAttachment] = useState<AttachmentType>('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

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
        authorName: profile.displayName,
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

      // Firestore strict rule: No undefined values!
      if (activeAttachment === 'media' && mediaUrl.trim()) {
        postPayload.imageUrl = mediaUrl.trim();
      }

      await createPost(postPayload);
      
      setContent('');
      setActiveAttachment('none');
      setMediaUrl('');
      setLocationStr('');
      setPollOptions(['', '']);
      
      toast({
        title: '¡Publicado!',
        description: 'Tu post ha sido compartido con el universo Nova.',
      });
    } catch (error) {
      console.error("Error al publicar:", error);
      toast({
        variant: 'destructive',
        title: 'Falla de Sincronización',
        description: 'No pudimos publicar tu post en este momento. Reintenta en breve.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAttachment = (type: AttachmentType) => {
    setActiveAttachment(prev => prev === type ? 'none' : type);
  };

  if (!user) return null;

  return (
    <div className="bg-[#050510]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all hover:border-white/10 group/post">
      {/* Decorative gradient backglow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex items-center sm:items-start gap-4">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border border-white/10 shadow-2xl shrink-0">
                <AvatarImage src={profile?.photoURL} alt={profile?.displayName} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">{profile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="sm:hidden">
                <p className="text-sm font-black text-white italic tracking-tighter uppercase">{profile?.displayName}</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-60">Emisión en vivo • XP</p>
            </div>
        </div>

        <div className="flex-1 flex flex-col min-h-[120px] sm:min-h-[140px] pt-1 sm:pt-2">
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`¿Qué está pasando en tu mundo, ${profile?.displayName?.split(' ')[0]}?`} 
            className="bg-transparent border-none focus-visible:ring-0 text-lg sm:text-xl font-medium resize-none min-h-[80px] p-0 placeholder:text-muted-foreground/30 text-white scroll-hide leading-relaxed px-1"
          />

          {/* Dynamic Attachment Area */}
          {activeAttachment !== 'none' && (
            <div className="mb-6 mt-4 p-5 bg-white/5 border border-white/10 rounded-[1.5rem] animate-fade-in relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-3 top-3 h-8 w-8 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-all"
                onClick={() => setActiveAttachment('none')}
              >
                <X className="w-4 h-4" />
              </Button>

              {activeAttachment === 'media' && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Adjuntar Multimedia
                  </p>
                  <Input 
                    placeholder="Pega la URL pública de la imagen o video..." 
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    className="bg-white/5 border-white/5 rounded-2xl text-sm h-14 px-5 focus:bg-white/10 transition-all"
                  />
                  {mediaUrl && (
                    <div className="aspect-video w-full bg-white/5 rounded-2xl border border-white/5 mt-4 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              )}

              {activeAttachment === 'poll' && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Crear Encuesta
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pollOptions.map((opt, i) => (
                      <Input 
                        key={i}
                        placeholder={`Opción ${i + 1}`} 
                        value={opt}
                        onChange={e => handleUpdatePollOption(i, e.target.value)}
                        className="bg-white/5 border-white/5 rounded-xl text-sm h-12 px-4"
                      />
                    ))}
                  </div>
                  {pollOptions.length < 4 && (
                    <Button variant="ghost" size="sm" onClick={handleAddPollOption} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-accent w-full border border-dashed border-white/10 rounded-xl h-10 mt-2">
                      <PlusCircle className="w-4 h-4 mr-2" /> Añadir Opción
                    </Button>
                  )}
                </div>
              )}

              {activeAttachment === 'location' && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Ubicación Nova
                  </p>
                  <Input 
                    placeholder="¿Desde dónde transmites?" 
                    value={locationStr}
                    onChange={e => setLocationStr(e.target.value)}
                    className="bg-white/5 border-white/5 rounded-xl text-sm h-12 px-4"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => toggleAttachment('media')} 
                variant="ghost" size="icon" 
                className={cn("rounded-2xl transition-all w-11 h-11", activeAttachment === 'media' ? "bg-primary/20 text-primary" : "text-[#8B5CF6] hover:bg-primary/10")}
              >
                <ImageIcon className="w-6 h-6" />
              </Button>
              <Button 
                onClick={() => toggleAttachment('media')} 
                variant="ghost" size="icon" 
                className={cn("rounded-2xl transition-all w-11 h-11", activeAttachment === 'media' ? "bg-accent/20 text-accent" : "text-[#06B6D4] hover:bg-accent/10")}
              >
                <Film className="w-6 h-6" />
              </Button>
              <Button 
                onClick={() => toggleAttachment('poll')} 
                variant="ghost" size="icon" 
                className={cn("rounded-2xl transition-all w-11 h-11", activeAttachment === 'poll' ? "bg-orange-500/20 text-orange-500" : "text-[#F59E0B] hover:bg-orange-500/10")}
              >
                <BarChart3 className="w-6 h-6" />
              </Button>
              <Button 
                onClick={() => setContent(prev => prev + '🚀')} 
                variant="ghost" size="icon" 
                className="rounded-2xl text-[#EAB308] hover:bg-yellow-500/10 w-11 h-11"
              >
                <Smile className="w-6 h-6" />
              </Button>
              <Button 
                onClick={() => toggleAttachment('location')} 
                variant="ghost" size="icon" 
                className={cn("rounded-2xl transition-all w-11 h-11", activeAttachment === 'location' ? "bg-green-500/20 text-green-500" : "text-[#10B981] hover:bg-green-500/10")}
              >
                <MapPin className="w-6 h-6" />
              </Button>
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && activeAttachment === 'none')}
              className="rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:brightness-110 px-8 gap-3 font-black uppercase tracking-widest text-[11px] h-12 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  Publicar
                  <Send className="w-4 h-4 rotate-45" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
