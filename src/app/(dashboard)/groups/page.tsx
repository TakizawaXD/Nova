'use client';

import { useState, useEffect } from 'react';
import { Plus, Hash, Users, Settings, Send, Loader2, ShieldAlert } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { 
  subscribeToUserGroups, subscribeToGroupChannels, subscribeToGroupMembers, 
  subscribeToChannelMessages, sendChannelMessage, createGroup,
  Group, Channel, Message
} from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function GroupsPage() {
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

  // Cargar Grupos
  useEffect(() => {
    if (!user) return;
    
    // Safety net in case firestore is silent
    const t = setTimeout(() => setLoading(false), 2000);
    
    const unsub = subscribeToUserGroups(user.uid, (data) => {
      setGroups(data);
      if (data.length > 0 && !activeGroup) setActiveGroup(data[0]);
      setLoading(false);
      clearTimeout(t);
    });
    return () => { unsub(); clearTimeout(t); };
  }, [user]);

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

  const handleSendMessage = async () => {
    if (!input.trim() || !activeChannel || !activeGroup || !user) return;
    const text = input;
    setInput('');
    try {
      await sendChannelMessage(activeChannel.id!, activeGroup.id!, user.uid, text);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar el mensaje.'});
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user || !profile) return;
    try {
      const avatarGen = `https://ui-avatars.com/api/?name=${newGroupName}&background=random`;
      const id = await createGroup(newGroupName, 'Nueva comunidad Nova', avatarGen, user.uid);
      setIsCreatingGroup(false);
      setNewGroupName('');
      toast({ title: 'Comunidad creada', description: '¡Bienvenido a tu nuevo núcleo!' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Ocurrió un error al crear la comunidad.'});
    }
  };

  const getMemberData = (uid: string) => {
    const fallback = { name: 'Usuario Desconocido', avatar: '' };
    // En un sistema real, haríamos fetch a la coleccion general de users para obtener nombre/avatar
    // ya que members solo tiene groupId, userId, role.
    // Usamos el hook de fallback simple:
    if (uid === user?.uid) return { name: profile?.displayName, avatar: profile?.photoURL, role: members.find(m => m.userId === uid)?.role };
    return { name: `Nova Explorer`, avatar: `https://picsum.photos/seed/${uid}/100`, role: members.find(m => m.userId === uid)?.role };
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] glass border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-fade-in relative">
      
      {/* 1. Columna de Servidores */}
      <div className="w-[80px] bg-black/60 border-r border-white/5 flex flex-col items-center py-4 space-y-4 overflow-y-auto no-scrollbar z-20">
        <div className="w-12 h-12 rounded-[1rem] bg-indigo-500/20 text-indigo-500 flex items-center justify-center border border-indigo-500/50 cursor-pointer shadow-[0_0_15px_theme(colors.indigo.500/20)]">
          <Hash className="w-6 h-6" />
        </div>
        <div className="w-8 h-px bg-white/10 rounded-full" />
        
        {groups.map(g => (
          <div key={g.id} className="relative group/server cursor-pointer" onClick={() => setActiveGroup(g)}>
            <div className={cn("absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 bg-white rounded-r-lg transition-all", activeGroup?.id === g.id ? "h-8" : "h-0 group-hover/server:h-4")} />
            <Avatar className={cn("w-12 h-12 transition-all duration-300", activeGroup?.id === g.id ? "rounded-xl shadow-lg border-2 border-primary ring-2 ring-primary/20" : "rounded-[1.5rem] hover:rounded-xl")}>
              <AvatarImage src={g.avatar} className="object-cover" />
              <AvatarFallback>{g.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        ))}
        
        <div 
          onClick={() => setIsCreatingGroup(true)}
          className="w-12 h-12 rounded-[1.5rem] bg-white/5 hover:bg-green-500 hover:text-white hover:rounded-xl text-green-500 flex items-center justify-center border border-dashed border-white/20 cursor-pointer transition-all mt-2"
        >
          <Plus className="w-6 h-6" />
        </div>
      </div>

      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent className="glass border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-center tracking-tighter">Crear Comunidad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-center text-muted-foreground pb-2">Un servidor es donde tú y tus amigos interactúan. Crea el tuyo y empieza a hablar.</p>
            <Input 
              value={newGroupName} 
              onChange={e => setNewGroupName(e.target.value)} 
              placeholder="Nombre del servidor" 
              className="bg-black/50 border-white/10 h-12 text-lg rounded-xl" 
            />
            <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-xs">
              Mandalore 🚀
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Columna de Canales */}
      <div className="w-[280px] bg-black/40 border-r border-white/5 flex flex-col z-10 hidden md:flex">
        {activeGroup ? (
          <>
            <div className="h-14 border-b border-white/5 flex items-center px-4 justify-between shadow-sm cursor-pointer hover:bg-white/5 transition-colors">
              <h2 className="font-black truncate text-white uppercase tracking-tighter">{activeGroup.name}</h2>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-1 flex items-center gap-1 group">
                Canales de Texto
              </p>
              <div className="space-y-0.5">
                {channels.map(ch => (
                  <div 
                    key={ch.id} 
                    onClick={() => setActiveChannel(ch)}
                    className={cn("flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer group transition-all", activeChannel?.id === ch.id ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white/90")}
                  >
                    <Hash className="w-4 h-4 opacity-70" />
                    <span className="font-medium text-sm truncate">{ch.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 bg-black/30 border-t border-white/5 flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={profile?.photoURL} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-white leading-tight">{profile?.displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">#{user?.uid.substring(0,6)}</p>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground hover:text-white cursor-pointer" />
            </div>
          </>
        ) : (
          <div className="p-4 opacity-50 text-center space-y-2 mt-20">
            <ShieldAlert className="w-10 h-10 mx-auto" />
            <p className="font-bold text-sm">Ninguna comunidad</p>
          </div>
        )}
      </div>

      {/* 3. Columna Central (Chat) */}
      <div className="flex-1 flex flex-col bg-transparent relative min-w-0">
        {activeChannel && activeGroup ? (
          <>
            <div className="h-14 border-b border-white/5 flex items-center px-6 gap-3 glass shadow-sm z-10 shrink-0">
              <Hash className="w-6 h-6 text-muted-foreground" />
              <h3 className="font-bold text-lg text-white">{activeChannel.name}</h3>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <span className="text-xs text-muted-foreground">Inicio del canal general de {activeGroup.name}</span>
            </div>

            <ScrollArea className="flex-1 p-6 z-0">
              {messages.length === 0 && (
                <div className="flex flex-col justify-end min-h-[50vh] pb-8">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4"><Hash className="w-8 h-8 text-white" /></div>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Te damos la bienvenida a #{activeChannel.name}!</h1>
                  <p className="text-muted-foreground">Este es el comienzo del canal en tu comunidad.</p>
                </div>
              )}
              <div className="space-y-6">
                {messages.map((msg, i) => {
                  const mData = getMemberData(msg.senderId);
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id || i} className="flex gap-4 group hover:bg-black/20 p-2 -mx-2 rounded-xl transition-all">
                      <Avatar className="h-10 w-10 border border-white/5 shrink-0 mt-0.5 cursor-pointer">
                        <AvatarImage src={mData.avatar} />
                        <AvatarFallback>{mData.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold cursor-hover hover:underline", isMe ? "text-primary": "text-white")}>{mData.name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { locale: es }) : 'Enviando...'}</span>
                        </div>
                        <p className="text-[15px] leading-relaxed text-slate-200">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-6 pt-2 shrink-0 z-10">
              <div className="relative">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Enviar mensaje a #${activeChannel.name}`}
                  className="w-full bg-white/5 hover:bg-white/10 focus-visible:bg-white/10 border-none h-14 rounded-2xl pl-6 pr-14 text-base transition-all shadow-inner"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-transparent hover:bg-white/10 text-muted-foreground hover:text-white"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-50 space-y-4">
             <div className="w-24 h-24 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-white/50" />
             </div>
             <p className="font-black text-xl tracking-tighter uppercase">Selecciona una Comunidad</p>
          </div>
        )}
      </div>

    </div>
  );
}
