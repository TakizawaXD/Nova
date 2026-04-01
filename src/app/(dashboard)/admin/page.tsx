
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldAlert, BarChart3, Database, Trash2, Ban, CheckCircle, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, posts: 0, reports: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const userSnap = await getDocs(query(collection(db, 'users'), limit(10)));
        const postSnap = await getDocs(query(collection(db, 'posts'), limit(1)));
        
        setUsers(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setStats({
          users: userSnap.size,
          posts: 12450, // Mock for scale
          reports: 12
        });
      } catch (error) {
        console.error("Error admin", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (profile?.username !== 'alex_nova' && profile?.username !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <ShieldAlert className="w-20 h-20 text-destructive animate-bounce" />
        <h1 className="text-3xl font-black uppercase tracking-tighter">Acceso Denegado</h1>
        <p className="text-muted-foreground">Tu núcleo cuántico no tiene permisos de administrador.</p>
        <Button variant="outline" className="rounded-xl" onClick={() => window.location.href = '/'}>Volver a Inicio</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">CENTRO DE CONTROL</h1>
          <p className="text-muted-foreground mt-2">Gestiona el universo Nova y a sus ciudadanos.</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary px-4 py-1.5 rounded-full font-black uppercase tracking-widest h-10">Admin Activo</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Usuarios" value={stats.users} icon={Users} color="text-blue-500" />
        <StatCard title="Publicaciones" value={stats.posts} icon={BarChart3} color="text-purple-500" />
        <StatCard title="Reportes" value={stats.reports} icon={ShieldAlert} color="text-red-500" />
        <StatCard title="Uso DB" value="2.4 GB" icon={Database} color="text-green-500" />
      </div>

      <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black uppercase tracking-tighter">Gestión de Usuarios</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10 bg-white/5 border-white/10 rounded-xl h-10" placeholder="Buscar por ID o @user..." />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5">
                <TableHead className="font-black uppercase tracking-widest text-[10px] pl-8">Usuario</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Rol</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Estado</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-right pr-8">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-lg text-[9px] font-black uppercase tracking-widest">Ciudadano</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] font-bold text-muted-foreground">Activo</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500 hover:bg-yellow-500/10"><Ban className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="glass border-white/5 rounded-[2rem] p-6 group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <Badge variant="outline" className="text-[9px] border-white/10 text-muted-foreground">+12%</Badge>
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="text-3xl font-black tracking-tighter mt-1">{value}</p>
    </Card>
  );
}
