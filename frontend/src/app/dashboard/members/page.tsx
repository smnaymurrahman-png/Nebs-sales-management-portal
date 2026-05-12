'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Edit2, Trash2, Search, KeyRound, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn, ROLE_COLORS, ROLE_LABELS, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const SHIFT_COLORS: Record<string, string> = {
  Morning: 'bg-amber-500/20 text-amber-300',
  Evening: 'bg-blue-500/20 text-blue-300',
  Day: 'bg-emerald-500/20 text-emerald-300',
};

interface Member { id: string; full_name: string; work_email: string; designation: string; role: string; shift: string; created_at: string }

function MemberModal({ onClose, member, onSaved, currentUserRole }: { onClose: () => void; member?: Member | null; onSaved: () => void; currentUserRole: string }) {
  const [form, setForm] = useState({ full_name: member?.full_name || '', work_email: member?.work_email || '', password: '', designation: member?.designation || '', role: member?.role || 'user', shift: member?.shift || 'Morning' });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (member) await api.put(`/users/${member.id}`, { full_name: form.full_name, work_email: form.work_email, designation: form.designation, role: form.role, shift: form.shift });
      else await api.post('/users', form);
      toast.success(member ? 'Updated' : 'Member added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  const roleOptions = currentUserRole === 'super_admin'
    ? [['user', 'User'], ['admin', 'Admin'], ['super_admin', 'Super Admin']]
    : [['user', 'User']];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md animate-slide-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">{member ? 'Edit Member' : 'Add Member'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {[['Full Name *', 'full_name', 'text'], ['Work Email *', 'work_email', 'email'], ['Designation', 'designation', 'text']].map(([label, key, type]) => (
            <div key={key}>
              <label className="block text-xs text-slate-400 mb-1">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={key !== 'designation'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
          ))}
          {!member && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                {roleOptions.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Shift</label>
              <select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Day">Day</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPwdModal({ onClose, member }: { onClose: () => void; member: Member }) {
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      await api.post(`/users/${member.id}/reset-password`, { new_password: pwd });
      toast.success('Password reset'); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm animate-slide-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Reset Password</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <p className="text-sm text-slate-400">Reset password for <span className="text-white font-medium">{member.full_name}</span></p>
          <div>
            <label className="block text-xs text-slate-400 mb-1">New Password *</label>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required minLength={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />} Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [resetMember, setResetMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'user') { router.replace('/dashboard'); return; }
    load();
  }, [user, router]);

  async function load() {
    try { const { data } = await api.get('/users'); setMembers(data); }
    catch {} finally { setLoading(false); }
  }

  async function del(id: string) {
    if (!confirm('Delete this member?')) return;
    await api.delete(`/users/${id}`); toast.success('Deleted'); load();
  }

  const filtered = members.filter(m => !search || m.full_name.toLowerCase().includes(search.toLowerCase()) || m.work_email.includes(search));

  return (
    <div>
      <TopBar title="Members" subtitle={`${members.length} team members`}
        actions={
          <button onClick={() => { setEditMember(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl">
            <UserPlus size={16} /> Add Member
          </button>
        } />

      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-violet-400" /></div> : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Designation</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Shift</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-slate-500">No members found</td></tr>}
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{m.full_name}</td>
                    <td className="px-4 py-3 text-slate-300">{m.work_email}</td>
                    <td className="px-4 py-3 text-slate-400">{m.designation || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', ROLE_COLORS[m.role])}>{ROLE_LABELS[m.role]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', SHIFT_COLORS[m.shift] || 'bg-slate-700 text-slate-400')}>{m.shift || 'Morning'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(m.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditMember(m); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => { setResetMember(m); setShowReset(true); }} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"><KeyRound size={14} /></button>
                        {m.id !== user?.id && (
                          <button onClick={() => del(m.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <MemberModal onClose={() => setShowModal(false)} member={editMember} onSaved={load} currentUserRole={user?.role || 'admin'} />}
      {showReset && resetMember && <ResetPwdModal onClose={() => setShowReset(false)} member={resetMember} />}
    </div>
  );
}
