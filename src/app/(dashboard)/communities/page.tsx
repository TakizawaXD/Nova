'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Hash, Users, Settings, Send, Loader2, ShieldAlert, ChevronLeft, Compass, Trash2, Share2, Copy, Image, Smile, UserPlus, Check, Search, Camera } from 'lucide-react';
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
  getAllUsers,
  createOrGetChat,
  sendMessage,
  generateUniqueInvite,
  Group, 
  Channel, 
  Message,
  UserProfile
} from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { uploadToSupabase } from '@/lib/supabase';
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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [friendsToInvite, setFriendsToInvite] = useState<UserProfile[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());
  const [inviteSearch, setInviteSearch] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [uniqueInviteURL, setUniqueInviteURL] = useState(''); // Current link in input
  const [groupAvatarFile, setGroupAvatarFile] = useState<File | null>(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState<string | null>(null);
  const groupAvatarInputRef = useRef<HTMLInputElement>(null);
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

  // Cargar Todas las Grupos (Discovery) — tanto en desktop como mobile
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

  useEffect(() => {
    if (activeGroup && typeof window !== 'undefined') {
       // Reset unique invite url to the master one initially
       setUniqueInviteURL(`${window.location.origin}/nova/${activeGroup.inviteCode}`);
    }
  }, [activeGroup]);

  // Cargar Amigos/Seguidores cuando abrimos el modal de invitar
  useEffect(() => {
    if (!user || !isInviteModalOpen) return;
    getAllUsers(200).then(users => setFriendsToInvite(users.filter(u => u.uid !== user.uid) || []));
  }, [user, isInviteModalOpen]);

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
    setLoading(true);
    try {
      let avatarUrl = `https://ui-avatars.com/api/?name=${newGroupName}&background=random`;
      
      if (groupAvatarFile) {
        avatarUrl = await uploadToSupabase(groupAvatarFile, 'avatars', `communities/${user.uid}/${Date.now()}`);
      }

      const id = await createGroup(newGroupName, 'Nueva comunidad Nova', avatarUrl, user.uid);
      setIsCreatingGroup(false);
      setNewGroupName('');
      setGroupAvatarFile(null);
      setGroupAvatarPreview(null);
      toast({ title: 'Comunidad creada', description: '¡Bienvenido a tu nueva comunidad!' });
      
      // Auto-seleccionar la comunidad creada
      const newG = { id, name: newGroupName, description: 'Nueva comunidad Nova', avatar: avatarUrl, ownerId: user.uid, membersCount: 1 };
      setActiveGroup(newG as Group);
      setIsExploreMode(false);
    } catch (e: any) {
      console.error("Fallo al crear comunidad:", e);
      toast({ 
        variant: 'destructive', 
        title: 'Error de Fundación', 
        description: e.message || 'Ocurrió un error al crear la comunidad.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!activeGroup?.id || !user) return;
    try {
      const code = await generateUniqueInvite(activeGroup.id, user.uid);
      const newUrl = `${window.location.origin}/nova/${code}`;
      setUniqueInviteURL(newUrl);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo generar un enlace.' });
    }
  };

  const handleCopyInvite = () => {
    if (!uniqueInviteURL) return;
    navigator.clipboard.writeText(uniqueInviteURL);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ title: 'Enlace Copiado', description: '¡Hazlo viral en la red Nova!' });
  };

  const handleSendDirectInvite = async (friendId: string) => {
    if (!user || !activeGroup?.id) return;
    try {
      const uniqueCode = await generateUniqueInvite(activeGroup.id, user.uid);
      const url = `${window.location.origin}/nova/${uniqueCode}`;
      
      const chatId = await createOrGetChat(user.uid, friendId);
      await sendMessage(chatId, user.uid, `¡Únete a mi comunidad "${activeGroup.name}" en Nova!\n${url}`);
      setInvitedUsers(prev => new Set(prev).add(friendId));
      toast({ title: 'Invitación enviada', description: '¡El mensaje ha sido entregado!' });
    } catch (error: any) {
      console.error("Fallo enviando invitación:", error);
      toast({ variant: 'destructive', title: 'Error', description: error?.message || 'No se pudo enviar la invitación.' });
    }
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
      <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-[#030303]/40 backdrop-blur-3xl border border-white/5 md:rounded-[3rem] overflow-hidden shadow-2xl animate-pulse">
        {/* Skeleton Sidebar Servidores */}
        <div className="w-full md:w-[100px] border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col items-center py-4 md:py-8 space-x-4 md:space-x-0 md:space-y-6 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-white/5 shrink-0" />
          ))}
        </div>
        {/* Skeleton Sidebar Canales */}
        <div className="w-full md:w-[300px] border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-4 md:p-8 space-y-8 hidden md:flex">
          <Skeleton className="h-8 w-40 rounded-xl bg-white/5" />
          <div className="space-y-4">
             {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl bg-white/5" />
             ))}
          </div>
        </div>
        {/* Skeleton Chat */}
        <div className="flex-1 flex flex-col bg-white/[0.02] p-4 md:p-10 space-y-8">
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
      
      {/* 1A. Vista Mobile: Selector de Comunidades (pantalla completa, card-based) */}
      <div className={cn(
        "w-full absolute inset-0 z-40 flex flex-col bg-black/95 backdrop-blur-3xl md:hidden transition-all duration-300",
        viewMode !== 'servers' ? "opacity-0 pointer-events-none -translate-y-2" : "opacity-100 translate-y-0"
      )}>
        {/* Header Mobile */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Comunidades</h1>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Tu red de ciudadanos Nova</p>
            </div>
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {/* Tabs: Mis Comunidades / Explorar */}
          <div className="flex gap-2 mt-4 p-1 bg-white/5 rounded-2xl">
            <button
              onClick={() => setIsExploreMode(false)}
              className={cn(
                "flex-1 h-9 rounded-xl text-xs font-black uppercase tracking-wide transition-all",
                !isExploreMode ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted-foreground"
              )}
            >
              Mis Comunidades
            </button>
            <button
              onClick={() => { setIsExploreMode(true); }}
              className={cn(
                "flex-1 h-9 rounded-xl text-xs font-black uppercase tracking-wide transition-all",
                isExploreMode ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted-foreground"
              )}
            >
              Explorar
            </button>
          </div>
        </div>

        {/* Lista de Comunidades / Explorar */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
          {!isExploreMode ? (
            groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 pb-20">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-white font-black text-lg uppercase tracking-tight">Sin comunidades</p>
                  <p className="text-muted-foreground text-sm">Funda la primera o únete a una existente.</p>
                </div>
                <button
                  onClick={() => setIsCreatingGroup(true)}
                  className="h-12 px-8 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  ✦ Fundar Comunidad
                </button>
              </div>
            ) : (
              groups.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleSelectGroup(g)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all text-left active:scale-[0.98]",
                    activeGroup?.id === g.id
                      ? "bg-primary/15 border-primary/40 shadow-lg shadow-primary/10"
                      : "bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.07]"
                  )}
                >
                  <Avatar className={cn(
                    "w-14 h-14 shrink-0 transition-all",
                    activeGroup?.id === g.id ? "rounded-2xl ring-2 ring-primary/60" : "rounded-[1.5rem]"
                  )}>
                    <AvatarImage src={g.avatar} className="object-cover" />
                    <AvatarFallback className={cn(
                      "text-white font-black text-xl",
                      activeGroup?.id === g.id ? "bg-primary" : "bg-gradient-to-br from-primary/50 to-violet-700/50"
                    )}>{g.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-base truncate">{g.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> {g.membersCount || 1} miembro{(g.membersCount || 1) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {activeGroup?.id === g.id && (
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_theme(colors.primary.DEFAULT)] shrink-0" />
                  )}
                  <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180 shrink-0" />
                </button>
              ))
            )
          ) : (
            <div className="space-y-3">
              {allGroups.map(g => {
                const isJoined = groups.some(myG => myG.id === g.id);
                return (
                  <div key={g.id} className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/[0.04] border border-white/[0.07]">
                    <Avatar className="w-14 h-14 shrink-0 rounded-[1.5rem]">
                      <AvatarImage src={g.avatar} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/50 to-violet-700/50 text-white font-black text-xl">{g.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-base truncate">{g.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{g.description}</p>
                    </div>
                    <button
                      onClick={() => !isJoined && joinGroup(g.id!, user!.uid)}
                      disabled={isJoined}
                      className={cn(
                        "shrink-0 h-9 px-4 rounded-xl font-black text-[11px] uppercase tracking-wide transition-all active:scale-95",
                        isJoined ? "bg-white/10 text-muted-foreground" : "bg-primary text-white shadow-md shadow-primary/30"
                      )}
                    >
                      {isJoined ? 'Unido' : 'Unirse'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 1B. Columna Desktop: Icon Sidebar (solo visible en md+) */}
      <div className={cn(
        "w-full md:w-[88px] bg-gradient-to-b from-black/80 via-black/60 to-black/80 border-r border-white/[0.06] flex-col items-center py-6 gap-3 overflow-y-auto no-scrollbar z-30 transition-all duration-300 backdrop-blur-xl hidden md:flex"
      )}>
        {/* Botón Inicio */}
        <div 
          onClick={() => setIsExploreMode(false)}
          className={cn(
            "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer group",
            !isExploreMode 
              ? "bg-primary rounded-xl shadow-lg shadow-primary/40" 
              : "bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-white hover:rounded-xl"
          )}
          title="Mis Comunidades"
        >
          <Hash className={cn("w-5 h-5 group-hover:scale-110 transition-transform", !isExploreMode ? "text-white" : "")} />
          {!isExploreMode && <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />}
        </div>

        {/* Botón Explorar */}
        <div 
          onClick={() => setIsExploreMode(true)}
          className={cn(
            "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer group",
            isExploreMode 
              ? "bg-primary rounded-xl shadow-lg shadow-primary/40" 
              : "bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-white hover:rounded-xl"
          )}
          title="Explorar universos"
        >
          <Compass className={cn("w-5 h-5 group-hover:scale-110 transition-transform", isExploreMode ? "text-white" : "")} />
          {isExploreMode && <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />}
        </div>
        
        {/* Separador premium */}
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-1 rounded-full" />
        
        {groups.map(g => (
          <div key={g.id} className="relative group/server cursor-pointer" onClick={() => handleSelectGroup(g)}>
            {/* Indicador activo */}
            <span className={cn(
              "absolute -left-3 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-300",
              activeGroup?.id === g.id ? "h-8 opacity-100" : "h-0 opacity-0 group-hover/server:h-5 group-hover/server:opacity-60"
            )} />
            {/* Tooltip */}
            <div className="absolute left-[4.5rem] top-1/2 -translate-y-1/2 bg-[#111]/95 text-white text-xs font-black uppercase tracking-wide px-3 py-2 rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/server:opacity-100 transition-opacity z-50 border border-white/10 shadow-xl">
              {g.name}
            </div>
            <Avatar className={cn(
              "w-12 h-12 transition-all duration-300 shadow-xl",
              activeGroup?.id === g.id 
                ? "rounded-xl ring-2 ring-primary/80 shadow-primary/30" 
                : "rounded-[1.5rem] hover:rounded-xl border border-white/5 hover:border-primary/30"
            )}>
              <AvatarImage src={g.avatar} alt={g.name} className="object-cover" />
              <AvatarFallback className={cn(
                "text-white font-black text-lg",
                activeGroup?.id === g.id ? "bg-primary" : "bg-gradient-to-br from-primary/40 to-violet-700/40"
              )}>{g.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        ))}
        
        {/* Botón crear comunidad */}
        <button 
          onClick={() => setIsCreatingGroup(true)}
          className="relative w-12 h-12 rounded-[1.5rem] hover:rounded-xl bg-white/5 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 flex items-center justify-center border border-white/10 hover:border-emerald-500/30 cursor-pointer transition-all duration-300 shadow-lg group/plus"
          title="Crear comunidad"
        >
          <Plus className="w-5 h-5 group-hover/plus:rotate-90 transition-transform duration-300" />
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
                <input 
                  type="file" 
                  ref={groupAvatarInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setGroupAvatarFile(file);
                      const reader = new FileReader();
                      reader.onload = (ev) => setGroupAvatarPreview(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button 
                  onClick={() => groupAvatarInputRef.current?.click()}
                  className={cn(
                    "w-32 h-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border-2 border-dashed transition-all relative overflow-hidden group",
                    groupAvatarPreview ? "border-primary" : "border-primary/40 hover:border-primary"
                  )}
                >
                    {groupAvatarPreview ? (
                      <img src={groupAvatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="w-8 h-8 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Logo Comunidad</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                </button>
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

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="bg-[#050510]/95 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] max-w-md p-8 shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-white italic text-center">Invitar Amigos</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground/60 font-medium uppercase text-[10px] tracking-widest mt-2">{activeGroup?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            
            {/* Input de Busqueda */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={inviteSearch}
                onChange={e => setInviteSearch(e.target.value)}
                placeholder="Buscar por nombre o pin" 
                className="bg-white/5 border-white/10 h-12 text-sm font-medium rounded-2xl pl-12 pr-4 focus-visible:ring-primary/40 transition-all" 
              />
            </div>

            <ScrollArea className="h-64 pr-4">
              <div className="space-y-3">
                 {friendsToInvite.length > 0 ? friendsToInvite.filter(f => f.displayName?.toLowerCase().includes(inviteSearch.toLowerCase()) || f.uid.includes(inviteSearch)).map(friend => {
                   const isInvited = invitedUsers.has(friend.uid);
                   return (
                     <div key={friend.uid} className="flex items-center justify-between group hover:bg-white/5 p-2 rounded-2xl transition-all">
                       <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10 border border-white/10">
                           <AvatarImage src={friend.photoURL} />
                           <AvatarFallback className="bg-primary/20 text-primary font-black uppercase">{friend.displayName?.[0]}</AvatarFallback>
                         </Avatar>
                         <div>
                           <p className="text-sm font-black text-white italic">{friend.displayName}</p>
                           <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">#{friend.uid.substring(0,6)}</p>
                         </div>
                       </div>
                       <Button 
                         onClick={() => !isInvited && handleSendDirectInvite(friend.uid)}
                         disabled={isInvited}
                         size="sm"
                         className={cn(
                           "h-8 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all",
                           isInvited ? "bg-white/10 text-white" : "bg-transparent border border-primary/40 text-primary hover:bg-primary hover:text-white"
                         )}
                       >
                         {isInvited ? 'Enviado' : 'Invitar'}
                       </Button>
                     </div>
                   );
                 }) : (
                   <div className="flex flex-col items-center justify-center py-10 opacity-50">
                      <UserPlus className="w-8 h-8 mb-3" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-center">No hay amigos en tu radar<br/>Aún no has sincronizado con otras señales</p>
                   </div>
                 )}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between px-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Enlace de acceso</label>
                 <Button 
                   onClick={handleGenerateLink}
                   variant="ghost" 
                   size="sm" 
                   className="h-6 text-[9px] uppercase tracking-widest text-primary hover:text-white"
                 >
                   Generar Nuevo 🔄
                 </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Input 
                  readOnly 
                  value={uniqueInviteURL}
                  className="bg-white/5 border-white/10 h-12 text-xs font-medium rounded-xl text-muted-foreground"
                />
                <Button 
                  onClick={handleCopyInvite} 
                  className={cn(
                    "h-12 w-20 rounded-xl font-black text-xs transition-all",
                    isCopied ? "bg-green-500 hover:bg-green-600 text-white" : "bg-primary text-white hover:bg-primary/80"
                  )}
                >
                  {isCopied ? <Check className="w-5 h-5" /> : 'Copiar'}
                </Button>
              </div>
              <p className="text-[9px] font-medium text-muted-foreground/60 px-2 leading-relaxed">Tu enlace de invitación no expira. Úsalo para reclutar masivamente.</p>
            </div>
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
                <div className="px-4 mb-6">
                   <Button 
                     onClick={() => setIsInviteModalOpen(true)}
                     className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-primary/80 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                   >
                     <UserPlus className="w-4 h-4" /> Invitar Personas
                   </Button>
                </div>

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
                        <div className="absolute right-4 md:right-8 top-4 md:top-8 bg-[#050510]/90 backdrop-blur-3xl px-2 md:px-4 py-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex border border-white/10 shadow-2xl scale-90 group-hover:scale-100">
                             <div className="flex gap-1">
                                {['👍', '🔥', '🚀', '❤️', '😂'].map(emoji => (
                                  <Button 
                                    key={emoji} 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-xl hover:bg-primary/20 hover:text-primary transition-all text-xs md:text-lg"
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
            <div className="p-4 md:p-10 pt-2 md:pt-4 shrink-0 z-20 bg-gradient-to-t from-black/60 to-transparent">
              <div className="relative group">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Mandar a #${activeChannel.name}`}
                  className="w-full bg-[#050510]/80 backdrop-blur-3xl hover:bg-[#080815] focus-visible:bg-[#080815] border border-white/5 focus-visible:border-primary/40 h-14 md:h-20 rounded-[2rem] pl-14 md:pl-16 pr-16 md:pr-24 text-sm md:text-lg font-bold italic tracking-tight transition-all shadow-2xl placeholder:text-muted-foreground/30 focus-visible:ring-0"
                />
                <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-primary transition-all">
                              <Smile className="w-5 h-5 md:w-6 md:h-6" />
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[85vw] md:w-80 bg-[#050510]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl">
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
                                      className="h-16 md:h-20 bg-white/5 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-primary/20 hover:scale-110 transition-all border border-white/5"
                                   >
                                      <img src={url} alt="Sticker" className="w-10 h-10 md:w-14 md:h-14 object-contain" />
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
                        className="hidden md:flex h-10 w-10 text-muted-foreground hover:text-primary transition-all"
                     >
                        <Image className="w-6 h-6" />
                     </Button>
                </div>
                <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <Button 
                        onClick={handleSendMessage}
                        disabled={!input.trim()}
                        className="h-10 w-10 md:h-14 md:w-14 rounded-full md:rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/80 transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="w-4 h-4 md:w-6 md:h-6 md:ml-1" />
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
             <Button onClick={() => setIsCreatingGroup(true)} className="relative z-10 h-14 px-10 rounded-2xl bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                ✦ Fundar Comunidad Nova
             </Button>
          </div>
        )}
      </div>

    </div>
  );
}
