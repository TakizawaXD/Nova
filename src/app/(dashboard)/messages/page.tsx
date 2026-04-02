
'use client';

import { useState, useEffect } from 'react';
import { Search, Send, Phone, Video, Info, Paperclip, Smile, Image as ImageIcon, Loader2, MessageSquare, Plus, ChevronLeft, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { sendMessage, subscribeToMessages, subscribeToUserChats, Message, getUserFriends, startDirectChat, deleteMessage, UserProfile } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [isNewMsgOpen, setIsNewMsgOpen] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Subscribe to user chats & load friends
  useEffect(() => {
    if (!user) return;
    
    // Load friends
    getUserFriends(user.uid).then(f => setFriends(f));

    const unsubscribe = subscribeToUserChats(user.uid, (data) => {
      setChats(data);
      if (data.length > 0 && !selectedChat && !showMobileChat) {
        // En desktop seleccionamos el primero por defecto
        if (window.innerWidth > 768) setSelectedChat(data[0]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;
    const unsubscribe = subscribeToMessages(selectedChat.id, (data) => {
      setMessages(data);
    });
    return () => unsubscribe();
  }, [selectedChat]);

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
    setShowMobileChat(true);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedChat || !user) return;
    const text = input;
    setInput('');
    try {
      await sendMessage(selectedChat.id, user.uid, text);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  const getOtherParticipant = (chat: any) => {
    if (!chat.participantData || !user) return { name: `Chat #${chat.id.substring(0, 4)}`, avatar: '' };
    const otherId = Object.keys(chat.participantData).find(id => id !== user.uid);
    if (!otherId) return { name: 'Desconocido', avatar: '' };
    return chat.participantData[otherId];
  };

  const handleCreateNewChat = async (friend: UserProfile) => {
    if (!user || !profile) return;
    setIsNewMsgOpen(false);
    try {
      const chatId = await startDirectChat(user.uid, friend.uid);
      // Fallback manual selection
      const exists = chats.find(c => c.id === chatId);
      if (exists) {
        setSelectedChat(exists);
        setShowMobileChat(true);
      }
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-140px)] bg-[#030303]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl animate-pulse">
        {/* Skeleton Sidebar */}
        <div className="w-full md:w-[400px] border-r border-white/5 flex flex-col p-8 space-y-8">
          <Skeleton className="h-10 w-40 rounded-2xl bg-white/5" />
          <Skeleton className="h-14 w-full rounded-2xl bg-white/5" />
          <div className="space-y-6 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-16 w-16 rounded-[1.5rem] bg-white/5 shrink-0" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-4 w-2/3 bg-white/5" />
                  <Skeleton className="h-3 w-1/2 bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Skeleton Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-white/[0.02] p-10">
           <div className="flex items-center gap-6 mb-12">
             <Skeleton className="h-14 w-14 rounded-2xl bg-white/5" />
             <div className="space-y-3">
               <Skeleton className="h-6 w-48 bg-white/5" />
               <Skeleton className="h-3 w-24 bg-white/5" />
             </div>
           </div>
           <div className="flex-1 flex flex-col justify-end space-y-8 pb-10">
             <Skeleton className="h-20 w-2/3 rounded-[2rem] rounded-bl-none bg-white/5" />
             <Skeleton className="h-14 w-1/2 rounded-[2rem] rounded-br-none bg-primary/10 self-end" />
             <Skeleton className="h-24 w-3/4 rounded-[2rem] rounded-bl-none bg-white/5" />
           </div>
        </div>
      </div>
    );
  }

  const currentOtherUser = selectedChat ? getOtherParticipant(selectedChat) : null;

  return (
    <div className="flex h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] bg-[#030303]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden animate-fade-in shadow-2xl relative">
      
      {/* 1. Sidebar: Conversaciones */}
      <div className={cn(
        "w-full md:w-[400px] border-r border-white/5 flex flex-col bg-black/20 z-20 transition-all duration-300",
        showMobileChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
             <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-white italic leading-none">Mensajes <span className="text-primary truncate">XP</span></h2>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_theme(colors.green.500)]" />
                   <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sistema de Red Activo</span>
                </div>
             </div>
             <Button onClick={() => setIsNewMsgOpen(true)} className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary hover:bg-primary/80 text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="w-6 h-6 md:w-7 md:h-7" />
             </Button>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input className="pl-14 bg-white/5 border-white/5 focus:bg-white/10 rounded-2xl h-12 md:h-14 text-xs md:text-sm font-medium transition-all" placeholder="Explorar hilos de red..." />
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 md:px-4 pb-8">
          <div className="space-y-1">
            {chats.map((chat) => {
              const other = getOtherParticipant(chat);
              const isActive = selectedChat?.id === chat.id;
              
              return (
                <div 
                  key={chat.id} 
                  onClick={() => handleSelectChat(chat)}
                  className={cn(
                    "flex items-center gap-5 p-5 rounded-[2rem] cursor-pointer transition-all border border-transparent group relative overflow-hidden",
                    isActive ? "bg-primary/10 border-primary/20 shadow-lg" : "hover:bg-white/5 hover:border-white/10"
                  )}
                >
                  <div className="relative shrink-0 transition-transform duration-500 group-hover:scale-105">
                    <Avatar className="h-16 w-16 border-2 border-white/5 group-hover:border-primary/50 transition-colors shadow-2xl">
                      <AvatarImage src={other.avatar} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">{other.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-[#030303] rounded-full border-2 border-white/5 flex items-center justify-center">
                       <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_theme(colors.green.500)]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className={cn("text-lg font-black italic tracking-tight truncate", isActive ? "text-primary" : "text-white")}>{other.name}</p>
                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest ml-3 opacity-60">
                        {chat.updatedAt ? formatDistanceToNow(chat.updatedAt.toDate(), { locale: es }).replace('alrededor de', '') : ''}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate font-medium", isActive ? "text-white/80" : "text-muted-foreground")}>
                      {chat.lastMessage || 'Iniciando protocolo de chat...'}
                    </p>
                  </div>
                  
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-r-full shadow-[0_0_20px_theme(colors.primary.DEFAULT)]" />
                  )}
                </div>
              );
            })}

            {chats.length === 0 && (
              <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                <MessageSquare className="w-16 h-16 text-muted-foreground" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No hay hilos activos en el núcleo</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 2. Chat Area: Mensajes */}
      <div className={cn(
        "flex-1 flex flex-col bg-white/[0.02] relative z-10 transition-all duration-300",
        !showMobileChat ? "hidden md:flex" : "flex"
      )}>
        {selectedChat && currentOtherUser ? (
          <>
            <div className="p-4 md:p-8 bg-[#050510]/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between z-20 shadow-xl">
              <div className="flex items-center gap-3 md:gap-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden h-10 w-10 rounded-xl hover:bg-white/5"
                  onClick={() => { setShowMobileChat(false); setSelectedChat(null); }}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </Button>

                <Avatar className="h-10 w-10 md:h-14 md:w-14 border-2 border-primary/30 shadow-2xl">
                  <AvatarImage src={currentOtherUser.avatar} className="object-cover" />
                  <AvatarFallback className="bg-primary/20 text-primary font-black text-lg md:text-xl">{currentOtherUser.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-2xl font-black text-white italic tracking-tighter truncate">{currentOtherUser.name}</h3>
                  <div className="flex items-center gap-2 md:gap-2.5">
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-500 rounded-full shadow-[0_0_8px_theme(colors.green.500)]" />
                    <span className="text-[7px] md:text-[10px] text-green-500 font-black uppercase tracking-[0.2em] truncate">Nodo Sincronizado</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-3">
                <Button variant="ghost" size="icon" className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"><Phone className="w-5 h-5 md:w-6 md:h-6" /></Button>
                <Button variant="ghost" size="icon" className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"><Video className="w-5 h-5 md:w-6 md:h-6" /></Button>
                <Button variant="ghost" size="icon" className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all ml-4 border border-white/5"><Info className="w-6 h-6" /></Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-10 relative">
              <div className="space-y-8 flex flex-col justify-end min-h-full pb-6">
                <div className="flex flex-col items-center mb-10 space-y-4 opacity-40">
                    <Avatar className="h-24 w-24 border-2 border-white/10">
                        <AvatarImage src={currentOtherUser.avatar} />
                        <AvatarFallback className="text-4xl">{currentOtherUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <p className="text-xl font-black italic">{currentOtherUser.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest mt-1">Conexión establecida via NovaSphere</p>
                    </div>
                </div>

                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id || i} className={cn("flex gap-5 max-w-[85%] group/msg", isMe ? "ml-auto flex-row-reverse" : "")}>
                      {!isMe && (
                        <Avatar className="h-10 w-10 self-end mb-2 shrink-0 shadow-2xl border border-white/5">
                          <AvatarImage src={currentOtherUser.avatar} />
                          <AvatarFallback>{currentOtherUser.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col gap-2 relative">
                        <div className={cn(
                          "px-6 py-4 rounded-[2rem] shadow-2xl text-[15px] leading-relaxed font-medium transition-all hover:scale-[1.02] relative",
                          isMe ? "bg-primary text-white rounded-br-none shadow-primary/20" : "bg-white/5 text-white/90 rounded-bl-none border border-white/10 backdrop-blur-xl"
                        )}>
                          <p>{msg.text}</p>
                          {isMe && (
                            <button 
                              onClick={() => deleteMessage(msg.id!)}
                              className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-red-500 opacity-0 group-hover/msg:opacity-100 transition-opacity hover:bg-red-500/10 rounded-xl"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest opacity-40 px-2",
                          isMe ? "text-right" : "text-left"
                        )}>
                          {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { locale: es }) : 'Sincronizando...'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-8 bg-[#050510]/60 backdrop-blur-3xl border-t border-white/5 z-20">
              <div className="flex items-center gap-5">
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-primary transition-all"><Paperclip className="w-6 h-6" /></Button>
                  <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-primary transition-all"><ImageIcon className="w-6 h-6" /></Button>
                </div>
                
                <div className="flex-1 relative group">
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-white/5 border-white/5 focus:bg-white/10 rounded-[1.75rem] pr-16 h-16 text-base font-medium focus-visible:ring-primary/30 transition-all placeholder:text-muted-foreground/30 px-8" 
                    placeholder="Transmitir mensaje al nodo..." 
                  />
                  <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary rounded-2xl hover:bg-transparent">
                    <Smile className="w-7 h-7" />
                  </Button>
                </div>

                <Button onClick={handleSendMessage} disabled={!input.trim()} className="h-16 w-16 shrink-0 rounded-[1.75rem] bg-primary text-white hover:bg-primary/80 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                  <Send className="w-7 h-7 ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-10 text-center">
            <div className="w-40 h-40 rounded-[3rem] bg-white/[0.02] flex items-center justify-center border border-white/5 shadow-2xl group relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <MessageSquare className="w-20 h-20 text-muted-foreground/40 group-hover:text-primary transition-colors duration-700" />
            </div>
            <div className="space-y-3">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Comunicaciones Nova</h3>
               <p className="text-muted-foreground font-medium text-lg max-w-sm leading-relaxed">Sincroniza protocolos de chat con tus conexiones de red para una integración total.</p>
            </div>
            <Button onClick={() => setIsNewMsgOpen(true)} className="h-16 px-10 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[11px] border border-white/5 transition-all">
               Iniciar Nuevo Hilo
            </Button>
          </div>
        )}
      </div>

      {/* 3. New Message Dialog (Rediseño Estético) */}
      <Dialog open={isNewMsgOpen} onOpenChange={setIsNewMsgOpen}>
        <DialogContent className="bg-[#050510]/95 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] max-w-xl p-10 shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-white italic text-center">Protocolo de Nueva Conexión <span className="text-primary">•</span></DialogTitle>
          </DialogHeader>
          <div className="relative mb-8 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input className="pl-16 bg-white/5 border-white/5 focus:bg-white/10 rounded-[1.75rem] h-16 text-lg font-bold" placeholder="Filtrar por PIN o Nombre..." />
          </div>
          <ScrollArea className="h-[400px] pr-6">
            <div className="space-y-3">
              {friends.length > 0 ? friends.map(f => (
                <div 
                  key={f.uid} 
                  onClick={() => handleCreateNewChat(f)} 
                  className="flex items-center justify-between p-5 hover:bg-primary/10 rounded-[2rem] cursor-pointer transition-all border border-transparent hover:border-primary/20 group relative overflow-hidden"
                >
                  <div className="flex items-center gap-5">
                    <Avatar className="h-16 w-16 border-2 border-white/5 group-hover:border-primary/50 transition-colors shadow-xl">
                      <AvatarImage src={f.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-white/5 text-primary text-xl font-black">{f.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-white italic tracking-tight">{f.displayName}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">#{f.uid.substring(0,6).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/5">
                     <Plus className="w-6 h-6 text-primary" />
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-6">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                        <Search className="w-10 h-10" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-center">Sin nodos vinculados en este sector</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
