'use client';

import { useState, useEffect } from 'react';
import { Heart, Mail, Search, UserPlus, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-8 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 px-4 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            Vínculos <span className="text-xs text-muted-foreground ml-2">(Amigos)</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-bold tracking-tight">Tu constelación Nova: {friends.length} exploradores.</p>
        </div>
      </div>

      <Card className="mx-4 glass border-primary/20 rounded-[2rem] p-6 shadow-xl mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 opacity-50" />
        <h2 className="text-xl font-black uppercase mb-4 tracking-tighter flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" /> Encontrar Explorador por PIN
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input 
            value={searchPin}
            onChange={(e) => setSearchPin(e.target.value)}
            placeholder="Introduce el código de 6 caracteres (Ej: 9A2B4C)"
            className="bg-white/5 border-white/10 rounded-xl h-14 uppercase tracking-widest text-lg font-bold"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching} className="h-14 px-8 rounded-xl font-black bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/20">
            {searching ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sincronizar'}
          </Button>
        </div>

        {foundUser && (
          <div className="mt-6 flex items-center justify-between bg-black/40 p-4 rounded-xl border border-primary/20 animate-fade-in">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/50">
                <AvatarImage src={foundUser.photoURL} />
                <AvatarFallback>{foundUser.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{foundUser.displayName}</p>
                <p className="text-xs text-muted-foreground">@{foundUser.username}</p>
              </div>
            </div>
            {foundUser.uid === user?.uid ? (
              <span className="text-xs text-muted-foreground font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">Este eres tú</span>
            ) : friends.some(f => f.uid === foundUser.uid) ? (
              <span className="text-xs text-primary font-black uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20 tracking-widest">Ya sois vínculos</span>
            ) : (
              <Button onClick={() => handleAddFriend(foundUser.uid)} disabled={adding} className="rounded-xl font-bold bg-primary hover:bg-primary/80 gap-2">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Vincular</>}
              </Button>
            )}
          </div>
        )}
      </Card>

      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {friends.map((friend) => (
              <Card key={friend.uid} className="glass border-white/10 rounded-[2rem] overflow-hidden group hover:bg-white/5 transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 border-2 border-primary/20">
                      <AvatarImage src={friend.photoURL} alt={friend.displayName} />
                      <AvatarFallback>{friend.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-black text-lg group-hover:text-primary transition-colors">{friend.displayName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">@{friend.username}</span>
                        {friend.isVerified && <span className="w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_theme(colors.primary.DEFAULT)]" />}
                        <span className="text-[10px] text-accent font-black tracking-widest uppercase">VIN CULADO</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => handleStartChat(friend)} variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-all shadow-lg hover:shadow-primary/20">
                    <Mail className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-[2.5rem] border-white/5 mx-auto">
            <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center animate-float mb-4">
               <Sparkles className="w-10 h-10 text-primary opacity-50" />
            </div>
            <p className="text-lg font-black uppercase tracking-tighter">Tu constelación está vacía</p>
            <p className="text-sm text-muted-foreground mt-2">Usa el buscador por PIN de arriba para vincularte con exploradores.</p>
          </div>
        )}
      </div>
    </div>
  );
}
