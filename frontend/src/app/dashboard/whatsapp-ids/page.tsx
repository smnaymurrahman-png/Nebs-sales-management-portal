'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const WA_STATUS_COLORS: Record<string, string> = {
  New: 'bg-slate-700 text-slate-300',
  Active: 'bg-emerald-500/20 text-emerald-300',
  Disabled: 'bg-orange-500/20 text-orange-300',
  Banned: 'bg-red-500/20 text-red-400',
};

interface WAId {
  id: string; whatsapp_name: string; whatsapp_number: string; whatsapp_link: string;
  wa_email: string; wa_password: string; wa_status: string; connected_fb_id: string;
  device: string; remarks: string; added_by_name: string;
}

function Modal({ onClose, item, onSaved }: { onClose: () => void; item?: WAId | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    whatsapp_name: item?.whatsapp_name || '',
    whatsapp_number: item?.whatsapp_number || '',
    whatsapp_link: item?.whatsapp_link || '',
    wa_email: item?.wa_email || '',
    wa_password: item?.wa_password || '',
    wa_status: item?.wa_status || 'New',
    connected_fb_id: item?.connected_fb_id || '',
    device: item?.device || '',
    remarks: item?.remarks || '',
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (item) await api.put(`/whatsapp-ids/${item.id}`, form);
      else await api.post('/whatsapp-ids', form);
      toast.success(item ? 'Updated' : 'Added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  function f(key: string, val: string) { setForm(p => ({ ...p, [key]: val })); }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h2 className="font-semibold text-white">{item ? 'Edit WhatsApp ID' : 'Add WhatsApp ID'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">WhatsApp Name *</label>
              <input value={form.whatsapp_name} onChange={e => f('whatsapp_name', e.target.value)} required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
              <input value={form.whatsapp_number} onChange={e => f('whatsapp_number', e.target.value)} placeholder="+880..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">WhatsApp Link</label>
              <input value={form.whatsapp_link} onChange={e => f('whatsapp_link', e.target.value)} placeholder="wa.me/..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input value={form.wa_email} onChange={e => f('wa_email', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Password</label>
              <input value={form.wa_password} onChange={e => f('wa_password', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <select value={form.wa_status} onChange={e => f('wa_status', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                <option>New</option><option>Active</option><option>Disabled</option><option>Banned</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Connected Facebook ID</label>
              <input value={form.connected_fb_id} onChange={e => f('connected_fb_id', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Device</label>
              <input value={form.device} onChange={e => f('device', e.target.value)} placeholder="e.g. Samsung S23"
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

export default function WhatsAppIdsPage() {
  const [items, setItems] = useState<WAId[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<WAId | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const { data } = await api.get('/whatsapp-ids'); setItems(data); }
    catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete this WhatsApp ID?')) return;
    await api.delete(`/whatsapp-ids/${id}`); toast.success('Deleted'); load();
  }

  const filtered = items.filter(i =>
    (!search || i.whatsapp_name.toLowerCase().includes(search.toLowerCase()) ||
      i.whatsapp_number?.includes(search) || i.wa_email?.includes(search)) &&
    (!filterStatus || i.wa_status === filterStatus)
  );

  const counts = { New: 0, Active: 0, Disabled: 0, Banned: 0 };
  items.forEach(i => { if (i.wa_status in counts) counts[i.wa_status as keyof typeof counts]++; });

  return (
    <div>
      <TopBar title="WhatsApp IDs" subtitle={`${items.length} accounts`}
        actions={
          <button onClick={() => { setEditItem(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl">
            <Plus size={16} /> Add WA ID
          </button>
        } />

      <div className="p-6 space-y-4">
        {/* Status summary chips */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(counts).map(([status, count]) => (
            <button key={status} onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
              className={cn('px-3 py-1 rounded-xl text-xs font-medium border transition-colors',
                filterStatus === status ? WA_STATUS_COLORS[status] + ' border-current' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white')}>
              {status} · {count}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, number, email..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
            <option value="">All Status</option>
            <option>New</option><option>Active</option><option>Disabled</option><option>Banned</option>
          </select>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-violet-400" /></div> : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">WhatsApp Name</th>
                  <th className="px-4 py-3 text-left">Number</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Connected FB ID</th>
                  <th className="px-4 py-3 text-left">Device</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-slate-500">No WhatsApp IDs found</td></tr>}
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{item.whatsapp_name}</span>
                        {item.whatsapp_link && (
                          <a href={item.whatsapp_link} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      {item.remarks && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{item.remarks}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{item.whatsapp_number || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{item.wa_email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', WA_STATUS_COLORS[item.wa_status] || 'bg-slate-700 text-slate-300')}>
                        {item.wa_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{item.connected_fb_id || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{item.device || '—'}</td>
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
