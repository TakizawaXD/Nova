'use client';

import { useState, useEffect } from 'react';
import { Plus, Hash, Users, Settings, Send, Loader2, ShieldAlert, ChevronLeft, Compass, Trash2, Share2, Copy, Image, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { 
  subscribeToUserGroups, 
  subscribeToGroupChannels, 
  subscribeToGroupMembers, 
  createGroup, 
  deleteGroup,
  createChannel,
  deleteChannel,
  sendChannelMessage, 
  subscribeToChannelMessages,
  getUserProfile,
  subscribeToAllGroups,
  joinGroup,
  toggleMessageReaction,
  Group, 
  Channel, 
  Message 
} from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunitiesPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [viewMode, setViewMode] = useState<'servers' | 'channels' | 'chat'>('servers');
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice' | 'announcement'>('text');

  // Cargar Grupos
  useEffect(() => {
    if (!user) return;
    
    // Safety net in case firestore is silent
    const t = setTimeout(() => setLoading(false), 2000);
    
    const unsub = subscribeToUserGroups(user.uid, (data) => {
      setGroups(data);
      if (data.length > 0 && !activeGroup) {
        if (window.innerWidth > 1024) setActiveGroup(data[0]);
      }
      setLoading(false);
      clearTimeout(t);
    });
    return () => { unsub(); clearTimeout(t); };
  }, [user]);

  // Cargar Todas las Grupos (Discovery)
  useEffect(() => {
    if (!isExploreMode) return;
    const unsub = subscribeToAllGroups(setAllGroups);
    return () => unsub();
  }, [isExploreMode]);

  const handleSelectGroup = (g: Group) => {
    setActiveGroup(g);
    setIsExploreMode(false);
    if (window.innerWidth <= 1024) setViewMode('channels');
  };

  const handleSelectChannel = (ch: Channel) => {
    setActiveChannel(ch);
    if (window.innerWidth <= 1024) setViewMode('chat');
  };

  // Cargar Canales y Miembros al cambiar de Grupo
  useEffect(() => {
    if (!activeGroup) return;
    const unsubCh = subscribeToGroupChannels(activeGroup.id!, (data) => {
      setChannels(data);
      if (data.length > 0) setActiveChannel(data[0]);
    });
    const unsubMem = subscribeToGroupMembers(activeGroup.id!, setMembers);
    return () => { unsubCh(); unsubMem(); };
  }, [activeGroup]);

  // Cargar Mensajes al cambiar de Canal
  useEffect(() => {
    if (!activeChannel) return;
    const unsubMsg = subscribeToChannelMessages(activeChannel.id!, setMessages);
    return () => unsubMsg();
  }, [activeChannel]);

  const handleSendMessage = async (textOverride?: string, type: 'text' | 'image' | 'sticker' = 'text', mediaUrl?: string) => {
    const finalMsg = textOverride || input;
    if (!finalMsg.trim() && type === 'text') return;
    if (!activeChannel || !activeGroup || !user) return;
    
    setInput('');
    try {
      await sendChannelMessage(activeChannel.id!, activeGroup.id!, user.uid, finalMsg, type, mediaUrl);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar el mensaje.'});
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    try {
      await toggleMessageReaction(messageId, emoji, user.uid);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user || !profile) return;
    try {
      const avatarGen = `https://ui-avatars.com/api/?name=${newGroupName}&background=random`;
      const id = await createGroup(newGroupName, 'Nueva comunidad Nova', avatarGen, user.uid);
      setIsCreatingGroup(false);
      setNewGroupName('');
      toast({ title: 'Comunidad creada', description: '¡Bienvenido a tu nueva comunidad!' });
      
      // Auto-seleccionar la comunidad creada
      const newG = { id, name: newGroupName, description: 'Nueva comunidad Nova', avatar: avatarGen, ownerId: user.uid, membersCount: 1 };
      setActiveGroup(newG as Group);
      setIsExploreMode(false);
    } catch (e: any) {
      console.error("Fallo al crear comunidad:", e);
      toast({ 
        variant: 'destructive', 
        title: 'Error de Fundación', 
        description: e.message || 'Ocurrió un error al crear la comunidad.'
      });
    }
  };

  const handleCopyInvite = () => {
    if (!activeGroup?.inviteCode) return;
    const url = `${window.location.origin}/join/${activeGroup.inviteCode}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Enlace Copiado', description: '¡Hazlo viral en la red Nova!' });
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!user || !activeGroup) return;
    if (!confirm("¿Desintegrar este terminal de datos? Todos los mensajes se perderán en el vacío.")) return;
    try {
      await deleteChannel(channelId, user.uid);
      if (activeChannel?.id === channelId) setActiveChannel(null);
      toast({ title: 'Terminal Cerrado', description: 'El canal ha sido removido con éxito.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !activeGroup?.id) return;
    try {
      await createChannel(activeGroup.id, newChannelName, newChannelType);
      setIsCreatingChannel(false);
      setNewChannelName('');
      toast({ title: 'Canal Creado', description: `Se ha abierto el terminal #${newChannelName}` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup?.id || !user) return;
    if (!confirm(`¿Estás seguro de desintegrar la comunidad "${activeGroup.name}"? Esta acción es irreversible.`)) return;
    
    try {
      await deleteGroup(activeGroup.id, user.uid);
      setActiveGroup(null);
      setIsSettingsOpen(false);
      toast({ title: 'Comunidad Desintegrada', description: 'El núcleo ha sido removido del mapa estelar.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };
  const getMemberData = (uid: string) => {
    if (uid === user?.uid) return { name: profile?.displayName, avatar: profile?.photoURL, role: members.find(m => m.userId === uid)?.role };
    // Para simplificar en esta vista, mostramos iniciales si no es el usuario actual,
    // o podríamos hacer un fetch asíncrono, pero por ahora evitamos picsum.
    const memberRole = members.find(m => m.userId === uid)?.role;
    return { name: `Nova Explorer`, avatar: `https://ui-avatars.com/api/?name=Nova+Explorer&background=random`, role: memberRole };
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-140px)] bg-[#030303]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl animate-pulse">
        {/* Skeleton Sidebar Servidores */}
        <div className="w-[100px] border-r border-white/5 flex flex-col items-center py-8 space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-14 rounded-2xl bg-white/5" />
          ))}
        </div>
        {/* Skeleton Sidebar Canales */}
        <div className="w-[300px] border-r border-white/5 flex flex-col p-8 space-y-8">
          <Skeleton className="h-8 w-40 rounded-xl bg-white/5" />
          <div className="space-y-4">
             {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl bg-white/5" />
             ))}
          </div>
        </div>
        {/* Skeleton Chat */}
        <div className="flex-1 flex flex-col bg-white/[0.02] p-10 space-y-8">
            <Skeleton className="h-10 w-64 rounded-xl bg-white/5" />
            <div className="flex-1 flex flex-col justify-end space-y-6">
                <Skeleton className="h-16 w-3/4 rounded-[2rem] bg-white/5" />
                <Skeleton className="h-12 w-1/2 rounded-[2rem] bg-white/5" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] bg-[#030303]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden animate-fade-in shadow-2xl relative">
      
      {/* 1. Columna de Comunidades */}
      <div className={cn(
        "w-full md:w-[110px] bg-black/60 border-r border-white/5 flex flex-col items-center py-8 space-y-8 overflow-y-auto no-scrollbar z-30 transition-all duration-300",
        viewMode !== 'servers' ? "hidden md:flex" : "flex"
      )}>
        <div 
          onClick={() => setIsExploreMode(false)}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all cursor-pointer shadow-2xl hover:scale-110 active:scale-95 group",
            !isExploreMode ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
          )}
        >
          <Hash className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        </div>

        <div 
          onClick={() => setIsExploreMode(true)}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all cursor-pointer shadow-2xl hover:scale-110 active:scale-95 group",
            isExploreMode ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
          )}
        >
          <Compass className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        </div>
        
        <div className="w-12 h-px bg-white/10 rounded-full" />
        
        {groups.map(g => (
          <div key={g.id} className="relative group/server cursor-pointer" onClick={() => handleSelectGroup(g)}>
            <div className={cn("absolute -left-1 top-1/2 -translate-y-1/2 w-2 bg-primary rounded-r-full transition-all shadow-[0_0_15px_theme(colors.primary.DEFAULT)]", activeGroup?.id === g.id ? "h-12" : "h-0 group-hover/server:h-6")} />
            <Avatar className={cn("w-16 h-16 transition-all duration-500 shadow-2xl", activeGroup?.id === g.id ? "rounded-2xl border-2 border-primary ring-4 ring-primary/10" : "rounded-[2rem] hover:rounded-2xl border border-white/5")}>
              <AvatarImage src={g.avatar} alt="Imagen" className="object-cover" />
              <AvatarFallback className="bg-white/5 text-primary font-black text-2xl">{g.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        ))}
        
        <button 
          onClick={() => setIsCreatingGroup(true)}
          className="w-16 h-16 rounded-[2rem] bg-white/5 hover:bg-green-500 hover:text-white hover:rounded-2xl text-green-500 flex items-center justify-center border border-dashed border-white/20 cursor-pointer transition-all duration-300 shadow-xl group"
        >
          <Plus className="w-8 h-8 group-hover:scale-125 transition-transform" />
        </button>
      </div>

      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent className="bg-[#050510]/95 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] max-w-xl p-12 shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-white italic text-center">Fundar Nueva Comunidad <span className="text-primary">+</span></DialogTitle>
            <DialogDescription className="text-center text-muted-foreground/60 font-medium uppercase text-[10px] tracking-widest mt-2">Inicia la expansión de tu red social en el universo Nova</DialogDescription>
          </DialogHeader>
          <div className="space-y-10">
            <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/40 text-primary">
                    <Plus className="w-12 h-12" />
                </div>
                <p className="text-muted-foreground font-medium text-center text-lg max-w-sm">Define la identidad de tu nueva comunidad. Estas son el corazón de NovaSphere.</p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2 leading-relaxed">Identificador de Comunidad</label>
              <Input 
                value={newGroupName} 
                onChange={e => setNewGroupName(e.target.value)} 
                placeholder="Nombre del servidor (Mín. 3 caracteres)" 
                className="bg-white/5 border-white/10 h-16 text-xl font-black rounded-2xl px-8 focus-visible:ring-primary/40 transition-all uppercase italic tracking-tight" 
              />
            </div>

            <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="w-full rounded-2xl h-16 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:bg-primary/80 transition-all hover:scale-[1.02] active:scale-95">
              Protocolo de Fundación 🚀
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingChannel} onOpenChange={setIsCreatingChannel}>
        <DialogContent className="bg-[#050510]/95 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] max-w-xl p-12 shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-white italic text-center">Abrir Nuevo Terminal <span className="text-primary">#</span></DialogTitle>
            <DialogDescription className="text-center text-muted-foreground/60 font-medium uppercase text-[10px] tracking-widest mt-2">Expande la infraestructura de comunicación de tu comunidad</DialogDescription>
          </DialogHeader>
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Identificador del Terminal</label>
              <Input 
                value={newChannelName} 
                onChange={e => setNewChannelName(e.target.value)} 
                placeholder="nombre-del-canal" 
                className="bg-white/5 border-white/10 h-16 text-xl font-black rounded-2xl px-8 focus-visible:ring-primary/40 transition-all lowercase" 
              />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 px-2">Protocolo de Datos</label>
               <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setNewChannelType('text')}
                    variant="ghost" 
                    className={cn("h-14 rounded-xl border border-white/5 font-black uppercase tracking-widest text-[10px]", newChannelType === 'text' ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5")}
                  >
                    Texto 💬
                  </Button>
                  <Button 
                    onClick={() => setNewChannelType('announcement')}
                    variant="ghost" 
                    className={cn("h-14 rounded-xl border border-white/5 font-black uppercase tracking-widest text-[10px]", newChannelType === 'announcement' ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5")}
                  >
                    Anuncios 📢
                  </Button>
               </div>
            </div>

            <Button onClick={handleCreateChannel} disabled={!newChannelName.trim()} className="w-full rounded-2xl h-16 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:bg-primary/80 transition-all hover:scale-[1.02] active:scale-95">
              Protocolo de Apertura 🚀
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Columna de Canales (Terminal de Control) */}
      <div className={cn(
        "w-full md:w-[320px] bg-black/40 border-r border-white/5 flex flex-col z-20 transition-all duration-300",
        viewMode !== 'channels' ? "hidden lg:flex" : "flex"
      )}>
        {activeGroup ? (
          <>
            <div className="h-16 md:h-20 border-b border-white/5 flex items-center px-6 md:px-8 justify-between shadow-xl backdrop-blur-xl transition-all group shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden h-10 w-10 rounded-xl hover:bg-white/5 shrink-0"
                    onClick={() => setViewMode('servers')}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </Button>
                <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)] shrink-0" />
                <h2 className="text-lg md:text-xl font-black truncate text-white uppercase italic tracking-tighter group-hover:text-primary transition-colors">{activeGroup.name}</h2>
              </div>
              <Settings className="w-5 h-5 text-muted-foreground hover:text-white transition-all shrink-0" />
            </div>
            
            <ScrollArea className="flex-1 px-4 py-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-6 px-4 flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full" /> Terminales de Texto
                  </span>
                  {activeGroup.ownerId === user?.uid && (
                    <Plus 
                        className="w-4 h-4 cursor-pointer hover:text-white transition-colors" 
                        onClick={() => setIsCreatingChannel(true)}
                    />
                  )}
                </p>
                <div className="space-y-2">
                  {channels.map(ch => (
                    <div 
                      key={ch.id} 
                      onClick={() => handleSelectChannel(ch)}
                      className={cn(
                        "flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer group/ch transition-all relative overflow-hidden",
                        activeChannel?.id === ch.id ? "bg-primary/10 border border-primary/20 text-white shadow-lg" : "text-muted-foreground hover:bg-white/5 hover:text-white/90"
                      )}
                    >
                      {ch.type === 'announcement' ? (
                        <ShieldAlert className={cn("w-5 h-5 transition-transform group-hover/ch:rotate-12", activeChannel?.id === ch.id ? "text-primary" : "opacity-40")} />
                      ) : (
                        <Hash className={cn("w-5 h-5 transition-transform group-hover/ch:rotate-12", activeChannel?.id === ch.id ? "text-primary" : "opacity-40")} />
                      )}
                      <span className="font-black italic text-[15px] uppercase tracking-tight flex-1">{ch.name}</span>
                      
                      {activeGroup.ownerId === user?.uid && ch.name !== 'general' && (
                        <Trash2 
                           onClick={(e) => { e.stopPropagation(); handleDeleteChannel(ch.id!); }}
                           className="w-4 h-4 opacity-0 group-hover/ch:opacity-40 hover:!opacity-100 hover:text-red-500 transition-all" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 bg-[#050510]/80 border-t border-white/5 flex items-center gap-5 backdrop-blur-3xl shadow-2xl">
              <Avatar className="h-10 w-10 md:h-14 md:w-14 border-2 border-white/10 shadow-xl">
                  <AvatarImage src={profile?.photoURL} alt="Imagen" />
                  <AvatarFallback className="bg-primary/10 text-primary font-black">U</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-black text-base md:text-lg truncate text-white italic tracking-tighter">{profile?.displayName}</p>
                <p className="text-[9px] md:text-[10px] text-primary font-black uppercase tracking-widest opacity-60">#{user?.uid.substring(0,6).toUpperCase()}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-30 text-center">
            <ShieldAlert className="w-12 h-12 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Zona Desactivada</p>
          </div>
        )}
      </div>

      {/* 3. Columna Central (Bucle de Comunicación) */}
      <div className={cn(
        "flex-1 flex flex-col bg-white/[0.02] relative min-w-0 z-10 transition-all duration-300",
        viewMode !== 'chat' ? "hidden lg:flex" : "flex"
      )}>
        {isExploreMode ? (
          <div className="flex-1 flex flex-col p-10 md:p-20 relative overflow-hidden">
             {/* Fondo de exploración */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary.DEFAULT/0.1),transparent_70%)] animate-pulse-slow" />
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32" />
             
             <div className="relative z-10 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">Explorar <span className="text-primary italic">Universos</span></h2>
                  <p className="text-xl text-muted-foreground font-medium max-w-2xl">Descubre comunidades públicas en el núcleo de NovaSphere y expande tu red de influencia.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {allGroups.map(g => {
                    const isJoined = groups.some(myG => myG.id === g.id);
                    return (
                      <div key={g.id} className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:bg-white/[0.06] transition-all hover:-translate-y-2 group group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                        <div className="flex items-center gap-6">
                           <Avatar className="h-20 w-20 border-2 border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                             <AvatarImage src={g.avatar} alt="Imagen" className="object-cover" />
                             <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">{g.name[0]}</AvatarFallback>
                           </Avatar>
                           <div className="flex-1 min-w-0">
                              <h3 className="text-2xl font-black text-white italic tracking-tighter truncate">{g.name}</h3>
                              <p className="text-xs text-primary font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                <Users className="w-3 h-3" /> {g.membersCount || 0} CIUDADANOS
                              </p>
                           </div>
                        </div>
                        <p className="text-muted-foreground font-medium line-clamp-2 leading-relaxed">{g.description}</p>
                        <Button 
                          onClick={() => !isJoined && joinGroup(g.id!, user!.uid)}
                          disabled={isJoined}
                          className={cn(
                            "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                            isJoined ? "bg-white/5 text-muted-foreground" : "bg-primary text-white hover:scale-105 shadow-xl shadow-primary/20"
                          )}
                        >
                          {isJoined ? 'YA PERTENECES' : 'INTEGRARSE AL NÚCLEO ⚡'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
        ) : activeChannel && activeGroup ? (
          <>
            {/* Cabecera de Comunidad con Banner */}
            <div className="relative h-28 md:h-40 shrink-0 overflow-hidden border-b border-white/5 group/header">
              <img 
                src={activeGroup.bannerUrl || 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80'} 
                alt="Banner" 
                className="w-full h-full object-cover opacity-30 group-hover/header:scale-110 transition-transform duration-[3s]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] to-transparent" />
              
              <div className="absolute inset-0 flex items-center px-6 md:px-10 gap-3 md:gap-8 z-20">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden h-10 w-10 rounded-xl hover:bg-white/5"
                    onClick={() => setViewMode('channels')}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </Button>
                
                <div className="flex-1 min-w-0 flex items-center gap-6">
                    <Hash className="w-6 h-6 md:w-10 md:h-10 text-primary opacity-80" />
                    <div className="min-w-0">
                        <h3 className="font-black text-xl md:text-4xl text-white italic tracking-tighter uppercase leading-none mb-1">{activeChannel.name}</h3>
                        <p className="text-[8px] md:text-xs text-primary font-black uppercase tracking-[0.3em] truncate opacity-60">
                           {activeGroup.name} • Sincronización Estable
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                      onClick={handleCopyInvite}
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 group/share backdrop-blur-xl border border-white/10"
                    >
                       <Share2 className="w-5 h-5 text-white group-hover/share:text-primary transition-colors" />
                    </Button>

                    {activeGroup.ownerId === user?.uid && (
                      <Button 
                        onClick={handleDeleteGroup}
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-red-500/20 group/delete backdrop-blur-xl border border-white/10"
                      >
                         <Trash2 className="w-5 h-5 text-white group-hover/delete:text-red-500 transition-colors" />
                      </Button>
                    )}

                    <div className="hidden sm:flex items-center gap-4 bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 backdrop-blur-xl ml-4">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-white leading-none">{members.length}</span>
                    </div>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-10 z-10">
              <div className="space-y-10 pb-12 flex flex-col justify-end min-h-full">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-8 animate-fade-in text-center">
                        <div className="w-32 h-32 rounded-[3.5rem] bg-primary/5 flex items-center justify-center border-2 border-dashed border-primary/20 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Hash className="w-16 h-16 text-primary group-hover:rotate-12 transition-transform duration-700" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Nacimiento del Canal <span className="text-primary italic">#{activeChannel.name}</span></h1>
                            <p className="text-muted-foreground font-medium text-lg max-w-lg leading-relaxed">Este es el inicio histórico de la comunicación en este terminal. Inicia la transmisión de datos ahora.</p>
                        </div>
                    </div>
                )}
                
                <div className="space-y-8">
                  {messages.map((msg, i) => {
                    const mData = getMemberData(msg.senderId);
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id || i} className="flex gap-6 group hover:bg-white/[0.04] p-5 -mx-5 rounded-[2.5rem] transition-all duration-300 relative overflow-hidden">
                        <div className="relative group/avatar shrink-0 mt-1">
                          <Avatar className="h-14 w-14 border-2 border-white/5 group-hover/avatar:border-primary/50 transition-colors shadow-xl cursor-hover">
                            <AvatarImage src={mData.avatar} alt="Imagen" className="object-cover" />
                            <AvatarFallback className="bg-white/5 text-primary text-xl font-black">{mData.name?.[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex items-center gap-4">
                            <span className={cn("text-lg font-black italic tracking-tight cursor-hover hover:underline transition-colors uppercase", isMe ? "text-primary": "text-white")}>{mData.name}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { locale: es }).replace('alrededor de', '') : 'Subiendo...'}
                            </span>
                          </div>
                          
                          {/* Contenido Dinámico */}
                          {msg.type === 'image' ? (
                            <div className="relative max-w-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/image">
                                <img src={msg.mediaUrl} alt="Media" className="w-full h-auto hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity" />
                            </div>
                          ) : msg.type === 'sticker' ? (
                            <img src={msg.mediaUrl} alt="Sticker" className="w-40 h-40 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:scale-110 transition-transform" />
                          ) : (
                            <p className="text-[17px] leading-relaxed text-white/80 font-medium selection:bg-primary/30">{msg.text}</p>
                          )}

                          {/* Reacciones */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                               {Object.entries(msg.reactions).map(([emoji, uids]) => (
                                 uids.length > 0 && (
                                   <div 
                                      key={emoji}
                                      onClick={() => handleReaction(msg.id!, emoji)}
                                      className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-black",
                                        uids.includes(user?.uid!) ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                      )}
                                   >
                                      <span>{emoji}</span>
                                      <span>{uids.length}</span>
                                   </div>
                                 )
                               ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Micro-interaction highlight */}
                        <div className="absolute right-8 top-8 bg-[#050510]/90 backdrop-blur-3xl px-4 py-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex border border-white/10 shadow-2xl scale-90 group-hover:scale-100">
                             <div className="flex gap-1">
                                {['👍', '🔥', '🚀', '❤️', '😂'].map(emoji => (
                                  <Button 
                                    key={emoji} 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-10 h-10 rounded-xl hover:bg-primary/20 hover:text-primary transition-all text-lg"
                                    onClick={() => handleReaction(msg.id!, emoji)}
                                  >
                                    {emoji}
                                  </Button>
                                ))}
                             </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>

            {/* Input de Mensaje Refinado */}
            <div className="p-10 pt-4 shrink-0 z-20 bg-gradient-to-t from-black/60 to-transparent">
              <div className="relative group">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Transmitir a #${activeChannel.name.toUpperCase()}`}
                  className="w-full bg-[#050510]/80 backdrop-blur-3xl hover:bg-[#080815] focus-visible:bg-[#080815] border border-white/5 focus-visible:border-primary/40 h-20 rounded-[2rem] pl-16 pr-24 text-lg font-bold italic tracking-tight transition-all shadow-2xl placeholder:text-muted-foreground/30 focus-visible:ring-0"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary transition-all">
                              <Smile className="w-6 h-6" />
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-[#050510]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                           <div className="space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Stickers Galácticos</p>
                              <div className="grid grid-cols-3 gap-3">
                                 {[
                                   'https://cdn3d.iconscout.com/3d/premium/thumb/rocket-4286121-3563212.png',
                                   'https://cdn3d.iconscout.com/3d/premium/thumb/alien-head-5246237-4389146.png',
                                   'https://cdn3d.iconscout.com/3d/premium/thumb/ufo-4676104-3891361.png',
                                   'https://cdn3d.iconscout.com/3d/premium/thumb/star-4034376-3335508.png',
                                   'https://cdn3d.iconscout.com/3d/premium/thumb/planet-4034374-3335506.png',
                                   'https://cdn3d.iconscout.com/3d/premium/thumb/astronaut-4676110-3891367.png'
                                 ].map((url, idx) => (
                                   <div 
                                      key={idx} 
                                      onClick={() => handleSendMessage('', 'sticker', url)}
                                      className="h-20 bg-white/5 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-primary/20 hover:scale-110 transition-all border border-white/5"
                                   >
                                      <img src={url} alt="Sticker" className="w-14 h-14 object-contain" />
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </PopoverContent>
                     </Popover>
                     
                     <Button 
                        onClick={() => {
                          const url = prompt("Introduce la URL de la imagen estelar:");
                          if (url) handleSendMessage('', 'image', url);
                        }}
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-muted-foreground hover:text-primary transition-all"
                     >
                        <Image className="w-6 h-6" />
                     </Button>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <Button 
                        onClick={handleSendMessage}
                        disabled={!input.trim()}
                        className="h-14 w-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/80 transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="w-6 h-6 ml-1" />
                    </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-10 p-10 text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.05),transparent)] opacity-100 transition-opacity" />
             <div className="w-48 h-48 rounded-[4rem] bg-white/[0.02] flex items-center justify-center border border-white/5 shadow-2xl relative z-10 animate-bounce-slow">
                <Users className="w-24 h-24 text-muted-foreground/30 group-hover:text-primary transition-colors duration-1000" />
             </div>
             <div className="space-y-4 relative z-10">
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Comunidades Activas</h3>
                <p className="text-muted-foreground font-medium text-lg max-w-sm leading-relaxed">Selecciona una comunidad en el sidebar izquierdo para iniciar la integración con otros ciudadanos.</p>
             </div>
             <Button onClick={() => setIsCreatingGroup(true)} className="relative z-10 h-16 px-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[11px] border border-white/5 transition-all shadow-xl hover:shadow-primary/5">
                Fundar Comunidad Nova
             </Button>
          </div>
        )}
      </div>

    </div>
  );
}
