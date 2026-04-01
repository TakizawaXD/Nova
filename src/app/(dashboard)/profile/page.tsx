'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Edit2, MapPin, Link as LinkIcon, Calendar, Clock, MoreHorizontal, Filter, Loader2, Verified, PlusCircle } from 'lucide-react';
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
    website: '',
    photoURL: '',
    bannerURL: ''
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        photoURL: profile.photoURL || '',
        bannerURL: profile.bannerURL || ''
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
      toast({ title: "Perfil actualizado", description: "Tu identidad ha sido guardada con éxito." });
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
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in bg-background w-full shadow-2xl rounded-b-[2rem] overflow-hidden">
      
      {/* 1. Header & Cover Photo */}
      <div className="w-full h-64 md:h-96 relative border-b border-white/10 glass rounded-b-3xl overflow-hidden group">
        <img 
          src={profile.bannerURL || `https://picsum.photos/seed/${profile.uid}banner/1200/400`} 
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
          alt="Banner Cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
      </div>

      {/* 2. Identity Row (Overlapping Avatar & Action Buttons) */}
      <div className="px-6 md:px-12 relative flex flex-col md:flex-row justify-between items-center md:items-end w-full pb-6 border-b border-white/5">
        
        {/* Left Side: Avatar + Name + Subtext */}
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-4 md:gap-6 mt-[-80px] md:mt-[-40px] z-10 w-full md:w-auto">
          <Avatar className="h-40 w-40 md:h-44 md:w-44 border-4 border-background ring-1 ring-white/10 shadow-2xl relative">
            <AvatarImage src={profile.photoURL} className="object-cover" />
            <AvatarFallback>{profile.displayName[0]}</AvatarFallback>
          </Avatar>
          
          <div className="text-center md:text-left pt-2 md:pt-14 pb-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-3xl md:text-[2rem] font-bold leading-none">{profile.displayName}</h1>
              {profile.isVerified && <Verified className="w-6 h-6 text-primary" />}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
              <p className="font-bold text-muted-foreground hover:underline cursor-pointer">
                {profile.followersCount || 0} amigos
              </p>
              <span className="hidden md:inline text-muted-foreground/50">•</span>
              <p className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 tracking-widest uppercase">
                PIN: #{profile.uid.substring(0, 6).toUpperCase()}
              </p>
            </div>
            <div className="flex -space-x-2 mt-2 justify-center md:justify-start">
              {[1,2,3,4,5].map(i => (
                <Avatar key={i} className="border-2 border-background h-8 w-8 hover:translate-y-[-2px] transition-transform cursor-pointer">
                  <AvatarImage src={`https://picsum.photos/seed/${profile.uid}_${i}/100/100`} />
                </Avatar>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex gap-3 pb-2 mt-8 md:mt-0 w-full md:w-auto z-10">
          <Button className="bg-primary hover:bg-primary/80 text-white font-bold h-10 w-full md:w-auto gap-2 rounded-lg">
            <PlusCircle className="w-4 h-4" /> Añadir a historia
          </Button>

          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="font-bold h-10 w-full md:w-auto text-white bg-white/10 hover:bg-white/20 rounded-lg gap-2">
                <Edit2 className="w-4 h-4" /> Editar perfil
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10 rounded-[2rem] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Configurar Perfil</DialogTitle>
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
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Avatar</label>
                    <Input 
                      value={editForm.photoURL} 
                      onChange={e => setEditForm({...editForm, photoURL: e.target.value})} 
                      className="bg-white/5 border-white/10 rounded-xl h-11" 
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Banner</label>
                    <Input 
                      value={editForm.bannerURL} 
                      onChange={e => setEditForm({...editForm, bannerURL: e.target.value})} 
                      className="bg-white/5 border-white/10 rounded-xl h-11" 
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={updating}
                  className="w-full bg-primary hover:bg-primary/80 rounded-xl font-bold h-12 gap-2 mt-4"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 3. Facebook-Style Navigation Menu */}
      <div className="px-6 md:px-12 py-1 flex items-center justify-between border-b border-white/5 bg-background">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          <Button variant="ghost" className="text-primary font-bold border-b-4 border-primary rounded-none h-14 px-4 hover:bg-white/5">Publicaciones</Button>
          <Button variant="ghost" className="text-muted-foreground font-bold hover:bg-white/5 h-14 rounded-md">Información</Button>
          <Button variant="ghost" className="text-muted-foreground font-bold hover:bg-white/5 h-14 rounded-md hidden sm:flex">Amigos</Button>
          <Button variant="ghost" className="text-muted-foreground font-bold hover:bg-white/5 h-14 rounded-md hidden md:flex">Fotos</Button>
          <Button variant="ghost" className="text-muted-foreground font-bold hover:bg-white/5 h-14 rounded-md hidden lg:flex">Reels</Button>
        </div>
        <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-md">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Gray separation mimicking Facebook */}
      <div className="h-4 w-full bg-black/40" />

      {/* 4. Body (Two Columns: Details & Posts Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 p-4 md:p-8 bg-black/40 min-h-screen">
        
        {/* Left Column: Details Widgets */}
        <div className="space-y-4 lg:sticky lg:top-24 h-fit">
          <Card className="glass border-white/5 rounded-xl shadow-xl p-5">
            <h2 className="text-[1.2rem] font-bold mb-4">Detalles</h2>
            <div className="space-y-4 text-[15px] font-medium text-foreground/90">
              <p className="text-center italic mb-6">"{profile.bio || '¡Hola a todos! Este es mi perfil en la red Nova.'}"</p>
              
              <div className="flex items-center gap-3"><MapPin className="text-muted-foreground w-6 h-6 shrink-0" /> De <span className="font-bold">{profile.location || 'Nova City'}</span></div>
              <div className="flex items-center gap-3"><Clock className="text-muted-foreground w-6 h-6 shrink-0" /> Se unió el <span className="font-bold">{new Date(profile.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span></div>
              <div className="flex items-center gap-3"><LinkIcon className="text-muted-foreground w-6 h-6 shrink-0" /> <a href={profile.website} target="_blank" className="text-primary font-bold hover:underline truncate">{profile.website?.replace(/^https?:\/\//, '') || 'nova.app'}</a></div>
            </div>
            <Button variant="secondary" className="w-full mt-6 bg-white/10 hover:bg-white/20 font-bold rounded-lg h-10">Editar detalles</Button>
          </Card>

          <Card className="glass border-white/5 rounded-xl shadow-xl p-5">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-[1.2rem] font-bold">Amigos</h2>
              <Button variant="link" className="text-primary font-normal p-0 h-auto">Ver todos los amigos</Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{profile.followersCount || 0} amigos</p>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="space-y-1 group cursor-pointer">
                  <div className="aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/5 group-hover:border-primary/50 transition-colors">
                    <img src={`https://picsum.photos/seed/${profile.uid}_friend${i}/150/150`} alt="Amigo" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-bold truncate">Explorador {i}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Feed */}
        <div className="space-y-4">
          <div className="flex justify-between items-center glass rounded-xl border border-white/5 p-4 py-3 shadow-md">
            <h2 className="text-xl font-bold">Publicaciones</h2>
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-sm font-bold rounded-lg">
              <Filter className="w-4 h-4 mr-2" /> Filtros
            </Button>
          </div>

          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <PostCard 
                  key={post.id}
                  id={post.id}
                  author={{ name: post.authorName, handle: post.authorHandle, avatar: post.authorAvatar }}
                  content={post.content}
                  image={post.imageUrl}
                  timestamp={post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : 'Recientemente'}
                  likes={post.likes}
                  comments={post.comments}
                  shares={post.shares}
                  likedBy={post.likedBy}
                />
              ))
            ) : (
              <Card className="glass border-white/5 rounded-xl shadow-md p-10 text-center flex flex-col items-center justify-center opacity-80">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">No hay publicaciones disponibles</h3>
                <p className="text-muted-foreground text-sm mt-2">Cuando compartas algo, lo verás aparecer aquí.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}