
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, X, Send, Minus, Maximize2, Bot, MessageSquareText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function NovaAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'Hola Alex, soy NovaAI. ¿En qué puedo ayudarte hoy en tu universo digital?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    // Mock AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: 'Estoy analizando tu solicitud... Como tu asistente Nova, te sugiero optimizar tu última publicación para mayor alcance.' }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && !isMinimized && (
        <Card className="w-80 md:w-96 glass border-primary/30 shadow-2xl overflow-hidden animate-fade-in flex flex-col h-[500px]">
          <CardHeader className="p-4 bg-primary/20 backdrop-blur-3xl border-b border-white/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-black text-white uppercase tracking-tighter">NovaAI</CardTitle>
                <p className="text-[10px] text-primary-foreground/70 font-bold uppercase">Online & Aprendiendo</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setIsMinimized(true)}>
                <Minus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-sm",
                      m.role === 'user' ? "bg-primary text-white rounded-br-none" : "bg-white/10 text-white rounded-bl-none border border-white/5"
                    )}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-white/10 glass-primary">
              <div className="flex gap-2">
                <Input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Pregúntale a NovaAI..." 
                  className="bg-black/20 border-white/10 h-10 rounded-xl text-xs"
                />
                <Button onClick={handleSend} size="icon" className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/80 rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto scroll-hide">
                {['Resumir feed', 'Crear post', 'Traducir'].map(tag => (
                  <button key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] whitespace-nowrap hover:bg-primary/20 hover:border-primary transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isMinimized && (
        <Button 
          onClick={() => setIsMinimized(false)}
          className="bg-primary hover:bg-primary/80 text-white rounded-2xl h-14 px-4 gap-2 electric-glow shadow-xl"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="font-bold">Abrir NovaAI</span>
          <Maximize2 className="w-4 h-4 opacity-50" />
        </Button>
      )}

      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-primary hover:bg-primary/80 text-white electric-glow shadow-2xl animate-float group"
        >
          <Sparkles className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </Button>
      )}
    </div>
  );
}
