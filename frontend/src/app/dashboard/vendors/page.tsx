'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, Loader2, Star, X, Send } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const VENDOR_TYPES = [
  'Blaster', 'RDP seller', 'API seller', 'Software seller', 'Calls Seller',
  'VOIP provider', 'CC route provider', 'Dialer provider', 'Call center', 'Campaign provider',
];

const VENDOR_TYPE_COLORS: Record<string, string> = {
  'Blaster': 'bg-orange-500/20 text-orange-300',
  'RDP seller': 'bg-purple-500/20 text-purple-300',
  'API seller': 'bg-blue-500/20 text-blue-300',
  'Software seller': 'bg-cyan-500/20 text-cyan-300',
  'Calls Seller': 'bg-green-500/20 text-green-300',
  'VOIP provider': 'bg-teal-500/20 text-teal-300',
  'CC route provider': 'bg-indigo-500/20 text-indigo-300',
  'Dialer provider': 'bg-green-500/15 text-green-700',
  'Call center': 'bg-pink-500/20 text-pink-300',
  'Campaign provider': 'bg-amber-500/20 text-amber-300',
};

interface Vendor {
  id: string; name: string; phone_number: string; whatsapp_link: string;
  telegram_id: string; vendor_type: string; country: string;
  avg_rating: string | null; rating_count: number; added_by_name: string;
}

interface Rating {
  id: string; rating: number; comment: string; rated_by_name: string; created_at: string;
}

function ratingColor(r: number) {
  if (r >= 8) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (r >= 5) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

function StarDisplay({ value, max = 10 }: { value: number; max?: number }) {
  const filled = Math.round(value);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={11} className={i < filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
      ))}
    </div>
  );
}

