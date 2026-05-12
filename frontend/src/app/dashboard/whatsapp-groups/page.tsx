'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface WAGroup {
  id: string; group_name: string; group_link: string; admin_whatsapp: string;
  group_members: number; group_type: string; activity_status: string; added_by_name: string;
}

function Modal({ onClose, group, onSaved }: { onClose: () => void; group?: WAGroup | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    group_name: group?.group_name || '', group_link: group?.group_link || '',
    admin_whatsapp: group?.admin_whatsapp || '', group_members: group?.group_members || 0,
    group_type: group?.group_type || '', activity_status: group?.activity_status || '',
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (group) await api.put(`/whatsapp-groups/${group.id}`, form);
      else await api.post('/whatsapp-groups', form);
      toast.success(group ? 'Updated' : 'Added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg animate-slide-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">{group ? 'Edit Group' : 'Add WhatsApp Group'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Group Name *', 'group_name'], ['Group Link', 'group_link'],
              ['Admin WhatsApp', 'admin_whatsapp'], ['Group Type', 'group_type'],
              ['Activity Status', 'activity_status'],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required={key === 'group_name'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Group Members</label>
              <input type="number" value={form.group_members} onChange={e => setForm(f => ({ ...f, group_members: Number(e.target.value) }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
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

export default function WhatsAppGroupsPage() {
  const [groups, setGroups] = useState<WAGroup[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editGroup, setEditGroup] = useState<WAGroup | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const { data } = await api.get('/whatsapp-groups'); setGroups(data); }
    catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete group?')) return;
    await api.delete(`/whatsapp-groups/${id}`); toast.success('Deleted'); load();
  }

  const filtered = groups.filter(g => !search || g.group_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <TopBar title="WhatsApp Groups" subtitle={`${groups.length} groups`}
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Group Name</th>
                  <th className="px-4 py-3 text-left">Admin WhatsApp</th>
                  <th className="px-4 py-3 text-left">Members</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Activity</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-slate-500">No groups found</td></tr>}
                {filtered.map(g => (
                  <tr key={g.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{g.group_name}</span>
                        {g.group_link && (
                          <a href={g.group_link} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300"><ExternalLink size={12} /></a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{g.admin_whatsapp || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{g.group_members?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-300">{g.group_type || '—'}</td>
                    <td className="px-4 py-3">
                      {g.activity_status && (
                        <span className={cn('text-xs px-2 py-0.5 rounded-full',
                          g.activity_status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' :
                          g.activity_status === 'Inactive' ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-slate-300'
                        )}>{g.activity_status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{g.added_by_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditGroup(g); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => del(g.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
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
