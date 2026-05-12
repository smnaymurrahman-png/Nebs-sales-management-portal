'use client';
import { useAuthStore } from '@/lib/store';
import { cn, ROLE_COLORS, ROLE_LABELS } from '@/lib/utils';

interface TopBarProps { title: string; subtitle?: string; actions?: React.ReactNode }

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  const user = useAuthStore(s => s.user);

  return (
    <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {user && (
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', ROLE_COLORS[user.role])}>
            {ROLE_LABELS[user.role]}
          </span>
        )}
      </div>
    </header>
  );
}
