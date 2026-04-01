import DashboardLayout from './(dashboard)/layout';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostCard } from '@/components/feed/PostCard';
import { StoryList } from '@/components/stories/StoryList';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="lg:col-span-8 animate-fade-in">
          <StoryList />
          <CreatePost />
          <div className="space-y-6">
            {mockPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </div>

        {/* Widgets Laterales */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <Card className="glass border-white/5 rounded-3xl p-6">
            <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tendencias para ti
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {[
                { topic: '#NovaMundo', count: '45.2k posts' },
                { topic: '#Ciberpunk2024', count: '12.8k posts' },
                { topic: 'IA Actualización', count: '8.4k posts' },
                { topic: 'Colonia Marte', count: '32.1k posts' },
              ].map((trend, i) => (
                <div key={i} className="group cursor-pointer">
                  <p className="text-xs text-muted-foreground">Tendencia en Tecnología</p>
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">{trend.topic}</p>
                  <p className="text-[10px] text-muted-foreground">{trend.count}</p>
                </div>
              ))}
              <button className="text-xs font-bold text-primary hover:underline">Ver más</button>
            </CardContent>
          </Card>

          <Card className="glass border-white/5 rounded-3xl p-6">
            <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                A quién seguir
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {[
                { name: 'Dr. Aris Thorne', handle: 'aris_t', avatar: 'https://picsum.photos/seed/u1/100/100' },
                { name: 'Nova Noticias', handle: 'novaofficial', avatar: 'https://picsum.photos/seed/u2/100/100' },
                { name: 'Tec Insider', handle: 't_insider', avatar: 'https://picsum.photos/seed/u3/100/100' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.handle}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full text-xs font-bold border-primary text-primary hover:bg-primary hover:text-white">Seguir</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="sticky top-24 p-4 text-[10px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 opacity-60">
            <a href="#" className="hover:underline">Privacidad</a>
            <a href="#" className="hover:underline">Términos</a>
            <a href="#" className="hover:underline">Cookies</a>
            <a href="#" className="hover:underline">Publicidad</a>
            <span>© 2024 Nova Inc.</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