function RatingsModal({ vendor, onClose, onRated }: { vendor: Vendor; onClose: () => void; onRated: () => void }) {
  const user = useAuthStore(s => s.user);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/vendors/${vendor.id}/ratings`)
      .then(r => setRatings(r.data))
      .finally(() => setLoadingRatings(false));
  }, [vendor.id]);

  async function submitRating(e: React.FormEvent) {
    e.preventDefault();
    if (!myRating) { toast.error('Select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post(`/vendors/${vendor.id}/ratings`, { rating: myRating, comment });
      toast.success('Rating submitted');
      const r = await api.get(`/vendors/${vendor.id}/ratings`);
      setRatings(r.data);
      setMyRating(0); setComment('');
      onRated();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSubmitting(false); }
  }

  const display = hovered || myRating;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">{vendor.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
              {vendor.avg_rating && <span className="ml-2 text-amber-300">avg {parseFloat(vendor.avg_rating).toFixed(1)}/10</span>}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900"><X size={16} /></button>
        </div>

        {/* Existing ratings */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loadingRatings ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-green-600" /></div>
          ) : ratings.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No ratings yet. Be the first!</p>
          ) : (
            ratings.map(r => (
              <div key={r.id} className="bg-gray-100 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-lg border', ratingColor(r.rating))}>
                      {r.rating}/10
                    </span>
                    <StarDisplay value={r.rating} />
                  </div>
                  <span className="text-xs text-gray-400">{r.rated_by_name}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))
          )}
        </div>

        {/* Submit rating */}
        <form onSubmit={submitRating} className="p-5 border-t border-gray-200 space-y-3 shrink-0">
          <p className="text-xs text-gray-500 font-medium">Your Rating</p>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => {
              const val = i + 1;
              return (
                <button
                  key={val}
                  type="button"
                  onMouseEnter={() => setHovered(val)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setMyRating(val)}
                  className="flex-1 flex items-center justify-center"
                >
                  <Star
                    size={20}
                    className={cn(
                      'transition-colors',
                      val <= display ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-gray-400'
                    )}
                  />
                </button>
              );
            })}
          </div>
          {display > 0 && (
            <p className="text-xs text-center text-amber-300">{display}/10</p>
          )}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment (optional)..."
            rows={2}
            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 resize-none"
          />
          <div className="flex justify-end">
            <button type="submit" disabled={submitting || !myRating}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50">
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VendorModal({ onClose, vendor, onSaved }: { onClose: () => void; vendor?: Vendor | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: vendor?.name || '',
    phone_number: vendor?.phone_number || '',
    whatsapp_link: vendor?.whatsapp_link || '',
    telegram_id: vendor?.telegram_id || '',
    vendor_type: vendor?.vendor_type || '',
    country: vendor?.country || '',
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (vendor) await api.put(`/vendors/${vendor.id}`, form);
      else await api.post('/vendors', form);
      toast.success(vendor ? 'Updated' : 'Added'); onSaved(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  function f(key: string, val: string) { setForm(p => ({ ...p, [key]: val })); }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg animate-slide-up">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{vendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Vendor Name *</label>
              <input value={form.name} onChange={e => f('name', e.target.value)} required
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone Number</label>
              <input value={form.phone_number} onChange={e => f('phone_number', e.target.value)} placeholder="+1..."
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">WhatsApp Link</label>
              <input value={form.whatsapp_link} onChange={e => f('whatsapp_link', e.target.value)} placeholder="wa.me/..."
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Telegram ID</label>
              <input value={form.telegram_id} onChange={e => f('telegram_id', e.target.value)} placeholder="@username"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Vendor Type</label>
              <select value={form.vendor_type} onChange={e => f('vendor_type', e.target.value)}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500">
                <option value="">Select type</option>
                {VENDOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Country</label>
              <input value={form.country} onChange={e => f('country', e.target.value)} placeholder="e.g. Bangladesh"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
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

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [ratingVendor, setRatingVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const { data } = await api.get('/vendors'); setVendors(data); }
    catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Delete this vendor?')) return;
    await api.delete(`/vendors/${id}`); toast.success('Deleted'); load();
  }

  const filtered = vendors.filter(v =>
    (!search || v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.phone_number?.includes(search) || v.country?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || v.vendor_type === filterType)
  );

  return (
    <div>
      <TopBar title="Vendor List" subtitle={`${vendors.length} vendors`}
        actions={
          <button onClick={() => { setEditVendor(null); setShowModal(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl">
            <Plus size={16} /> Add Vendor
          </button>
        } />

      <div className="p-6 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, country..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500">
            <option value="">All Types</option>
            {VENDOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-green-600" /></div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Vendor</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Country</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">No vendors found</td></tr>
                )}
                {filtered.map(v => {
                  const avg = v.avg_rating ? parseFloat(v.avg_rating) : null;
                  return (
                    <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{v.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        {v.vendor_type && (
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', VENDOR_TYPE_COLORS[v.vendor_type] || 'bg-gray-200 text-gray-600')}>
                            {v.vendor_type}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 space-y-0.5">
                        {v.phone_number && <p className="text-gray-600 text-xs">{v.phone_number}</p>}
                        {v.whatsapp_link && (
                          <a href={v.whatsapp_link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
                            <ExternalLink size={11} /> WhatsApp
                          </a>
                        )}
                        {v.telegram_id && <p className="text-xs text-sky-400">{v.telegram_id}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{v.country || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setRatingVendor(v)}
                          className="group flex flex-col gap-1 text-left hover:opacity-80 transition-opacity"
                        >
                          {avg !== null ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-lg border', ratingColor(avg))}>
                                  {avg.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-400">{v.rating_count} review{Number(v.rating_count) !== 1 ? 's' : ''}</span>
                              </div>
                              <StarDisplay value={avg} />
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 group-hover:text-green-600 transition-colors">Rate this vendor</span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{v.added_by_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditVendor(v); setShowModal(true); }}
                            className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-500/10 rounded-lg transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => del(v.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <VendorModal onClose={() => setShowModal(false)} vendor={editVendor} onSaved={load} />}
      {ratingVendor && (
        <RatingsModal
          vendor={ratingVendor}
          onClose={() => setRatingVendor(null)}
          onRated={() => { load(); setRatingVendor(v => vendors.find(x => x.id === v?.id) || v); }}
        />
      )}
    </div>
  );
}
