import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'NovaSphere | Social Ecosystem',
  description: 'The definitive social ecosystem powered by NovaAI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        
        {/* PWA Settings */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NovaSphere" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#8B5CF6" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const theme = localStorage.getItem('nova-theme') || 'purple';
            document.documentElement.className = 'dark theme-' + theme;
          })()
        `}} />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
