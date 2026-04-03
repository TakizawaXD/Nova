
'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Edit2, Trash2, Loader2, AlertTriangle, Heart, MessageSquare, Repeat, Share2, Bookmark, Send, Sparkles, Verified, Smile, Ghost } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { updatePost, deletePost, toggleLikePost, addComment, subscribeToComments, deleteComment, Comment, votePoll, Poll } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PostCardProps {
  id: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  image?: string;
  videoUrl?: string;
  poll?: Poll;
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
  likedBy?: string[];
  priority?: boolean;
}

export function PostCard({ id, author, content, image, videoUrl, poll, timestamp, likes = 0, comments: initialCommentsCount = 0, shares = 0, likedBy = [], priority = false }: PostCardProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [loading, setLoading] = useState(false);

  // Social State
  const [showComments, setShowComments] = useState(false);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(user ? likedBy.includes(user.uid) : false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const totalVotes = poll?.options.reduce((acc: number, opt) => acc + (opt.votes || 0), 0) || 0;
  const hasVoted = user && poll?.votedBy?.includes(user.uid);

  const handleVote = async (idx: number) => {
    if (!id || !user) return;
    try {
      await votePoll(id, idx, user.uid);
      toast({ title: "Señal Registrada", description: "Tu voto ha sido procesado por el núcleo." });
    } catch (e) {
      toast({ variant: "destructive", title: "Falla de Sistema", description: "No se pudo sincronizar el voto." });
    }
  };

  const COMMON_EMOJIS = ['🔥', '✨', '🚀', '⭐', '💎', '❤️', '🙌', '💯', '🦾', '👾', '🪐', '⚡'];
  const NOVAX_STICKERS = [
    'https://cdn.pixabay.com/photo/2020/08/21/08/40/astronaut-5505541_1280.png',
    'https://cdn.pixabay.com/photo/2020/08/21/08/46/astronaut-5505568_1280.png',
    'https://cdn.pixabay.com/photo/2017/01/31/15/34/astronaut-2025114_1280.png',
    'https://cdn.pixabay.com/photo/2017/01/31/15/33/astronaut-2025111_1280.png'
  ];

  const handleEmojiSelect = (emoji: string) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleStickerSelect = async (stickerUrl: string) => {
    if (!id || !user || !profile) return;
    try {
      await addComment({
        postId: id,
        authorId: user.uid,
        authorName: profile.displayName,
        authorAvatar: profile.photoURL,
        text: '',
        stickerUrl: stickerUrl
      });
      setShowStickerPicker(false);
    } catch (error) {
      console.error("Error adding sticker", error);
    }
  };

  const isOwner = user && user.uid === author.id;

  // --- Funciones CRUD de Autor ---
  const handleUpdate = async () => {
    if (!id || !editContent.trim()) return;
    setLoading(true);
    try {
      await updatePost(id, editContent);
      setIsEditing(false);
      toast({ title: 'Mensaje Alterado', description: 'Tu publicación ha sido modificada en la red.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo editar.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await deletePost(id);
      setIsDeleting(false);
      toast({ title: 'Registro Borrado', description: 'Tu post ha sido eliminado del núcleo cuántico.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo borrar.' });
    } finally {
      setLoading(false);
    }
  };

  // --- Funciones Sociales ---
  const handleLike = async () => {
    if (!id || !user) return;
    try {
      await toggleLikePost(id, user.uid, isLiked);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like", error);
    }
  };

  useEffect(() => {
    if (showComments && id) {
      const unsub = subscribeToComments(id, (data) => {
        setPostComments(data);
      });
      return () => unsub();
    }
  }, [showComments, id]);

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!id || !user || !profile || !newComment.trim()) return;
    try {
      await addComment({
        postId: id,
        authorId: user.uid,
        authorName: profile.displayName,
        authorAvatar: profile.photoURL,
        text: newComment
      });
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment", error);
    }
  };

  return (
    <>
      <Card className="bg-[#050510]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden transition-all hover:border-white/10 mb-8 shadow-2xl relative group/card">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-6 pb-2">
          <Link href={`/profile/${author.id}`} className="flex items-center gap-4 group/author cursor-pointer">
            <div className="relative group-hover/author:scale-105 transition-transform duration-500">
              <Avatar className="h-14 w-14 border-2 border-white/5 group-hover/author:border-primary/50 transition-colors shadow-2xl">
                <AvatarImage src={author.avatar} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">{author.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#030303] rounded-full flex items-center justify-center border border-white/5">
                 <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-white italic tracking-tight text-lg group-hover/author:text-primary transition-colors leading-none">{author.name}</span>
                <Verified className="w-4 h-4 text-primary opacity-80" />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">@{author.handle} <span className="mx-1.5 opacity-30">•</span> {timestamp}</p>
            </div>
          </Link>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-2xl text-muted-foreground hover:bg-white/5 data-[state=open]:bg-white/10 w-10 h-10">
                  <MoreHorizontal className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#050510]/95 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-2 shadow-2xl">
                <DropdownMenuItem onClick={() => setIsEditing(true)} className="rounded-xl gap-3 cursor-pointer font-black uppercase tracking-widest text-[10px] py-3 focus:bg-primary/20 focus:text-primary">
                  <Edit2 className="w-4 h-4" /> Editar Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleting(true)} className="rounded-xl gap-3 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500 font-black uppercase tracking-widest text-[10px] py-3 mt-1">
                  <Trash2 className="w-4 h-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="px-6 py-2 pb-6 space-y-5">
          <p className="text-base leading-relaxed whitespace-pre-wrap text-white/90 font-medium">{content}</p>
          
          {poll && (
            <div className="space-y-3 bg-white/5 p-6 rounded-[2.5rem] border border-white/5 mt-4 quantum-glow shadow-[0_0_40px_-15px_theme(colors.primary.DEFAULT)]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 flex items-center gap-2 italic">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Sintonía de Opinión
              </h4>
              <div className="space-y-3">
                {poll.options.map((opt, i) => {
                  const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  return (
                    <button 
                      key={i}
                      disabled={hasVoted}
                      onClick={() => handleVote(i)}
                      className={cn(
                        "w-full relative h-12 rounded-xl overflow-hidden border border-white/5 transition-all group/opt text-left",
                        hasVoted ? "cursor-default" : "hover:border-primary/50 cursor-pointer"
                      )}
                    >
                      <div 
                        className={cn("absolute inset-y-0 left-0 transition-all duration-1000", hasVoted ? "bg-primary/20" : "bg-white/5 group-hover/opt:bg-primary/10")} 
                        style={{ width: hasVoted ? `${percentage}%` : '0%' }}
                      />
                      <div className="relative h-full flex items-center justify-between px-4 z-10">
                        <span className="text-sm font-bold text-white/80">{opt.text}</span>
                        {hasVoted && <span className="text-xs font-black text-primary italic">{percentage}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-4">
                {totalVotes} Ciudadanos han participado {hasVoted && "• Señal Registrada"}
              </p>
            </div>
          )}

          {videoUrl && (
            <div className="relative aspect-video w-full rounded-[2rem] border border-white/10 mt-4 group/video shadow-2xl bg-black/40">
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-contain"
                poster={image} 
              />
            </div>
          )}

          {image && !videoUrl && (
            <div className="relative w-full rounded-[2rem] border border-white/10 mt-4 group/image shadow-2xl bg-black/20">
              <img 
                src={image} 
                alt="Post content" 
                className="w-full h-auto block transition-transform duration-700 group-hover/image:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity transition-transform duration-700 pointer-events-none" />
            </div>
          )}
        </CardContent>

        {/* Interactividad Social */}
        <CardFooter className="flex flex-col border-t border-white/5 p-0 bg-white/[0.02]">
          <div className="flex items-center justify-between px-6 py-4 w-full">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                className={cn("gap-2.5 rounded-2xl transition-all px-5 h-11", isLiked ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-red-500 hover:bg-red-500/5 group")}
              >
                <Heart className={cn("w-5 h-5 transition-transform active:scale-150", isLiked && "fill-current")} />
                <span className="text-sm font-black">{likes}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleToggleComments}
                className={cn("gap-2.5 rounded-2xl transition-all px-5 h-11", showComments ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5")}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-black">{initialCommentsCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2.5 rounded-2xl text-muted-foreground hover:text-green-500 hover:bg-green-500/5 px-5 h-11">
                <Repeat className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-tighter">{shares}</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 w-10 h-10">
                <Bookmark className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 w-10 h-10">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Vista Previa de Comentarios (Criterio Perfeccionista) */}
          {!showComments && postComments.length > 0 && (
            <div className="w-full px-6 py-3 bg-white/[0.01] border-t border-white/5 space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
                {postComments.slice(-2).map((c, i) => (
                    <div key={i} className="flex gap-2 text-[11px] font-medium items-center">
                        <span className="text-primary font-black italic">@{c.authorName.toLowerCase().replace(/\s/g, '_')}</span>
                        <span className="text-white/70 truncate">{c.text}</span>
                    </div>
                ))}
                {postComments.length > 2 && (
                    <button onClick={() => setShowComments(true)} className="text-[9px] font-black uppercase tracking-widest text-primary/50 hover:text-primary transition-colors">
                        Ver los {postComments.length} comentarios vinculados
                    </button>
                )}
            </div>
          )}

          {showComments && (
            <div className="w-full px-6 pb-8 animate-in slide-in-from-top-4 duration-500 border-t border-white/5 pt-6 bg-[#030303]/40">
              <div className="flex gap-4 mb-8">
                <Avatar className="h-10 w-10 border-2 border-primary/20 shrink-0 shadow-lg">
                  <AvatarImage src={profile?.photoURL} className="object-cover" />
                  <AvatarFallback className="bg-primary/20 text-primary font-black uppercase">{profile?.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3 relative group/comment-input">
                    <Input 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Sincronizar respuesta..." 
                      className="bg-white/5 border-white/5 rounded-2xl h-12 text-sm text-white px-5 focus:bg-white/10 focus:border-primary/30 transition-all placeholder:text-muted-foreground/30"
                      onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                    />
                    <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 group-focus-within/comment-input:opacity-100 transition-opacity">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowStickerPicker(false); }}
                            className={cn("h-8 w-8 rounded-lg hover:bg-white/10 transition-colors", showEmojiPicker ? "text-primary bg-primary/10" : "text-muted-foreground")}
                        >
                            <Smile className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); }}
                            className={cn("h-8 w-8 rounded-lg hover:bg-white/10 transition-colors", showStickerPicker ? "text-accent bg-accent/10" : "text-muted-foreground")}
                        >
                            <Ghost className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button onClick={handleAddComment} size="icon" className="h-12 w-12 shrink-0 bg-primary text-white hover:bg-primary/80 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 group/send-btn">
                      <Send className="w-5 h-5 group-hover/send-btn:translate-x-1 group-hover/send-btn:-translate-y-1 transition-transform" />
                    </Button>
                  </div>

                  {/* Emoji Picker Popover */}
                  {showEmojiPicker && (
                      <div className="p-3 bg-[#0a0a15] border border-white/10 rounded-2xl flex flex-wrap gap-2 animate-in zoom-in-95 duration-200">
                          {COMMON_EMOJIS.map(emoji => (
                              <button 
                                key={emoji} 
                                onClick={() => handleEmojiSelect(emoji)}
                                className="text-xl hover:scale-125 transition-transform p-1"
                              >
                                  {emoji}
                              </button>
                          ))}
                      </div>
                  )}

                  {/* Sticker Picker Popover */}
                  {showStickerPicker && (
                      <div className="p-4 bg-[#0a0a15] border border-white/10 rounded-3xl grid grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
                          {NOVAX_STICKERS.map((sticker, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => handleStickerSelect(sticker)}
                                className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-accent hover:scale-110 transition-all bg-white/5 p-1 group"
                              >
                                  <Image src={sticker} fill className="object-contain group-hover:rotate-6 transition-transform" alt="Sticker" />
                              </button>
                          ))}
                      </div>
                  )}
                </div>
              </div>

              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-6">
                  {postComments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group animate-fade-in relative">
                      <Avatar className="h-10 w-10 shrink-0 border border-white/5 shadow-lg group-hover:border-primary/30 transition-colors">
                        <AvatarImage src={comment.authorAvatar} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">{comment.authorName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 group-hover:bg-white/[0.05] transition-all relative">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">@{comment.authorName.toLowerCase().replace(/\s/g, '_')}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">
                                  {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { locale: es, addSuffix: true }) : 'Transmitiendo...'}
                                </span>
                                {user?.uid === comment.authorId && (
                                    <button 
                                        onClick={() => deleteComment(comment.id!, id)}
                                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded-lg"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                          </div>
                          {comment.text && <p className="text-sm text-white/90 leading-relaxed font-medium">{comment.text}</p>}
                          {comment.stickerUrl && (
                            <div className="mt-3 relative w-32 h-32 group/sticker transition-transform hover:scale-110 active:scale-95 duration-300">
                                <img src={comment.stickerUrl} alt="Sticker" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                                <div className="absolute inset-0 bg-primary/10 rounded-xl opacity-0 group-hover/sticker:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {postComments.length === 0 && (
                    <div className="text-center py-8">
                       <p className="text-[11px] text-muted-foreground uppercase font-black tracking-[0.3em] opacity-30 italic">Sin transmisiones entrantes</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="glass border-white/10 rounded-[2rem] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Editar Publicación
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[150px] bg-white/5 border-white/10 rounded-xl resize-none text-base text-white"
              placeholder="¿Qué estás pensando?"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={loading} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleUpdate} disabled={loading || !editContent.trim()} className="bg-primary hover:bg-primary/80 text-white rounded-xl px-8 font-bold gap-2 shadow-lg shadow-primary/30">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="glass border-red-500/20 bg-black/90 rounded-[2rem] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> ¿Destruir Post?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-foreground/80">Esta acción eliminará la publicación de manera permanente del servidor cuántico. No hay vuelta atrás.</p>
          </div>
          <DialogFooter className="flex-row gap-2 sm:justify-between w-full mt-4">
            <Button variant="ghost" onClick={() => setIsDeleting(false)} disabled={loading} className="flex-1 rounded-xl">Mantener</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading} className="flex-1 rounded-xl font-black gap-2 shadow-lg shadow-red-500/20">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Destruir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
