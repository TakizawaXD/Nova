
'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Heart, ShoppingCart, Tag, MapPin, Loader2, Plus, Sparkles, Edit, Trash2, MoreVertical, LayoutGrid, ListFilter, Star, ShieldCheck, Box, Truck, Zap, Filter } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { subscribeToMarketplace, addMarketItem, updateMarketItem, deleteMarketItem, purchaseItem, getFeaturedItems, MarketItem } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const categories = ['Electrónica', 'Moda', 'Coleccionables', 'Servicios', 'Vehículos', 'Hogar', 'Otros'];

export default function MarketplacePage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showMyItems, setShowMyItems] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'Electrónica',
    location: '',
    image: '',
    condition: 'used',
    delivery: 'pickup',
    isFeatured: false
  });
  
  const [featuredItems, setFeaturedItems] = useState<MarketItem[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMarketplace((data) => {
      setItems(data);
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });
    
    getFeaturedItems(3).then(setFeaturedItems);
    
    return () => unsubscribe();
  }, []);

  const handleListItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title || !formData.price) return;

    setIsSubmitting(true);
    try {
      const itemData = {
        ownerId: user.uid,
        name: formData.title,
        price: formData.price.toString(),
        description: formData.description,
        imageUrl: formData.image || '',
        category: formData.category,
        location: formData.location || 'Nova Origin',
      };

      if (editingItemId) {
        await updateMarketItem(editingItemId, itemData);
        toast({ title: "Portal Actualizado", description: "El activo ha sido recalibrado en el mercado." });
      } else {
        await addMarketItem(itemData as any);
        toast({ title: "¡Portal de Venta Abierto!", description: "Tu producto ahora es parte del ecosistema Nova." });
      }
      
      setIsAdding(false);
      setEditingItemId(null);
      setFormData({ title: '', price: '', description: '', category: 'Electrónica', location: '', image: '', condition: 'used', delivery: 'pickup', isFeatured: false });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Falla de Sistema", description: error.message || "No se pudo sincronizar el item." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: MarketItem) => {
    setEditingItemId(item.id!);
    setFormData({
      title: item.name,
      price: item.price,
      description: item.description || '',
      category: item.category,
      location: item.location || '',
      image: item.imageUrl || '',
      condition: item.condition || 'used',
      delivery: item.delivery || 'pickup',
      isFeatured: item.isFeatured || false
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres desvincular este activo del mercado?')) return;
    try {
      await deleteMarketItem(id);
      toast({ title: "Activo Eliminado", description: "La señal ha sido removida del mercado." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Falla de Sistema", description: e.message });
    }
  };

  const handlePurchase = async (item: MarketItem) => {
    if (!user) {
        toast({ title: "Acceso Denegado", description: "Conéctate primero para adquirir activos.", variant: "destructive" });
        return;
    }
    if (item.ownerId === user.uid) {
        toast({ title: "Error", description: "No puedes adquirir tus propios activos." });
        return;
    }
    
    if (!confirm(`¿Confirmar adquisición de "${item.name}" por ${item.price} Nova Credits?`)) return;

    try {
      await purchaseItem(item.id!, user.uid);
      toast({ title: "Adquisición Exitosa", description: "El activo ha sido asignado a tu inventario." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Falla de Sistema", description: e.message });
    }
  };

  const filteredItems = items
    .filter(item => {
      const matchesSearch = (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (item.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesUser = showMyItems ? item.ownerId === user?.uid : true;
      const matchesCondition = selectedCondition ? item.condition === selectedCondition : true;
      const priceNum = parseFloat(item.price);
      const matchesPrice = priceNum >= priceRange[0] && priceNum <= priceRange[1];
      
      return matchesSearch && matchesUser && matchesCondition && matchesPrice;
    })
    .sort((a, b) => {
      if (sortOrder === 'price-asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sortOrder === 'price-desc') return parseFloat(b.price) - parseFloat(a.price);
      if (sortOrder === 'newest') return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
      return 0;
    });

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      
      {/* 1. Hero Section - Items Destacados */}
      {featuredItems.length > 0 && !searchTerm && !showMyItems && (
        <section className="relative h-[300px] sm:h-[400px] rounded-[2rem] sm:rounded-[3rem] overflow-hidden group shadow-2xl border border-white/5 mx-4 sm:mx-0">
             <Image 
                src={featuredItems[0].imageUrl} 
                fill 
                alt="Destacado" 
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
             <div className="relative z-10 h-full flex flex-col justify-center p-8 sm:p-12 md:p-20 space-y-4 sm:space-y-6 max-w-2xl">
                <Badge className="w-fit bg-primary/20 text-primary border-primary/30 uppercase font-black tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-xl text-[8px] sm:text-[10px]">
                   Oferta Destacada <Star className="w-3 h-3 ml-2 fill-primary" />
                </Badge>
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9] uppercase underline decoration-primary/50 decoration-wavy">
                   {featuredItems[0].name}
                </h2>
                <p className="text-sm sm:text-xl text-white/60 font-medium line-clamp-2 italic">{featuredItems[0].description}</p>
                <div className="flex items-center gap-4 sm:gap-6 pt-2 sm:pt-4">
                   <div className="text-2xl sm:text-4xl font-black text-primary italic tracking-tight">{featuredItems[0].price} <span className="text-[8px] sm:text-xs uppercase tracking-widest text-muted-foreground not-italic ml-1">Credits</span></div>
                   <Button onClick={() => handlePurchase(featuredItems[0])} size="lg" className="h-12 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-widest transition-all text-[10px] sm:text-sm">
                      Adquirir
                   </Button>
                </div>
             </div>
        </section>
      )}

      {/* 2. Header & Quick Actions */}
      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter flex items-center gap-3 sm:gap-4 leading-none uppercase italic">
              MARKET <span className="text-primary italic">CORE</span>
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse shrink-0" />
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-4 overflow-x-auto pb-2 scrollbar-hide">
               <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 sm:px-4 py-2 rounded-full border border-white/5 flex items-center gap-2 whitespace-nowrap">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Encriptado
               </span>
               <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 sm:px-4 py-2 rounded-full border border-white/5 flex items-center gap-2 whitespace-nowrap">
                  <Box className="w-3 h-3 text-primary" /> Verificado
               </span>
            </div>
          </div>
          
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl sm:rounded-[2rem] bg-primary hover:bg-primary/80 text-white gap-2 sm:gap-3 font-black uppercase tracking-widest px-6 sm:px-10 h-14 sm:h-16 shadow-2xl shadow-primary/30 transition-all hover:translate-y-[-4px] active:scale-95 text-[10px] sm:text-xs">
                Sincronizar Item <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#050510]/98 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] max-w-2xl p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
              <DialogHeader className="mb-8">
                <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-white italic text-center">
                    {editingItemId ? 'Recalibrar' : 'Fundar'} <span className="text-primary">Activo</span>
                </DialogTitle>
                <p className="text-center text-muted-foreground/60 font-medium uppercase text-[10px] tracking-[0.3em] mt-2">Protocolo de Registro Comercial NovaSphere</p>
              </DialogHeader>
              <form onSubmit={handleListItem} className="space-y-8 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">¿Qué estás vendiendo?</label>
                        <Input 
                            required
                            placeholder="Ej: Chip de Consciencia Nova"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="bg-white/5 border-white/5 rounded-2xl h-16 px-6 text-white focus:bg-white/10 transition-all text-lg font-bold"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Precio (Nova Credits)</label>
                        <Input 
                            required
                            placeholder="000"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                            className="bg-white/5 border-white/5 rounded-2xl h-16 px-6 text-white focus:bg-white/10 transition-all font-mono text-xl text-primary"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Sector / Ciudad</label>
                        <Input 
                            placeholder="Nova City"
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            className="bg-white/5 border-white/5 rounded-2xl h-14 px-6 text-white"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Categoría</label>
                        <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                            <SelectTrigger className="bg-white/5 border-white/5 rounded-2xl h-14 px-6 text-white uppercase font-black text-[10px] tracking-widest">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#050510] border-white/10 rounded-2xl">
                                {categories.map(c => <SelectItem key={c} value={c} className="rounded-xl focus:bg-primary/20 uppercase font-black text-[10px] tracking-widest">{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Condición</label>
                        <Select value={formData.condition} onValueChange={v => setFormData({...formData, condition: v as any})}>
                            <SelectTrigger className="bg-white/5 border-white/5 rounded-2xl h-14 px-6 text-white uppercase font-black text-[10px] tracking-widest">
                                <SelectValue placeholder="Condición" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#050510] border-white/10 rounded-2xl">
                                <SelectItem value="new" className="rounded-xl">De Fábrica (Nuevo)</SelectItem>
                                <SelectItem value="used" className="rounded-xl">En Uso (Usado)</SelectItem>
                                <SelectItem value="refurbished" className="rounded-xl">Recalibrado (Refurbished)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Especificaciones de Datos (Descripción)</label>
                  <Textarea 
                    placeholder="Describe esta pieza del futuro con detalle..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="bg-white/5 border-white/5 rounded-2xl min-h-[120px] p-6 text-white focus:bg-white/10 transition-all resize-none text-[15px] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">URL de Imagen</label>
                        <Input 
                            placeholder="https://visual.net/item.png"
                            value={formData.image}
                            onChange={e => setFormData({...formData, image: e.target.value})}
                            className="bg-white/5 border-white/5 rounded-2xl h-14 px-6 text-white"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Método Entrega</label>
                        <Select value={formData.delivery} onValueChange={v => setFormData({...formData, delivery: v as any})}>
                            <SelectTrigger className="bg-white/5 border-white/5 rounded-2xl h-14 px-6 text-white uppercase font-black text-[10px] tracking-widest">
                                <SelectValue placeholder="Entrega" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#050510] border-white/10 rounded-2xl">
                                <SelectItem value="shipping" className="rounded-xl">Portal de Envío</SelectItem>
                                <SelectItem value="pickup" className="rounded-xl">Recogida Local</SelectItem>
                                <SelectItem value="digital" className="rounded-xl">Transferencia Digital</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="pt-8">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-18 bg-primary text-white font-black uppercase tracking-[0.3em] rounded-3xl shadow-2xl shadow-primary/30 hover:brightness-110 md:text-base py-8 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : 'Sincronizar Activo en la Red 🚀'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 3. Search and Quick Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 h-16 md:h-20 bg-[#050510]/40 backdrop-blur-3xl border-white/5 rounded-3xl md:rounded-[2.5rem] text-lg md:text-2xl font-medium placeholder:text-muted-foreground/20 focus:bg-[#050510]/60 transition-all italic tracking-tight" 
              placeholder="Escanear redes comerciales..." 
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
                onClick={() => setShowMyItems(!showMyItems)}
                variant="ghost" 
                className={cn(
                    "h-16 md:h-20 flex-1 md:w-auto rounded-3xl border border-white/5 gap-3 px-8 text-white font-black uppercase tracking-widest text-xs transition-all",
                    showMyItems ? "bg-primary text-white shadow-2xl shadow-primary/20" : "bg-white/5 hover:bg-white/10"
                )}
            >
                <ListFilter className="w-5 h-5" />
                Mis Transacciones
            </Button>
            <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                <SelectTrigger className="h-16 md:h-20 flex-1 md:w-56 rounded-3xl bg-white/5 border-white/5 gap-3 px-8 text-white font-black uppercase tracking-widest text-[10px]">
                    <SelectValue placeholder="FILTRAR" />
                </SelectTrigger>
                <SelectContent className="bg-[#050510]/95 backdrop-blur-3xl border-white/10 rounded-3xl">
                    <SelectItem value="newest" className="rounded-xl font-black uppercase text-[10px] tracking-widest py-3">Última Señal</SelectItem>
                    <SelectItem value="price-asc" className="rounded-xl font-black uppercase text-[10px] tracking-widest py-3">Precio ++</SelectItem>
                    <SelectItem value="price-desc" className="rounded-xl font-black uppercase text-[10px] tracking-widest py-3">Precio --</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. Main Body: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Sidebar Tactico */}
        <aside className="w-full lg:w-80 shrink-0 space-y-10 lg:sticky lg:top-8">
            <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary px-2 flex items-center gap-2">
                   <Filter className="w-3 h-3" /> Parámetros de Búsqueda
                </p>
                
                {/* Categorías */}
                <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 pb-2 border-b border-white/5">Sectores</p>
                    <div className="flex flex-wrap lg:flex-col gap-2">
                        {['Todos', ...categories].map(cat => (
                            <Button 
                                key={cat}
                                onClick={() => setSearchTerm(cat === 'Todos' ? '' : cat)}
                                variant="ghost" 
                                className={cn(
                                    "w-fit lg:w-full justify-start h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                                    (cat === 'Todos' && !searchTerm) || searchTerm === cat ? "bg-primary/20 text-primary border border-primary/20" : "hover:bg-white/5 text-muted-foreground"
                                )}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Condición */}
                <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 pb-2 border-b border-white/5">Estado del Activo</p>
                    <div className="space-y-2">
                        {[
                            { id: 'new', label: 'De Fábrica' },
                            { id: 'used', label: 'En Uso' },
                            { id: 'refurbished', label: 'Recalibrado' }
                        ].map(c => (
                            <div 
                                key={c.id} 
                                onClick={() => setSelectedCondition(selectedCondition === c.id ? null : c.id)}
                                className={cn(
                                    "flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer border transition-all",
                                    selectedCondition === c.id ? "bg-primary/10 border-primary/30 text-white" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                )}
                            >
                                <span className="text-[11px] font-black uppercase tracking-widest">{c.label}</span>
                                {selectedCondition === c.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>

        {/* Rejilla de Computación (Products) */}
        <div className="flex-1 w-full">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-[#050510]/40 rounded-[3rem] overflow-hidden border border-white/5 space-y-6 p-6 animate-pulse">
                        <Skeleton className="aspect-square w-full rounded-[2rem] bg-white/5" />
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4 bg-white/5" />
                            <Skeleton className="h-4 w-1/2 bg-white/5" />
                            <div className="flex justify-between items-center pt-4">
                                <Skeleton className="h-10 w-24 rounded-full bg-white/5" />
                                <Skeleton className="h-12 w-32 rounded-2xl bg-white/5" />
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-10">
                {filteredItems.map((product, index) => (
                    <Card key={product.id} className="bg-[#050510]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden group hover:border-primary/40 transition-all duration-700 shadow-2xl relative flex flex-col hover:translate-y-[-8px]">
                    
                    {/* Condición Badge Superior */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                        <Badge className={cn(
                            "border-none font-black text-[8px] sm:text-[9px] uppercase tracking-[0.2em] py-1 sm:py-1.5 px-3 sm:px-4 rounded-full shadow-xl backdrop-blur-2xl",
                            product.condition === 'new' ? "bg-green-500/20 text-green-400" :
                            product.condition === 'refurbished' ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/40"
                        )}>
                            {product.condition === 'new' ? 'De Fábrica' : product.condition === 'refurbished' ? 'Recalibrado' : 'En Uso'}
                        </Badge>
                    </div>

                    <div className="relative aspect-[12/11] overflow-hidden bg-white/5">
                        <Image 
                        src={product.imageUrl} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 3}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1" 
                        alt={product.name || "Producto Galáctico"} 
                        />
                        
                        {/* Overlay Gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        {/* Botones de Acción Superior */}
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                            {product.ownerId === user?.uid && (
                                <>
                                    <Button 
                                        onClick={() => handleEdit(product)}
                                        variant="ghost" 
                                        size="icon" 
                                        className="rounded-xl sm:rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 hover:text-primary w-10 h-10 sm:w-12 sm:h-12 transition-all shadow-2xl"
                                    >
                                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </Button>
                                    <Button 
                                        onClick={() => handleDelete(product.id!)}
                                        variant="ghost" 
                                        size="icon" 
                                        className="rounded-xl sm:rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 hover:text-red-500 w-10 h-10 sm:w-12 sm:h-12 transition-all shadow-2xl"
                                    >
                                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </Button>
                                </>
                            )}
                            <Button variant="ghost" size="icon" className="rounded-xl sm:rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 hover:text-red-500 w-10 h-10 sm:w-12 sm:h-12 transition-all shadow-2xl">
                                <Heart className={cn("w-5 h-5 sm:w-6 sm:h-6", product.favorites?.includes(user?.uid!) ? "fill-red-500 text-red-500" : "")} />
                            </Button>
                        </div>

                        {/* Indicador de Entrega */}
                        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-2 sm:gap-3 opacity-0 group-hover:opacity-100 transition-all duration-700">
                             <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                                {product.delivery === 'shipping' ? <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> : 
                                 product.delivery === 'digital' ? <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> : 
                                 <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                             </div>
                        </div>
                    </div>

                    <CardHeader className="p-6 sm:p-8 flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <Badge className="bg-primary/10 text-primary border-none font-black text-[8px] sm:text-[9px] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full tracking-widest italic">{product.category.toUpperCase()}</Badge>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground/40">
                                <MapPin className="w-3 h-3" />
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">{product.location}</span>
                            </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                             <CardTitle className="text-lg sm:text-2xl font-black text-white truncate leading-tight tracking-tighter group-hover:text-primary transition-colors italic">{product.name}</CardTitle>
                             <p className="text-[11px] sm:text-[13px] text-muted-foreground/60 font-medium line-clamp-2 leading-relaxed italic">
                                {product.description || 'Sin descripción disponible para este item stelar.'}
                             </p>
                        </div>
                    </CardHeader>

                    <CardFooter className="p-6 sm:p-8 pt-0 mt-auto flex items-center justify-between gap-4 sm:gap-6">
                        <div className="flex flex-col">
                            <span className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1 opacity-40">Precio de Red</span>
                            <span className="text-xl sm:text-3xl font-black text-white italic tracking-tighter leading-none">{product.price} <span className="text-[7px] sm:text-[8px] tracking-[0.3em] not-italic text-primary">NC</span></span>
                        </div>
                        
                        <Button 
                            onClick={(e) => { e.stopPropagation(); handlePurchase(product); }}
                            disabled={product.status === 'sold'}
                            className={cn(
                                "h-12 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[11px] shadow-2xl transition-all hover:scale-[1.05] active:scale-95",
                                product.status === 'sold' ? "bg-white/5 text-muted-foreground border border-white/5 cursor-not-allowed" : "bg-primary text-white shadow-primary/20 hover:bg-primary/80"
                            )}
                        >
                            {product.status === 'sold' ? 'VENDIDO' : (
                                <span className="flex items-center gap-2 sm:gap-3">
                                    {product.price} <ShoppingCart className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {/* empty State */}
                {filteredItems.length === 0 && (
                    <div className="col-span-full text-center py-40 bg-[#050510]/30 backdrop-blur-3xl rounded-[4rem] border border-dashed border-white/5 shadow-inner">
                        <div className="flex flex-col items-center gap-8 opacity-20">
                            <div className="w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center animate-pulse">
                                <LayoutGrid className="w-16 h-16" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-black uppercase tracking-[0.5em]">Sin Frecuencia Comercial</p>
                                <p className="text-sm font-medium italic">No se detectaron activos en este sector de la red Nova.</p>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
