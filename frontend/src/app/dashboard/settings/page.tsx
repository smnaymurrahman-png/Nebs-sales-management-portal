'use client';
import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'password'>('profile');

  const [profile, setProfile] = useState({ full_name: user?.full_name || '', designation: user?.designation || '' });
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data); toast.success('Profile updated');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.new_password !== pwd.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { current_password: pwd.current_password, new_password: pwd.new_password });
      toast.success('Password changed'); setPwd({ current_password: '', new_password: '', confirm: '' });
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  }

  const tabClass = (active: boolean) => cn('px-4 py-2 text-sm rounded-xl transition-colors', active ? 'bg-green-500/15 text-green-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100');

  return (
    <div>
      <TopBar title="Settings" />
      <div className="p-6 max-w-xl">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('profile')} className={tabClass(tab === 'profile')}>Profile</button>
          <button onClick={() => setTab('password')} className={tabClass(tab === 'password')}>Password</button>
        </div>

        {tab === 'profile' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Profile Information</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                <input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Work Email</label>
                <input value={user?.work_email} disabled className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Designation</label>
                <input value={profile.designation} onChange={e => setProfile(p => ({ ...p, designation: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
              </div>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl disabled:opacity-60">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
              </button>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={changePassword} className="space-y-4">
              {[['Current Password', 'current_password'], ['New Password', 'new_password'], ['Confirm Password', 'confirm']].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input type="password" value={(pwd as any)[key]} onChange={e => setPwd(p => ({ ...p, [key]: e.target.value }))} required
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
                </div>
              ))}
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl disabled:opacity-60">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Update Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
