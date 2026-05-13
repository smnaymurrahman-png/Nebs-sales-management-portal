'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import { useUIStore } from '@/lib/uiStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore(s => s.token);
  const { sidebarOpen, closeSidebar } = useUIStore();

  useEffect(() => {
    if (!token) router.replace('/auth/login');
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={closeSidebar} />
      )}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
    </div>
  );
}
