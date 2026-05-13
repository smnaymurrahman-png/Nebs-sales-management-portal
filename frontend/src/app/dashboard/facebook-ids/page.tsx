'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn, FB_STATUS_COLORS } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FBId {
  id: string; facebook_name: string; facebook_id_link: string; facebook_email: string;
  facebook_password: string; fb_id_status: string; connected_whatsapp: string;
  friends_count: number; added_by_name: string;
}

function Modal({ onClose, item, onSaved }: { onClose: () => void; item?: FBId | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    facebook_name: item?.facebook_name || '', facebook_id_link: item?.facebook_id_link || '',
    facebook_email: item?.facebook_email || '', facebook_password: item?.facebook_password || '',
    fb_id_status: item?.fb_id_status || 'New', connected_whatsapp: item?.connected_whatsapp || '',
    friends_count: item?.friends_count || 0,
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (item) await api.put(`/facebook-ids/${item.id}`, form);
      else await api.post('/facebook-ids', form);
      toast.success(item ? 'Updated' : 'Added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg animate-slide-up">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{item ? 'Edit Facebook ID' : 'Add Facebook ID'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Facebook Name *</label>
              <input value={form.facebook_name} onChange={e => setForm(f => ({ ...f, facebook_name: e.target.value }))} required
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Profile Link</label>
              <input value={form.facebook_id_link} onChange={e => setForm(f => ({ ...f, facebook_id_link: e.target.value }))}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Facebook Email</label>
              <input value={form.facebook_email} onChange={e => setForm(f => ({ ...f, facebook_email: e.target.value }))}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Password</label>
              <input value={form.facebook_password} onChange={e => setForm(f => ({ ...f, facebook_password: e.target.value }))}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select value={form.fb_id_status} onChange={e => setForm(f => ({ ...f, fb_id_status: e.target.value }))}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500">
                <option>New</option><option>Active</option><option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Connected WhatsApp</label>
              <input value={form.connected_whatsapp} onChange={e => setForm(f => ({ ...f, connected_whatsapp: e.target.value }))}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Friends Count</label>
              <input type="number" value={form.friends_count} onChange={e => setForm(f => ({ ...f, friends_count: Number(e.target.value) }))}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FacebookIdsPage() {
  const [items, setItems] = useState<FBId[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<FBId | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const { data } = await api.get('/facebook-ids'); setItems(data); }
    catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete this ID?')) return;
    await api.delete(`/facebook-ids/${id}`); toast.success('Deleted'); load();
  }

  const filtered = items.filter(i =>
    (!search || i.facebook_name.toLowerCase().includes(search.toLowerCase()) || i.facebook_email?.includes(search)) &&
    (!filterStatus || i.fb_id_status === filterStatus)
  );

  return (
    <div>
      <TopBar title="Facebook IDs" subtitle={`${items.length} IDs`}
        actions={
          <button onClick={() => { setEditItem(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl">
            <Plus size={16} /> Add ID
          </button>
        } />

      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500">
            <option value="">All Status</option>
            <option>New</option><option>Active</option><option>Disabled</option>
          </select>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-green-600" /></div> : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Facebook Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">WhatsApp</th>
                  <th className="px-4 py-3 text-left">Friends</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">No IDs found</td></tr>}
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{item.facebook_name}</span>
                        {item.facebook_id_link && (
                          <a href={item.facebook_id_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300"><ExternalLink size={12} /></a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.facebook_email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', FB_STATUS_COLORS[item.fb_id_status] || 'bg-gray-200 text-gray-600')}>{item.fb_id_status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.connected_whatsapp || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.friends_count?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{item.added_by_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-500/10 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => del(item.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
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
