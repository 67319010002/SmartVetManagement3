'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden font-sans">
      {/* Background Image with Warm Overlay */}
      <div 
        className="absolute inset-0 z-0 scale-110"
        style={{
          backgroundImage: 'url("/login-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-[4px]" />

      {/* Modern Soft Glass Card */}
      <div className="relative z-20 w-full max-w-md animate-soft-breath">
        <div className="bg-white/10 backdrop-blur-2xl p-10 md:p-12 rounded-[3rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 bg-sky-400/20 text-sky-300 text-[10px] uppercase tracking-[0.3em] rounded-full mb-4">
              Authorized Only
            </div>
            <h1 className="text-4xl font-semibold text-white mb-2 tracking-tight">ยินดีต้อนรับ</h1>
            <p className="text-slate-400 text-sm font-light">เข้าสู่ระบบเพื่อจัดการสัตว์เลี้ยงของคุณ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 ml-2">Email Address</label>
              <input
                type="email"
                className="modern-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 ml-2">Password</label>
              <input
                type="password"
                className="modern-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-center text-xs text-red-400 italic">! {error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-white hover:bg-sky-400 text-slate-900 hover:text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-black/10 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'กำลังเข้าระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-xs">
              ยังไม่มีสมาชิก?{' '}
              <Link href="/register" className="text-white font-semibold hover:text-sky-400 transition-colors">
                สมัครสมาชิกที่นี่
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
           <Link href="/" className="text-xs text-slate-500 hover:text-white transition-colors tracking-widest uppercase">
             ← กลับหน้าแรก
           </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes soft-breath {
          from { opacity: 0; transform: scale(1.05); filter: blur(10px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        .animate-soft-breath { 
          animation: soft-breath 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; 
        }
        .modern-input {
          width: 100%;
          padding: 1.1rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.25rem;
          color: white;
          font-size: 0.9rem;
          transition: all 0.3s;
        }
        .modern-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(56, 189, 248, 0.5);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.1);
        }
        .modern-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }
        .py-4.5 {
          padding-top: 1.125rem;
          padding-bottom: 1.125rem;
        }
      `}</style>
    </main>
  );
}
