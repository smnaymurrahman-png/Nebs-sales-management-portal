'use client';
import { useState } from 'react';
import { Clock, Sun, Moon, Sunrise } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type Shift = 'Morning' | 'Evening' | 'Day';

const SHIFT_SLOTS: Record<Shift, { slot: string; time: string; activity: string }[]> = {
  Morning: [
    { slot: 'Slot A', time: '10:00 PM – 11:00 PM', activity: 'Template making + Story post' },
    { slot: 'Slot B', time: '11:00 PM – 12:00 AM', activity: 'Facebook & LinkedIn posting' },
    { slot: 'Slot C', time: '12:00 AM – 1:00 AM', activity: 'Group posting + Invitations' },
    { slot: 'Slot D', time: '1:00 AM – 2:00 AM', activity: 'WhatsApp + Telegram tasks' },
  ],
  Evening: [
    { slot: 'Slot A', time: '4:00 PM – 5:00 PM', activity: 'Template making + Story post' },
    { slot: 'Slot B', time: '5:00 PM – 6:00 PM', activity: 'Facebook & LinkedIn posting' },
    { slot: 'Slot C', time: '7:00 PM – 8:00 PM', activity: 'Group posting + Invitations' },
    { slot: 'Slot D', time: '8:00 PM – 9:00 PM', activity: 'WhatsApp + Telegram tasks' },
  ],
  Day: [
    { slot: 'Slot A', time: '10:00 AM – 11:00 AM', activity: 'Template making + Story post' },
    { slot: 'Slot B', time: '11:00 AM – 12:00 PM', activity: 'Facebook & LinkedIn posting' },
    { slot: 'Slot C', time: '12:00 PM – 1:00 PM', activity: 'Group posting + Invitations' },
    { slot: 'Slot D', time: '1:00 PM – 2:00 PM', activity: 'WhatsApp + Telegram tasks' },
    { slot: 'Slot E', time: '4:00 PM – 5:00 PM', activity: 'Template making + Story post' },
    { slot: 'Slot F', time: '5:00 PM – 6:00 PM', activity: 'Facebook & LinkedIn posting' },
    { slot: 'Slot G', time: '7:00 PM – 8:00 PM', activity: 'Group posting + Invitations' },
    { slot: 'Slot H', time: '8:00 PM – 9:00 PM', activity: 'WhatsApp + Telegram tasks' },
  ],
};

const FB_GROUP_EXAMPLES: Record<Shift, { type: string; example: string }[]> = {
  Morning: [
    { type: 'Targeted database group', example: 'Email Marketing Data and leads' },
    { type: 'Group for all database', example: 'B2C/B2B Email Data and leads buy/sell' },
    { type: 'Campaign/data everything group', example: 'Email Marketing / Call Gen / Blaster community' },
    { type: 'Work proof or review group', example: 'The Leads Publisher (work proof)' },
  ],
  Evening: [
    { type: 'Targeted database group', example: 'Telemarketing Data and leads' },
    { type: 'Group for all database', example: 'Data and leads buy/sell' },
    { type: 'Campaign/data everything group', example: 'Call center / Campaign / VOIP community' },
    { type: 'Work proof or review group', example: 'The Leads Publisher (work proof)' },
  ],
  Day: [
    { type: 'Targeted database group', example: 'Email Marketing / Telemarketing Data and leads' },
    { type: 'Group for all database', example: 'B2C/B2B Email Data and leads buy/sell' },
    { type: 'Campaign/data everything group', example: 'Email Marketing / Call Gen / Blaster / VOIP community' },
    { type: 'Work proof or review group', example: 'The Leads Publisher (work proof)' },
  ],
};

const STORY_TYPES = [
  'Limited-Time Offers — discount deals, combo deals, special offers',
  'Payment Proofs — successful client payment screenshots',
  'Client Conversations — blurred numbers showing interest or success',
  'Client Reviews / Testimonials — client feedback and opinions',
  'Negative Marketing — before/after comparisons, fake seller stories',
  'Announcements — new service launches, delivery updates, offer deadlines',
  'Database Updates — new entries, fresh uploads, newly verified leads',
];

