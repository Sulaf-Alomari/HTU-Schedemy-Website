import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from GeistSans to Inter
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ // Changed from geistSans to inter
  subsets: ['latin'],
  variable: '--font-inter', // Defined CSS variable name
});

export const metadata: Metadata = {
  title: 'Sci-Ed Schedule - University Class Scheduler',
  description: 'Manage university class schedules for the Science Department with conflict resolution.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}> {/* Used inter.variable */}
        <AppShell>
          {children}
        </AppShell>
        <Toaster />
      </body>
    </html>
  );
}
