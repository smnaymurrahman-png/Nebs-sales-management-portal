'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Instruction {
  id: string; title: string; content: string; category: string; sort_order: number; creator_name: string;
}

const CATEGORIES = ['Posting Instructions', 'LinkedIn Policy', 'Facebook Policy', 'Group Making', 'General'];

function Modal({ onClose, item, onSaved }: { onClose: () => void; item?: Instruction | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: item?.title || '', content: item?.content || '',
    category: item?.category || CATEGORIES[0], sort_order: item?.sort_order || 0,
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (item) await api.put(`/instructions/${item.id}`, form);
      else await api.post('/instructions', form);
      toast.success(item ? 'Updated' : 'Created'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h2 className="font-semibold text-white">{item ? 'Edit Instruction' : 'Add Instruction'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
              className="w-32 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Content *</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows={14}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 resize-none font-mono" />
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

const CATEGORY_COLORS: Record<string, string> = {
  'Posting Instructions': 'bg-violet-500/20 text-violet-300',
  'LinkedIn Policy': 'bg-blue-500/20 text-blue-300',
  'Facebook Policy': 'bg-sky-500/20 text-sky-300',
  'Group Making': 'bg-emerald-500/20 text-emerald-300',
  'General': 'bg-slate-700 text-slate-300',
};

export default function InstructionsPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role !== 'user';
  const [items, setItems] = useState<Instruction[]>([]);
  const [selected, setSelected] = useState<Instruction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Instruction | null>(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const { data } = await api.get('/instructions'); setItems(data); if (data.length && !selected) setSelected(data[0]); }
    catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete?')) return;
    await api.delete(`/instructions/${id}`); toast.success('Deleted'); setSelected(null); load();
  }

  const filtered = items.filter(i => !filter || i.category === filter);
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-violet-400" /></div>;

  return (
    <div>
      <TopBar title="Instructions" subtitle="Team guidelines and policies"
        actions={isAdmin && (
          <button onClick={() => { setEditItem(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl">
            <Plus size={16} /> Add
          </button>
        )} />

      <div className="flex h-[calc(100vh-73px)]">
        <div className="w-72 border-r border-slate-800 overflow-y-auto p-3 flex-shrink-0">
          <div className="mb-3">
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            {filtered.length === 0 && <p className="text-xs text-slate-500 px-2">No instructions</p>}
            {filtered.map(i => (
              <button key={i.id} onClick={() => setSelected(i)}
                className={cn('w-full text-left px-3 py-2.5 rounded-xl transition-colors', i.id === selected?.id ? 'bg-violet-600/20 border border-violet-500/30' : 'hover:bg-slate-800')}>
                <p className={cn('text-sm font-medium truncate', i.id === selected?.id ? 'text-violet-300' : 'text-white')}>{i.title}</p>
                {i.category && (
                  <span className={cn('text-xs px-1.5 py-0.5 rounded mt-1 inline-block', CATEGORY_COLORS[i.category] || 'bg-slate-700 text-slate-400')}>{i.category}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="p-6 max-w-3xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selected.title}</h2>
                  {selected.category && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full mt-2 inline-block', CATEGORY_COLORS[selected.category] || 'bg-slate-700 text-slate-400')}>
                      {selected.category}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditItem(selected); setShowModal(true); }} className="p-2 text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => del(selected.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{selected.content}</pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500"><p>Select an instruction</p></div>
          )}
        </div>
      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} item={editItem} onSaved={load} />}
    </div>
  );
}
