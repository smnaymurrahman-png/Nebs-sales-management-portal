'use client';
import { useEffect, useState } from 'react';
import { Search, ExternalLink, Loader2, X, ChevronRight, User } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn, ROLE_LABELS, ROLE_COLORS } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface Member { id: string; full_name: string; work_email: string; designation: string; role: string; shift: string }
interface FBId { id: string; facebook_name: string; facebook_id_link: string; facebook_email: string; facebook_password: string; fb_id_status: string; connected_whatsapp: string; friends_count: number }
interface WAId { id: string; whatsapp_name: string; whatsapp_number: string; whatsapp_link: string; wa_email: string; wa_password: string; wa_status: string; connected_fb_id: string; device: string; remarks: string }
interface FBPage { id: string; page_name: string; page_link: string; page_id: string; fb_email: string; fb_password: string; page_status: string; connected_whatsapp: string; page_likes: number; remarks: string }
interface LIProfile { id: string; profile_name: string; profile_link: string; li_email: string; li_password: string; connection_count: number; li_status: string; remarks: string }

interface MemberProfiles {
  user: Member;
  facebook_ids: FBId[];
  whatsapp_ids: WAId[];
  facebook_pages: FBPage[];
  linkedin_profiles: LIProfile[];
}

const FB_STATUS: Record<string, string> = { New: 'bg-gray-100 text-gray-600', Active: 'bg-blue-50 text-blue-700', Disabled: 'bg-red-50 text-red-600' };
const WA_STATUS: Record<string, string> = { New: 'bg-gray-100 text-gray-600', Active: 'bg-emerald-50 text-emerald-700', Disabled: 'bg-orange-50 text-orange-700', Banned: 'bg-red-50 text-red-600' };
const PAGE_STATUS: Record<string, string> = { New: 'bg-gray-100 text-gray-600', Active: 'bg-emerald-50 text-emerald-700', Disabled: 'bg-orange-50 text-orange-700', Restricted: 'bg-red-50 text-red-600' };
const LI_STATUS: Record<string, string> = { Active: 'bg-blue-50 text-blue-700', Restricted: 'bg-orange-50 text-orange-700', Disabled: 'bg-red-50 text-red-600' };
const SHIFT_COLORS: Record<string, string> = { Morning: 'bg-amber-50 text-amber-700', Evening: 'bg-blue-50 text-blue-700', Day: 'bg-emerald-50 text-emerald-700' };

function InfoRow({ label, value, link }: { label: string; value?: string | number | null; link?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-28 shrink-0 mt-0.5">{label}</span>
      {link && typeof value === 'string' ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 flex-1 min-w-0 break-all">
          <ExternalLink size={10} /> {value}
        </a>
      ) : (
        <span className="text-xs text-gray-900 flex-1 min-w-0 break-all">{value}</span>
      )}
    </div>
  );
}

