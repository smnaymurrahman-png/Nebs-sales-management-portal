'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DailyTask { id: string; title: string; content: string; task_date: string; creator_name: string }

function Modal({ onClose, task, onSaved }: { onClose: () => void; task?: DailyTask | null; onSaved: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ title: task?.title || '', content: task?.content || '', task_date: task?.task_date?.split('T')[0] || today });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (task) await api.put(`/daily-task/${task.id}`, form);
      else await api.post('/daily-task', form);
      toast.success(task ? 'Updated' : 'Created');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl animate-slide-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">{task ? 'Edit Task' : 'Create Daily Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Date</label>
              <input type="date" value={form.task_date} onChange={e => setForm(f => ({ ...f, task_date: e.target.value }))} required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Content</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows={12}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 resize-none font-mono"
              placeholder="Paste your daily task content here..." />
          </div>
          <div className="flex justify-end gap-3">
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

export default function DailyTaskPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role !== 'user';
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [selected, setSelected] = useState<DailyTask | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<DailyTask | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { data } = await api.get('/daily-task');
      setTasks(data);
      if (data.length && !selected) setSelected(data[0]);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/daily-task/${id}`);
    toast.success('Deleted');
    setSelected(null);
    load();
  }

  const idx = tasks.findIndex(t => t.id === selected?.id);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-violet-400" />
    </div>
  );

  return (
    <div>
      <TopBar title="Daily Task" subtitle="Team tasks and briefings"
        actions={isAdmin && (
          <button onClick={() => { setEditTask(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl">
            <Plus size={16} /> New Task
          </button>
        )} />

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar list */}
        <div className="w-64 border-r border-slate-800 overflow-y-auto p-3 space-y-1 flex-shrink-0">
          {tasks.length === 0 && <p className="text-sm text-slate-500 p-2">No tasks yet</p>}
          {tasks.map(t => (
            <button key={t.id} onClick={() => setSelected(t)}
              className={cn('w-full text-left px-3 py-2.5 rounded-xl transition-colors', t.id === selected?.id ? 'bg-violet-600/20 border border-violet-500/30' : 'hover:bg-slate-800')}>
              <p className={cn('text-sm font-medium truncate', t.id === selected?.id ? 'text-violet-300' : 'text-white')}>{t.title}</p>
              <p className="text-xs text-slate-500">{formatDate(t.task_date)}</p>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="p-6 max-w-3xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selected.title}</h2>
                  <p className="text-sm text-slate-400 mt-1">{formatDate(selected.task_date)} · Added by {selected.creator_name}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditTask(selected); setShowModal(true); }} className="p-2 text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => del(selected.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{selected.content}</pre>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button disabled={idx <= 0} onClick={() => setSelected(tasks[idx - 1])}
                  className="flex items-center gap-2 text-sm text-slate-400 disabled:opacity-30 hover:text-white transition-colors">
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-xs text-slate-500">{idx + 1} / {tasks.length}</span>
                <button disabled={idx >= tasks.length - 1} onClick={() => setSelected(tasks[idx + 1])}
                  className="flex items-center gap-2 text-sm text-slate-400 disabled:opacity-30 hover:text-white transition-colors">
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>Select a task from the list</p>
            </div>
          )}
        </div>
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} task={editTask} onSaved={load} />}
    </div>
  );
}
