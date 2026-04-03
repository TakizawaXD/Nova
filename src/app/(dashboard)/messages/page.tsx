
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Send, Phone, Video, Info, Paperclip, Smile, Image as ImageIcon, Loader2, MessageSquare, Plus, ChevronLeft, Trash2, Mic, Square, Play, Pause, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { sendMessage, subscribeToMessages, subscribeToUserChats, Message, getAllUsers, startDirectChat, deleteMessage, UserProfile, setTypingStatus, joinGroup, subscribeToUserFollowing } from '@/lib/db';
import { db } from '@/lib/firebase';
import { uploadToSupabase } from '@/lib/supabase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  
  // Audio Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to user chats & load friends
  useEffect(() => {
    if (!user) return;
    
    // Load followed users (friends) for the list
    const unsubFollowing = subscribeToUserFollowing(user.uid, setFriends);

    const unsubscribe = subscribeToUserChats(user.uid, (data) => {
      setChats(data);
      if (data.length > 0 && !showMobileChat) {
        if (window.innerWidth > 768) {
          setSelectedChat((prev: any) => prev || data[0]);
        }
      }
      setLoading(false);
    });
    return () => {
        unsubscribe();
        unsubFollowing();
    };
  }, [user]);

  // Subscribe to messages when a chat is selected
  useEffect(() => {
    if (!selectedChat || !user) return;
    const unsubscribe = subscribeToMessages(selectedChat.id, (data) => {
      setMessages(data);
      // Actualizar lastRead (Visto)
      if (data.length > 0) {
        updateDoc(doc(db, 'chats', selectedChat.id), {
          [`lastRead.${user.uid}`]: serverTimestamp()
        }).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, [selectedChat, user]);

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
      await setTypingStatus(selectedChat.id, user.uid, false);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (!selectedChat || !user) return;
        setLoading(true);
        try {
            const url = await uploadToSupabase(audioBlob, 'audio', `chats/${selectedChat.id}/${Date.now()}.webm`);
            await sendMessage(selectedChat.id, user.uid, 'Mensaje de voz', 'audio', url);
        } catch(e) { 
          console.error("Error uploading audio:", e);
        }
        setLoading(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleInput = (val: string) => {
      setInput(val);
      if (!selectedChat || !user) return;
      setTypingStatus(selectedChat.id, user.uid, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
          setTypingStatus(selectedChat.id, user.uid, false);
      }, 2000);
  };

  const getOtherParticipant = (chat: any) => {
    if (!user || !chat.participants) return { name: `Chat Desconocido`, avatar: '' };
    const otherId = chat.participants.find((id: string) => id !== user.uid);
    if (!otherId) return { name: 'Desconocido', avatar: '' };
    
    // Look up real identity using the all-users list
    const knownUser = friends.find(f => f.uid === otherId);
    if (knownUser) return { 
        name: knownUser.displayName, 
        avatar: knownUser.photoURL, 
        uid: knownUser.uid,
        status: knownUser.status || 'offline',
        lastSeen: knownUser.lastSeen
    };

    if (chat.participantData && chat.participantData[otherId]) return { ...chat.participantData[otherId], status: 'offline' };
    return { name: `Usuario #${otherId.substring(0, 4)}`, avatar: '', status: 'offline' };
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

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat || !user) return;

    setLoading(true);
    try {
      const isVideo = file.type.startsWith('video/');
      const url = await uploadToSupabase(file, 'media', `chats/${selectedChat.id}/${Date.now()}`);
      await sendMessage(
        selectedChat.id, 
        user.uid, 
        isVideo ? 'Video' : 'Imagen', 
        isVideo ? 'video' : 'image', 
        url
      );
    } catch (error) {
      console.error("Error uploading media to chat:", error);
    } finally {
      setLoading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
    <div className="flex h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] bg-black md:bg-[#0a0a0a] border border-white/5 md:rounded-xl overflow-hidden animate-fade-in relative max-w-6xl mx-auto w-full">
      
      {/* 1. Sidebar: Conversaciones */}
      <div className={cn(
        "w-full md:w-[350px] lg:w-[400px] border-r border-white/10 flex flex-col bg-black md:bg-[#0a0a0a] z-20 transition-all duration-300",
        showMobileChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 md:p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold tracking-tight text-white">{profile?.displayName || 'Mensajes'}</h2>
             <Button variant="ghost" size="icon" onClick={() => setIsNewMsgOpen(true)} className="w-10 h-10 rounded-full hover:bg-white/10 text-white transition-all">
                <Plus className="w-6 h-6" />
             </Button>
          </div>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-base font-semibold text-white">Mensajes</h3>
             <span className="text-sm font-medium text-muted-foreground hover:text-white cursor-pointer hover:underline">Solicitudes</span>
          </div>
          
          {/* Instagram Style Active Users Row */}
          <div className="w-full pb-4 overflow-x-auto no-scrollbar">
             <div className="flex w-max space-x-4 px-1 pb-2">
                {friends.slice(0, 15).map(f => (
                  <div key={f.uid} onClick={() => handleCreateNewChat(f)} className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform group">
                     <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                           <Avatar className="w-full h-full border-2 border-black">
                              <AvatarImage src={f.photoURL} className="rounded-full object-cover" />
                              <AvatarFallback className="bg-black text-white font-black uppercase text-xl">{f.displayName?.[0]}</AvatarFallback>
                           </Avatar>
                        </div>
                        <div className={cn(
                            "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-black transition-colors duration-500",
                            f.status === 'online' ? "bg-green-500 shadow-[0_0_8px_theme(colors.green.500)]" : 
                            f.status === 'idle' ? "bg-amber-500 shadow-[0_0_8px_theme(colors.amber.500)]" : 
                            "bg-zinc-600"
                        )} />
                     </div>
                     <span className="text-[11px] font-bold text-white max-w-[64px] truncate">{f.displayName?.split(' ')[0]}</span>
                  </div>
                ))}
             </div>
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
                    "flex items-center gap-3 py-2.5 px-4 cursor-pointer transition-colors group",
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-14 w-14 border border-white/10">
                      <AvatarImage src={other.avatar} className="object-cover" />
                      <AvatarFallback className="bg-white/10 text-white font-medium text-lg">{other.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                        "absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-black transition-colors",
                        other.status === 'online' ? "bg-green-500" : 
                        other.status === 'idle' ? "bg-amber-500" : 
                        "bg-zinc-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{other.name}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <p className="truncate font-normal max-w-[150px] sm:max-w-[180px]">
                        {chat.lastMessage || 'Nuevo en NOVAX'}
                      </p>
                      <span className="shrink-0 text-xs">
                        · {chat.updatedAt ? formatDistanceToNow(chat.updatedAt.toDate(), { locale: es }).split(' ')[0] : '1m'}
                      </span>
                    </div>
                  </div>
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
        "flex-1 flex flex-col bg-black md:bg-[#0a0a0a] relative z-10 transition-all duration-300",
        !showMobileChat ? "hidden md:flex" : "flex"
      )}>
        {selectedChat && currentOtherUser ? (
          <>
            <div className="px-5 py-3.5 bg-black md:bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden h-8 w-8 rounded-full hover:bg-white/10 -ml-2"
                  onClick={() => { setShowMobileChat(false); setSelectedChat(null); }}
                >
                  <ChevronLeft className="w-7 h-7 text-white" />
                </Button>

                <Avatar className="h-11 w-11 border border-white/10">
                  <AvatarImage src={currentOtherUser.avatar} className="object-cover" />
                  <AvatarFallback className="bg-white/10 text-white font-medium">{currentOtherUser.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex flex-col justify-center">
                  <h3 className="text-base font-semibold text-white tracking-tight truncate leading-tight">{currentOtherUser.name}</h3>
                  <div className="flex flex-col">
                     <span className="text-xs text-muted-foreground truncate leading-none mt-0.5">
                       {currentOtherUser.status === 'online' ? <span className="text-green-500 font-medium">🟢 En línea</span> : 
                         currentOtherUser.lastSeen ? `Últ. vez: ${formatDistanceToNow(currentOtherUser.lastSeen?.toDate?.() || new Date(), { locale: es })}` : 'Desconectado'}
                     </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-white cursor-pointer hover:opacity-80 transition-opacity" />
                <Video className="w-7 h-7 text-white cursor-pointer hover:opacity-80 transition-opacity" />
                <Info className="w-6 h-6 text-white cursor-pointer hover:opacity-80 transition-opacity ml-1" />
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 sm:px-6 relative bg-black md:bg-[#0a0a0a]">
              <div className="space-y-4 flex flex-col py-6">
                <div className="flex flex-col items-center mb-6 space-y-2">
                    <Avatar className="h-20 w-20 border-[3px] border-white/10">
                        <AvatarImage src={currentOtherUser.avatar} />
                        <AvatarFallback className="text-3xl">{currentOtherUser.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{currentOtherUser.name}</p>
                        <p className="text-sm font-medium text-muted-foreground mt-1">NOVAX</p>
                        <Button className="mt-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold h-8 text-sm px-4 border-none">Ver perfil</Button>
                    </div>
                </div>

                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id || i} className={cn("flex gap-2 max-w-[75%] sm:max-w-[65%] group/msg", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
                      {!isMe && (
                        <Avatar className="h-7 w-7 self-end shrink-0 hidden sm:block">
                          <AvatarImage src={currentOtherUser.avatar} />
                          <AvatarFallback>{currentOtherUser.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col gap-1 relative items-start">
                        <div className={cn(
                          "px-4 py-2.5 text-[15px] leading-tight font-medium relative group-hover/msg:opacity-100",
                          isMe ? "bg-primary text-white rounded-[1.3rem] rounded-br-[0.3rem]" : "bg-[#262626] text-white rounded-[1.3rem] rounded-bl-[0.3rem]"
                        )}>
                          {msg.type === 'audio' ? (
                              <div className="flex items-center gap-3 w-48 sm:w-56">
                                <Button size="icon" className="w-8 h-8 rounded-full bg-white/20 text-white shrink-0 hover:bg-white/30" onClick={(e) => {
                                    const audio = e.currentTarget.nextElementSibling as HTMLAudioElement;
                                    if(audio) audio.paused ? audio.play() : audio.pause();
                                }}>
                                    <Play className="w-4 h-4" />
                                </Button>
                                <audio src={msg.mediaUrl} className="hidden" />
                                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-1/3 rounded-full animate-pulse" />
                                </div>
                                <span className="text-[10px] font-bold opacity-70">Voz</span>
                              </div>
                          ) : msg.type === 'image' ? (
                              <div className="relative rounded-xl overflow-hidden border border-white/10 max-w-xs group/img-msg">
                                <img src={msg.mediaUrl} alt="Adjunto" className="w-full h-auto object-cover max-h-80" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img-msg:opacity-100 transition-opacity" />
                              </div>
                          ) : msg.type === 'sticker' ? (
                              <div className="w-32 h-32 md:w-40 md:h-40">
                                <img src={msg.mediaUrl} alt="Sticker" className="w-full h-full object-contain" />
                              </div>
                          ) : msg.type === 'video' ? (
                              <div className="relative rounded-xl overflow-hidden border border-white/10 max-w-xs group/vid-msg">
                                <video src={msg.mediaUrl} controls className="w-full h-auto max-h-80" />
                              </div>
                          ) : (
                              <div className="whitespace-pre-wrap break-words">
                                {(() => {
                                  const ytOrNovaRegex = /(https?:\/\/[^\s]+)/g;
                                  if (!msg.text) return msg.text;
                                  if (!msg.text.includes('/nova/') && !msg.text.includes('/novax/')) return msg.text;
                                  
                                  const parts = [];
                                  let lastIndex = 0;
                                  let match;
                                  while ((match = ytOrNovaRegex.exec(msg.text)) !== null) {
                                    if (match.index > lastIndex) {
                                      parts.push(<span key={"t"+match.index}>{msg.text.substring(lastIndex, match.index)}</span>);
                                    }
                                    const url = match[0];
                                    if (url.includes('/nova/') || url.includes('/novax/')) {
                                      const splitUrl = url.includes('/novax/') ? '/novax/' : '/nova/';
                                      const code = url.split(splitUrl)[1].split(' ')[0];
                                      parts.push(
                                        <div key={match.index} className="my-2 p-3 bg-black/40 rounded-xl border border-white/10 flex flex-col gap-2 min-w-[200px] shadow-lg">
                                          <span className="text-[10px] font-black text-accent uppercase tracking-widest break-all line-clamp-1">Invitación: {code}</span>
                                          <Button 
                                            size="sm"
                                            onClick={() => { 
                                              joinGroup(code, user!.uid)
                                                .then(() => window.location.href = '/communities')
                                                .catch(e => console.error(e)); 
                                            }}
                                            className="w-full bg-accent hover:bg-accent/80 text-background font-black text-xs h-9"
                                          >
                                            UNIRSE A LA COMUNIDAD
                                          </Button>
                                        </div>
                                      );
                                    } else {
                                      parts.push(<a key={match.index} href={url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{url}</a>);
                                    }
                                    lastIndex = ytOrNovaRegex.lastIndex;
                                  }
                                  if (lastIndex < msg.text.length) {
                                    parts.push(<span key="last">{msg.text.substring(lastIndex)}</span>);
                                  }
                                  return parts;
                                })()}
                              </div>
                          )}
                          <div className={cn("flex items-center gap-1 mt-1.5 text-[10px] font-medium opacity-80", isMe ? "text-white/90 justify-end" : "text-white/60")}>
                            {formatDistanceToNow(msg.createdAt?.toDate?.() || new Date(), { locale: es }).split(' ')[0]}
                            {isMe && (
                              <CheckCheck className={cn("w-3.5 h-3.5 shrink-0", ((chats.find(c => c.id === selectedChat.id)?.lastRead?.[currentOtherUser?.uid]?.toDate?.() || 0) >= (msg.createdAt?.toDate?.() || 0)) ? "text-blue-400" : "text-white/40")} />
                            )}
                          </div>
                          {isMe && (
                            <button 
                              onClick={() => deleteMessage(msg.id!)}
                              className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-red-500 opacity-0 group-hover/msg:opacity-100 transition-opacity hover:bg-red-500/10 rounded-full"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {((chats.find(c => c.id === selectedChat.id)?.typing?.[currentOtherUser.uid] || 0) > Date.now() - 3000) && (
                    <div className="flex gap-2 max-w-[75%] sm:max-w-[65%] group/msg mr-auto">
                        <Avatar className="h-7 w-7 self-end shrink-0 hidden sm:block">
                            <AvatarImage src={currentOtherUser.avatar} />
                            <AvatarFallback>{currentOtherUser.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1 relative items-start">
                            <div className="px-4 py-2.5 text-[15px] leading-tight font-medium bg-[#262626] text-white rounded-[1.3rem] rounded-bl-[0.3rem]">
                                <div className="flex gap-1 items-center h-4 py-1">
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-black md:bg-[#0a0a0a] z-20">
              <div className="flex items-end gap-2 w-full rounded-full border border-white/20 bg-transparent px-2 py-1 focus-within:border-white/40 transition-colors min-h-[44px]">
                <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 rounded-full text-white hover:bg-white/10 hover:text-white transition-all self-end">
                  <Smile className="w-6 h-6" />
                </Button>
                
                <div className="flex-1 min-w-0 self-center items-center flex">
                  {isRecording ? (
                      <div className="flex items-center gap-3 px-2 w-full animate-pulse text-red-500">
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                          <span className="font-bold text-sm tracking-widest">{Math.floor(recordingTime/60)}:{(recordingTime%60).toString().padStart(2, '0')}</span>
                      </div>
                  ) : (
                      <textarea 
                        rows={1}
                        value={input}
                        onChange={(e: any) => handleInput(e.target.value)}
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="bg-transparent border-none focus:outline-none min-h-[22px] max-h-[100px] py-1.5 text-[15px] font-normal text-white placeholder:text-muted-foreground/60 px-2 resize-none scroll-hide shadow-none w-full leading-tight" 
                    placeholder="Mensaje..." 
                  />
                  )}
                </div>

                {input.trim() ? (
                  <Button onClick={handleSendMessage} variant="ghost" className="h-10 shrink-0 text-primary font-bold hover:bg-transparent hover:text-primary/80 self-end px-4 text-sm">
                    Enviar
                  </Button>
                ) : isRecording ? (
                  <Button onClick={stopRecording} variant="ghost" className="h-10 shrink-0 text-red-500 hover:text-red-400 font-bold hover:bg-transparent self-end px-4 text-sm gap-2">
                    <Square className="w-4 h-4 fill-current" />
                  </Button>
                ) : (
                  <div className="flex gap-1 shrink-0 self-end items-center h-10">
                    <input 
                      type="file" 
                      ref={imageInputRef} 
                      className="hidden" 
                      accept="image/*,video/*" 
                      onChange={handleImageFileChange}
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-white hover:bg-white/10 transition-all" onClick={startRecording}><Mic className="w-5 h-5" /></Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-full text-white hover:bg-white/10 transition-all"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-black md:bg-[#0a0a0a] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.primary.DEFAULT/0.06),transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-center gap-6 max-w-xs">
              <div className="w-28 h-28 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10 animate-pulse">
                <MessageSquare className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Tus Mensajes</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Envía notas de voz y mensajes privados a los ciudadanos de Nova.</p>
              </div>
              <Button onClick={() => setIsNewMsgOpen(true)} className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                ✦ Nuevo Mensaje
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. New Message Dialog (Rediseño Estético) */}
      <Dialog open={isNewMsgOpen} onOpenChange={setIsNewMsgOpen}>
        <DialogContent className="bg-[#050510]/95 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] max-w-xl p-10 shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-white italic text-center">Protocolo de Nueva Conexión <span className="text-primary">•</span></DialogTitle>
            <DialogDescription className="sr-only">Busca y selecciona un contacto para iniciar una nueva conversación privada.</DialogDescription>
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
                      <AvatarFallback className="bg-white/5 text-primary text-xl font-black">{f.displayName?.[0] || '?'}</AvatarFallback>
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
