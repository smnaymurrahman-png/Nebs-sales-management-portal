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
  sample_taken: number; order_completed: number;
  client_type: string; data_type: string;
  last_message: string; last_message_image: string; remarks: string;
  added_by_name: string; created_at: string;
}

const CLIENT_TYPES = [
  'New client', 'Sample provided', 'Important', 'Pending payment', 'Order completed',
  'Follow up', 'Spammer', 'No response', 'Old client', 'Refund Requested',
  'Replacement pending', 'Payment Issue', 'Problematic',
];

const DATA_TYPES = [
  'Email data', 'Gmail domain', 'MIX Domain', 'PAID domain', 'Crypto data',
  'Telemarketing data', 'Homeowner Data', 'SMS/WhatsApp data', 'Sweepstakes data',
  'B2B Data', 'Car Owner Data',
];

function parseMulti(val: string | null | undefined): string[] {
  if (!val) return [];
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

function MultiSelect({ label, options, value, onChange, accentClass }: {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  accentClass: string;
}) {
  const selected = parseMulti(value);
  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt];
    onChange(next.join(','));
  }
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-2">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            type="button"
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              'px-2.5 py-1 text-xs rounded-lg border transition-colors',
              selected.includes(opt)
                ? accentClass
                : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-gray-400 mt-1.5">{selected.length} selected</p>
      )}
    </div>
  );
}

function ImagePreview({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 text-gray-900 bg-gray-100 rounded-full p-2"><X size={18} /></button>
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
    client_type: client?.client_type || '',
    data_type: client?.data_type || '',
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
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type={type}
        value={type === 'number' && form[key] === 0 ? '' : form[key] as string | number}
        placeholder={placeholder}
        min={type === 'number' ? 0 : undefined}
        onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value }))}
        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {previewImg && <ImagePreview src={previewImg} onClose={() => setPreviewImg(null)} />}
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">{client ? 'Edit Client' : 'Add Client'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {inp('Client Name *', 'client_name')}
            {inp('WhatsApp Number', 'whatsapp_number', 'text', '+880...')}
            {inp('WhatsApp Link', 'whatsapp_link', 'text', 'https://wa.me/...')}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500">
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

          <MultiSelect
            label="Client Type"
            options={CLIENT_TYPES}
            value={form.client_type}
            onChange={val => setForm(f => ({ ...f, client_type: val }))}
            accentClass="bg-green-500/25 border-green-500/60 text-green-800"
          />

          <MultiSelect
            label="Data Type"
            options={DATA_TYPES}
            value={form.data_type}
            onChange={val => setForm(f => ({ ...f, data_type: val }))}
            accentClass="bg-blue-100 border-blue-400 text-blue-700"
          />

          <div>
            <label className="block text-xs text-gray-500 mb-1">Last Message</label>
            <textarea value={form.last_message} onChange={e => setForm(f => ({ ...f, last_message: e.target.value }))} rows={2}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 resize-none" />
            <div className="mt-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 rounded-lg transition-colors">
                  <ImageIcon size={13} /> Upload Screenshot
                </button>
                {form.last_message_image && (
                  <div className="flex items-center gap-2">
                    <img src={form.last_message_image} alt="preview"
                      onClick={() => setPreviewImg(form.last_message_image)}
                      className="w-10 h-10 rounded-lg object-cover cursor-pointer border border-gray-200 hover:border-green-500" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, last_message_image: '' }))}
                      className="text-gray-400 hover:text-red-400"><X size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Remarks</label>
            <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} rows={2}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 resize-none" />
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

function ChipList({ value, colorClass, max = 2 }: { value: string; colorClass: string; max?: number }) {
  const items = parseMulti(value);
  if (!items.length) return <span className="text-gray-400 text-xs">—</span>;
  const shown = items.slice(0, max);
  const rest = items.length - max;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map(t => (
        <span key={t} className={cn('text-xs px-1.5 py-0.5 rounded', colorClass)}>{t}</span>
      ))}
      {rest > 0 && <span className="text-xs text-gray-400">+{rest}</span>}
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
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl">
            <Plus size={16} /> Add Client
          </button>
        } />

      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500">
            <option value="">All Types</option>
            <option>Blaster</option><option>Reseller</option><option>Owner</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-green-600" /></div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">WhatsApp</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-center">Samples</th>
                  <th className="px-4 py-3 text-center">Orders</th>
                  <th className="px-4 py-3 text-left">Client Type</th>
                  <th className="px-4 py-3 text-left">Data Type</th>
                  <th className="px-4 py-3 text-left">Msg</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="py-12 text-center text-gray-400">No clients found</td></tr>
                )}
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.client_name}</p>
                      {c.data_requirements && <p className="text-xs text-gray-400 truncate max-w-[160px]">{c.data_requirements}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 text-xs">{c.whatsapp_number || '—'}</p>
                      {c.whatsapp_link && (
                        <a href={c.whatsapp_link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 mt-0.5">
                          <ExternalLink size={11} /> Open Chat
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', CLIENT_TYPE_COLORS[c.type] || 'bg-gray-200 text-gray-600')}>{c.type}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{c.quantity}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs font-medium', (c.sample_taken ?? 0) > 0 ? 'text-emerald-600' : 'text-gray-400')}>
                        {c.sample_taken ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs font-medium', (c.order_completed ?? 0) > 0 ? 'text-blue-600' : 'text-gray-400')}>
                        {c.order_completed ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ChipList value={c.client_type} colorClass="bg-green-500/15 text-green-700" max={2} />
                    </td>
                    <td className="px-4 py-3">
                      <ChipList value={c.data_type} colorClass="bg-blue-50 text-blue-700" max={2} />
                    </td>
                    <td className="px-4 py-3">
                      {c.last_message_image && (
                        <img src={c.last_message_image} alt="msg"
                          onClick={() => setPreviewImg(c.last_message_image)}
                          className="w-8 h-8 rounded object-cover cursor-pointer hover:opacity-80 border border-gray-200" />
                      )}
                      {!c.last_message_image && c.last_message && (
                        <p className="text-xs text-gray-400 truncate max-w-[100px]">{c.last_message}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditClient(c); setShowModal(true); }}
                          className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-500/10 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => del(c.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
