
'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Heart, ShoppingCart, Tag, MapPin, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { subscribeToMarketplace, listMarketItem, MarketItem } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

const categories = ['Todo', 'Electrónica', 'Moda', 'Coleccionables', 'Servicios', 'Vehículos'];

export default function MarketplacePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToMarketplace((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleListItem = async () => {
    if (!user) return;
    try {
      await listMarketItem({
        sellerId: user.uid,
        title: "Nuevo Item Tecnológico",
        price: "$500",
        description: "Un gadget increíble de la era Nova.",
        imageUrl: `https://picsum.photos/seed/${Math.random()}/600/600`,
        category: "Electrónica",
        location: "Nova City",
      });
      toast({ title: "Item listado", description: "Tu producto ya está en el mercado." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo listar el item." });
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">TIENDA</h1>
            <p className="text-muted-foreground mt-2">Intercambia el futuro, hoy. Comercio P2P seguro y rápido.</p>
          </div>
          <Button onClick={handleListItem} className="rounded-xl bg-primary hover:bg-primary/90 gap-2 font-bold px-6 h-12 shadow-lg shadow-primary/20">
            Vender Item <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-secondary/50 border-none rounded-2xl text-lg" 
              placeholder="¿Qué estás buscando?" 
            />
          </div>
          <Button variant="outline" className="h-14 rounded-2xl glass border-white/10 gap-2 px-6">
            <SlidersHorizontal className="w-5 h-5" />
            Filtros
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scroll-hide">
          {categories.map((cat) => (
            <Badge 
              key={cat} 
              variant="secondary"
              className="px-6 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-white transition-all text-sm whitespace-nowrap"
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((product) => (
            <Card key={product.id} className="glass border-white/5 rounded-3xl overflow-hidden floating-card group">
              <div className="relative aspect-square">
                <img src={product.imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={product.title} />
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
                  Comprar ahora
                </Button>
              </CardFooter>
            </Card>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-20 opacity-50">
              No se encontraron productos en esta dimensión.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
