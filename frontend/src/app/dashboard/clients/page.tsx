'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn, CLIENT_TYPE_COLORS, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Client {
  id: string; client_name: string; whatsapp_number: string; data_requirements: string;
  type: string; quantity: number; sample_taken: number; order_completed: number;
  badge: string; last_message: string; remarks: string; added_by_name: string; created_at: string;
}

const BADGES = ['New Client', 'Old Client', 'VIP', 'Hot Lead', 'Cold Lead', 'Pending', 'Blacklisted'];

function Modal({ onClose, client, onSaved }: { onClose: () => void; client?: Client | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    client_name: client?.client_name || '', whatsapp_number: client?.whatsapp_number || '',
    data_requirements: client?.data_requirements || '', type: client?.type || 'Blaster',
    quantity: client?.quantity || 0, sample_taken: !!client?.sample_taken,
    order_completed: !!client?.order_completed, badge: client?.badge || '',
    last_message: client?.last_message || '', remarks: client?.remarks || '',
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (client) await api.put(`/clients/${client.id}`, form);
      else await api.post('/clients', form);
      toast.success(client ? 'Updated' : 'Created');
      onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  const field = (label: string, key: keyof typeof form, type = 'text', opts?: string[]) => (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      {opts ? (
        <select value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key] as string | number}
          onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h2 className="font-semibold text-white">{client ? 'Edit Client' : 'Add Client'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field('Client Name *', 'client_name')}
            {field('WhatsApp Number', 'whatsapp_number')}
            {field('Type *', 'type', 'text', ['Blaster', 'Reseller', 'Owner'])}
            {field('Quantity', 'quantity', 'number')}
          </div>
          {field('Data Requirements', 'data_requirements')}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Badge</label>
              <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                <option value="">No Badge</option>
                {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-4 pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.sample_taken} onChange={e => setForm(f => ({ ...f, sample_taken: e.target.checked }))} className="accent-violet-500" />
                <span className="text-sm text-slate-300">Sample Taken</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.order_completed} onChange={e => setForm(f => ({ ...f, order_completed: e.target.checked }))} className="accent-violet-500" />
                <span className="text-sm text-slate-300">Order Completed</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Last Message</label>
            <textarea value={form.last_message} onChange={e => setForm(f => ({ ...f, last_message: e.target.value }))} rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Remarks</label>
            <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} rows={2}
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const { data } = await api.get('/clients'); setClients(data); }
    catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete this client?')) return;
    await api.delete(`/clients/${id}`);
    toast.success('Deleted'); load();
  }

  const filtered = clients.filter(c =>
    (!search || c.client_name.toLowerCase().includes(search.toLowerCase()) || c.whatsapp_number?.includes(search)) &&
    (!filter || c.type === filter)
  );

  return (
    <div>
      <TopBar title="Clients" subtitle={`${clients.length} total clients`}
        actions={
          <button onClick={() => { setEditClient(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl">
            <Plus size={16} /> Add Client
          </button>
        } />

      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
            <option value="">All Types</option>
            <option>Blaster</option><option>Reseller</option><option>Owner</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-violet-400" /></div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">WhatsApp</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Badge</th>
                  <th className="px-4 py-3 text-center">Sample</th>
                  <th className="px-4 py-3 text-center">Order</th>
                  <th className="px-4 py-3 text-left">Added</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="py-12 text-center text-slate-500">No clients found</td></tr>
                )}
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{c.client_name}</p>
                      {c.data_requirements && <p className="text-xs text-slate-500 truncate max-w-[180px]">{c.data_requirements}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{c.whatsapp_number || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', CLIENT_TYPE_COLORS[c.type] || 'bg-slate-700 text-slate-300')}>{c.type}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{c.quantity}</td>
                    <td className="px-4 py-3">
                      {c.badge && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{c.badge}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.sample_taken ? <CheckCircle size={16} className="text-emerald-400 mx-auto" /> : <XCircle size={16} className="text-slate-600 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.order_completed ? <CheckCircle size={16} className="text-emerald-400 mx-auto" /> : <XCircle size={16} className="text-slate-600 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{c.added_by_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditClient(c); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => del(c.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} client={editClient} onSaved={load} />}
    </div>
  );
}
