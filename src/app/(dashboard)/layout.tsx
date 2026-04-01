import { Navbar } from '@/components/layout/Navbar';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-0">
        <AppSidebar />
        <main className="flex-1 md:ml-20 xl:ml-64 p-4 md:p-8 max-w-full">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
