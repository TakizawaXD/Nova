
'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2, Loader2, AlertTriangle, Heart, MessageSquare, Repeat, Share2, Bookmark, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { updatePost, deletePost, toggleLikePost, addComment, subscribeToComments, Comment } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PostCardProps {
  id?: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    id?: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
  likedBy?: string[];
}

export function PostCard({ id, author, content, image, timestamp, likes = 0, comments: initialCommentsCount = 0, shares = 0, likedBy = [] }: PostCardProps) {
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

  const isOwner = user && user.displayName === author.name;

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

  const handleToggleComments = () => {
    if (!showComments && id) {
      subscribeToComments(id, (data) => setPostComments(data));
    }
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
      <Card className="glass border-white/5 rounded-[2rem] overflow-hidden floating-card mb-6">
        <CardHeader className="flex flex-row items-center justify-between p-5 space-y-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm hover:text-primary transition-colors cursor-pointer">{author.name}</span>
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Verified</span>
              </div>
              <p className="text-xs text-muted-foreground">@{author.handle} • {timestamp}</p>
            </div>
          </div>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-white/5 data-[state=open]:bg-white/10">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass border-white/10 rounded-xl p-2 shadow-2xl">
                <DropdownMenuItem onClick={() => setIsEditing(true)} className="rounded-lg gap-2 cursor-pointer font-bold focus:bg-white/10">
                  <Edit2 className="w-4 h-4 text-primary" /> Editar Publicación
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleting(true)} className="rounded-lg gap-2 cursor-pointer text-red-500 focus:bg-red-500/20 focus:text-red-500 font-bold mt-1">
                  <Trash2 className="w-4 h-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="px-5 py-2 pb-4 space-y-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          {image && (
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/5 mt-4">
              <Image src={image} alt="Post image" fill className="object-cover" />
            </div>
          )}
        </CardContent>

        {/* Interactividad Social (Likes, Comentarios) */}
        <CardFooter className="flex flex-col border-t border-white/5 p-0">
          <div className="flex items-center justify-between p-4 w-full">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                className={cn("gap-2 rounded-full transition-all px-4", isLiked ? "text-red-500 bg-red-500/10" : "hover:text-red-500 hover:bg-red-500/10 group")}
              >
                <Heart className={cn("w-4 h-4 transition-transform active:scale-150", isLiked && "fill-current")} />
                <span className="text-xs font-bold">{likes}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleToggleComments}
                className={cn("gap-2 rounded-full transition-all px-4", showComments ? "text-primary bg-primary/10" : "hover:text-primary hover:bg-primary/10")}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-bold">{initialCommentsCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:text-green-500 hover:bg-green-500/10 px-4">
                <Repeat className="w-4 h-4" />
                <span className="text-xs font-bold">{shares}</span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full hover:text-primary transition-all">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:text-primary transition-all">
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showComments && (
            <div className="w-full px-5 pb-5 animate-fade-in border-t border-white/5 pt-4">
              <div className="flex gap-3 mb-6">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarImage src={profile?.photoURL} />
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input 
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario brillante..." 
                    className="bg-white/5 border-white/10 rounded-xl h-10 text-xs text-white"
                    onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button onClick={handleAddComment} size="icon" className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/80 rounded-xl shadow-lg shadow-primary/20">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="max-h-[300px] pr-4">
                <div className="space-y-4">
                  {postComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <Avatar className="h-8 w-8 shrink-0 border border-white/10">
                        <AvatarImage src={comment.authorAvatar} />
                      </Avatar>
                      <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-black uppercase tracking-tighter">{comment.authorName}</span>
                          <span className="text-[9px] text-muted-foreground">
                            {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { locale: es, addSuffix: true }) : 'Enviando...'}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  {postComments.length === 0 && (
                    <p className="text-center text-[10px] text-muted-foreground uppercase font-black py-4">Sé el primero en comentar algo épico.</p>
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
