'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Loader2, X } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FBId { id: string; facebook_name: string; facebook_id_link: string; facebook_email: string; facebook_password: string; fb_id_status: string; connected_whatsapp: string; friends_count: number; added_by_name: string }
interface WAId { id: string; whatsapp_name: string; whatsapp_number: string; whatsapp_link: string; wa_email: string; wa_password: string; wa_status: string; connected_fb_id: string; device: string; remarks: string; added_by_name: string }
interface FBPage { id: string; page_name: string; page_link: string; page_id: string; fb_email: string; fb_password: string; page_status: string; connected_whatsapp: string; page_likes: number; remarks: string; added_by_name: string }
interface LIProfile { id: string; profile_name: string; profile_link: string; li_email: string; li_password: string; connection_count: number; li_status: string; remarks: string; added_by_name: string }

// ─── Status color helpers ─────────────────────────────────────────────────────
const FB_STATUS: Record<string, string> = { New: 'bg-gray-100 text-gray-600', Active: 'bg-blue-50 text-blue-700', Disabled: 'bg-red-50 text-red-600' };
const WA_STATUS: Record<string, string> = { New: 'bg-gray-100 text-gray-600', Active: 'bg-emerald-50 text-emerald-700', Disabled: 'bg-orange-50 text-orange-700', Banned: 'bg-red-50 text-red-600' };
const PAGE_STATUS: Record<string, string> = { New: 'bg-gray-100 text-gray-600', Active: 'bg-emerald-50 text-emerald-700', Disabled: 'bg-orange-50 text-orange-700', Restricted: 'bg-red-50 text-red-600' };
const LI_STATUS: Record<string, string> = { Active: 'bg-blue-50 text-blue-700', Restricted: 'bg-orange-50 text-orange-700', Disabled: 'bg-red-50 text-red-600' };

// ─── Reusable field row ───────────────────────────────────────────────────────
function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-900 font-medium break-all">{value}</p>
    </div>
  );
}

// ─── Generic table wrapper ────────────────────────────────────────────────────
function Section({ title, count, onAdd, children }: { title: string; count: number; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-xl">
          <Plus size={13} /> Add
        </button>
      </div>
      {children}
    </div>
  );
}

// ─── Card list component ──────────────────────────────────────────────────────
function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Card({ children, onEdit, onDelete }: { children: React.ReactNode; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2.5 relative group">
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg"><Edit2 size={13} /></button>
        <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
      </div>
      {children}
    </div>
  );
}

