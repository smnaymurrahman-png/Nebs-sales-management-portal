'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, LayoutDashboard, ClipboardList, Users, Facebook,
  MessageCircle, BookOpen, Bot, Video, UserCog, Settings, LogOut, CalendarClock, Smartphone, Flag,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/daily-task', label: 'Daily Task', icon: ClipboardList },
  { href: '/dashboard/shift-tasks', label: 'Shift Tasks', icon: CalendarClock },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/facebook-groups', label: 'Facebook Groups', icon: Facebook },
  { href: '/dashboard/facebook-ids', label: 'Facebook IDs', icon: UserCog },
  { href: '/dashboard/facebook-page-ids', label: 'FB Page IDs', icon: Flag },
  { href: '/dashboard/whatsapp-groups', label: 'WhatsApp Groups', icon: MessageCircle },
  { href: '/dashboard/whatsapp-ids', label: 'WhatsApp IDs', icon: Smartphone },
  { href: '/dashboard/instructions', label: 'Instructions', icon: BookOpen },
  { href: '/dashboard/nebs-seller-pro', label: 'Nebs-Seller Pro', icon: Bot },
  { href: '/dashboard/tutorials', label: 'Tutorials', icon: Video },
];

const ADMIN_NAV = [
  { href: '/dashboard/members', label: 'Members', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role !== 'user';

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Nebs Seller</p>
            <p className="text-xs text-slate-400">Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                active ? 'bg-violet-600/20 text-violet-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs text-slate-600 uppercase tracking-wider font-medium">Admin</p>
            </div>
            {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                    active ? 'bg-violet-600/20 text-violet-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  )}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-slate-800 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
            pathname === '/dashboard/settings' ? 'bg-violet-600/20 text-violet-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          )}
        >
          <Settings size={16} />
          Settings
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>

        <div className="px-3 py-2 mt-1">
          <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
          <p className="text-xs text-slate-500 truncate">{user?.work_email}</p>
        </div>
      </div>
    </aside>
  );
}
