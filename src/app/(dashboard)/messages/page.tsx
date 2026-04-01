
'use client';

import { useState, useEffect } from 'react';
import { Search, Send, Phone, Video, Info, Paperclip, Smile, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { sendMessage, subscribeToMessages, subscribeToUserChats, Message } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Subscribe to user chats
  useEffect(() => {
    if (!user) return;
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] glass border-white/5 rounded-3xl overflow-hidden animate-fade-in shadow-2xl">
      {/* Sidebar List */}
      <div className="w-full md:w-80 border-r border-white/5 flex flex-col">
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-black tracking-tighter uppercase">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10 bg-secondary/50 border-none rounded-xl" placeholder="Buscar chats..." />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-2 space-y-1">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedChat?.id === chat.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/10'}`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white/10">
                    <AvatarImage src={`https://picsum.photos/seed/${chat.id}/100/100`} />
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`text-sm font-bold truncate ${selectedChat?.id === chat.id ? 'text-white' : ''}`}>Chat #{chat.id.substring(0, 4)}</p>
                  </div>
                  <p className={`text-xs truncate ${selectedChat?.id === chat.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {chat.lastMessage || 'Empieza a chatear...'}
                  </p>
                </div>
              </div>
            ))}
            {chats.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground italic">
                No tienes chats activos.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Active Chat */}
      <div className="hidden md:flex flex-1 flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 glass border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={`https://picsum.photos/seed/${selectedChat.id}/100/100`} />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">Chat #{selectedChat.id.substring(0, 4)}</p>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">En línea</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary"><Phone className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary"><Video className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary"><Info className="w-5 h-5" /></Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex gap-3 max-w-[80%] ${msg.senderId === user?.uid ? 'ml-auto flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 self-end">
                      <AvatarImage src={`https://picsum.photos/seed/${msg.senderId}/100/100`} />
                    </Avatar>
                    <div className={cn(
                      "p-4 rounded-2xl",
                      msg.senderId === user?.uid ? "bg-primary text-white rounded-br-none shadow-lg" : "bg-secondary/50 rounded-bl-none"
                    )}>
                      <p className="text-sm">{msg.text}</p>
                      <span className={cn(
                        "text-[9px] mt-1 block",
                        msg.senderId === user?.uid ? "text-white/70 text-right" : "text-muted-foreground"
                      )}>
                        {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true, locale: es }) : 'Enviando...'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 glass border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Paperclip className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><ImageIcon className="w-5 h-5" /></Button>
                </div>
                <div className="flex-1 relative">
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-secondary/50 border-none rounded-2xl pr-12 h-12" 
                    placeholder="Escribe un mensaje..." 
                  />
                  <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
                <Button onClick={handleSendMessage} className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
            <Bot className="w-16 h-16 text-primary" />
            <p className="text-lg font-black uppercase tracking-tighter">Selecciona un chat para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
