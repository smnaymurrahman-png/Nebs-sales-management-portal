'use client';
import { useEffect, useState } from 'react';
import { Users, UserCheck, ShieldCheck, ClipboardList, Facebook, MessageCircle, BookOpen, Video } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Stats {
  total_users: number;
  total_clients: number;
  fb_groups: number;
  wa_groups: number;
  fb_ids: number;
  tutorials: number;
  instructions: number;
}

function StatCard({ icon: Icon, label, value, color, href }: { icon: any; label: string; value: number; color: string; href: string }) {
  return (
    <Link href={href} className={cn('bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-200 transition-colors group')}>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
        <Icon size={20} className="text-gray-900" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [clients, fbGroups, waGroups, fbIds, tutorials, instructions] = await Promise.all([
          api.get('/clients'),
          api.get('/facebook-groups'),
          api.get('/whatsapp-groups'),
          api.get('/facebook-ids'),
          api.get('/tutorials'),
          api.get('/instructions'),
        ]);
        let userCount = 0;
        if (user?.role !== 'user') {
          const usersRes = await api.get('/users');
          userCount = usersRes.data.length;
        }
        setStats({
          total_users: userCount,
          total_clients: clients.data.length,
          fb_groups: fbGroups.data.length,
          wa_groups: waGroups.data.length,
          fb_ids: fbIds.data.length,
          tutorials: tutorials.data.length,
          instructions: instructions.data.length,
        });
      } catch {}
    }
    load();
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <TopBar title="Dashboard" subtitle={`${greeting}, ${user?.full_name?.split(' ')[0]}`} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <StatCard icon={ClipboardList} label="Clients" value={stats?.total_clients ?? 0} color="bg-green-600" href="/dashboard/clients" />
          <StatCard icon={Facebook} label="FB Groups" value={stats?.fb_groups ?? 0} color="bg-blue-600" href="/dashboard/facebook-groups" />
          <StatCard icon={UserCheck} label="FB IDs" value={stats?.fb_ids ?? 0} color="bg-sky-600" href="/dashboard/facebook-ids" />
          <StatCard icon={MessageCircle} label="WA Groups" value={stats?.wa_groups ?? 0} color="bg-emerald-600" href="/dashboard/whatsapp-groups" />
          <StatCard icon={BookOpen} label="Instructions" value={stats?.instructions ?? 0} color="bg-amber-600" href="/dashboard/instructions" />
          <StatCard icon={Video} label="Tutorials" value={stats?.tutorials ?? 0} color="bg-rose-600" href="/dashboard/tutorials" />
          {user?.role !== 'user' && (
            <StatCard icon={Users} label="Team Members" value={stats?.total_users ?? 0} color="bg-indigo-600" href="/dashboard/members" />
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/daily-task" className="px-4 py-2 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-700 text-sm rounded-xl transition-colors">
              View Today&apos;s Task
            </Link>
            <Link href="/dashboard/clients" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-xl transition-colors">
              Add Client
            </Link>
            <Link href="/dashboard/nebs-seller-pro" className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm rounded-xl transition-colors">
              Ask Nebs-Seller Pro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
