'use client';

import { useEffect, useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  ArrowUp, 
  ArrowDown, 
  Send, 
  Clock, 
  Loader2, 
  Flame, 
  Heart, 
  MoreVertical, 
  Trash2, 
  Edit2,
  BarChart3,
  Plus,
  Zap,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  subscribeToActiveStories, 
  Story, 
  createStory, 
  updateStoryVote, 
  toggleLikeStory, 
  deleteStory, 
  updateStory,
  voteStoryPoll,
  addStoryResponse,
  subscribeToStoryResponses,
  StoryResponse
} from '@/lib/db';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';

export default function StoriesPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [storyType, setStoryType] = useState<'text' | 'poll' | 'qna'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToActiveStories((activeStories) => {
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

  const handleAddOption = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, '']);
  };

  const handleCreateForum = async () => {
    if (!newTitle.trim() || !user || !profile) return;
    setIsSubmitting(true);
    try {
      const options = storyType === 'poll' ? pollOptions.filter(o => o.trim() !== '') : undefined;
      await createStory(
        user.uid, 
        profile.displayName, 
        profile.photoURL, 
        newContent, 
        storyType, 
        newTitle,
        options
      );
      setNewTitle('');
      setNewContent('');
      setPollOptions(['', '']);
      setStoryType('text');
      toast({ title: 'Destello emitido', description: 'Tu frecuencia ha sido sincronizada con éxito.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Fallo al iniciar el destello.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pt-8 pb-32">
      <div className="flex flex-col mb-4 px-4 space-y-2">
        <Badge className="w-fit bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase font-black tracking-widest px-3 py-1 rounded-full text-[10px]">
          Frecuencias Efímeras <Clock className="w-3 h-3 ml-1.5 inline mb-0.5" />
        </Badge>
        <h1 className="text-5xl font-black tracking-tighter uppercase flex items-center gap-3 text-white italic">
           <Flame className="w-10 h-10 fill-orange-500 text-orange-500" />
           Destellos y <span className="text-orange-500">Foros</span>
        </h1>
        <p className="text-muted-foreground text-sm font-bold tracking-tight italic opacity-70">Emisiones comunitarias que se desintegran en 24 horas.</p>
      </div>

      {/* Selector de Emisión Mejorado */}
      <Card className="mx-4 glass border-orange-500/20 rounded-[2.5rem] p-1 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-orange-500/20 transition-all duration-700" />
        <CardContent className="p-4 sm:p-8 space-y-6">
          <div className="flex gap-3 sm:gap-5">
            <Avatar className="h-10 w-10 sm:h-14 sm:h-14 border-2 border-orange-500/30 ring-4 ring-orange-500/5 items-center justify-center">
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="bg-orange-500/10 text-orange-500 font-black">{profile?.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                 <Button 
                   onClick={() => setStoryType('text')} 
                   variant="ghost" 
                   className={cn("h-7 sm:h-8 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 transition-all", storyType === 'text' ? "bg-orange-500 text-white" : "text-muted-foreground hover:bg-white/5")}
                 >
                   Texto
                 </Button>
                 <Button 
                   onClick={() => setStoryType('poll')} 
                   variant="ghost" 
                   className={cn("h-7 sm:h-8 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 transition-all", storyType === 'poll' ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5")}
                 >
                   Encuesta
                 </Button>
                 <Button 
                   onClick={() => setStoryType('qna')} 
                   variant="ghost" 
                   className={cn("h-7 sm:h-8 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 transition-all", storyType === 'qna' ? "bg-accent text-black" : "text-muted-foreground hover:bg-white/5")}
                 >
                   QnA
                 </Button>
              </div>
              <Input 
                placeholder={storyType === 'poll' ? "¿Preguntas?" : "¿Qué pasa hoy?"} 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="bg-transparent border-none text-lg sm:text-2xl font-black p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/30 text-white italic tracking-tighter"
              />
              {newTitle.length > 0 && (
                <Textarea 
                  placeholder="Detalles..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="bg-white/5 border-white/5 hover:border-white/10 focus:border-orange-500/30 rounded-2xl min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm font-medium italic transition-all"
                />
              )}

              {storyType === 'poll' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 pt-2">
                   {pollOptions.map((opt, i) => (
                     <div key={i} className="relative group/opt">
                       <Input 
                         placeholder={`Opción ${i+1}`}
                         value={opt}
                         onChange={e => {
                           const n = [...pollOptions];
                           n[i] = e.target.value;
                           setPollOptions(n);
                         }}
                         className="h-9 sm:h-11 px-4 rounded-xl bg-white/5 border-white/5 focus:border-primary/40 text-[10px] sm:text-xs font-bold"
                       />
                     </div>
                   ))}
                   {pollOptions.length < 5 && (
                     <Button variant="ghost" onClick={handleAddOption} className="text-[10px] font-black text-primary hover:bg-primary/10 rounded-xl uppercase h-7">
                       + Opción
                     </Button>
                   )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleCreateForum} 
                  disabled={isSubmitting || !newTitle.trim()} 
                  className={cn(
                    "h-10 sm:h-14 rounded-xl sm:rounded-2xl px-6 sm:px-10 font-black uppercase tracking-widest gap-2 sm:gap-3 transition-all", 
                    storyType === 'poll' ? "bg-primary shadow-primary/20" : storyType === 'qna' ? "bg-accent text-black shadow-accent/20" : "bg-orange-500 shadow-orange-500/20"
                  )}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Emitir
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-orange-500" /></div>
      ) : stories.length === 0 ? (
        <div className="text-center py-32 opacity-30 space-y-6">
           <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/10 mx-auto flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
           </div>
           <div>
              <p className="text-2xl font-black uppercase tracking-widest">Atmósfera en Calma</p>
              <p className="text-sm font-bold italic mt-2">Sé el primero en alterar la frecuencia comunitaria.</p>
           </div>
        </div>
      ) : (
        <div className="space-y-8 px-4">
          {stories.map((story) => (
            <StoryCard 
              key={story.id} 
              story={story} 
              user={user}
              onVote={handleStoryVoteInternal}
              onLike={handleLike}
              onDelete={handleDelete}
              onEdit={handleEdit}
              userProfile={profile}
            />
          ))}
        </div>
      )}
    </div>
  );

  async function handleStoryVoteInternal(id: string, type: 'up' | 'down') {
    if (!id || !user) return;
    try {
      await updateStoryVote(id, type, 1);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLike(story: Story) {
    if (!user || !story.id) return;
    const isLiked = story.likedBy?.includes(user.uid);
    try {
      await toggleLikeStory(story.id, user.uid, isLiked);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteStory(id);
      toast({ title: "Destello disuelto", description: "La frecuencia ha sido retirada de la red." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  }

  async function handleEdit(story: Story) {
    const nT = prompt("Nuevo título:", story.title);
    const nC = prompt("Nuevo contenido:", story.content);
    if (!nT && !nC) return;
    try {
      await updateStory(story.id!, nC || story.content, nT || story.title);
      toast({ title: "Sincronizado" });
    } catch (e) {
      toast({ variant: "destructive", title: "Fallo" });
    }
  }
}

function StoryCard({ 
  story, 
  user, 
  onVote, 
  onLike, 
  onDelete, 
  onEdit,
  userProfile
}: { 
  story: Story, 
  user: any, 
  onVote: (id: string, type: 'up' | 'down') => void, 
  onLike: (s: Story) => void, 
  onDelete: (id: string) => void, 
  onEdit: (s: Story) => void,
  userProfile: any
}) {
  const [responses, setResponses] = useState<StoryResponse[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const hasVotedPoll = story.votedBy?.includes(user?.uid || '');
  const totalPollVotes = Object.values(story.pollVotes || {}).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (story.id) {
      const unsub = subscribeToStoryResponses(story.id, setResponses);
      return () => unsub();
    }
  }, [story.id]);

  const handleVotePoll = async (idx: number) => {
    if (!user || !story.id) return;
    try {
      await voteStoryPoll(story.id, idx, user.uid);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendResponse = async () => {
    if (!user || !responseText.trim() || !story.id) return;
    setIsSubmittingResponse(true);
    try {
      await addStoryResponse({
        storyId: story.id,
        authorId: user.uid,
        authorName: userProfile?.displayName || 'Explorador',
        authorAvatar: userProfile?.photoURL || '',
        content: responseText
      });
      setResponseText('');
      setIsResponding(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const score = (story.upvotes || 0) - (story.downvotes || 0);

  return (
    <Card className="glass border-white/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden hover:bg-white/[0.03] transition-all flex flex-col sm:flex-row group/card duration-500 hover:border-white/10 mx-4 sm:mx-0">
      {/* Votes Section */}
      <div className="w-full sm:w-16 bg-black/30 flex flex-row sm:flex-col items-center justify-between sm:justify-start sm:py-6 px-4 py-2 sm:px-0 gap-2 border-b sm:border-b-0 sm:border-r border-white/5 group-hover/card:bg-black/50 transition-colors">
        <Button onClick={() => onVote(story.id!, 'up')} variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 active:scale-125 transition-all">
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
        <span className={cn("font-black text-sm sm:text-lg tabular-nums", score > 0 ? "text-orange-500" : score < 0 ? "text-blue-500" : "text-white")}>
          {score}
        </span>
        <Button onClick={() => onVote(story.id!, 'down')} variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 active:scale-125 transition-all">
          <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </div>
      
      <div className="flex-1 p-5 sm:p-8 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6 ring-2 ring-white/5">
              <AvatarImage src={story.authorAvatar} />
              <AvatarFallback className="text-[8px]">{story.authorName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
              <span className="text-orange-500 italic">{story.authorName}</span>
              <span className="text-muted-foreground/40 hidden sm:inline">•</span>
              <span className="text-muted-foreground/60 flex items-center gap-1"><Clock className="w-3 h-3" /> {story.createdAt ? formatDistanceToNow(story.createdAt.toDate(), { locale: es }) : ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {story.type === 'poll' && <Badge className="bg-primary/20 text-primary border-primary/20 rounded-full text-[8px] sm:text-[9px] uppercase font-black px-2 sm:px-3">Encuesta</Badge>}
             {story.type === 'qna' && <Badge className="bg-accent/20 text-accent border-accent/20 rounded-full text-[8px] sm:text-[9px] uppercase font-black px-2 sm:px-3 text-black">QnA</Badge>}
             {user?.uid === story.authorId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-white hover:bg-white/5">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass border-white/10 rounded-2xl w-48 p-2">
                  <DropdownMenuItem onClick={() => onEdit(story)} className="gap-2 rounded-xl focus:bg-white/10 font-bold text-xs uppercase p-3">
                     <Edit2 className="w-3.5 h-3.5" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(story.id!)} className="gap-2 rounded-xl text-red-500 focus:bg-red-500/10 font-bold text-xs uppercase p-3 mt-1">
                     <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <h2 className={cn("text-xl sm:text-3xl font-black italic tracking-tighter uppercase leading-tight", story.type === 'poll' ? "text-primary" : story.type === 'qna' ? "text-accent" : "text-white")}>
            {story.title}
          </h2>
          {story.content && <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed italic whitespace-pre-wrap opacity-80">{story.content}</p>}
        </div>

        {/* Media Block */}
        {story.type === 'image' && story.content && story.content.startsWith('http') && (
          <div className="rounded-[2rem] overflow-hidden border border-white/5 relative aspect-video mt-4 shadow-2xl">
            <img src={story.content} alt="Contenido" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Poll Component */}
        {story.type === 'poll' && (
          <div className="space-y-4 pt-4">
            {story.pollOptions?.map((opt, i) => {
              const val = story.pollVotes?.[i.toString()] || 0;
              const perc = totalPollVotes > 0 ? Math.round((val / totalPollVotes) * 100) : 0;
              return (
                <div key={i} className="space-y-2 group/opt relative">
                   <div className="flex justify-between items-end mb-1 px-1">
                      <span className="text-[11px] font-black uppercase tracking-widest text-white/70 italic group-hover/opt:text-white transition-colors">{opt}</span>
                      <span className="text-[10px] font-black text-primary">{perc}%</span>
                   </div>
                   <div className="relative h-12 w-full bg-white/5 rounded-2xl overflow-hidden border border-white/5 group-hover/opt:border-white/10 transition-all">
                      <Progress value={perc} className="h-full bg-transparent" indicatorClassName="bg-gradient-to-r from-primary/40 to-primary transition-all duration-1000" />
                      {!hasVotedPoll && (
                        <button 
                          onClick={() => handleVotePoll(i)}
                          className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 bg-primary/10 flex items-center justify-center transition-all z-10 backdrop-blur-sm"
                        >
                          <span className="text-[9px] font-black uppercase tracking-widest text-white ring-1 ring-white/20 px-3 py-1 rounded-full">Sincronizar Voto</span>
                        </button>
                      )}
                   </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
          <Button 
            onClick={() => onLike(story)}
            variant="ghost" 
            size="sm" 
            className={cn("gap-2 h-10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all px-4", story.likedBy?.includes(user?.uid || '') ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:text-white hover:bg-white/5')}
          >
            <Heart className={cn("w-4 h-4", story.likedBy?.includes(user?.uid || '') ? 'fill-current' : '')} />
            {story.likes || 0} REACCIONES
          </Button>
          
          <Dialog open={isResponding} onOpenChange={setIsResponding}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-10 rounded-2xl text-muted-foreground hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest px-4">
                <MessageSquare className="w-4 h-4" /> {responses.length} RESPUESTAS
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10 sm:max-w-2xl p-0 overflow-hidden rounded-[3rem]">
              <div className="flex flex-col h-[600px]">
                <div className="p-8 border-b border-white/5">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-white">Consola de Respuestas</DialogTitle>
                    <p className="text-[10px] font-black uppercase text-orange-500 opacity-70 mt-1">Hilo comunitario: {story.title}</p>
                  </DialogHeader>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  {responses.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4 py-20">
                       <MessageSquare className="w-16 h-16" />
                       <p className="text-sm font-black uppercase tracking-widest">Frecuencia en espera</p>
                    </div>
                  ) : (
                    responses.map((resp) => (
                      <div key={resp.id} className="flex gap-4 group/resp">
                        <Avatar className="h-10 w-10 border border-white/10">
                          <AvatarImage src={resp.authorAvatar} />
                          <AvatarFallback className="bg-white/5 text-[10px]">{resp.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="text-[11px] font-black text-orange-500 uppercase tracking-tight">{resp.authorName}</span>
                             <span className="text-[9px] text-muted-foreground font-bold italic">• {resp.createdAt ? formatDistanceToNow(resp.createdAt.toDate(), { locale: es }) : ''}</span>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-2 top-0 w-0.5 h-full bg-orange-500/0 group-hover/resp:bg-orange-500/30 transition-all rounded-full" />
                            <p className="text-sm text-white/80 font-medium italic leading-relaxed">{resp.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                  <Textarea 
                    placeholder="Escribe tu contribución técnica..."
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    className="min-h-[80px] bg-white/5 border-white/5 rounded-2xl text-sm italic font-medium transition-all focus:border-orange-500/50"
                  />
                  <Button 
                    onClick={handleSendResponse}
                    disabled={isSubmittingResponse || !responseText.trim()}
                    className="h-auto px-6 rounded-2xl bg-orange-500 text-white font-black uppercase"
                  >
                    {isSubmittingResponse ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
}
