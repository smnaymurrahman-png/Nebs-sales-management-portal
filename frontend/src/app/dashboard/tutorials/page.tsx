'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Play, Loader2, ExternalLink } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn, getYouTubeId, getYouTubeThumbnail } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Tutorial {
  id: string; title: string; description: string; video_url: string; category: string; creator_name: string; created_at: string;
}

const CATEGORIES = ['Getting Started', 'Sales Training', 'Facebook Marketing', 'WhatsApp Marketing', 'LinkedIn', 'Tools & Software', 'General'];

function Modal({ onClose, item, onSaved }: { onClose: () => void; item?: Tutorial | null; onSaved: () => void }) {
  const [form, setForm] = useState({ title: item?.title || '', description: item?.description || '', video_url: item?.video_url || '', category: item?.category || CATEGORIES[0] });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (item) await api.put(`/tutorials/${item.id}`, form);
      else await api.post('/tutorials', form);
      toast.success(item ? 'Updated' : 'Added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg animate-slide-up">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{item ? 'Edit Tutorial' : 'Add Tutorial'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Video URL * (YouTube or any link)</label>
            <input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} required placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
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

function TutorialCard({ t, isAdmin, onEdit, onDelete }: { t: Tutorial; isAdmin: boolean; onEdit: () => void; onDelete: () => void }) {
  const ytId = getYouTubeId(t.video_url);
  const thumb = ytId ? getYouTubeThumbnail(t.video_url) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors group">
      <a href={t.video_url} target="_blank" rel="noopener noreferrer" className="block relative">
        {thumb ? (
          <img src={thumb} alt={t.title} className="w-full aspect-video object-cover" />
        ) : (
          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
            <Play size={32} className="text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
            <Play size={20} className="text-gray-900" fill="white" />
          </div>
        </div>
      </a>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm truncate">{t.title}</h3>
            {t.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              {t.category && <span className="text-xs bg-green-500/15 text-green-700 px-1.5 py-0.5 rounded">{t.category}</span>}
              <span className="text-xs text-gray-400">by {t.creator_name}</span>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <a href={t.video_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
              <ExternalLink size={13} />
            </a>
            {isAdmin && (
              <>
                <button onClick={onEdit} className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-500/10 rounded-lg transition-colors"><Edit2 size={13} /></button>
                <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={13} /></button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TutorialsPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role !== 'user';
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const { data } = await api.get('/tutorials'); setTutorials(data); }
    catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete this tutorial?')) return;
    await api.delete(`/tutorials/${id}`); toast.success('Deleted'); load();
  }

  const filtered = tutorials.filter(t =>
    (!search || t.title.toLowerCase().includes(search.toLowerCase())) &&
    (!filter || t.category === filter)
  );
  const categories = [...new Set(tutorials.map(t => t.category).filter(Boolean))];

  return (
    <div>
      <TopBar title="Tutorials" subtitle={`${tutorials.length} videos`}
        actions={isAdmin && (
          <button onClick={() => { setEditItem(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl">
            <Plus size={16} /> Add Tutorial
          </button>
        )} />

      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tutorials..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-green-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No tutorials found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(t => (
              <TutorialCard key={t.id} t={t} isAdmin={isAdmin} onEdit={() => { setEditItem(t); setShowModal(true); }} onDelete={() => del(t.id)} />
            ))}
          </div>
        )}
      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} item={editItem} onSaved={load} />}
    </div>
  );
}
