
import { Navbar } from '@/components/layout/Navbar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { NovaAI } from '@/components/ai/NovaAI';
import { InstallButton } from '@/components/pwa/InstallButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <Navbar />
      <MobileNav />
      <div className="flex flex-1 pt-0">
        <AppSidebar />
        <main className="flex-1 md:ml-20 xl:ml-72 p-4 md:p-8 max-w-full pb-8 transition-all duration-500">
          <div className="mx-auto max-w-7xl relative">
            {children}
          </div>
        </main>
      </div>
      <NovaAI />
      <InstallButton />
    </div>
  );
}
