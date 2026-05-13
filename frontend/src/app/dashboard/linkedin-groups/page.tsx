'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const GROUP_TYPES = ['Data and leads', 'Targeted database group', 'Other business group', 'Review group'];
const GROUP_CONDITIONS = ['Very Good', 'Good', 'Average', 'Below Average', 'Low'];

interface LIGroup {
  id: string; group_name: string; group_link: string; group_type: string;
  group_members: number; group_condition: string; added_by_name: string;
}

function normalizeUrl(url: string) {
  return url.trim().toLowerCase().replace(/\/$/, '');
}

function detectLILink(url: string): boolean {
  return /linkedin\.com\/(groups|company|in)\/[^/?&#\s]+/i.test(url);
}

function Modal({ onClose, group, groups, onSaved }: { onClose: () => void; group?: LIGroup | null; groups: LIGroup[]; onSaved: () => void }) {
  const [form, setForm] = useState({
    group_name: group?.group_name || '', group_link: group?.group_link || '',
    group_type: group?.group_type || '', group_members: group?.group_members || 0,
    group_condition: group?.group_condition || '',
  });
  const [loading, setLoading] = useState(false);
  const [linkInfo, setLinkInfo] = useState<{ type: 'duplicate' | 'valid' | 'invalid' | null; message: string }>({ type: null, message: '' });

  function handleLinkChange(val: string) {
    setForm(p => ({ ...p, group_link: val }));
    if (!val.trim()) { setLinkInfo({ type: null, message: '' }); return; }
    const norm = normalizeUrl(val);
    const dup = groups.find(g => g.id !== group?.id && normalizeUrl(g.group_link || '') === norm);
    if (dup) { setLinkInfo({ type: 'duplicate', message: `Already exists: "${dup.group_name}"` }); return; }
    if (detectLILink(val)) setLinkInfo({ type: 'valid', message: 'LinkedIn group link detected' });
    else if (val.startsWith('http')) setLinkInfo({ type: 'invalid', message: 'Not a recognized LinkedIn group link' });
    else setLinkInfo({ type: null, message: '' });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (linkInfo.type === 'duplicate') { toast.error(linkInfo.message); return; }
    setLoading(true);
    try {
      if (group) await api.put(`/linkedin-groups/${group.id}`, form);
      else await api.post('/linkedin-groups', form);
      toast.success(group ? 'Updated' : 'Added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  function f(key: string, val: string | number) { setForm(p => ({ ...p, [key]: val })); }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg animate-slide-up">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{group ? 'Edit LinkedIn Group' : 'Add LinkedIn Group'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Group Name *</label>
              <input value={form.group_name} onChange={e => f('group_name', e.target.value)} required
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Group Link</label>
              <input value={form.group_link} onChange={e => handleLinkChange(e.target.value)} placeholder="https://linkedin.com/groups/..."
                className={cn(
                  'w-full bg-white border rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none',
                  linkInfo.type === 'duplicate' ? 'border-red-400 focus:border-red-400' :
                  linkInfo.type === 'valid' ? 'border-green-400 focus:border-green-500' :
                  'border-gray-200 focus:border-green-500'
                )} />
              {linkInfo.type && (
                <div className={cn('flex items-center gap-1 mt-1 text-xs',
                  linkInfo.type === 'duplicate' ? 'text-red-500' :
                  linkInfo.type === 'valid' ? 'text-green-600' : 'text-amber-600'
                )}>
                  {linkInfo.type === 'valid' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {linkInfo.message}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Group Type</label>
              <select value={form.group_type} onChange={e => f('group_type', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500">
                <option value="">Select type</option>
                {GROUP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Members</label>
              <input type="number" value={form.group_members === 0 ? '' : form.group_members}
                onChange={e => f('group_members', parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Group Condition</label>
              <select value={form.group_condition} onChange={e => f('group_condition', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500">
                <option value="">Select condition</option>
                {GROUP_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading || linkInfo.type === 'duplicate'} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LinkedInGroupsPage() {
  const [groups, setGroups] = useState<LIGroup[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editGroup, setEditGroup] = useState<LIGroup | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const { data } = await api.get('/linkedin-groups'); setGroups(data); }
    catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete group?')) return;
    await api.delete(`/linkedin-groups/${id}`); toast.success('Deleted'); load();
  }

  const filtered = groups.filter(g => !search || g.group_name.toLowerCase().includes(search.toLowerCase()));

  const conditionColor = (c: string) =>
    c === 'Very Good' ? 'bg-emerald-50 text-emerald-700' :
    c === 'Good' ? 'bg-green-50 text-green-700' :
    c === 'Average' ? 'bg-yellow-50 text-yellow-700' :
    c === 'Below Average' ? 'bg-orange-50 text-orange-700' :
    'bg-red-50 text-red-600';

  return (
    <div>
      <TopBar title="LinkedIn Groups" subtitle={`${groups.length} groups`}
        actions={
          <button onClick={() => { setEditGroup(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl">
            <Plus size={16} /> Add Group
          </button>
        } />

      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-green-600" /></div> : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Group Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Members</th>
                  <th className="px-4 py-3 text-left">Condition</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-gray-400">No LinkedIn groups found</td></tr>}
                {filtered.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{g.group_name}</span>
                        {g.group_link && (
                          <a href={g.group_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{g.group_type || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{g.group_members?.toLocaleString() || '0'}</td>
                    <td className="px-4 py-3">
                      {g.group_condition && (
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', conditionColor(g.group_condition))}>
                          {g.group_condition}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{g.added_by_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditGroup(g); setShowModal(true); }} className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-500/10 rounded-lg transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => del(g.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} group={editGroup} groups={groups} onSaved={load} />}
    </div>
  );
}
