'use client';

import { Search, Send, Phone, Video, Info, Paperclip, Smile, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

const chats = [
  { id: 1, name: 'Nova AI Support', lastMsg: 'How can I assist you today?', time: '2m ago', active: true, unread: 2 },
  { id: 2, name: 'Lucas Wright', lastMsg: 'See you at the cyber cafe later!', time: '1h ago', active: false, unread: 0 },
  { id: 3, name: 'Sarah Miller', lastMsg: 'The new story filter is sick!', time: '3h ago', active: false, unread: 0 },
  { id: 4, name: 'Dev Team Group', lastMsg: 'PR #452 has been merged.', time: '5h ago', active: false, unread: 0 },
  { id: 5, name: 'Mars Habitat', lastMsg: 'Oxygen levels normalized.', time: '1d ago', active: false, unread: 0 },
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(chats[0]);

  return (
    <div className="flex h-[calc(100vh-140px)] glass border-white/5 rounded-3xl overflow-hidden animate-fade-in shadow-2xl">
      {/* Sidebar List */}
      <div className="w-full md:w-80 border-r border-white/5 flex flex-col">
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-black tracking-tighter">MESSAGES</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10 bg-secondary/50 border-none rounded-xl" placeholder="Search chats..." />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-2 space-y-1">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedChat.id === chat.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/10'}`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white/10">
                    <AvatarImage src={`https://picsum.photos/seed/ch${chat.id}/100/100`} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.active && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`text-sm font-bold truncate ${selectedChat.id === chat.id ? 'text-white' : ''}`}>{chat.name}</p>
                    <span className={`text-[10px] ${selectedChat.id === chat.id ? 'text-white/70' : 'text-muted-foreground'}`}>{chat.time}</span>
                  </div>
                  <p className={`text-xs truncate ${selectedChat.id === chat.id ? 'text-white/80' : 'text-muted-foreground'}`}>{chat.lastMsg}</p>
                </div>
                {chat.unread > 0 && selectedChat.id !== chat.id && (
                  <span className="bg-primary text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full">{chat.unread}</span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Active Chat */}
      <div className="hidden md:flex flex-1 flex-col">
        <div className="p-4 glass border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={`https://picsum.photos/seed/ch${selectedChat.id}/100/100`} />
              <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold">{selectedChat.name}</p>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
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
            <div className="flex justify-center">
              <span className="text-[10px] bg-secondary/50 text-muted-foreground px-3 py-1 rounded-full font-bold uppercase tracking-widest">Today</span>
            </div>
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="h-8 w-8 self-end"><AvatarImage src={`https://picsum.photos/seed/ch${selectedChat.id}/100/100`} /></Avatar>
              <div className="bg-secondary/50 p-4 rounded-2xl rounded-bl-none">
                <p className="text-sm">Hey Alex! Have you checked out the new marketplace items yet?</p>
                <span className="text-[9px] text-muted-foreground mt-1 block">10:15 AM</span>
              </div>
            </div>
            <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
              <div className="bg-primary p-4 rounded-2xl rounded-br-none text-white shadow-lg shadow-primary/20">
                <p className="text-sm">Not yet, I was busy configuring my new personal sphere dashboard. Is there anything cool?</p>
                <span className="text-[9px] text-white/70 mt-1 block text-right">10:17 AM</span>
              </div>
            </div>
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="h-8 w-8 self-end"><AvatarImage src={`https://picsum.photos/seed/ch${selectedChat.id}/100/100`} /></Avatar>
              <div className="bg-secondary/50 p-4 rounded-2xl rounded-bl-none">
                <p className="text-sm">Yeah, some rare digital artifacts from the legacy era. You should take a look!</p>
                <span className="text-[9px] text-muted-foreground mt-1 block">10:18 AM</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 glass border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Paperclip className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><ImageIcon className="w-5 h-5" /></Button>
            </div>
            <div className="flex-1 relative">
              <Input className="bg-secondary/50 border-none rounded-2xl pr-12 h-12" placeholder="Type a message..." />
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                <Smile className="w-5 h-5" />
              </Button>
            </div>
            <Button className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
