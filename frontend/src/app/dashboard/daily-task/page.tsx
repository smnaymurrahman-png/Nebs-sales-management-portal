'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, Clock, Sun, Moon, Sunrise } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
type Shift = 'Morning' | 'Evening' | 'Day';
interface DailyTask { id: string; title: string; content: string; task_date: string; creator_name: string }

// ─── Shift data (from PDF documents) ─────────────────────────────────────────
const SHIFT_SLOTS: Record<'Morning' | 'Evening', { slot: string; time: string; activity: string }[]> = {
  Morning: [
    { slot: 'Slot A', time: '10:00 PM – 11:00 PM', activity: 'Template making + Story post' },
    { slot: 'Slot B', time: '11:00 PM – 12:00 AM', activity: 'Facebook & LinkedIn posting' },
    { slot: 'Slot C', time: '12:00 AM – 1:00 AM',  activity: 'Group posting + Invitations' },
    { slot: 'Slot D', time: '1:00 AM – 2:00 AM',   activity: 'WhatsApp + Telegram tasks' },
  ],
  Evening: [
    { slot: 'Slot A', time: '4:00 PM – 5:00 PM', activity: 'Template making + Story post' },
    { slot: 'Slot B', time: '5:00 PM – 6:00 PM', activity: 'Facebook & LinkedIn posting' },
    { slot: 'Slot C', time: '7:00 PM – 8:00 PM', activity: 'Group posting + Invitations' },
    { slot: 'Slot D', time: '8:00 PM – 9:00 PM', activity: 'WhatsApp + Telegram tasks' },
  ],
};

const FB_GROUP_EXAMPLES: Record<'Morning' | 'Evening', { type: string; example: string }[]> = {
  Morning: [
    { type: 'Targeted database group',      example: 'Email Marketing Data and leads' },
    { type: 'Group for all database',       example: 'B2C/B2B Email Data and leads buy/sell' },
    { type: 'Campaign/data everything group', example: 'Email Marketing / Call Gen / Blaster community' },
    { type: 'Work proof or review group',   example: 'The Leads Publisher (work proof)' },
  ],
  Evening: [
    { type: 'Targeted database group',      example: 'Telemarketing Data and leads' },
    { type: 'Group for all database',       example: 'Data and leads buy/sell' },
    { type: 'Campaign/data everything group', example: 'Call center / Campaign / VOIP community' },
    { type: 'Work proof or review group',   example: 'The Leads Publisher (work proof)' },
  ],
};

const STORY_TYPES = [
  'Limited-Time Offers — discounts, combo deals, special offers',
  'Payment Proofs — successful client payment screenshots',
  'Client Conversations — blurred numbers showing interest or success',
  'Client Reviews / Testimonials — client feedback and opinions',
  'Negative Marketing — before/after comparisons, fake seller/buyer stories',
  'Announcements — new service launches, delivery updates, offer deadlines',
  'Database Updates — new entries, fresh uploads, newly verified leads',
];

// ─── Shared UI components ─────────────────────────────────────────────────────
function SectionCard({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className={cn('text-sm font-semibold uppercase tracking-wider', accent)}>{title}</h3>
      {children}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
          <span className="text-violet-400 mt-0.5 flex-shrink-0">•</span>{item}
        </li>
      ))}
    </ul>
  );
}

function MiniTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {headers.map(h => <th key={h} className="pb-2 pr-6 text-left text-xs text-slate-400 uppercase tracking-wider">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j} className="py-2 pr-6 text-slate-300 text-sm">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Shift task guide renderer ────────────────────────────────────────────────
function ShiftGuide({ shift }: { shift: Shift }) {
  const isDay = shift === 'Day';
  const slotsA = SHIFT_SLOTS.Morning;
  const slotsB = SHIFT_SLOTS.Evening;
  const displaySlots = isDay ? [...slotsB, ...slotsA] : SHIFT_SLOTS[shift as 'Morning' | 'Evening'];

  const slotColor = shift === 'Morning' ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
    : shift === 'Evening' ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
    : 'bg-violet-500/15 border-violet-500/30 text-violet-300';

  const accentColor = shift === 'Morning' ? 'text-amber-300'
    : shift === 'Evening' ? 'text-blue-300'
    : 'text-violet-300';

  const groupExamples = isDay
    ? [...FB_GROUP_EXAMPLES.Evening, ...FB_GROUP_EXAMPLES.Morning]
    : FB_GROUP_EXAMPLES[shift as 'Morning' | 'Evening'];

  return (
    <div className="space-y-5 p-6">
      {/* Schedule */}
      <SectionCard title="Daily Schedule" accent={accentColor}>
        {isDay && (
          <p className="text-xs text-slate-500 -mt-2">Day shift combines Evening (4 PM–9 PM) + Morning (10 PM–2 AM) schedules.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {displaySlots.map(({ slot, time, activity }) => (
            <div key={slot + time} className={cn('flex items-start gap-3 p-3 rounded-xl border', slotColor)}>
              <Clock size={15} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{slot}</p>
                <p className="text-xs opacity-75 mt-0.5">{time}</p>
                <p className="text-xs mt-1 text-white/90">{activity}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Template Making */}
      <SectionCard title="Template Making" accent={accentColor}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Facebook Template Making</p>
            <Bullets items={[
              'Create minimum 1 Facebook post template for each ID or Page.',
              'Create minimum 1 Story template for each ID or Page.',
            ]} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Template Distribution by Page</p>
            <MiniTable
              headers={['Page', 'Template 1', 'Template 2']}
              rows={[['Page 1','Primary Database','Secondary Database'],['Page 2','Primary Database','Secondary Database'],['Page 3','Primary Database','Secondary Database'],['Page 4','Primary Database','Secondary Database']]}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Story Templates — 3 Total (one per platform)</p>
            <MiniTable
              headers={['#', 'Platform', 'Story Type']}
              rows={[['1','Facebook Pages','Page story post'],['2','Business WhatsApp','WA status/story post'],['3','Telegram','Telegram story post']]}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Story Content Types</p>
            <Bullets items={STORY_TYPES} />
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl">
            <span className="text-amber-400 font-bold text-xs flex-shrink-0">⚠</span>
            <p className="text-xs text-amber-300">Post story immediately at shift start — before sending any greeting messages.</p>
          </div>
        </div>
      </SectionCard>

      {/* Facebook Tasks */}
      <SectionCard title="Facebook Tasks" accent={accentColor}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">A. Page Wall Posting</p>
            <Bullets items={[
              'Post on the wall of each Page — total 4 Pages.',
              'Write a different caption for each Page — do not copy-paste the same content.',
            ]} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">B. Group Posting</p>
            <MiniTable
              headers={['Page', 'Daily Posts', 'Rule']}
              rows={[['Page 1','10–15 group posts','5 min gap between posts'],['Page 2','10–15 group posts','5 min gap between posts'],['Page 3','10–15 group posts','5 min gap between posts'],['Page 4','10–15 group posts','5 min gap between posts']]}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">C. Group Invitations</p>
            <Bullets items={['Send 20 invitations per Group.', 'Total daily target: 200 invitations combined.']} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">D. Facebook Group Maintenance</p>
            <MiniTable headers={['Group Type', 'Example']} rows={groupExamples.map(g => [g.type, g.example])} />
            <div className="mt-3">
              <Bullets items={['Delete spam posts.', 'Maintain group rules.', 'Keep welcome post updated.', 'Ban irrelevant members.', 'Maintain scheduled posts.']} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* LinkedIn Tasks */}
      <SectionCard title="LinkedIn Tasks" accent={accentColor}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Personal Account</p>
            <MiniTable
              headers={['Task', 'Daily Target', 'Details']}
              rows={[
                ['Post ready + template','Minimum 3 posts','Prepare posts with templates'],
                ['Post publish','3 posts/day','Publish to LinkedIn account'],
                ['Group posting','All relevant groups','Post in targeted LinkedIn groups'],
                ['Connection requests','Minimum 20/day','Send to targeted clients or accounts'],
                ['Scroll + comment','10–15 minutes','Leave meaningful comments in relevant places'],
              ]}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">LinkedIn Page</p>
            <Bullets items={['Send follow invites — minimum 20/day.', 'Post all content on the Page.', 'Keep welcome post, pin post, and About section updated.']} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">LinkedIn Group</p>
            <Bullets items={['Maintain minimum 1 own group.', 'Send 15 invitations/day to your own group.', 'Post daily in your own group and team members\' groups.']} />
          </div>
        </div>
      </SectionCard>

      {/* WhatsApp Tasks */}
      <SectionCard title="WhatsApp Tasks" accent={accentColor}>
        <MiniTable
          headers={['Task', 'Daily Target', 'Details']}
          rows={[
            ['WhatsApp Group Maintain','All groups','Keep groups active and clean'],
            ['WhatsApp Group Posting','All groups','Post relevant content in every group'],
            ['WhatsApp Story','Every WA account','Post story at very start of shift'],
            ['Daily Conversation','Minimum 10 people','Have daily conversations with 10 clients'],
          ]}
        />
      </SectionCard>

      {/* Telegram Tasks */}
      <SectionCard title="Telegram Tasks" accent={accentColor}>
        <MiniTable
          headers={['Task', 'Details']}
          rows={[
            ['Telegram Group Posting','Post daily in all targeted Telegram groups'],
            ['Client Greeting Message','Send greeting messages to clients every day'],
          ]}
        />
      </SectionCard>
    </div>
  );
}

// ─── Post Modal ───────────────────────────────────────────────────────────────
function PostModal({ onClose, task, onSaved }: { onClose: () => void; task?: DailyTask | null; onSaved: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ title: task?.title || '', content: task?.content || '', task_date: task?.task_date?.split('T')[0] || today });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (task) await api.put(`/daily-task/${task.id}`, form);
      else await api.post('/daily-task', form);
      toast.success(task ? 'Updated' : 'Created'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl animate-slide-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">{task ? 'Edit Post' : 'New Team Post'}</h2>
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

// ─── Main page ────────────────────────────────────────────────────────────────
const SHIFT_META: Record<Shift, { label: string; icon: React.ReactNode; color: string; badge: string }> = {
  Morning: { label: 'Morning Shift (A)', icon: <Moon size={14} />, color: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  Evening: { label: 'Evening Shift (B)', icon: <Sunrise size={14} />, color: 'text-blue-300',  badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  Day:     { label: 'Day Shift',         icon: <Sun size={14} />,     color: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

export default function DailyTaskPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role !== 'user';
  const userShift = (user?.shift as Shift) || 'Morning';

  const [tab, setTab] = useState<'shift' | 'posts'>('shift');
  const [viewShift, setViewShift] = useState<Shift>(userShift);

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
    if (!confirm('Delete this post?')) return;
    await api.delete(`/daily-task/${id}`); toast.success('Deleted'); setSelected(null); load();
  }

  const idx = tasks.findIndex(t => t.id === selected?.id);
  const meta = SHIFT_META[viewShift];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar title="Daily Task" subtitle="Shift guide & team posts"
        actions={
          <div className="flex items-center gap-3">
            <span className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium', SHIFT_META[userShift].badge)}>
              {SHIFT_META[userShift].icon} {SHIFT_META[userShift].label}
            </span>
            {isAdmin && tab === 'posts' && (
              <button onClick={() => { setEditTask(null); setShowModal(true); }} className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl">
                <Plus size={16} /> New Post
              </button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="border-b border-slate-800 px-6 flex gap-1 flex-shrink-0">
        <button onClick={() => setTab('shift')}
          className={cn('px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
            tab === 'shift' ? 'border-violet-500 text-violet-300' : 'border-transparent text-slate-400 hover:text-white')}>
          My Shift Tasks
        </button>
        <button onClick={() => setTab('posts')}
          className={cn('px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
            tab === 'posts' ? 'border-violet-500 text-violet-300' : 'border-transparent text-slate-400 hover:text-white')}>
          Team Posts {tasks.length > 0 && <span className="ml-1.5 text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full">{tasks.length}</span>}
        </button>
      </div>

      {/* Shift Tasks Tab */}
      {tab === 'shift' && (
        <div className="flex-1 overflow-y-auto">
          {/* Shift switcher — admin only */}
          {isAdmin && (
            <div className="flex gap-2 px-6 pt-4">
              {(['Morning', 'Evening', 'Day'] as Shift[]).map(s => (
                <button key={s} onClick={() => setViewShift(s)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors',
                    viewShift === s ? SHIFT_META[s].badge : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white')}>
                  {SHIFT_META[s].icon} {s}
                </button>
              ))}
            </div>
          )}
          <ShiftGuide shift={isAdmin ? viewShift : userShift} />
        </div>
      )}

      {/* Team Posts Tab */}
      {tab === 'posts' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar list */}
          <div className="w-64 border-r border-slate-800 overflow-y-auto p-3 space-y-1 flex-shrink-0">
            {loading && <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-violet-400" /></div>}
            {!loading && tasks.length === 0 && <p className="text-sm text-slate-500 p-2">No posts yet</p>}
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
                    <p className="text-sm text-slate-400 mt-1">{formatDate(selected.task_date)} · Posted by {selected.creator_name}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditTask(selected); setShowModal(true); }} className="p-2 text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => del(selected.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{selected.content}</pre>
                </div>
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
                <p>Select a post from the list</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && <PostModal onClose={() => setShowModal(false)} task={editTask} onSaved={load} />}
    </div>
  );
}