// ─── Facebook ID Modal ────────────────────────────────────────────────────────
function FBIdModal({ onClose, item, onSaved }: { onClose: () => void; item?: FBId | null; onSaved: () => void }) {
  const [form, setForm] = useState({ facebook_name: item?.facebook_name || '', facebook_id_link: item?.facebook_id_link || '', facebook_email: item?.facebook_email || '', facebook_password: item?.facebook_password || '', fb_id_status: item?.fb_id_status || 'New', connected_whatsapp: item?.connected_whatsapp || '', friends_count: item?.friends_count ?? 0 });
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
  function f(k: string, v: string | number) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">{item ? 'Edit Facebook Profile' : 'Add Facebook Profile'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Name *</label><input value={form.facebook_name} onChange={e => f('facebook_name', e.target.value)} required className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Profile Link</label><input value={form.facebook_id_link} onChange={e => f('facebook_id_link', e.target.value)} placeholder="https://facebook.com/..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Status</label><select value={form.fb_id_status} onChange={e => f('fb_id_status', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500"><option>New</option><option>Active</option><option>Disabled</option></select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Email</label><input value={form.facebook_email} onChange={e => f('facebook_email', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Password</label><input value={form.facebook_password} onChange={e => f('facebook_password', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Connected WhatsApp</label><input value={form.connected_whatsapp} onChange={e => f('connected_whatsapp', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Friends Count</label><input type="number" value={form.friends_count === 0 ? '' : form.friends_count} onChange={e => f('friends_count', parseInt(e.target.value) || 0)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-60">{loading && <Loader2 size={13} className="animate-spin" />} Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── WhatsApp ID Modal ────────────────────────────────────────────────────────
function WAIdModal({ onClose, item, onSaved }: { onClose: () => void; item?: WAId | null; onSaved: () => void }) {
  const [form, setForm] = useState({ whatsapp_name: item?.whatsapp_name || '', whatsapp_number: item?.whatsapp_number || '', whatsapp_link: item?.whatsapp_link || '', wa_email: item?.wa_email || '', wa_password: item?.wa_password || '', wa_status: item?.wa_status || 'New', connected_fb_id: item?.connected_fb_id || '', device: item?.device || '', remarks: item?.remarks || '' });
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
  function f(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">{item ? 'Edit WhatsApp ID' : 'Add WhatsApp ID'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Name *</label><input value={form.whatsapp_name} onChange={e => f('whatsapp_name', e.target.value)} required className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Phone Number</label><input value={form.whatsapp_number} onChange={e => f('whatsapp_number', e.target.value)} placeholder="+880..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">WhatsApp Link</label><input value={form.whatsapp_link} onChange={e => f('whatsapp_link', e.target.value)} placeholder="wa.me/..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Status</label><select value={form.wa_status} onChange={e => f('wa_status', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500"><option>New</option><option>Active</option><option>Disabled</option><option>Banned</option></select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Email</label><input value={form.wa_email} onChange={e => f('wa_email', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Password</label><input value={form.wa_password} onChange={e => f('wa_password', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Connected FB ID</label><input value={form.connected_fb_id} onChange={e => f('connected_fb_id', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Device</label><input value={form.device} onChange={e => f('device', e.target.value)} placeholder="Samsung S23..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">Remarks</label><textarea value={form.remarks} onChange={e => f('remarks', e.target.value)} rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-60">{loading && <Loader2 size={13} className="animate-spin" />} Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Facebook Page Modal ──────────────────────────────────────────────────────
function FBPageModal({ onClose, item, onSaved }: { onClose: () => void; item?: FBPage | null; onSaved: () => void }) {
  const [form, setForm] = useState({ page_name: item?.page_name || '', page_link: item?.page_link || '', page_id: item?.page_id || '', fb_email: item?.fb_email || '', fb_password: item?.fb_password || '', page_status: item?.page_status || 'New', connected_whatsapp: item?.connected_whatsapp || '', page_likes: item?.page_likes ?? 0, remarks: item?.remarks || '' });
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (item) await api.put(`/facebook-page-ids/${item.id}`, form);
      else await api.post('/facebook-page-ids', form);
      toast.success(item ? 'Updated' : 'Added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }
  function f(k: string, v: string | number) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">{item ? 'Edit Facebook Page' : 'Add Facebook Page'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Page Name *</label><input value={form.page_name} onChange={e => f('page_name', e.target.value)} required className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Page Link</label><input value={form.page_link} onChange={e => f('page_link', e.target.value)} placeholder="https://facebook.com/..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Page ID</label><input value={form.page_id} onChange={e => f('page_id', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Status</label><select value={form.page_status} onChange={e => f('page_status', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500"><option>New</option><option>Active</option><option>Disabled</option><option>Restricted</option></select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Email</label><input value={form.fb_email} onChange={e => f('fb_email', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Password</label><input value={form.fb_password} onChange={e => f('fb_password', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Connected WhatsApp</label><input value={form.connected_whatsapp} onChange={e => f('connected_whatsapp', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Page Likes</label><input type="number" value={form.page_likes === 0 ? '' : form.page_likes} onChange={e => f('page_likes', parseInt(e.target.value) || 0)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">Remarks</label><textarea value={form.remarks} onChange={e => f('remarks', e.target.value)} rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-60">{loading && <Loader2 size={13} className="animate-spin" />} Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── LinkedIn Profile Modal ───────────────────────────────────────────────────
function LIModal({ onClose, item, onSaved }: { onClose: () => void; item?: LIProfile | null; onSaved: () => void }) {
  const [form, setForm] = useState({ profile_name: item?.profile_name || '', profile_link: item?.profile_link || '', li_email: item?.li_email || '', li_password: item?.li_password || '', connection_count: item?.connection_count ?? 0, li_status: item?.li_status || 'Active', remarks: item?.remarks || '' });
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (item) await api.put(`/linkedin-profiles/${item.id}`, form);
      else await api.post('/linkedin-profiles', form);
      toast.success(item ? 'Updated' : 'Added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }
  function f(k: string, v: string | number) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">{item ? 'Edit LinkedIn Profile' : 'Add LinkedIn Profile'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Profile Name *</label><input value={form.profile_name} onChange={e => f('profile_name', e.target.value)} required className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Profile Link</label><input value={form.profile_link} onChange={e => f('profile_link', e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Status</label><select value={form.li_status} onChange={e => f('li_status', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500"><option>Active</option><option>Restricted</option><option>Disabled</option></select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Email</label><input value={form.li_email} onChange={e => f('li_email', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Password</label><input value={form.li_password} onChange={e => f('li_password', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Connections</label><input type="number" value={form.connection_count === 0 ? '' : form.connection_count} onChange={e => f('connection_count', parseInt(e.target.value) || 0)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" /></div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">Remarks</label><textarea value={form.remarks} onChange={e => f('remarks', e.target.value)} rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-60">{loading && <Loader2 size={13} className="animate-spin" />} Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type TabKey = 'facebook' | 'whatsapp' | 'fb_pages' | 'linkedin';

const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: 'facebook', label: 'Facebook Profiles', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'whatsapp', label: 'WhatsApp IDs', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'fb_pages', label: 'Facebook Pages', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { key: 'linkedin', label: 'LinkedIn Profiles', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

export default function ProfilesPage() {
  const [tab, setTab] = useState<TabKey>('facebook');
  const [fbIds, setFbIds] = useState<FBId[]>([]);
  const [waIds, setWaIds] = useState<WAId[]>([]);
  const [fbPages, setFbPages] = useState<FBPage[]>([]);
  const [liProfiles, setLiProfiles] = useState<LIProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: TabKey; item?: any } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [fb, wa, fp, li] = await Promise.all([
        api.get('/facebook-ids'),
        api.get('/whatsapp-ids'),
        api.get('/facebook-page-ids'),
        api.get('/linkedin-profiles'),
      ]);
      setFbIds(fb.data); setWaIds(wa.data); setFbPages(fp.data); setLiProfiles(li.data);
    } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(type: TabKey, id: string) {
    if (!confirm('Delete this entry?')) return;
    const map: Record<TabKey, string> = { facebook: '/facebook-ids', whatsapp: '/whatsapp-ids', fb_pages: '/facebook-page-ids', linkedin: '/linkedin-profiles' };
    await api.delete(`${map[type]}/${id}`);
    toast.success('Deleted'); load();
  }

  const totalCount = fbIds.length + waIds.length + fbPages.length + liProfiles.length;

  return (
    <div>
      <TopBar title="My Profiles" subtitle={`${totalCount} total entries across all platforms`} />
      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('px-4 py-2 text-sm font-medium rounded-xl border transition-colors',
                tab === t.key ? t.color : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900')}>
              {t.label}
              <span className={cn('ml-2 text-xs px-1.5 py-0.5 rounded-full', tab === t.key ? 'bg-white/60' : 'bg-gray-100 text-gray-500')}>
                {t.key === 'facebook' ? fbIds.length : t.key === 'whatsapp' ? waIds.length : t.key === 'fb_pages' ? fbPages.length : liProfiles.length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-green-600" /></div>
        ) : (
          <>
            {/* Facebook Profiles */}
            {tab === 'facebook' && (
              <Section title="Facebook Profiles" count={fbIds.length} onAdd={() => setModal({ type: 'facebook' })}>
                {fbIds.length === 0 ? <p className="text-sm text-gray-400 py-4">No Facebook profiles added yet.</p> : (
                  <CardGrid>
                    {fbIds.map(item => (
                      <Card key={item.id} onEdit={() => setModal({ type: 'facebook', item })} onDelete={() => del('facebook', item.id)}>
                        <div className="flex items-start justify-between pr-16">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.facebook_name}</p>
                            {item.facebook_id_link && <a href={item.facebook_id_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5"><ExternalLink size={10} /> View Profile</a>}
                          </div>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full shrink-0', FB_STATUS[item.fb_id_status] || 'bg-gray-100 text-gray-600')}>{item.fb_id_status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                          <Field label="Email" value={item.facebook_email} />
                          <Field label="Password" value={item.facebook_password} />
                          <Field label="Connected WA" value={item.connected_whatsapp} />
                          <Field label="Friends" value={item.friends_count} />
                        </div>
                      </Card>
                    ))}
                  </CardGrid>
                )}
              </Section>
            )}

            {/* WhatsApp IDs */}
            {tab === 'whatsapp' && (
              <Section title="WhatsApp IDs" count={waIds.length} onAdd={() => setModal({ type: 'whatsapp' })}>
                {waIds.length === 0 ? <p className="text-sm text-gray-400 py-4">No WhatsApp IDs added yet.</p> : (
                  <CardGrid>
                    {waIds.map(item => (
                      <Card key={item.id} onEdit={() => setModal({ type: 'whatsapp', item })} onDelete={() => del('whatsapp', item.id)}>
                        <div className="flex items-start justify-between pr-16">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.whatsapp_name}</p>
                            <p className="text-xs text-gray-500">{item.whatsapp_number || '—'}</p>
                            {item.whatsapp_link && <a href={item.whatsapp_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-0.5"><ExternalLink size={10} /> Open Chat</a>}
                          </div>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full shrink-0', WA_STATUS[item.wa_status] || 'bg-gray-100 text-gray-600')}>{item.wa_status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                          <Field label="Email" value={item.wa_email} />
                          <Field label="Password" value={item.wa_password} />
                          <Field label="Connected FB ID" value={item.connected_fb_id} />
                          <Field label="Device" value={item.device} />
                        </div>
                        {item.remarks && <p className="text-xs text-gray-400 pt-1">{item.remarks}</p>}
                      </Card>
                    ))}
                  </CardGrid>
                )}
              </Section>
            )}

            {/* Facebook Pages */}
            {tab === 'fb_pages' && (
              <Section title="Facebook Pages" count={fbPages.length} onAdd={() => setModal({ type: 'fb_pages' })}>
                {fbPages.length === 0 ? <p className="text-sm text-gray-400 py-4">No Facebook pages added yet.</p> : (
                  <CardGrid>
                    {fbPages.map(item => (
                      <Card key={item.id} onEdit={() => setModal({ type: 'fb_pages', item })} onDelete={() => del('fb_pages', item.id)}>
                        <div className="flex items-start justify-between pr-16">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.page_name}</p>
                            {item.page_link && <a href={item.page_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5"><ExternalLink size={10} /> View Page</a>}
                          </div>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full shrink-0', PAGE_STATUS[item.page_status] || 'bg-gray-100 text-gray-600')}>{item.page_status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                          <Field label="Page ID" value={item.page_id} />
                          <Field label="Likes" value={item.page_likes} />
                          <Field label="Email" value={item.fb_email} />
                          <Field label="Password" value={item.fb_password} />
                          <Field label="Connected WA" value={item.connected_whatsapp} />
                        </div>
                        {item.remarks && <p className="text-xs text-gray-400 pt-1">{item.remarks}</p>}
                      </Card>
                    ))}
                  </CardGrid>
                )}
              </Section>
            )}

            {/* LinkedIn Profiles */}
            {tab === 'linkedin' && (
              <Section title="LinkedIn Profiles" count={liProfiles.length} onAdd={() => setModal({ type: 'linkedin' })}>
                {liProfiles.length === 0 ? <p className="text-sm text-gray-400 py-4">No LinkedIn profiles added yet.</p> : (
                  <CardGrid>
                    {liProfiles.map(item => (
                      <Card key={item.id} onEdit={() => setModal({ type: 'linkedin', item })} onDelete={() => del('linkedin', item.id)}>
                        <div className="flex items-start justify-between pr-16">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.profile_name}</p>
                            {item.profile_link && <a href={item.profile_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-0.5"><ExternalLink size={10} /> View Profile</a>}
                          </div>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full shrink-0', LI_STATUS[item.li_status] || 'bg-gray-100 text-gray-600')}>{item.li_status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                          <Field label="Email" value={item.li_email} />
                          <Field label="Password" value={item.li_password} />
                          <Field label="Connections" value={item.connection_count} />
                        </div>
                        {item.remarks && <p className="text-xs text-gray-400 pt-1">{item.remarks}</p>}
                      </Card>
                    ))}
                  </CardGrid>
                )}
              </Section>
            )}
          </>
        )}
      </div>

      {modal?.type === 'facebook' && <FBIdModal onClose={() => setModal(null)} item={modal.item} onSaved={load} />}
      {modal?.type === 'whatsapp' && <WAIdModal onClose={() => setModal(null)} item={modal.item} onSaved={load} />}
      {modal?.type === 'fb_pages' && <FBPageModal onClose={() => setModal(null)} item={modal.item} onSaved={load} />}
      {modal?.type === 'linkedin' && <LIModal onClose={() => setModal(null)} item={modal.item} onSaved={load} />}
    </div>
  );
}
