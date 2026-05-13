'use client';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useUIStore } from '@/lib/uiStore';
import { cn, ROLE_COLORS, ROLE_LABELS } from '@/lib/utils';

interface TopBarProps { title: string; subtitle?: string; actions?: React.ReactNode }

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  const user = useAuthStore(s => s.user);
  const openSidebar = useUIStore(s => s.openSidebar);

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={openSidebar}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        {user && (
          <span className={cn('hidden sm:inline text-xs px-2.5 py-1 rounded-full font-medium', ROLE_COLORS[user.role])}>
            {ROLE_LABELS[user.role]}
          </span>
        )}
      </div>
    </header>
  );
}
