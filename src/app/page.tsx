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
      author: { name: 'Julian Vance', handle: 'jvance', avatar: 'https://picsum.photos/seed/p1/100/100' },
      content: 'Just arrived in the Neo-City. The glassmorphism architecture here is absolutely stunning! #NovaSphere #FutureCity',
      image: postImages[0]?.imageUrl,
      timestamp: '2h ago',
      likes: 1243,
      comments: 42,
      shares: 12
    },
    {
      id: '2',
      author: { name: 'Elena Solis', handle: 'elena_s', avatar: 'https://picsum.photos/seed/p2/100/100' },
      content: 'Morning vibes from the cloud gardens. Can we just appreciate how clear the sky is today?',
      image: postImages[1]?.imageUrl,
      timestamp: '5h ago',
      likes: 892,
      comments: 18,
      shares: 5
    }
  ];

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Content */}
        <div className="lg:col-span-8 animate-fade-in">
          <StoryList />
          <CreatePost />
          <div className="space-y-6">
            {mockPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <Card className="glass border-white/5 rounded-3xl p-6">
            <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trending for you
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {[
                { topic: '#NeoSphere', count: '45.2k posts' },
                { topic: '#Cyberpunk2077', count: '12.8k posts' },
                { topic: 'Neuralink Update', count: '8.4k posts' },
                { topic: 'Mars Colonization', count: '32.1k posts' },
              ].map((trend, i) => (
                <div key={i} className="group cursor-pointer">
                  <p className="text-xs text-muted-foreground">Trending in Technology</p>
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">{trend.topic}</p>
                  <p className="text-[10px] text-muted-foreground">{trend.count}</p>
                </div>
              ))}
              <button className="text-xs font-bold text-primary hover:underline">Show more</button>
            </CardContent>
          </Card>

          <Card className="glass border-white/5 rounded-3xl p-6">
            <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Who to follow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {[
                { name: 'Dr. Aris Thorne', handle: 'aris_t', avatar: 'https://picsum.photos/seed/u1/100/100' },
                { name: 'Nova News', handle: 'novaofficial', avatar: 'https://picsum.photos/seed/u2/100/100' },
                { name: 'Tech Insider', handle: 't_insider', avatar: 'https://picsum.photos/seed/u3/100/100' },
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
                  <Button variant="outline" size="sm" className="rounded-full text-xs font-bold border-primary text-primary hover:bg-primary hover:text-white">Follow</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="sticky top-24 p-4 text-[10px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 opacity-60">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Cookies</a>
            <a href="#" className="hover:underline">Nova Ads</a>
            <span>© 2030 NovaSphere Inc.</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
