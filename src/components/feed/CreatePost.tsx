
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
        authorHandle: profile.username,
        authorAvatar: profile.photoURL,
        content: finalContent,
        likes: 0,
        comments: 0,
        shares: 0,
      };

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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No pudimos publicar tu post en este momento.',
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
    <div className="glass border-white/5 rounded-3xl p-5 mb-8 shadow-xl relative overflow-hidden">
      {/* Decorative gradient backglow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg">
          <AvatarImage src={profile?.photoURL} alt={profile?.displayName} className="object-cover" />
          <AvatarFallback>{profile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex flex-col min-h-[120px]">
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`¿Qué está pasando en tu mundo, ${profile?.displayName?.split(' ')[0]}?`} 
            className="bg-transparent border-none focus-visible:ring-0 text-lg resize-none min-h-[60px] p-0 placeholder:text-muted-foreground/50 text-white"
          />

          {/* Dinamic Attachment Area */}
          {activeAttachment !== 'none' && (
            <div className="mb-4 mt-2 p-4 bg-black/40 border border-white/10 rounded-2xl animate-fade-in relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 h-6 w-6 rounded-full text-muted-foreground hover:bg-white/10"
                onClick={() => setActiveAttachment('none')}
              >
                <X className="w-3 h-3" />
              </Button>

              {activeAttachment === 'media' && (
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Adjuntar Multimedia
                  </p>
                  <Input 
                    placeholder="Pega la URL pública de la imagen o video (Ej: https://...)" 
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl text-sm h-12"
                  />
                  {mediaUrl && (
                    <div className="h-24 w-full bg-white/5 rounded-xl border border-white/10 mt-2 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              )}

              {activeAttachment === 'poll' && (
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Crear Encuesta
                  </p>
                  {pollOptions.map((opt, i) => (
                    <Input 
                      key={i}
                      placeholder={`Opción ${i + 1}`} 
                      value={opt}
                      onChange={e => handleUpdatePollOption(i, e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl text-sm h-10"
                    />
                  ))}
                  {pollOptions.length < 4 && (
                    <Button variant="ghost" size="sm" onClick={handleAddPollOption} className="text-xs text-muted-foreground hover:text-accent w-full border border-dashed border-white/10 rounded-xl">
                      <PlusCircle className="w-3 h-3 mr-2" /> Añadir Opción
                    </Button>
                  )}
                </div>
              )}

              {activeAttachment === 'location' && (
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-green-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Ubicación Interestelar
                  </p>
                  <Input 
                    placeholder="¿Dónde te originaste?" 
                    value={locationStr}
                    onChange={e => setLocationStr(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl text-sm h-10"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/5">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                onClick={() => toggleAttachment('media')} 
                variant="ghost" size="icon" 
                className={cn("rounded-full transition-all", activeAttachment === 'media' ? "bg-primary/20 text-primary" : "text-primary hover:bg-primary/10")}
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => toggleAttachment('media')} 
                variant="ghost" size="icon" 
                className={cn("rounded-full transition-all", activeAttachment === 'media' ? "bg-accent/20 text-accent" : "text-accent hover:bg-accent/10")}
              >
                <Film className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => toggleAttachment('poll')} 
                variant="ghost" size="icon" 
                className={cn("rounded-full transition-all", activeAttachment === 'poll' ? "bg-orange-500/20 text-orange-500" : "text-orange-500 hover:bg-orange-500/10")}
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => setContent(prev => prev + '😁')} 
                variant="ghost" size="icon" 
                className="rounded-full text-yellow-500 hover:bg-yellow-500/10"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => toggleAttachment('location')} 
                variant="ghost" size="icon" 
                className={cn("rounded-full transition-all", activeAttachment === 'location' ? "bg-green-500/20 text-green-500" : "text-green-500 hover:bg-green-500/10")}
              >
                <MapPin className="w-5 h-5" />
              </Button>
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && activeAttachment === 'none')}
              className="rounded-[1.25rem] bg-primary hover:bg-primary/90 px-6 gap-2 font-bold shadow-[0_0_20px_theme(colors.primary.DEFAULT/30)] transition-all hover:scale-105"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar'}
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
