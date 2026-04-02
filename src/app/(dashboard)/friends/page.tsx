'use client';

import { useState, useEffect } from 'react';
import { Heart, Mail, Search, UserPlus, Loader2, Sparkles, Verified } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { searchUserByPin, followUser, getUserFriends, UserProfile, startDirectChat } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function FriendsPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchPin, setSearchPin] = useState('');
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getUserFriends(user.uid);
      setFriends(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchPin.trim()) return;
    setSearching(true);
    try {
      const result = await searchUserByPin(searchPin);
      setFoundUser(result);
      if (!result) {
        toast({ variant: 'destructive', title: 'Explorador no encontrado', description: 'El PIN estelar no existe.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Fallo en la búsqueda.' });
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (targetId: string) => {
    if (!user) return;
    setAdding(true);
    try {
      await followUser(user.uid, targetId);
      toast({ title: 'Vínculo creado', description: 'Has añadido este explorador a tu constelación.' });
      setFoundUser(null);
      setSearchPin('');
      loadFriends(); // refetch
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el vínculo.' });
    } finally {
      setAdding(false);
    }
  };

  const handleStartChat = async (friendProfile: UserProfile) => {
    if (!profile || !friendProfile) return;
    try {
      // Usamos el hook router importado para navegar al chat con ID.
      // Pero startDirectChat requiere ambos UserProfiles.
      // profile is UserProfile, we need to pass them
      const chatId = await startDirectChat(profile, friendProfile);
      router.push(`/messages`);
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el hilo de mensajes.' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pt-12 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-end justify-between px-6 gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Conexiones <span className="text-primary">XP</span></h1>
          <p className="text-muted-foreground font-medium text-lg max-w-xl">Gestiona tus nodos de red y expande tu constelación NovaSphere.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
           <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Red Activa: {friends.length} Nodos</span>
        </div>
      </div>

      {/* Search by PIN Section */}
      <Card className="mx-6 bg-[#050510]/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 opacity-30 group-hover:opacity-50 transition-opacity" />
        
        <div className="flex flex-col gap-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
              <Search className="w-6 h-6 text-primary" /> Capturar Nodo <span className="text-primary">/</span> PIN
            </h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Localiza ciudadanos Nova mediante su identificador único de red.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group/input">
              <Input 
                value={searchPin}
                onChange={(e) => setSearchPin(e.target.value)}
                placeholder="EJ: 9A2B4C"
                className="bg-white/5 border-white/5 focus:bg-white/10 rounded-2xl h-16 px-8 uppercase tracking-[0.3em] text-2xl font-black text-white transition-all placeholder:text-muted-foreground/20"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute inset-0 rounded-2xl border border-primary/0 group-focus-within/input:border-primary/30 pointer-events-none transition-all" />
            </div>
            <Button onClick={handleSearch} disabled={searching} className="h-16 px-10 rounded-2xl font-black bg-primary text-white hover:bg-primary/80 transition-all shadow-2xl shadow-primary/20 uppercase tracking-widest text-[11px]">
              {searching ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : 'Sincronizar'}
            </Button>
          </div>
        </div>

        {foundUser && (
          <div className="mt-8 flex items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/10 animate-fade-in backdrop-blur-xl">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary shadow-xl">
                  <AvatarImage src={foundUser.photoURL} />
                  <AvatarFallback className="bg-primary/20 text-primary font-black">{foundUser.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#050510] rounded-full flex items-center justify-center border border-white/5">
                   <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight">{foundUser.displayName}</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">ID: #{foundUser.uid.substring(0, 6).toUpperCase()}</p>
              </div>
            </div>
            {foundUser.uid === user?.uid ? (
              <Badge variant="outline" className="bg-white/5 text-white/40 border-white/10 font-black uppercase tracking-widest text-[10px] py-1.5 px-4 rounded-xl">AUTOSISTEMA</Badge>
            ) : friends.some(f => f.uid === foundUser.uid) ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] py-1.5 px-4 rounded-xl">NODO ACTIVO</Badge>
            ) : (
              <Button onClick={() => handleAddFriend(foundUser.uid)} disabled={adding} className="rounded-2xl h-12 px-6 font-black bg-primary text-white hover:bg-primary/80 gap-3 uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5" /> Vincular</>}
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Friends List Section */}
      <div className="px-6 space-y-6">
        <div className="flex items-center justify-between border-l-4 border-primary pl-6 py-2">
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Nodos de Constelación</h2>
           <div className="flex gap-2">
              <Button variant="ghost" className="rounded-xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] h-10 px-4">Recientes</Button>
              <Button variant="ghost" className="rounded-xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] h-10 px-4">Alfabético</Button>
           </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Analizando topología de red...</p>
          </div>
        ) : friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {friends.map((friend) => (
              <Card key={friend.uid} className="bg-[#050510]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-2xl relative">
                <div className="p-8 flex items-center justify-between">
                  <Link href={`/profile/${friend.uid}`} className="flex items-center gap-6 cursor-pointer flex-1">
                    <div className="relative group-hover:scale-110 transition-transform duration-500">
                      <Avatar className="w-20 h-20 border-2 border-white/5 group-hover:border-primary/50 transition-colors shadow-2xl">
                        <AvatarImage src={friend.photoURL} alt={friend.displayName} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">{friend.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#030303] rounded-full flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                         <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_theme(colors.green.500)]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-white italic tracking-tighter group-hover:text-primary transition-colors">{friend.displayName}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">@{friend.username}</span>
                        {friend.isVerified && <Verified className="w-3.5 h-3.5 text-primary opacity-60" />}
                      </div>
                    </div>
                  </Link>
                  <Button onClick={() => handleStartChat(friend)} variant="ghost" size="icon" className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-primary text-white border border-white/10 hover:border-primary transition-all shadow-xl hover:shadow-primary/30 ml-4">
                    <Mail className="w-6 h-6" />
                  </Button>
                </div>
                
                {/* Micro-Interaction Highlight Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-[#050510]/20 rounded-[4rem] border border-dashed border-white/5 mx-auto px-10">
            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] mx-auto flex items-center justify-center animate-bounce-slow mb-8 border border-primary/20">
               <Sparkles className="w-12 h-12 text-primary opacity-60" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Tu Constelación Está Deshabitada</h2>
            <p className="text-muted-foreground font-medium text-lg mt-4 max-w-sm mx-auto">Inicia la expansión de tu red sincronizando con otros exploradores mediante su PIN estelar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
