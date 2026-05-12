'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, X, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FBGroup {
  id: string; group_name: string; group_link: string; group_type: string;
  group_members: number; group_current_status: string; owner_fb_id_name: string;
  owner_fb_id_link: string; backup_group_link: string; group_status: string;
  admins: string[]; added_by_name: string;
}

function Modal({ onClose, group, onSaved }: { onClose: () => void; group?: FBGroup | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    group_name: group?.group_name || '', group_link: group?.group_link || '',
    group_type: group?.group_type || '', group_members: group?.group_members || 0,
    group_current_status: group?.group_current_status || '', owner_fb_id_name: group?.owner_fb_id_name || '',
    owner_fb_id_link: group?.owner_fb_id_link || '', backup_group_link: group?.backup_group_link || '',
    group_status: group?.group_status || '', admins: group?.admins || [''],
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, admins: form.admins.filter(a => a.trim()) };
      if (group) await api.put(`/facebook-groups/${group.id}`, payload);
      else await api.post('/facebook-groups', payload);
      toast.success(group ? 'Updated' : 'Added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  function setField(key: string, val: any) { setForm(f => ({ ...f, [key]: val })); }
  function setAdmin(i: number, val: string) {
    const a = [...form.admins]; a[i] = val; setForm(f => ({ ...f, admins: a }));
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h2 className="font-semibold text-white">{group ? 'Edit Group' : 'Add Facebook Group'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['Group Name *', 'group_name'], ['Group Link', 'group_link'], ['Group Type', 'group_type'],
              ['Group Members', 'group_members', 'number'], ['Current Status', 'group_current_status'],
              ['Group Status', 'group_status']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input type={type as string || 'text'} value={(form as any)[key]}
                  onChange={e => setField(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                  required={key === 'group_name'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['Owner FB ID Name', 'owner_fb_id_name'], ['Owner FB ID Link', 'owner_fb_id_link'], ['Backup Group Link', 'backup_group_link']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[key]} onChange={e => setField(key, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">Group Admins</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, admins: [...f.admins, ''] }))}
                className="text-xs text-violet-400 hover:text-violet-300">+ Add Admin</button>
            </div>
            {form.admins.map((a, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={a} onChange={e => setAdmin(i, e.target.value)} placeholder={`Admin ${i + 1} name`}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
                {form.admins.length > 1 && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, admins: f.admins.filter((_, j) => j !== i) }))}
                    className="text-slate-500 hover:text-red-400"><X size={14} /></button>
                )}
              </div>
            ))}
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

export default function FacebookGroupsPage() {
  const [groups, setGroups] = useState<FBGroup[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editGroup, setEditGroup] = useState<FBGroup | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const { data } = await api.get('/facebook-groups'); setGroups(data); }
    catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete group?')) return;
    await api.delete(`/facebook-groups/${id}`); toast.success('Deleted'); load();
  }

  const filtered = groups.filter(g => !search || g.group_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <TopBar title="Facebook Groups" subtitle={`${groups.length} groups`}
        actions={
          <button onClick={() => { setEditGroup(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl">
            <Plus size={16} /> Add Group
          </button>
        } />

      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-violet-400" /></div> : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Group Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Members</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-left">Admins</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-slate-500">No groups found</td></tr>}
                {filtered.map(g => (
                  <tr key={g.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{g.group_name}</span>
                        {g.group_link && (
                          <a href={g.group_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      {g.backup_group_link && (
                        <a href={g.backup_group_link} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1 mt-0.5">
                          Backup <ExternalLink size={10} />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{g.group_type || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{g.group_members?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {g.group_current_status && <p className="text-xs text-slate-300">{g.group_current_status}</p>}
                        {g.group_status && <span className={cn('text-xs px-1.5 py-0.5 rounded', g.group_status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400')}>{g.group_status}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {g.owner_fb_id_name && (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-300 text-xs">{g.owner_fb_id_name}</span>
                          {g.owner_fb_id_link && <a href={g.owner_fb_id_link} target="_blank" rel="noopener noreferrer" className="text-blue-400"><ExternalLink size={10} /></a>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(g.admins || []).map((a, i) => <span key={i} className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{a}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{g.added_by_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditGroup(g); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => del(g.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} group={editGroup} onSaved={load} />}
    </div>
  );
}
