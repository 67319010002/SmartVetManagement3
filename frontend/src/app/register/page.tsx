'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'OWNER' | 'VET'>('OWNER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'การสมัครสมาชิกล้มเหลว');

      router.push('/login');
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
      <div className="absolute inset-0 z-10 bg-slate-900/50 backdrop-blur-[4px]" />

      {/* Modern Soft Glass Card */}
      <div className="relative z-20 w-full max-w-lg animate-soft-breath">
        <div className="bg-white/10 backdrop-blur-2xl p-10 md:p-12 rounded-[3rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-emerald-400/20 text-emerald-300 text-[10px] uppercase tracking-[0.3em] rounded-full mb-4">
              Join Our Community
            </div>
            <h1 className="text-4xl font-semibold text-white mb-2 tracking-tight">สร้างบัญชีใหม่</h1>
            <p className="text-slate-400 text-sm font-light">เริ่มต้นการดูแลสัตว์เลี้ยงอย่างมืออาชีพได้ที่นี่</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-2">Full Name</label>
              <input
                type="text"
                className="modern-input"
                placeholder="สมชาย ใจดี"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 ml-2">Email Address</label>
              <input
                type="email"
                className="modern-input"
                placeholder="somchai@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
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

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 ml-2">คุณคือใคร?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('OWNER')}
                  className={`py-3 rounded-2xl border transition-all duration-300 font-medium ${
                    role === 'OWNER' 
                      ? 'bg-sky-500/30 border-sky-500 text-white shadow-lg shadow-sky-500/20' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  🐶 เจ้าของสัตว์
                </button>
                <button
                  type="button"
                  onClick={() => setRole('VET')}
                  className={`py-3 rounded-2xl border transition-all duration-300 font-medium ${
                    role === 'VET' 
                      ? 'bg-emerald-500/30 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  🩺 สัตวแพทย์
                </button>
              </div>
            </div>

            {error && (
              <p className="text-center text-xs text-red-400 italic">! {error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white hover:bg-sky-400 text-slate-900 hover:text-white rounded-2xl font-bold transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึกข้อมูล...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-xs">
              มีบัญชีอยู่แล้ว?{' '}
              <Link href="/login" className="text-white font-semibold hover:text-sky-400 transition-colors">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
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
          padding: 1rem 1.4rem;
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
      `}</style>
    </main>
  );
}
