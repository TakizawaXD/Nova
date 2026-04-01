
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, MapPin, Link as LinkIcon, Calendar, Users, Grid, Play, ShoppingBag } from 'lucide-react';
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
    }

    const unsubscribe = subscribeToPosts((allPosts) => {
      const filtered = allPosts.filter(p => p.authorId === user?.uid);
      setUserPosts(filtered);
    });
    return () => unsubscribe();
  }, [profile, user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateProfileData(user.uid, editForm);
      setIsEditing(false);
      toast({ title: "Perfil actualizado", description: "Tus cambios se han guardado correctamente." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el perfil." });
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header / Banner */}
      <div className="relative h-64 rounded-[2.5rem] overflow-hidden glass border-white/10 group">
        <img 
          src={profile.bannerURL || `https://picsum.photos/seed/${profile.uid}banner/1200/400`} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt="Banner" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <Avatar className="h-40 w-40 border-8 border-background shadow-2xl">
            <AvatarImage src={profile.photoURL} />
            <AvatarFallback>{profile.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="pb-20">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase">{profile.displayName}</h1>
              {profile.isVerified && <div className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Verificado</div>}
            </div>
            <p className="text-muted-foreground font-medium">@{profile.username}</p>
          </div>
        </div>

        <div className="absolute bottom-6 right-8">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 gap-2">
                <Edit2 className="w-4 h-4" /> Editar Perfil
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10 rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Editar mi identidad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre Público</label>
                  <Input value={editForm.displayName} onChange={e => setEditForm({...editForm, displayName: e.target.value})} className="bg-white/5 border-white/10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Biografía</label>
                  <Textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="bg-white/5 border-white/10 rounded-xl min-h-[100px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ubicación</label>
                    <Input value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="bg-white/5 border-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sitio Web</label>
                    <Input value={editForm.website} onChange={e => setEditForm({...editForm, website: e.target.value})} className="bg-white/5 border-white/10 rounded-xl" />
                  </div>
                </div>
                <Button onClick={handleUpdateProfile} className="w-full bg-primary hover:bg-primary/80 rounded-xl font-bold h-12 uppercase tracking-widest">Guardar Cambios</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-20">
        {/* Info lateral */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass border-white/5 rounded-[2rem] p-6">
            <CardContent className="p-0 space-y-4">
              <p className="text-sm font-medium leading-relaxed">{profile.bio}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {profile.location || 'Dimensión Desconocida'}</div>
                <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> <a href="#" className="text-primary hover:underline">{profile.website || 'nova.app/user'}</a></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Miembro desde {new Date(profile.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-6 pt-4 border-t border-white/5">
                <div className="cursor-pointer group">
                  <p className="text-xl font-black group-hover:text-primary transition-colors">{profile.followingCount || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Siguiendo</p>
                </div>
                <div className="cursor-pointer group">
                  <p className="text-xl font-black group-hover:text-primary transition-colors">{profile.followersCount || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seguidores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/5 rounded-[2rem] p-6">
            <CardHeader className="p-0 mb-4"><CardTitle className="text-xs font-black uppercase tracking-widest">Amigos Comunes</CardTitle></CardHeader>
            <div className="flex -space-x-3 overflow-hidden">
              {[1,2,3,4,5].map(i => (
                <Avatar key={i} className="border-4 border-background h-10 w-10">
                  <AvatarImage src={`https://picsum.photos/seed/${i}/40/40`} />
                </Avatar>
              ))}
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold border-4 border-background">+12</div>
            </div>
          </Card>
        </div>

        {/* Feed Personal */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full bg-white/5 border border-white/5 p-1 rounded-2xl h-14 mb-6">
              <TabsTrigger value="posts" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2">
                <Grid className="w-4 h-4" /> Publicaciones
              </TabsTrigger>
              <TabsTrigger value="reels" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2">
                <Play className="w-4 h-4" /> Reels
              </TabsTrigger>
              <TabsTrigger value="market" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2">
                <ShoppingBag className="w-4 h-4" /> Tienda
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6">
              {userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard 
                    key={post.id}
                    author={{ name: post.authorName, handle: post.authorHandle, avatar: post.authorAvatar }}
                    content={post.content}
                    image={post.imageUrl}
                    timestamp={post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Recién publicado'}
                    likes={post.likes}
                    comments={post.comments}
                    shares={post.shares}
                  />
                ))
              ) : (
                <div className="text-center py-20 opacity-50">Aún no has compartido nada en esta dimensión.</div>
              )}
            </TabsContent>
            
            <TabsContent value="reels" className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Mock Reels */}
              {[1,2,3].map(i => (
                <div key={i} className="aspect-[9/16] rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer">
                  <img src={`https://picsum.photos/seed/rp${i}/400/711`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
