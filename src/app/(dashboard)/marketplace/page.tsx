'use client';

import { Search, SlidersHorizontal, Heart, ShoppingCart, Tag, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = ['All', 'Electronics', 'Fashion', 'Collectibles', 'Services', 'Vehicles'];

const products = [
  { id: 1, title: 'Quantum Neural Link v2', price: '$1,299', location: 'Neo-City', category: 'Electronics', image: 'https://picsum.photos/seed/m1/600/600' },
  { id: 2, title: 'Holographic Jacket', price: '$450', location: 'Sky District', category: 'Fashion', image: 'https://picsum.photos/seed/m2/600/600' },
  { id: 3, title: 'Vintage Game Console', price: '$85', location: 'Underground', category: 'Collectibles', image: 'https://picsum.photos/seed/m3/600/600' },
  { id: 4, title: 'Tesla Cyberbike 2030', price: '$12,400', location: 'Highland', category: 'Vehicles', image: 'https://picsum.photos/seed/m4/600/600' },
  { id: 5, title: 'Bio-Metric Scanner', price: '$220', location: 'Research Lab', category: 'Electronics', image: 'https://picsum.photos/seed/m5/600/600' },
  { id: 6, title: 'Neon Sneakers', price: '$180', location: 'Downtown', category: 'Fashion', image: 'https://picsum.photos/seed/m6/600/600' },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">MARKETPLACE</h1>
            <p className="text-muted-foreground mt-2">Trade the future, today. Safe and secure peer-to-peer commerce.</p>
          </div>
          <Button className="rounded-xl bg-primary hover:bg-primary/90 gap-2 font-bold px-6 h-12 shadow-lg shadow-primary/20">
            List Item <Tag className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input className="pl-12 h-14 bg-secondary/50 border-none rounded-2xl text-lg" placeholder="Search for items..." />
          </div>
          <Button variant="outline" className="h-14 rounded-2xl glass border-white/10 gap-2 px-6">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scroll-hide">
          {categories.map((cat) => (
            <Badge 
              key={cat} 
              variant={cat === 'All' ? 'default' : 'secondary'}
              className="px-6 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-white transition-all text-sm whitespace-nowrap"
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="glass border-white/5 rounded-3xl overflow-hidden floating-card group">
            <div className="relative aspect-square">
              <img src={product.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={product.title} />
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 rounded-full glass bg-black/20 hover:text-red-500">
                <Heart className="w-5 h-5" />
              </Button>
              <div className="absolute bottom-4 left-4 z-10">
                <Badge className="bg-primary/90 backdrop-blur-md text-white border-none font-bold">{product.price}</Badge>
              </div>
            </div>
            <CardHeader className="p-4 space-y-1">
              <p className="text-[10px] text-primary font-black uppercase tracking-widest">{product.category}</p>
              <CardTitle className="text-base font-bold truncate group-hover:text-primary transition-colors">{product.title}</CardTitle>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] font-medium">{product.location}</span>
              </div>
            </CardHeader>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full rounded-xl bg-secondary hover:bg-primary hover:text-white transition-all gap-2 text-xs font-bold">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
