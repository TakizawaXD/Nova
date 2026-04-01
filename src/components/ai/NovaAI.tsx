
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, X, Send, Minus, Maximize2, Bot, MessageSquareText, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function NovaAI() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile && messages.length === 0) {
      setMessages([
        { role: 'ai', content: `Hola ${profile.displayName.split(' ')[0]}, soy NovaAI. He analizado tu perfil y estoy lista para ayudarte a optimizar tu experiencia en Nova. ¿Quieres que te sugiera algunas tendencias o que redacte un post por ti?` }
      ]);
    }
  }, [profile]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Mock AI Logic (Próximo paso: conectar con Genkit real)
    setTimeout(() => {
      let response = "Interesante. Basado en los algoritmos de NovaSphere, te sugiero usar el hashtag #NovaFuture para tu próxima publicación.";
      
      if (userMessage.toLowerCase().includes('resumir')) {
        response = "He analizado los últimos 50 posts de tu feed. La tendencia principal es la computación cuántica y el diseño minimalista.";
      } else if (userMessage.toLowerCase().includes('post')) {
        response = "Aquí tienes una idea para un post: 'Explorando las fronteras digitales de #NovaSphere. El futuro es ahora. 🚀'";
      }

      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && !isMinimized && (
        <Card className="w-80 md:w-96 glass border-primary/30 shadow-2xl overflow-hidden animate-fade-in flex flex-col h-[500px]">
          <CardHeader className="p-4 bg-primary/20 backdrop-blur-3xl border-b border-white/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center electric-glow">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-black text-white uppercase tracking-tighter">NovaAI</CardTitle>
                <p className="text-[10px] text-primary-foreground/70 font-bold uppercase tracking-widest">Núcleo Cuántico Activo</p>
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
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start animate-fade-in")}>
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                      m.role === 'user' ? "bg-primary text-white rounded-br-none shadow-lg shadow-primary/20" : "bg-white/10 text-white rounded-bl-none border border-white/5"
                    )}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Nova está procesando...
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-white/10 glass-primary">
              <div className="flex gap-2">
                <Input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Envía una instrucción a NovaAI..." 
                  className="bg-black/20 border-white/10 h-11 rounded-xl text-xs placeholder:text-white/30"
                />
                <Button onClick={handleSend} size="icon" className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/80 rounded-xl electric-glow">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto scroll-hide">
                {[
                  { tag: 'Resumir feed', icon: <MessageSquareText className="w-3 h-3" /> },
                  { tag: 'Escribir post', icon: <Sparkles className="w-3 h-3" /> },
                  { tag: 'Optimizar perfil', icon: <Bot className="w-3 h-3" /> }
                ].map(item => (
                  <button 
                    key={item.tag} 
                    onClick={() => setInput(item.tag)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/70 whitespace-nowrap hover:bg-primary/20 hover:border-primary/50 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    {item.icon} {item.tag}
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
          className="bg-primary hover:bg-primary/80 text-white rounded-2xl h-14 px-6 gap-3 electric-glow shadow-xl animate-bounce"
        >
          <Bot className="w-6 h-6" />
          <span className="font-black uppercase tracking-widest text-xs">NovaAI Activa</span>
          <Maximize2 className="w-4 h-4 opacity-50" />
        </Button>
      )}

      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-primary hover:bg-primary/80 text-white electric-glow shadow-2xl animate-float group border-4 border-white/10"
        >
          <Sparkles className="w-8 h-8 group-hover:scale-125 transition-transform duration-500" />
        </Button>
      )}
    </div>
  );
}
