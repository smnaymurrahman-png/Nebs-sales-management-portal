'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const PAGE_STATUS_COLORS: Record<string, string> = {
  New: 'bg-slate-700 text-slate-300',
  Active: 'bg-emerald-500/20 text-emerald-300',
  Disabled: 'bg-orange-500/20 text-orange-300',
  Restricted: 'bg-red-500/20 text-red-400',
};

interface FBPageId {
  id: string; page_name: string; page_link: string; page_id: string;
  fb_email: string; fb_password: string; page_status: string;
  connected_whatsapp: string; page_likes: number; remarks: string;
  added_by_name: string;
}

function Modal({ onClose, item, onSaved }: { onClose: () => void; item?: FBPageId | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    page_name: item?.page_name || '',
    page_link: item?.page_link || '',
    page_id: item?.page_id || '',
    fb_email: item?.fb_email || '',
    fb_password: item?.fb_password || '',
    page_status: item?.page_status || 'New',
    connected_whatsapp: item?.connected_whatsapp || '',
    page_likes: item?.page_likes ?? 0,
    remarks: item?.remarks || '',
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (item) await api.put(`/facebook-page-ids/${item.id}`, form);
      else await api.post('/facebook-page-ids', form);
      toast.success(item ? 'Updated' : 'Added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  function f(key: string, val: string | number) { setForm(p => ({ ...p, [key]: val })); }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h2 className="font-semibold text-white">{item ? 'Edit Facebook Page ID' : 'Add Facebook Page ID'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Page Name *</label>
              <input value={form.page_name} onChange={e => f('page_name', e.target.value)} required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Page Link</label>
              <input value={form.page_link} onChange={e => f('page_link', e.target.value)} placeholder="https://facebook.com/..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Page ID</label>
              <input value={form.page_id} onChange={e => f('page_id', e.target.value)} placeholder="Numeric page ID"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Facebook Email</label>
              <input value={form.fb_email} onChange={e => f('fb_email', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Password</label>
              <input value={form.fb_password} onChange={e => f('fb_password', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <select value={form.page_status} onChange={e => f('page_status', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                <option>New</option><option>Active</option><option>Disabled</option><option>Restricted</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Connected WhatsApp</label>
              <input value={form.connected_whatsapp} onChange={e => f('connected_whatsapp', e.target.value)} placeholder="+880..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Page Likes</label>
              <input type="number" min={0} value={form.page_likes} onChange={e => f('page_likes', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Remarks</label>
            <textarea value={form.remarks} onChange={e => f('remarks', e.target.value)} rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
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

export default function FacebookPageIdsPage() {
  const [items, setItems] = useState<FBPageId[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<FBPageId | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const { data } = await api.get('/facebook-page-ids'); setItems(data); }
    catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete this Facebook Page ID?')) return;
    await api.delete(`/facebook-page-ids/${id}`); toast.success('Deleted'); load();
  }

  const filtered = items.filter(i =>
    (!search || i.page_name.toLowerCase().includes(search.toLowerCase()) ||
      i.page_id?.includes(search) || i.fb_email?.includes(search)) &&
    (!filterStatus || i.page_status === filterStatus)
  );

  const counts = { New: 0, Active: 0, Disabled: 0, Restricted: 0 };
  items.forEach(i => { if (i.page_status in counts) counts[i.page_status as keyof typeof counts]++; });

  return (
    <div>
      <TopBar title="Facebook Page IDs" subtitle={`${items.length} pages`}
        actions={
          <button onClick={() => { setEditItem(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl">
            <Plus size={16} /> Add Page ID
          </button>
        } />

      <div className="p-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(counts).map(([status, count]) => (
            <button key={status} onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
              className={cn('px-3 py-1 rounded-xl text-xs font-medium border transition-colors',
                filterStatus === status ? PAGE_STATUS_COLORS[status] + ' border-current' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white')}>
              {status} · {count}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, page ID, email..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
            <option value="">All Status</option>
            <option>New</option><option>Active</option><option>Disabled</option><option>Restricted</option>
          </select>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-violet-400" /></div> : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Page Name</th>
                  <th className="px-4 py-3 text-left">Page ID</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Connected WA</th>
                  <th className="px-4 py-3 text-left">Likes</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-slate-500">No Facebook Page IDs found</td></tr>}
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{item.page_name}</span>
                        {item.page_link && (
                          <a href={item.page_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      {item.remarks && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{item.remarks}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{item.page_id || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{item.fb_email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', PAGE_STATUS_COLORS[item.page_status] || 'bg-slate-700 text-slate-300')}>
                        {item.page_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{item.connected_whatsapp || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{item.page_likes?.toLocaleString() ?? 0}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{item.added_by_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => del(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} item={editItem} onSaved={load} />}
    </div>
  );
}
