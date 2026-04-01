
import DashboardLayout from './(dashboard)/layout';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostCard } from '@/components/feed/PostCard';
import { StoryList } from '@/components/stories/StoryList';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Users, Sparkles, Zap, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Home() {
  const postImages = PlaceHolderImages.filter(img => img.id.startsWith('post-'));
  
  const mockPosts = [
    {
      id: '1',
      author: { name: 'Julián Vance', handle: 'jvance', avatar: 'https://picsum.photos/seed/p1/100/100' },
      content: 'Recién llegado a la Ciudad Neón. ¡La arquitectura aquí es absolutamente impresionante! #Nova #CiudadFuturo',
      image: postImages[0]?.imageUrl,
      timestamp: 'hace 2h',
      likes: 1243,
      comments: 42,
      shares: 12
    },
    {
      id: '2',
      author: { name: 'Elena Solis', handle: 'elena_s', avatar: 'https://picsum.photos/seed/p2/100/100' },
      content: 'Vibras matutinas desde los jardines de nubes. ¿Podemos apreciar lo despejado que está el cielo hoy?',
      image: postImages[1]?.imageUrl,
      timestamp: 'hace 5h',
      likes: 892,
      comments: 18,
      shares: 5
    }
  ];

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feed Principal */}
        <div className="lg:col-span-8 animate-fade-in space-y-8">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-xl font-black tracking-tighter flex items-center gap-2">
              HISTORIAS
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </h2>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/10">Ver todas</Button>
          </div>
          <StoryList />
          <CreatePost />
          <div className="space-y-6">
            <div className="flex items-center gap-4 px-2 mb-4">
              <Button variant="ghost" className="text-sm font-black text-primary border-b-2 border-primary rounded-none px-0">Para ti</Button>
              <Button variant="ghost" className="text-sm font-bold text-muted-foreground hover:text-white transition-all px-0">Siguiendo</Button>
            </div>
            {mockPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </div>

        {/* Widgets Laterales */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <Card className="glass border-white/10 rounded-[2rem] overflow-hidden group">
            <div className="h-24 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 animate-pulse group-hover:scale-110 transition-transform duration-700" />
            <CardHeader className="p-6 relative">
              <div className="absolute -top-12 left-6">
                <Avatar className="h-20 w-20 border-4 border-background shadow-2xl">
                  <AvatarImage src="https://picsum.photos/seed/user123/200/200" />
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
              </div>
              <div className="pt-8">
                <CardTitle className="text-2xl font-black tracking-tighter">Alex Rivera</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">@alex_riv • Explorador de Universos</p>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="flex gap-6">
                <div><p className="font-black text-lg">1.2k</p><p className="text-[10px] text-muted-foreground uppercase font-bold">Seguidores</p></div>
                <div><p className="font-black text-lg">452</p><p className="text-[10px] text-muted-foreground uppercase font-bold">Siguiendo</p></div>
                <div><p className="font-black text-lg">Nova+</p><p className="text-[10px] text-primary uppercase font-bold">Membresía</p></div>
              </div>
              <Button className="w-full rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all font-black text-xs uppercase tracking-widest">Mi Perfil Completo</Button>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 rounded-[2rem] p-6 electric-glow">
            <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
                <TrendingUp className="w-5 h-5 text-primary" />
                TENDENCIAS
              </CardTitle>
              <Zap className="w-4 h-4 text-accent animate-pulse" />
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              {[
                { topic: '#NovaSphere', count: '145.2k posts', color: 'text-primary' },
                { topic: '#Ciberpunk2030', count: '82.8k posts', color: 'text-accent' },
                { topic: 'IA Generativa', count: '58.4k posts', color: 'text-white' },
                { topic: 'Colonización Marte', count: '32.1k posts', color: 'text-white' },
              ].map((trend, i) => (
                <div key={i} className="group cursor-pointer flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Tecnología</p>
                    <p className={cn("text-sm font-black transition-all group-hover:translate-x-1", trend.color)}>{trend.topic}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{trend.count}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-xs font-black text-white uppercase tracking-widest rounded-2xl transition-all border border-white/5">Explorar Tendencias</button>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 rounded-[2rem] p-6">
            <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
                <Users className="w-5 h-5 text-accent" />
                DESCUBRE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              {[
                { name: 'Dr. Aris Thorne', handle: 'aris_t', avatar: 'https://picsum.photos/seed/u1/100/100' },
                { name: 'Nova Oficial', handle: 'novaofficial', avatar: 'https://picsum.photos/seed/u2/100/100' },
                { name: 'Tec Insider', handle: 't_insider', avatar: 'https://picsum.photos/seed/u3/100/100' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 border-2 border-white/10 group-hover:border-primary transition-colors">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-black leading-none group-hover:text-primary transition-colors">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">@{user.handle}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest border-primary/40 text-primary hover:bg-primary hover:text-white shadow-lg shadow-primary/10">Seguir</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
