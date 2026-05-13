'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ClipboardList, Users,
  MessageCircle, BookOpen, Bot, Video, UserCog, Settings, LogOut,
  CalendarClock, Smartphone, Flag, ShoppingBag, X, Globe,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/daily-task', label: 'Daily Task', icon: ClipboardList },
  { href: '/dashboard/shift-tasks', label: 'Shift Tasks', icon: CalendarClock },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/facebook-groups', label: 'Facebook Groups', icon: Globe },
  { href: '/dashboard/facebook-ids', label: 'Facebook IDs', icon: UserCog },
  { href: '/dashboard/facebook-page-ids', label: 'FB Page IDs', icon: Flag },
  { href: '/dashboard/whatsapp-groups', label: 'WhatsApp Groups', icon: MessageCircle },
  { href: '/dashboard/whatsapp-ids', label: 'WhatsApp IDs', icon: Smartphone },
  { href: '/dashboard/vendors', label: 'Vendor List', icon: ShoppingBag },
  { href: '/dashboard/instructions', label: 'Instructions', icon: BookOpen },
  { href: '/dashboard/nebs-seller-pro', label: 'Nebs-Seller Pro', icon: Bot },
  { href: '/dashboard/tutorials', label: 'Tutorials', icon: Video },
];

const ADMIN_NAV = [
  { href: '/dashboard/members', label: 'Members', icon: Users },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role !== 'user';

  const content = (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <Image src="/logo.png" alt="Nebs Logo" width={36} height={36} className="rounded-xl flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">Nebs Seller</p>
            <p className="text-xs text-gray-400">Portal</p>
          </div>
        </Link>
        {/* Close button — mobile only */}
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                active
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon size={16} className={cn('flex-shrink-0', active ? 'text-green-600' : '')} />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Admin</p>
            </div>
            {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                    active
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon size={16} className={cn('flex-shrink-0', active ? 'text-green-600' : '')} />
                  {label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 space-y-0.5">
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-green-50 text-green-700'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <Settings size={16} />
          Settings
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>

        <div className="px-3 py-2 mt-1">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.work_email}</p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:flex h-screen sticky top-0">
        {content}
      </div>

      {/* Mobile: slide-in drawer */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-30 lg:hidden transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {content}
      </div>
    </>
  );
}
