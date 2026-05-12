'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, ExternalLink, ImageIcon, X } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn, CLIENT_TYPE_COLORS } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Client {
  id: string; client_name: string; whatsapp_number: string; whatsapp_link: string;
  data_requirements: string; type: string; quantity: number;
  sample_taken: number; order_completed: number; badge: string;
  last_message: string; last_message_image: string; remarks: string;
  added_by_name: string; created_at: string;
}

const BADGES = [
  'New Client', 'Old Client', 'VIP', 'Hot Lead', 'Cold Lead', 'Pending', 'Blacklisted',
  'WA Level 1', 'WA Level 2', 'WA Level 3', 'WA Level 4', 'WA Level 5',
];

const BADGE_COLORS: Record<string, string> = {
  'WA Level 1': 'bg-green-500/20 text-green-300',
  'WA Level 2': 'bg-green-500/20 text-green-300',
  'WA Level 3': 'bg-blue-500/20 text-blue-300',
  'WA Level 4': 'bg-violet-500/20 text-violet-300',
  'WA Level 5': 'bg-amber-500/20 text-amber-300',
};

function ImagePreview({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white bg-slate-800 rounded-full p-2"><X size={18} /></button>
      <img src={src} alt="Last message screenshot" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
    </div>
  );
}

function Modal({ onClose, client, onSaved }: { onClose: () => void; client?: Client | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    client_name: client?.client_name || '',
    whatsapp_number: client?.whatsapp_number || '',
    whatsapp_link: client?.whatsapp_link || '',
    data_requirements: client?.data_requirements || '',
    type: client?.type || 'Blaster',
    quantity: client?.quantity ?? 0,
    sample_taken: client?.sample_taken ?? 0,
    order_completed: client?.order_completed ?? 0,
    badge: client?.badge || '',
    last_message: client?.last_message || '',
    last_message_image: client?.last_message_image || '',
    remarks: client?.remarks || '',
  });
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, last_message_image: reader.result as string }));
    reader.readAsDataURL(file);
  }

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

  const inp = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input type={type} value={form[key] as string | number} placeholder={placeholder}
        min={type === 'number' ? 0 : undefined}
        onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value }))}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {previewImg && <ImagePreview src={previewImg} onClose={() => setPreviewImg(null)} />}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h2 className="font-semibold text-white">{client ? 'Edit Client' : 'Add Client'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {inp('Client Name *', 'client_name')}
            {inp('WhatsApp Number', 'whatsapp_number', 'text', '+880...')}
            {inp('WhatsApp Link', 'whatsapp_link', 'text', 'https://wa.me/...')}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                {['Blaster', 'Reseller', 'Owner'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {inp('Quantity', 'quantity', 'number')}
            {inp('Samples Taken', 'sample_taken', 'number')}
            {inp('Orders Completed', 'order_completed', 'number')}
          </div>

          {inp('Data Requirements', 'data_requirements')}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Badge</label>
            <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
              <option value="">No Badge</option>
              {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Last Message</label>
            <textarea value={form.last_message} onChange={e => setForm(f => ({ ...f, last_message: e.target.value }))} rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
            <div className="mt-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors">
                  <ImageIcon size={13} /> Upload Screenshot
                </button>
                {form.last_message_image && (
                  <div className="flex items-center gap-2">
                    <img src={form.last_message_image} alt="preview"
                      onClick={() => setPreviewImg(form.last_message_image)}
                      className="w-10 h-10 rounded-lg object-cover cursor-pointer border border-slate-700 hover:border-violet-500" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, last_message_image: '' }))}
                      className="text-slate-500 hover:text-red-400"><X size={14} /></button>
                  </div>
                )}
              </div>
            </div>
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
  const [previewImg, setPreviewImg] = useState<string | null>(null);

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
      {previewImg && <ImagePreview src={previewImg} onClose={() => setPreviewImg(null)} />}
      <TopBar title="Clients" subtitle={`${clients.length} total clients`}
        actions={
          <button onClick={() => { setEditClient(null); setShowModal(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl">
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">WhatsApp</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-center">Samples</th>
                  <th className="px-4 py-3 text-center">Orders</th>
                  <th className="px-4 py-3 text-left">Badge</th>
                  <th className="px-4 py-3 text-left">Msg</th>
                  <th className="px-4 py-3 text-left">Added</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="py-12 text-center text-slate-500">No clients found</td></tr>
                )}
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{c.client_name}</p>
                      {c.data_requirements && <p className="text-xs text-slate-500 truncate max-w-[160px]">{c.data_requirements}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-300 text-xs">{c.whatsapp_number || '—'}</p>
                      {c.whatsapp_link && (
                        <a href={c.whatsapp_link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-0.5">
                          <ExternalLink size={11} /> Open Chat
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', CLIENT_TYPE_COLORS[c.type] || 'bg-slate-700 text-slate-300')}>{c.type}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">{c.quantity}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs font-medium', (c.sample_taken ?? 0) > 0 ? 'text-emerald-400' : 'text-slate-600')}>
                        {c.sample_taken ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs font-medium', (c.order_completed ?? 0) > 0 ? 'text-blue-400' : 'text-slate-600')}>
                        {c.order_completed ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.badge && (
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', BADGE_COLORS[c.badge] || 'bg-amber-500/20 text-amber-300')}>
                          {c.badge}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.last_message_image && (
                        <img src={c.last_message_image} alt="msg"
                          onClick={() => setPreviewImg(c.last_message_image)}
                          className="w-8 h-8 rounded object-cover cursor-pointer hover:opacity-80 border border-slate-700" />
                      )}
                      {!c.last_message_image && c.last_message && (
                        <p className="text-xs text-slate-500 truncate max-w-[100px]">{c.last_message}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{c.added_by_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditClient(c); setShowModal(true); }}
                          className="p-1.5 text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => del(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