const FB_MAINTENANCE = [
  'Delete spam posts',
  'Maintain group rules',
  'Keep welcome post updated',
  'Ban irrelevant members',
  'Maintain scheduled posts',
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-violet-300 mb-4 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
          <span className="text-violet-400 mt-0.5 flex-shrink-0">•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function TableGrid({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
            {headers.map(h => <th key={h} className="pb-2 pr-4 text-left">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 text-slate-300">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ShiftTasksPage() {
  const user = useAuthStore(s => s.user);
  const defaultShift: Shift = (user?.shift as Shift) || 'Morning';
  const [active, setActive] = useState<Shift>(defaultShift);

  const slots = SHIFT_SLOTS[active];
  const groupExamples = FB_GROUP_EXAMPLES[active];

  const tabs: { key: Shift; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'Morning', label: 'Morning Shift', icon: <Moon size={16} />, color: 'amber' },
    { key: 'Evening', label: 'Evening Shift', icon: <Sunrise size={16} />, color: 'blue' },
    { key: 'Day', label: 'Day Shift', icon: <Sun size={16} />, color: 'emerald' },
  ];

  const colorMap: Record<string, string> = {
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };
  const activeTab = tabs.find(t => t.key === active)!;

  return (
    <div>
      <TopBar title="Shift Daily Tasks" subtitle="Task schedule and guidelines by shift" />

      <div className="p-6 space-y-6">
        {/* Shift Tabs */}
        <div className="flex gap-3 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActive(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                active === tab.key ? colorMap[tab.color] : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              )}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Schedule Timeline */}
        <Section title={`${active} Shift — Daily Schedule`}>
          <div className="grid gap-3 sm:grid-cols-2">
            {slots.map(({ slot, time, activity }) => (
              <div key={slot} className={cn('flex items-start gap-3 p-3 rounded-xl border', colorMap[activeTab.color])}>
                <div className="flex-shrink-0">
                  <Clock size={16} className="mt-0.5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{slot}</p>
                  <p className="text-xs opacity-80 mt-0.5">{time}</p>
                  <p className="text-xs mt-1 text-white/90">{activity}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Template Making */}
        <Section title="Template Making">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Facebook Template Making</p>
              <BulletList items={[
                'Create minimum 1 Facebook post template for each ID or Page.',
                'Create minimum 1 Story template for each ID or Page.',
              ]} />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Page Template Distribution</p>
              <TableGrid
                headers={['Page', 'Template 1 — Data Type', 'Template 2 — Data Type']}
                rows={[
                  ['Page 1', 'Primary Database', 'Secondary Database'],
                  ['Page 2', 'Primary Database', 'Secondary Database'],
                  ['Page 3', 'Primary Database', 'Secondary Database'],
                  ['Page 4', 'Primary Database', 'Secondary Database'],
                ]}
              />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Story Template Making — 3 Total</p>
              <TableGrid
                headers={['#', 'Platform', 'Story Type']}
                rows={[
                  ['1', 'Facebook Pages', 'Page story post'],
                  ['2', 'Business WhatsApp', 'WA status/story post'],
                  ['3', 'Telegram', 'Telegram story post'],
                ]}
              />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Story Types</p>
              <BulletList items={STORY_TYPES} />
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <span className="text-amber-400 text-xs font-bold flex-shrink-0">⚠</span>
                <p className="text-xs text-amber-300">Story must be posted right at shift start — before sending any greeting messages.</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Facebook Tasks */}
        <Section title="Facebook Tasks">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">A. Page Wall Posting</p>
              <BulletList items={[
                'Post on the wall of each Page — total 4 Pages.',
                'Write a different caption for each Page — do not copy-paste the same content.',
              ]} />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">B. Group Posting</p>
              <TableGrid
                headers={['Page', 'Daily Group Posts', 'Rule']}
                rows={[
                  ['Page 1', '10–15 group posts', '5 min gap between each post'],
                  ['Page 2', '10–15 group posts', '5 min gap between each post'],
                  ['Page 3', '10–15 group posts', '5 min gap between each post'],
                  ['Page 4', '10–15 group posts', '5 min gap between each post'],
                ]}
              />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">C. Group Invitation</p>
              <BulletList items={[
                'Send 20 invitations to each Group.',
                'Total daily target: 200 invitations combined.',
              ]} />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">D. Facebook Group Maintenance</p>
              <p className="text-xs text-slate-500 mb-3">Keep your own groups always active and clean.</p>
              <div className="mb-3">
                <TableGrid
                  headers={['Group Type', 'Example']}
                  rows={groupExamples.map(g => [g.type, g.example])}
                />
              </div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Maintenance Checklist</p>
              <BulletList items={FB_MAINTENANCE} />
            </div>
          </div>
        </Section>

        {/* LinkedIn Tasks */}
        <Section title="LinkedIn Tasks">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Personal Account Tasks</p>
              <TableGrid
                headers={['Task', 'Daily Target', 'Details']}
                rows={[
                  ['Post ready + template', 'Minimum 3 posts', 'Prepare posts with templates'],
                  ['Post publish', '3 posts/day', 'Publish to LinkedIn account'],
                  ['Group posting', 'All relevant groups', 'Post in targeted LinkedIn groups'],
                  ['Connection requests', 'Minimum 20/day', 'Send to targeted clients or accounts'],
                  ['Scroll + comment', '10–15 minutes', 'Leave meaningful comments in relevant places'],
                ]}
              />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">LinkedIn Page Tasks</p>
              <BulletList items={[
                'Send follow invites — minimum 20 per day.',
                'Post all content on the Page.',
                'Maintain page: keep welcome post updated, set pin post, keep About section complete.',
              ]} />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">LinkedIn Group Tasks</p>
              <BulletList items={[
                'Maintain minimum 1 own group.',
                'Send 15 invitations per day to your own group.',
                'Post daily in your own group and in team members\' groups.',
              ]} />
            </div>
          </div>
        </Section>

        {/* WhatsApp Tasks */}
        <Section title="WhatsApp Tasks">
          <TableGrid
            headers={['Task', 'Daily Target', 'Details']}
            rows={[
              ['WhatsApp Group Maintain', 'All groups', 'Keep groups active and clean'],
              ['WhatsApp Group Posting', 'All groups', 'Post relevant content in every group'],
              ['WhatsApp Story', 'Every WA account', 'Post story at the very start of shift'],
              ['Daily Conversation', 'Minimum 10 people', 'Have daily conversations with 10 clients'],
            ]}
          />
        </Section>

        {/* Telegram Tasks */}
        <Section title="Telegram Tasks">
          <TableGrid
            headers={['Task', 'Details']}
            rows={[
              ['Telegram Group Posting', 'Post daily in all targeted Telegram groups'],
              ['Client Greeting Message', 'Send greeting messages to clients every day'],
            ]}
          />
        </Section>
      </div>
    </div>
  );
}
