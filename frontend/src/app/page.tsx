'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 scale-105 animate-slow-zoom"
        style={{
          backgroundImage: 'url("/cat-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-transparent" />

      {/* Content Container */}
      <div className="relative z-20 max-w-4xl w-full px-8 flex flex-col items-start text-left">
        <div className="glass-light p-2 px-4 rounded-full text-sky-400 text-sm font-semibold mb-6 animate-fade-in-down">
          ✨ ยกระดับการดูแลสัตว์เลี้ยงอย่างมืออาชีพ
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight tracking-tighter animate-fade-in">
          Smart Pet <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
            Management
          </span>
        </h1>
        
        <p className="text-xl text-slate-300 max-w-xl mb-12 leading-relaxed animate-fade-in-up">
          ดูแลน้องๆ ของคุณด้วยระบบจัดการนัดหมายและบันทึกการรักษาที่ทันสมัย 
          รวดเร็ว แม่นยำ และอบอุ่นใจเสมือนมีสัตวแพทย์อยู่ใกล้บ้าน
        </p>

        <div className="flex flex-wrap gap-6 animate-fade-in-up">
          <Link 
            href="/login" 
            className="group relative px-8 py-4 bg-sky-500 text-white rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(14,165,233,0.4)]"
          >
            <span className="relative z-10">เริ่มใช้งานตอนนี้</span>
            <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          <Link 
            href="/register" 
            className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold text-lg backdrop-blur-md border border-white/20 transition-all hover:bg-white/20 hover:scale-105"
          >
            สมัครสมาชิก
          </Link>
        </div>

        {/* Minimalist Stats */}
        <div className="mt-20 pt-10 border-t border-white/10 w-full grid grid-cols-2 md:grid-cols-4 gap-12 animate-fade-in-up">
          <div>
            <div className="text-3xl font-bold text-white">24/7</div>
            <div className="text-sm text-slate-400">ระบบทำงานต่อเนื่อง</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">0%</div>
            <div className="text-sm text-slate-400">การจองซ้ำซ้อน</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">Secure</div>
            <div className="text-sm text-slate-400">ข้อมูลปลอดภัย</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">Cloud</div>
            <div className="text-sm text-slate-400">เข้าถึงได้ทุกที่</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
        .animate-fade-in-down { animation: fade-in-down 1s ease-out forwards; }
        .animate-slow-zoom { animation: slow-zoom 20s linear infinite alternate; }
        .glass-light {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </main>
  );
}
