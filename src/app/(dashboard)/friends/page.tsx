'use client';

import { useState, useEffect } from 'react';
import { Heart, Mail, Search, UserPlus, Loader2, Sparkles, Verified } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { searchUserByPin, followUser, getAllUsers, getUserFriends, checkFollowStatus, UserProfile, startDirectChat, getDiscoverUsers } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function FriendsPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'explore' | 'following'>('explore');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [followingUsers, setFollowingUsers] = useState<UserProfile[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user) {
      loadNetwork();
      getDiscoverUsers(4).then((users: UserProfile[]) => setDiscoverUsers(users.filter((u: UserProfile) => u.uid !== user.uid)));
    }
  }, [user]);

  // Búsqueda en tiempo real por PIN si tiene longitud de PIN (6 chars)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length === 6) {
        handleSearch(searchQuery);
      } else {
        setFoundUser(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadNetwork = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const allData = await getAllUsers(200);
      setFriends(allData.filter(u => u.uid !== user.uid));
      
      const followData = await getUserFriends(user.uid);
      setFollowingUsers(followData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (pin: string) => {
    setSearching(true);
    try {
      const result = await searchUserByPin(pin);
      setFoundUser(result);
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setSearching(false);
    }
  };

  const filteredFriends = friends.filter(f => 
    f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFriend = async (targetId: string) => {
    if (!user) return;
    setAdding(true);
    try {
      await followUser(user.uid, targetId);
      toast({ title: 'Vínculo creado', description: 'Has añadido este nodo a tu constelación.' });
      setFoundUser(null);
      setSearchQuery('');
      loadNetwork(); // refetch
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el vínculo.' });
    } finally {
      setAdding(false);
    }
  };

  const handleStartChat = async (friendProfile: UserProfile) => {
    if (!user || !profile || !friendProfile) return;
    try {
      const chatId = await startDirectChat(user.uid, friendProfile.uid);
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
              {searching ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Search className="w-6 h-6 text-primary" />} 
              Capturar Nodo <span className="text-primary">/</span> Red
            </h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              Escribe un nombre para filtrar tu red o un PIN de 6 caracteres para localizar nuevos ciudadanos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group/input">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BUSCAR NOMBRE O PIN..."
                className="bg-white/5 border-white/5 focus:bg-white/10 rounded-2xl h-16 px-8 uppercase tracking-[0.2em] text-2xl font-black text-white transition-all placeholder:text-muted-foreground/20"
              />
              <div className="absolute inset-0 rounded-2xl border border-primary/0 group-focus-within/input:border-primary/30 pointer-events-none transition-all" />
            </div>
            <div className="hidden sm:flex h-16 px-10 rounded-2xl font-black bg-white/5 text-muted-foreground items-center uppercase tracking-widest text-[10px] border border-white/5">
                Búsqueda Activa
            </div>
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
      <Tabs defaultValue="explore" onValueChange={(v) => setActiveTab(v as any)} className="px-6 space-y-6 w-full">
        <TabsList className="w-full h-14 sm:h-16 bg-[#050510]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-1 flex">
            <TabsTrigger value="explore" className="flex-1 rounded-[1.5rem] font-black uppercase text-[9px] sm:text-[11px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">Explorar Ecosistema</TabsTrigger>
            <TabsTrigger value="following" className="flex-1 rounded-[1.5rem] font-black uppercase text-[9px] sm:text-[11px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none flex items-center gap-2">Mis Nodos <Badge className="bg-white/20 text-white rounded-full py-0 border-none text-[8px] h-4 leading-none hidden sm:flex">{followingUsers.length}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Analizando topología...</p>
          </div>
        ) : filteredFriends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredFriends.map((friend) => (
              <Card key={friend.uid} className="bg-[#050510]/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-xl relative">
                <div className="p-4 sm:p-6 flex items-center justify-between">
                  <Link href={`/profile/${friend.uid}`} className="flex items-center gap-4 cursor-pointer flex-1 min-w-0">
                    <div className="relative group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white/5 group-hover:border-primary/50 transition-colors shadow-2xl">
                        <AvatarImage src={friend.photoURL} alt={friend.displayName} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">{friend.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#030303] rounded-full flex items-center justify-center border border-white/5">
                         <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_theme(colors.green.500)]" />
                      </div>
                    </div>
                    <div className="space-y-0.5 truncate">
                      <h3 className="text-sm sm:text-lg font-black text-white italic tracking-tighter group-hover:text-primary transition-colors truncate">{friend.displayName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest truncate">@{friend.username}</span>
                        {friend.isVerified && <Verified className="w-3 h-3 text-primary shrink-0 opacity-60" />}
                      </div>
                    </div>
                  </Link>
                  <Button 
                    onClick={() => {
                        if (followingUsers.find(u => u.uid === friend.uid)) {
                            handleStartChat(friend);
                        } else {
                            handleAddFriend(friend.uid);
                        }
                    }}
                    variant={followingUsers.find(u => u.uid === friend.uid) ? "ghost" : "default"} 
                    size="icon" 
                    className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all ml-2", followingUsers.find(u => u.uid === friend.uid) ? "hover:bg-primary text-primary" : "bg-primary text-white shadow-xl shadow-primary/30")}
                  >
                    {loading || adding ? <Loader2 className="w-4 h-4 animate-spin" /> : followingUsers.find(u => u.uid === friend.uid) ? <Mail className="w-4 h-4 sm:w-5 sm:h-5" /> : <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : friends.length > 0 ? (
           <div className="text-center py-20 opacity-40">
              <Search className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xs font-black uppercase tracking-widest">No se detectan nodos estelares</p>
           </div>
        ) : (
          <div className="text-center py-20 bg-[#050510]/20 rounded-[3rem] sm:rounded-[4rem] border border-dashed border-white/5 mx-auto px-4 sm:px-10">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Tu Constelación Está Deshabitada</h2>
          </div>
        )}
        </TabsContent>

        <TabsContent value="following" className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Listando Conexiones...</p>
          </div>
        ) : followingUsers.filter(f => f.displayName.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {followingUsers.filter(f => f.displayName.toLowerCase().includes(searchQuery.toLowerCase())).map((friend) => (
              <Card key={friend.uid} className="bg-primary/5 backdrop-blur-3xl border border-primary/20 rounded-[2rem] overflow-hidden group hover:border-primary/50 transition-all duration-500 shadow-xl relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -z-10 group-hover:bg-primary/30 transition-all" />
                <div className="p-4 sm:p-6 flex items-center justify-between">
                  <Link href={`/profile/${friend.uid}`} className="flex items-center gap-4 cursor-pointer flex-1 min-w-0">
                      <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-primary/50 group-hover:scale-110 transition-transform shadow-2xl shrink-0">
                        <AvatarImage src={friend.photoURL} alt={friend.displayName} className="object-cover" />
                        <AvatarFallback className="bg-primary/20 text-primary font-black text-xl">{friend.displayName[0]}</AvatarFallback>
                      </Avatar>
                    <div className="space-y-0.5 truncate">
                      <h3 className="text-sm sm:text-lg font-black text-white italic tracking-tighter hover:underline truncate flex items-center gap-1">{friend.displayName} {friend.isVerified && <Verified className="w-3 h-3 text-primary shrink-0 opacity-60" />}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-primary/70 font-black uppercase tracking-widest truncate">@{friend.username}</span>
                      </div>
                    </div>
                  </Link>
                  <Button 
                    onClick={() => handleStartChat(friend)}
                    className="h-10 sm:h-12 px-4 sm:px-6 shrink-0 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-primary hover:text-white group-hover:shadow-xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all ml-2"
                  >
                    Chat <Mail className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
           <div className="text-center py-20 opacity-60">
              <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary" />
              <p className="text-sm font-black uppercase tracking-widest text-white">No tienes nodos seguidos</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Ve a la pestaña Explorar para vincularte con la sociedad Nova.</p>
           </div>
        )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
