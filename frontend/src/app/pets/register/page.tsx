'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PetRegisterPage() {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [ageDays, setAgeDays] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('species', species);
      formData.append('breed', breed);
      formData.append('age', age || '0');
      formData.append('ageMonths', ageMonths || '0');
      formData.append('ageDays', ageDays || '0');
      if (image) {
        formData.append('image', image);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f4] p-6 md:p-12 font-sans text-[#44403c]">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-[#a8a29e] hover:text-[#8c7851] font-bold text-sm mb-8 transition-all group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> กลับไปหน้าแดชบอร์ด
        </button>

        <div className="bg-white border-2 border-[#e7e5e4] rounded-[3.5rem] p-10 md:p-16 shadow-sm relative overflow-hidden animate-fade-in">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fafaf9] rounded-full -mr-16 -mt-16 border-2 border-[#e7e5e4]" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#fafaf9] rounded-full -ml-12 -mb-12 border-2 border-[#e7e5e4]" />

          <div className="relative z-10">
            <header className="mb-12">
               <div className="inline-block px-4 py-1.5 bg-[#f5f5f4] text-[#8c7851] text-[10px] font-black uppercase tracking-[0.4em] rounded-full mb-6">Pet Registration Portal</div>
               <h1 className="text-5xl font-black text-[#44403c] tracking-tighter leading-tight">
                 ลงทะเบียน<br/>สัตว์เลี้ยงสมาชิกใหม่
               </h1>
               <p className="text-[#a8a29e] mt-4 font-medium text-lg italic">กรอกข้อมูลเบื้องต้นเพื่อสร้างประวัติสุขภาพให้กับสัตว์เลี้ยงของคุณ</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center gap-6 p-8 bg-[#fafaf9] border-2 border-dashed border-[#e7e5e4] rounded-[2.5rem] group hover:border-[#8c7851] transition-all">
                <div className="w-32 h-32 bg-white rounded-3xl border-2 border-[#e7e5e4] overflow-hidden flex items-center justify-center relative shadow-sm">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">📸</span>
                  )}
                </div>
                <div className="text-center">
                   <label className="cursor-pointer bg-[#8c7851] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#44403c] transition-all shadow-md">
                     เลือกรูปภาพ
                     <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                   </label>
                   <p className="text-[10px] text-[#a8a29e] mt-3 font-bold uppercase tracking-widest">Recommended size: 500x500px</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#8c7851] uppercase tracking-[0.2em] ml-2">ชื่อสัตว์เลี้ยง</label>
                  <input
                    type="text"
                    className="w-full p-5 bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-2xl focus:border-[#8c7851] focus:bg-white outline-none transition-all font-bold text-lg"
                    placeholder="เช่น ปุยฝ้าย, มะลิ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#8c7851] uppercase tracking-[0.2em] ml-2">ประเภท (Species)</label>
                  <input
                    type="text"
                    className="w-full p-5 bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-2xl focus:border-[#8c7851] focus:bg-white outline-none transition-all font-bold text-lg"
                    placeholder="เช่น สุนัข, แมว"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[#8c7851] uppercase tracking-[0.2em] ml-2">สายพันธุ์ (Breed)</label>
                <input
                  type="text"
                  className="w-full p-5 bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-2xl focus:border-[#8c7851] focus:bg-white outline-none transition-all font-bold text-lg"
                  placeholder="เช่น โกลเด้น รีทรีฟเวอร์"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>

              {/* Age Section */}
              <div className="space-y-4">
                <label className="text-xs font-black text-[#8c7851] uppercase tracking-[0.2em] ml-2">อายุสัตว์เลี้ยง</label>
                <div className="grid grid-cols-3 gap-6">
                   <div className="relative">
                      <input
                        type="number"
                        className="w-full p-5 bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-2xl focus:border-[#8c7851] focus:bg-white outline-none transition-all font-bold text-center text-xl"
                        placeholder="0"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-[#a8a29e] uppercase tracking-widest">ปี</span>
                   </div>
                   <div className="relative">
                      <input
                        type="number"
                        className="w-full p-5 bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-2xl focus:border-[#8c7851] focus:bg-white outline-none transition-all font-bold text-center text-xl"
                        placeholder="0"
                        value={ageMonths}
                        onChange={(e) => setAgeMonths(e.target.value)}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-[#a8a29e] uppercase tracking-widest">เดือน</span>
                   </div>
                   <div className="relative">
                      <input
                        type="number"
                        className="w-full p-5 bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-2xl focus:border-[#8c7851] focus:bg-white outline-none transition-all font-bold text-center text-xl"
                        placeholder="0"
                        value={ageDays}
                        onChange={(e) => setAgeDays(e.target.value)}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-[#a8a29e] uppercase tracking-widest">วัน</span>
                   </div>
                </div>
              </div>

              {error && (
                <div className="p-5 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center animate-pulse">
                  ! {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-[#44403c] text-white font-black rounded-3xl hover:bg-[#8c7851] transition-all shadow-xl shadow-stone-200 active:scale-[0.97] disabled:opacity-50 tracking-[0.4em] uppercase text-sm mt-8"
              >
                {loading ? 'กำลังประมวลผล...' : 'ลงทะเบียนสมาชิกใหม่'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
      `}</style>
    </main>
  );
}
