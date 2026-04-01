
'use client';

import { useState, useEffect } from 'react';
import { Search, Send, Phone, Video, Info, Paperclip, Smile, Image as ImageIcon, Loader2, MessageSquare, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { sendMessage, subscribeToMessages, subscribeToUserChats, Message, getUserFriends, startDirectChat, UserProfile } from '@/lib/db';
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

  // Subscribe to user chats & load friends
  useEffect(() => {
    if (!user) return;
    
    // Load friends
    getUserFriends(user.uid).then(f => setFriends(f));

    const unsubscribe = subscribeToUserChats(user.uid, (data) => {
      setChats(data);
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0]);
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
    if (!profile) return;
    setIsNewMsgOpen(false);
    try {
      const chatId = await startDirectChat(profile, friend);
      // Fallback manual selection
      const exists = chats.find(c => c.id === chatId);
      if (exists) setSelectedChat(exists);
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-140px)] glass border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        {/* Skeleton Sidebar */}
        <div className="w-full md:w-[350px] border-r border-white/5 flex flex-col p-4 space-y-4">
          <Skeleton className="h-8 w-32 rounded-xl mb-2" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="space-y-4 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Skeleton Chat */}
        <div className="hidden md:flex flex-1 flex-col bg-background/50 p-6">
           <div className="flex items-center gap-4 mb-8">
             <Skeleton className="h-12 w-12 rounded-full" />
             <div className="space-y-2">
               <Skeleton className="h-5 w-40" />
               <Skeleton className="h-3 w-20" />
             </div>
           </div>
           <div className="flex-1 flex flex-col justify-end space-y-6 pb-6 border-b border-white/5">
             <Skeleton className="h-16 w-2/3 rounded-2xl rounded-bl-sm" />
             <Skeleton className="h-12 w-1/2 rounded-2xl rounded-br-sm self-end" />
             <Skeleton className="h-20 w-3/4 rounded-2xl rounded-bl-sm" />
           </div>
           <div className="pt-6 flex gap-4">
             <Skeleton className="h-12 flex-1 rounded-full" />
             <Skeleton className="h-12 w-12 rounded-full shrink-0" />
           </div>
        </div>
      </div>
    );
  }

  const currentOtherUser = selectedChat ? getOtherParticipant(selectedChat) : null;

  return (
    <div className="flex h-[calc(100vh-140px)] glass border-white/5 rounded-3xl overflow-hidden animate-fade-in shadow-2xl">
      {/* Sidebar List */}
      <div className="w-full md:w-[350px] border-r border-white/5 flex flex-col bg-black/20">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tighter uppercase text-primary">Chats</h2>
            <Button onClick={() => setIsNewMsgOpen(true)} variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/5 border-white/10 hover:bg-primary hover:text-white">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10 bg-white/5 border-white/10 rounded-2xl h-12" placeholder="Buscar en Messenger..." />
          </div>
        </div>

        <Dialog open={isNewMsgOpen} onOpenChange={setIsNewMsgOpen}>
          <DialogContent className="glass border-white/10 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase text-center tracking-tighter">Nuevo Mensaje</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[300px] pr-4 pt-4">
              {friends.length > 0 ? friends.map(f => (
                <div key={f.uid} onClick={() => handleCreateNewChat(f)} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border-b border-white/5">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={f.photoURL} />
                    <AvatarFallback>{f.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm text-foreground leading-none">{f.displayName}</p>
                    <p className="text-xs text-muted-foreground mt-1">@{f.username}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-sm text-muted-foreground py-8">No tienes exploradores vinculados.</p>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <ScrollArea className="flex-1">
          <div className="px-3 py-2 space-y-1">
            {chats.map((chat) => {
              const other = getOtherParticipant(chat);
              const isActive = selectedChat?.id === chat.id;
              
              return (
                <div 
                  key={chat.id} 
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                    isActive ? "bg-primary/20 border-primary/30 shadow-lg" : "hover:bg-white/5 hover:border-white/10"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-14 w-14 border border-white/10 shadow-md">
                      <AvatarImage src={other.avatar} className="object-cover" />
                      <AvatarFallback>{other.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-[0_0_5px_theme(colors.green.500)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className={cn("text-[15px] font-black truncate", isActive ? "text-primary" : "text-white")}>{other.name}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {chat.updatedAt ? formatDistanceToNow(chat.updatedAt.toDate(), { locale: es }).replace('alrededor de', '') : ''}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate", isActive ? "text-primary/80 font-bold" : "text-muted-foreground font-medium")}>
                      {chat.lastMessage || 'Empieza a chatear...'}
                    </p>
                  </div>
                </div>
              );
            })}
            {chats.length === 0 && (
              <div className="text-center py-10 opacity-50 flex flex-col items-center">
                <MessageSquare className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="text-sm font-bold">Sin mensajes recientes</p>
                <p className="text-xs text-muted-foreground">Tus conversaciones aparecerán aquí.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Active Chat */}
      <div className="hidden md:flex flex-1 flex-col bg-background/50 relative">
        {selectedChat && currentOtherUser ? (
          <>
            <div className="p-4 glass border-b border-white/5 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={currentOtherUser.avatar} className="object-cover" />
                  <AvatarFallback>{currentOtherUser.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-black">{currentOtherUser.name}</p>
                  <p className="text-[11px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> En línea
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-primary"><Phone className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-primary"><Video className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-primary ml-2"><Info className="w-5 h-5" /></Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6 relative">
              <div className="space-y-4 flex flex-col justify-end min-h-full">
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id || i} className={cn("flex gap-3 max-w-[75%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                      {!isMe && (
                        <Avatar className="h-8 w-8 self-end mb-1 shrink-0 shadow-md">
                          <AvatarImage src={currentOtherUser.avatar} />
                          <AvatarFallback>{currentOtherUser.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col gap-1">
                        <div className={cn(
                          "px-4 py-2.5 rounded-[1.25rem] shadow-sm text-[15px] leading-snug",
                          isMe ? "bg-primary text-white rounded-br-sm shadow-primary/20" : "bg-white/10 text-foreground rounded-bl-sm border border-white/5"
                        )}>
                          <p>{msg.text}</p>
                        </div>
                        <span className={cn(
                          "text-[10px] opacity-70 px-1 font-medium",
                          isMe ? "text-right" : "text-left"
                        )}>
                          {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { locale: es }) : 'Enviando...'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-4 glass border-t border-white/5 z-10">
              <div className="flex items-center gap-3">
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-white/5 hover:text-primary"><Paperclip className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-white/5 hover:text-primary"><ImageIcon className="w-5 h-5" /></Button>
                </div>
                <div className="flex-1 relative">
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-white/5 border-white/10 rounded-full pr-12 h-12 text-[15px] focus-visible:ring-1 focus-visible:ring-primary/50" 
                    placeholder="Escribe un mensaje..." 
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary rounded-full hover:bg-transparent">
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
                <Button onClick={handleSendMessage} disabled={!input.trim()} className="h-12 w-12 shrink-0 rounded-full bg-primary hover:bg-primary/80 shadow-lg shadow-primary/30 transition-transform active:scale-95">
                  <Send className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50 p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
               <MessageSquare className="w-12 h-12 text-muted-foreground" />
            </div>
            <p className="text-xl font-black uppercase tracking-tighter">Tus mensajes</p>
            <p className="text-sm max-w-xs leading-relaxed text-muted-foreground">Envía fotos y mensajes privados a tus exploradores. Inicia un chat desde su constelación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
