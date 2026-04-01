'use client';

import { useEffect, useState } from 'react';
import { Sparkles, MessageSquare, ArrowUp, ArrowDown, Send, Clock, Loader2, Flame } from 'lucide-react';
import { subscribeToActiveStories, Story, createStory, updateStoryVote } from '@/lib/db';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function StoriesPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToActiveStories((activeStories) => {
      // Ordenar por popularidad (upvotes - downvotes) y luego fechas
      const sorted = activeStories.sort((a, b) => {
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.createdAt - a.createdAt;
      });
      setStories(sorted);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateForum = async () => {
    if (!newTitle.trim() || !user || !profile) return;
    setIsSubmitting(true);
    try {
      await createStory(user.uid, profile.displayName, profile.photoURL, newTitle, newContent);
      setNewTitle('');
      setNewContent('');
      toast({ title: 'Pregunta lazada', description: 'Tu hilo ha entrado en la constelación.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Fallo al iniciar el hilo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (storyId: string | undefined, type: 'up' | 'down') => {
    if (!storyId || !user) return;
    try {
      await updateStoryVote(storyId, type);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pt-8 pb-32">
      <div className="flex flex-col mb-8 px-4">
        <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3 text-orange-500">
          <Flame className="w-8 h-8 fill-current" />
          Foros de Preguntas
        </h1>
        <p className="text-muted-foreground mt-2 text-sm font-bold tracking-widest uppercase">Historias comunitarias que expiran en 24h.</p>
      </div>

      <Card className="mx-4 glass border-orange-500/20 rounded-[2rem] p-1 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-5 flex gap-4">
          <Avatar className="h-10 w-10 border border-orange-500/30">
            <AvatarImage src={profile?.photoURL} />
            <AvatarFallback>{profile?.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Input 
              placeholder="¿De qué quieres hablar?" 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="bg-transparent border-none text-xl font-black p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 text-white"
            />
            {newTitle.length > 0 && (
              <Textarea 
                placeholder="Añade contexto opcional..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl min-h-[80px] text-sm"
              />
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={handleCreateForum} disabled={isSubmitting || !newTitle.trim()} className="rounded-xl px-6 font-bold bg-orange-500 hover:bg-orange-600 text-white gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Preguntar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 opacity-50 space-y-4">
           <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground" />
           <p className="text-xl font-black uppercase tracking-tighter">Sin hilos activos</p>
           <p className="text-sm">Sé el primero en hacer una pregunta épica a la comunidad.</p>
        </div>
      ) : (
        <div className="space-y-4 px-4">
          {stories.map((story) => (
            <Card key={story.id} className="glass border-white/5 rounded-2xl overflow-hidden hover:bg-white/5 transition-all flex">
              {/* Votes Column */}
              <div className="w-16 bg-black/20 flex flex-col items-center py-4 gap-1 border-r border-white/5">
                <Button onClick={() => handleVote(story.id, 'up')} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 active:scale-150 transition-all">
                  <ArrowUp className="w-5 h-5" />
                </Button>
                <span className="font-black text-sm my-1">{(story.upvotes || 0) - (story.downvotes || 0)}</span>
                <Button onClick={() => handleVote(story.id, 'down')} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 active:scale-150 transition-all">
                  <ArrowDown className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex-1 p-5">
                <div className="flex items-center gap-2 mb-2 text-[11px] text-muted-foreground font-black tracking-widest uppercase">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={story.authorAvatar} />
                  </Avatar>
                  <span className="text-primary">{story.authorName}</span>
                  <span className="opacity-50 flex items-center gap-1"><Clock className="w-3 h-3" /> {story.createdAt ? formatDistanceToNow(story.createdAt.toDate(), { locale: es }) : ''}</span>
                </div>
                
                <h2 className="text-xl font-bold mb-2 text-white">{story.title}</h2>
                {story.content && <p className="text-sm text-muted-foreground/80 leading-relaxed whitespace-pre-wrap">{story.content}</p>}
                
                {story.imageUrl && ( // Para fallbacks de historias viejas con foto
                  <div className="mt-4 rounded-xl overflow-hidden max-h-[300px] border border-white/10 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={story.imageUrl} alt="Contenido multimedia" className="w-full object-cover" />
                  </div>
                )}
                
                <div className="flex items-center gap-4 mt-6">
                  <Button variant="ghost" size="sm" className="gap-2 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 text-xs font-bold">
                    <MessageSquare className="w-4 h-4" /> 0 Respuestas
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
