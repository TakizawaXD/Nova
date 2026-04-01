'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, MapPin, Link as LinkIcon, Calendar, Grid, Play, ShoppingBag, Loader2, Verified } from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';
import { subscribeToPosts, Post, updateProfileData } from '@/lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || ''
      });

      const unsubscribe = subscribeToPosts((allPosts) => {
        const filtered = allPosts.filter(p => p.authorId === profile.uid);
        setUserPosts(filtered);
      });
      return () => unsubscribe();
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      await updateProfileData(user.uid, editForm);
      setIsEditing(false);
      toast({ title: "Perfil actualizado", description: "Tu identidad ha sido reconfigurada." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo sincronizar los cambios." });
    } finally {
      setUpdating(false);
    }
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Header / Banner */}
      <div className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden glass border-white/10 group shadow-2xl">
        <img 
          src={profile.bannerURL || `https://picsum.photos/seed/${profile.uid}banner/1200/400`} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          alt="Banner" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="absolute -bottom-16 left-8 flex items-end gap-6 z-10">
          <Avatar className="h-40 w-40 border-8 border-background shadow-2xl electric-glow ring-4 ring-primary/20">
            <AvatarImage src={profile.photoURL} />
            <AvatarFallback>{profile.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="pb-20">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase">{profile.displayName}</h1>
              {profile.isVerified && <Verified className="w-5 h-5 text-primary fill-current" />}
            </div>
            <p className="text-muted-foreground font-bold tracking-tight">@{profile.username}</p>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 z-20">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-primary hover:text-white gap-2 shadow-lg transition-all">
                <Edit2 className="w-4 h-4" /> Editar Perfil
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10 rounded-[2.5rem] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Configurar Identidad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre Público</label>
                  <Input 
                    value={editForm.displayName} 
                    onChange={e => setEditForm({...editForm, displayName: e.target.value})} 
                    className="bg-white/5 border-white/10 rounded-xl h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Biografía</label>
                  <Textarea 
                    value={editForm.bio} 
                    onChange={e => setEditForm({...editForm, bio: e.target.value})} 
                    className="bg-white/5 border-white/10 rounded-xl min-h-[100px] text-sm" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ubicación</label>
                    <Input 
                      value={editForm.location} 
                      onChange={e => setEditForm({...editForm, location: e.target.value})} 
                      className="bg-white/5 border-white/10 rounded-xl h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sitio Web</label>
                    <Input 
                      value={editForm.website} 
                      onChange={e => setEditForm({...editForm, website: e.target.value})} 
                      className="bg-white/5 border-white/10 rounded-xl h-11" 
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={updating}
                  className="w-full bg-primary hover:bg-primary/80 rounded-2xl font-black h-14 uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Sincronización'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-24">
        {/* Info lateral */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass border-white/5 rounded-[2.5rem] p-8 shadow-xl">
            <CardContent className="p-0 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Biografía</p>
                <p className="text-sm font-medium leading-relaxed">{profile.bio}</p>
              </div>
              
              <div className="space-y-4 text-sm text-muted-foreground border-t border-white/5 pt-6">
                <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-accent" /> {profile.location || 'Dimensión Desconocida'}</div>
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-primary" /> 
                  <a href={profile.website} target="_blank" className="text-primary hover:underline truncate">
                    {profile.website?.replace(/^https?:\/\//, '') || 'nova.app/user'}
                  </a>
                </div>
                <div className="flex items-center gap-3"><Calendar className="w-4 h-4" /> Ciudadano desde {new Date(profile.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</div>
              </div>

              <div className="flex gap-8 pt-6 border-t border-white/5">
                <div className="cursor-pointer group">
                  <p className="text-2xl font-black group-hover:text-primary transition-colors">{profile.followingCount || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Siguiendo</p>
                </div>
                <div className="cursor-pointer group">
                  <p className="text-2xl font-black group-hover:text-primary transition-colors">{profile.followersCount || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seguidores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/5 rounded-[2.5rem] p-6">
            <CardHeader className="p-0 mb-4 flex items-center justify-between">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exploradores Comunes</CardTitle>
              <Verified className="w-4 h-4 text-primary opacity-50" />
            </CardHeader>
            <div className="flex -space-x-4 overflow-hidden">
              {[1,2,3,4,5].map(i => (
                <Avatar key={i} className="border-4 border-background h-12 w-12 hover:translate-y-[-4px] transition-transform cursor-pointer">
                  <AvatarImage src={`https://picsum.photos/seed/${i + 10}/100/100`} />
                </Avatar>
              ))}
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black border-4 border-background">+12</div>
            </div>
          </Card>
        </div>

        {/* Feed Personal */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full bg-white/5 border border-white/5 p-1.5 rounded-[2rem] h-16 mb-8 shadow-inner">
              <TabsTrigger value="posts" className="flex-1 rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest gap-2">
                <Grid className="w-4 h-4" /> Publicaciones
              </TabsTrigger>
              <TabsTrigger value="reels" className="flex-1 rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest gap-2">
                <Play className="w-4 h-4" /> Reels
              </TabsTrigger>
              <TabsTrigger value="market" className="flex-1 rounded-[1.5rem] data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest gap-2">
                <ShoppingBag className="w-4 h-4" /> Tienda
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6 animate-fade-in">
              {userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard 
                    key={post.id}
                    id={post.id}
                    author={{ name: post.authorName, handle: post.authorHandle, avatar: post.authorAvatar }}
                    content={post.content}
                    image={post.imageUrl}
                    timestamp={post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Enviando...'}
                    likes={post.likes}
                    comments={post.comments}
                    shares={post.shares}
                    likedBy={post.likedBy}
                  />
                ))
              ) : (
                <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-4 border-dashed border-muted-foreground flex items-center justify-center">
                    <Grid className="w-8 h-8" />
                  </div>
                  <p className="font-black uppercase tracking-tighter text-sm">Aún no has compartido nada en esta dimensión.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}