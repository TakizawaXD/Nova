'use client';

import { useState, useEffect } from 'react';
import { discoverPopularPosts, AiEnhancedPostDiscoveryOutput } from '@/ai/flows/ai-enhanced-post-discovery';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, RefreshCw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExplorePage() {
  const [recommendations, setRecommendations] = useState<AiEnhancedPostDiscoveryOutput | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAIRecommendations = async () => {
    setLoading(true);
    try {
      // Mock some popular posts to send to the AI
      const mockPopularPosts = [
        { id: '1', content: 'Incredible sunset over the Martian colony today. The blue hues are breathtaking!', likes: 5000, comments: 400, shares: 1200 },
        { id: '2', content: 'New breakthrough in quantum computing allows for 1000x faster social algorithms. #FutureIsHere', likes: 2300, comments: 150, shares: 800 },
        { id: '3', content: 'Why everyone is talking about the new Virtual Reality skins in NovaSphere. #VR #SkinDesign', likes: 12000, comments: 2000, shares: 5000 },
      ];

      const result = await discoverPopularPosts({ popularPosts: mockPopularPosts });
      setRecommendations(result);
    } catch (error) {
      console.error("Failed to fetch AI discovery posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIRecommendations();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            EXPLORE THE <span className="text-primary">SPHERE</span>
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-2">AI-curated content discovered just for your taste.</p>
        </div>
        <Button 
          onClick={fetchAIRecommendations} 
          disabled={loading}
          variant="outline" 
          className="rounded-xl glass border-primary/20 text-primary hover:bg-primary/10 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Discovery
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass border-white/5 rounded-3xl h-[400px]">
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-[200px] w-full rounded-2xl" />
              </div>
            </Card>
          ))
        ) : (
          recommendations?.recommendedPosts.map((post) => (
            <Card key={post.postId} className="glass border-white/5 rounded-3xl overflow-hidden floating-card group cursor-pointer flex flex-col">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                <img 
                  src={`https://picsum.photos/seed/exp${post.postId}/600/400`} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="Post visual"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">AI PICK</span>
                </div>
              </div>
              <CardHeader className="p-6 flex-1">
                <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {post.summary}
                </CardTitle>
                <CardDescription className="mt-4 line-clamp-3 text-sm italic border-l-2 border-accent pl-4 text-foreground/80">
                  "{post.originalContent}"
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-white/10">
                      <AvatarImage src={`https://picsum.photos/seed/u${post.postId}/50/50`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-muted-foreground">Original Author</span>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full gap-2 hover:bg-primary/10 hover:text-primary">
                    View Post <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
