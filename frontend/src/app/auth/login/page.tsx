'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const [form, setForm] = useState({ work_email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.png" alt="Nebs Logo" width={44} height={44} className="rounded-xl flex-shrink-0" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Nebs Seller Portal</h1>
            <p className="text-xs text-gray-400">Nebs IT Solution Ltd</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1.5">Work Email</label>
            <input
              type="email"
              value={form.work_email}
              onChange={e => setForm(f => ({ ...f, work_email: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="you@nebs.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium rounded-xl py-2.5 text-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
