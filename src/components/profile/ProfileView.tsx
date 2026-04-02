'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Edit2, MapPin, Link as LinkIcon, Calendar, Clock, MoreHorizontal, Filter, Loader2, Verified, PlusCircle, UserPlus, UserMinus, Mail } from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';
import { subscribeToPosts, Post, updateProfileData, UserProfile, subscribeToUserFollowers, subscribeToUserFollowing, checkFollowStatus, followUser, unfollowUser, startDirectChat, createNotification } from '@/lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ProfileViewProps {
  targetProfile: UserProfile;
  isOwnProfile: boolean;
}

export function ProfileView({ targetProfile, isOwnProfile }: ProfileViewProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleStartChat = async () => {
    if (!user || !profile || !targetProfile) return;
    try {
      await startDirectChat(user.uid, targetProfile.uid);
      await createNotification({
        userId: targetProfile.uid,
        type: 'message',
        senderId: user.uid,
        senderName: profile.displayName,
        senderAvatar: profile.photoURL,
        content: 'ha iniciado una nueva línea de transmisión contigo.',
        link: `/messages`,
        read: false,
      });
      router.push(`/messages`);
    } catch (e) {
      toast({ variant: "destructive", title: "Falla de red", description: "No se pudo iniciar la conexión." });
    }
  };
  const [editForm, setEditForm] = useState({
    displayName: targetProfile.displayName || '',
    bio: targetProfile.bio || '',
    location: targetProfile.location || '',
    website: targetProfile.website || '',
    photoURL: targetProfile.photoURL || '',
    bannerURL: targetProfile.bannerURL || ''
  });

  useEffect(() => {
    const unsubPosts = subscribeToPosts((allPosts) => {
      const filtered = allPosts.filter(p => p.authorId === targetProfile.uid);
      setUserPosts(filtered);
    });

    const unsubFollowers = subscribeToUserFollowers(targetProfile.uid, (data) => {
      setFollowers(data);
    });

    const unsubFollowing = subscribeToUserFollowing(targetProfile.uid, (data) => {
      setFollowing(data);
    });

    if (user && !isOwnProfile) {
      checkFollowStatus(user.uid, targetProfile.uid).then(setIsFollowing);
    }

    return () => {
      unsubPosts();
      unsubFollowers();
      unsubFollowing();
    };
  }, [targetProfile.uid, user, isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!user) return;
    try {
      if (isFollowing) {
        await unfollowUser(user.uid, targetProfile.uid);
        setIsFollowing(false);
        toast({ title: "Nodo desconectado", description: `Has dejado de seguir a ${targetProfile.displayName}` });
      } else {
        await followUser(user.uid, targetProfile.uid);
        setIsFollowing(true);
        toast({ title: "Nodo conectado", description: `Ahora sigues a ${targetProfile.displayName}` });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error de red", description: "No se pudo actualizar el estado del seguidor." });
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      await updateProfileData(user.uid, editForm);
      setIsEditing(false);
      toast({ title: "Perfil actualizado", description: "Tu identidad ha sido guardada con éxito." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo sincronizar los cambios." });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 animate-fade-in w-full">
      {/* 1. Header & Cover Photo */}
      <div className="w-full h-[300px] md:h-[450px] relative rounded-[3rem] overflow-hidden group shadow-2xl border border-white/5">
        <img 
          src={targetProfile.bannerURL || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop`} 
          className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
          alt="Banner Cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/20 to-transparent" />
      </div>

      {/* 2. Identity Row */}
      <div className="px-8 md:px-16 relative flex flex-col md:flex-row justify-between items-center md:items-end w-full pb-10 mt-[-100px] md:mt-[-120px] z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 w-full md:w-auto">
          <div className="relative group/avatar">
            <Avatar className="h-44 w-44 md:h-56 md:w-56 border-[6px] border-[#030303] shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-105">
              <AvatarImage src={targetProfile.photoURL} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary text-5xl font-black">{targetProfile.displayName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="text-center md:text-left pb-1 flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">{targetProfile.displayName}</h1>
              {targetProfile.isVerified && <Verified className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <p className="font-black text-muted-foreground uppercase tracking-widest text-[11px] opacity-60">
                {followers.length} Seguidores Nova
              </p>
              <div className="hidden md:block w-1.5 h-1.5 bg-white/20 rounded-full" />
              <p className="text-[10px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-2xl border border-primary/20 tracking-[0.2em] uppercase">
                ID SISTEMA: #{targetProfile.uid.substring(0, 6).toUpperCase()}
              </p>
            </div>
            <div className="flex -space-x-3 mt-4 justify-center md:justify-start">
              {followers.map((f) => (
                <div key={f.uid} className="border-[3px] border-[#030303] rounded-full overflow-hidden h-10 w-10 shadow-lg hover:z-20 hover:scale-110 transition-all cursor-pointer bg-white/5">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={f.photoURL} />
                    <AvatarFallback className="bg-primary/20 text-primary text-[8px]">{f.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              ))}
              {followers.length === 0 && (
                <div className="h-10 w-10 rounded-full bg-white/5 border-[3px] border-[#030303] flex items-center justify-center text-[10px] font-black text-white/20">
                  <PlusCircle className="w-4 h-4 opacity-10" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-10 md:mt-0 w-full md:w-auto">
          {isOwnProfile ? (
            <>
              <Button className="bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-widest text-[10px] h-14 w-full md:w-48 gap-3 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <PlusCircle className="w-5 h-5" /> Nueva Historia
              </Button>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-14 w-full md:w-48 gap-3 rounded-2xl border border-white/5 transition-all">
                    <Edit2 className="w-5 h-5" /> Ajustes Perfil
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#050510]/95 backdrop-blur-3xl border border-white/10 rounded-[3rem] max-w-xl p-8 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-white italic">Modificar Identidad <span className="text-primary">•</span></DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-6 font-medium">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nombre Público</label>
                      <Input value={editForm.displayName} onChange={e => setEditForm({...editForm, displayName: e.target.value})} className="bg-white/5 border-white/5 rounded-2xl h-14 px-5 text-white" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Biografía</label>
                       <Textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="bg-white/5 border-white/5 rounded-2xl min-h-[100px]" />
                    </div>
                    <Button onClick={handleUpdateProfile} disabled={updating} className="w-full bg-primary h-14 rounded-2xl font-black uppercase">
                      {updating ? <Loader2 className="animate-spin" /> : 'Sincronizar'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <div className="flex gap-4 w-full md:w-auto">
                <Button 
                    onClick={handleToggleFollow}
                    className={cn(
                        "font-black uppercase tracking-widest text-[10px] h-14 flex-1 md:w-48 gap-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95",
                        isFollowing ? "bg-white/5 text-white border border-white/10" : "bg-primary text-white"
                    )}
                >
                    {isFollowing ? <><UserMinus className="w-5 h-5" /> Dejar de Seguir</> : <><UserPlus className="w-5 h-5" /> Seguir Nodo</>}
                </Button>
                <Button 
                    onClick={handleStartChat}
                    variant="ghost" 
                    className="bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-14 w-14 md:w-14 p-0 rounded-2xl border border-white/5 transition-all shadow-xl"
                >
                    <Mail className="w-5 h-5" />
                </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 p-8 md:p-16">
        <div className="space-y-8 lg:sticky lg:top-28 h-fit">
          <Card className="bg-[#050510]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl p-8 space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Bio-Data <span className="text-primary">/ 01</span></h2>
            <p className="text-center italic text-white/50 leading-relaxed border-b border-white/5 pb-6">"{targetProfile.bio || 'Nodo Nova sin descripción.'}"</p>
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <MapPin className="text-primary w-5 h-5" />
                  <p className="font-bold text-sm">{targetProfile.location || 'Nova System'}</p>
               </div>
               <div className="flex items-center gap-4">
                  <LinkIcon className="text-primary w-5 h-5" />
                  <p className="font-bold text-sm truncate">{targetProfile.website || 'No website'}</p>
               </div>
            </div>
          </Card>

          <Card className="bg-[#050510]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Nodos <span className="text-primary">/ Amigos</span></h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{following.length} Conectados</p>
              </div>
              <Button variant="link" className="text-primary font-black uppercase tracking-widest text-[10px] p-0 h-auto hover:no-underline hover:text-primary/70">Ver Todos</Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {following.length > 0 ? following.slice(0, 9).map((f) => (
                <div key={f.uid} className="space-y-2 group cursor-pointer text-center">
                  <div className="aspect-square bg-white/5 rounded-[1.5rem] overflow-hidden border border-white/5 transition-all duration-500 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] shadow-lg">
                    <img src={f.photoURL} alt={f.displayName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground truncate group-hover:text-white transition-colors">{f.displayName}</p>
                </div>
              )) : (
                [1,2,3,4,5,6,7,8,9].map((i) => (
                  <div key={i} className="space-y-2 opacity-20 text-center">
                    <div className="aspect-square bg-white/5 rounded-[1.5rem] border border-white/5 p-4 flex items-center justify-center">
                       <PlusCircle className="w-6 h-6" />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest">Inactivo</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {userPosts.map(post => (
            <PostCard 
              key={post.id}
              id={post.id!}
              author={{ 
                id: post.authorId || 'unknown',
                name: post.authorName, 
                handle: post.authorHandle, 
                avatar: post.authorAvatar 
              }}
              content={post.content}
              image={post.imageUrl}
              poll={post.poll}
              timestamp={post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Recientemente'}
              likes={post.likes}
              comments={post.comments}
              shares={post.shares}
              likedBy={post.likedBy}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