function ProfileSection({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', color)}>{count}</span>
        </div>
        <ChevronRight size={15} className={cn('text-gray-400 transition-transform', open && 'rotate-90')} />
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function ProfileDrawer({ profiles, onClose }: { profiles: MemberProfiles; onClose: () => void }) {
  const { user, facebook_ids, whatsapp_ids, facebook_pages, linkedin_profiles } = profiles;
  const total = facebook_ids.length + whatsapp_ids.length + facebook_pages.length + linkedin_profiles.length;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-white overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-semibold text-gray-900">{user.full_name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user.work_email} · {total} profile entries</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1"><X size={18} /></button>
        </div>

        {/* Member info */}
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex gap-3 flex-wrap">
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', ROLE_COLORS[user.role])}>{ROLE_LABELS[user.role]}</span>
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', SHIFT_COLORS[user.shift] || 'bg-gray-100 text-gray-600')}>{user.shift} Shift</span>
          {user.designation && <span className="text-xs text-gray-500">{user.designation}</span>}
        </div>

        <div className="p-5 space-y-4 flex-1">
          {/* Facebook IDs */}
          <ProfileSection title="Facebook Profiles" count={facebook_ids.length} color="bg-blue-50 text-blue-700">
            {facebook_ids.length === 0 ? <p className="text-sm text-gray-400">None added</p> : (
              <div className="space-y-3">
                {facebook_ids.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.facebook_name}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', FB_STATUS[item.fb_id_status] || 'bg-gray-100 text-gray-600')}>{item.fb_id_status}</span>
                    </div>
                    <InfoRow label="Profile Link" value={item.facebook_id_link} link />
                    <InfoRow label="Email" value={item.facebook_email} />
                    <InfoRow label="Password" value={item.facebook_password} />
                    <InfoRow label="Connected WA" value={item.connected_whatsapp} />
                    <InfoRow label="Friends" value={item.friends_count} />
                  </div>
                ))}
              </div>
            )}
          </ProfileSection>

          {/* WhatsApp IDs */}
          <ProfileSection title="WhatsApp IDs" count={whatsapp_ids.length} color="bg-emerald-50 text-emerald-700">
            {whatsapp_ids.length === 0 ? <p className="text-sm text-gray-400">None added</p> : (
              <div className="space-y-3">
                {whatsapp_ids.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.whatsapp_name}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', WA_STATUS[item.wa_status] || 'bg-gray-100 text-gray-600')}>{item.wa_status}</span>
                    </div>
                    <InfoRow label="Number" value={item.whatsapp_number} />
                    <InfoRow label="WA Link" value={item.whatsapp_link} link />
                    <InfoRow label="Email" value={item.wa_email} />
                    <InfoRow label="Password" value={item.wa_password} />
                    <InfoRow label="Connected FB" value={item.connected_fb_id} />
                    <InfoRow label="Device" value={item.device} />
                    <InfoRow label="Remarks" value={item.remarks} />
                  </div>
                ))}
              </div>
            )}
          </ProfileSection>

          {/* Facebook Pages */}
          <ProfileSection title="Facebook Pages" count={facebook_pages.length} color="bg-sky-50 text-sky-700">
            {facebook_pages.length === 0 ? <p className="text-sm text-gray-400">None added</p> : (
              <div className="space-y-3">
                {facebook_pages.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.page_name}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', PAGE_STATUS[item.page_status] || 'bg-gray-100 text-gray-600')}>{item.page_status}</span>
                    </div>
                    <InfoRow label="Page Link" value={item.page_link} link />
                    <InfoRow label="Page ID" value={item.page_id} />
                    <InfoRow label="Likes" value={item.page_likes} />
                    <InfoRow label="Email" value={item.fb_email} />
                    <InfoRow label="Password" value={item.fb_password} />
                    <InfoRow label="Connected WA" value={item.connected_whatsapp} />
                    <InfoRow label="Remarks" value={item.remarks} />
                  </div>
                ))}
              </div>
            )}
          </ProfileSection>

          {/* LinkedIn Profiles */}
          <ProfileSection title="LinkedIn Profiles" count={linkedin_profiles.length} color="bg-indigo-50 text-indigo-700">
            {linkedin_profiles.length === 0 ? <p className="text-sm text-gray-400">None added</p> : (
              <div className="space-y-3">
                {linkedin_profiles.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.profile_name}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', LI_STATUS[item.li_status] || 'bg-gray-100 text-gray-600')}>{item.li_status}</span>
                    </div>
                    <InfoRow label="Profile Link" value={item.profile_link} link />
                    <InfoRow label="Email" value={item.li_email} />
                    <InfoRow label="Password" value={item.li_password} />
                    <InfoRow label="Connections" value={item.connection_count} />
                    <InfoRow label="Remarks" value={item.remarks} />
                  </div>
                ))}
              </div>
            )}
          </ProfileSection>
        </div>
      </div>
    </div>
  );
}

export default function MemberProfilesPage() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MemberProfiles | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'user') { router.replace('/dashboard'); return; }
    api.get('/users').then(r => setMembers(r.data)).finally(() => setLoading(false));
  }, [user, router]);

  async function viewProfiles(member: Member) {
    setLoadingProfile(member.id);
    try {
      const { data } = await api.get(`/member-profiles/${member.id}`);
      setSelected(data);
    } catch { } finally { setLoadingProfile(null); }
  }

  const isSuperAdmin = user?.role === 'super_admin';
  const filtered = members.filter(m => {
    if (!isSuperAdmin && m.role === 'admin') return false;
    return !search || m.full_name.toLowerCase().includes(search.toLowerCase()) || m.work_email.includes(search);
  });

  return (
    <div>
      <TopBar title="Member Profiles" subtitle="View all members' social account details" />
      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-green-600" /></div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.length === 0 && <p className="text-sm text-gray-400 col-span-full py-8 text-center">No members found</p>}
            {filtered.map(m => (
              <button key={m.id} onClick={() => viewProfiles(m)}
                className="bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-green-300 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <User size={18} className="text-green-600" />
                  </div>
                  {loadingProfile === m.id ? (
                    <Loader2 size={14} className="animate-spin text-green-600 mt-1" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-green-500 transition-colors mt-1" />
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-sm truncate">{m.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{m.work_email}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[m.role])}>{ROLE_LABELS[m.role]}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full',
                    m.shift === 'Morning' ? 'bg-amber-50 text-amber-700' :
                    m.shift === 'Evening' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700')}>
                    {m.shift}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && <ProfileDrawer profiles={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
