'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
    
    if (parsedUser.role === 'OWNER') {
      fetchApi('/pets/my').then(setPets).catch(err => console.error("Pets Fetch Error:", err));
    }
    
    fetchApi('/appointments').then(setAppointments).catch(err => console.error("Appointments Fetch Error:", err));
  }, [router]);

  if (!user) return <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center text-[#d6d3d1] font-light tracking-[0.5em] animate-pulse">PREPARING SPACE...</div>;

  const upcomingApps = appointments.filter(app => app.status === 'SCHEDULED');
  const completedApps = appointments.filter(app => app.status === 'COMPLETED');

  const goToRecord = (id: number) => {
    if (!id) return;
    router.push(`/appointments/${id}/record`);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f4] text-[#44403c] font-sans pb-24">
      {/* Wood Style Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-[#e7e5e4] shadow-sm">
        <div className="max-w-6xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#8c7851] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">S</div>
            <span className="text-xl font-black tracking-tight text-[#44403c]">SmartPet</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-sm font-black text-[#44403c]">{user.name}</p>
                <p className="text-[9px] text-[#8c7851] font-bold uppercase tracking-[0.2em]">{user.role}</p>
             </div>
             <button 
              onClick={() => { localStorage.clear(); router.push('/login'); }}
              className="text-[11px] font-black text-[#a8a29e] hover:text-[#44403c] transition-colors uppercase tracking-widest"
             >
               Logout
             </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 pt-12 animate-fade-in">
        <header className="mb-12 relative p-12 bg-white border-2 border-[#e7e5e4] rounded-[3rem] shadow-sm overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5f5f4] rounded-full -mr-20 -mt-20 opacity-40" />
           <div className="relative z-10">
             <h1 className="text-5xl font-black text-[#44403c] tracking-tighter uppercase">Workspace</h1>
             <p className="text-[#a8a29e] mt-2 font-medium">จัดการเพื่อนรักของคุณด้วยความใส่ใจ สไตล์ Cozy Minimal</p>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {user.role === 'OWNER' ? (
              <>
                <section className="bg-white border-2 border-[#e7e5e4] rounded-[3rem] p-10 shadow-sm">
                  <div className="flex justify-between items-center mb-8 border-b-2 border-[#f5f5f4] pb-6">
                    <h2 className="text-2xl font-black text-[#44403c]">สัตว์เลี้ยงของฉัน</h2>
                    <button onClick={() => router.push('/pets/register')} className="px-6 py-2.5 bg-[#8c7851] text-white text-xs font-bold rounded-xl hover:bg-[#44403c] transition-all shadow-lg">+ เพิ่มใหม่</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {pets.map(pet => (
                      <div key={pet.id} onClick={() => router.push(`/pets/${pet.id}`)} className="group cursor-pointer border-2 border-[#f5f5f4] rounded-[2.5rem] p-5 hover:border-[#8c7851] transition-all bg-[#fafaf9]/30">
                        <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 bg-[#f5f5f4] border border-[#e7e5e4]">
                          {pet.imageUrl ? (
                            <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#d6d3d1] text-xs font-black">PET PHOTO</div>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-[#44403c] group-hover:text-[#8c7851] transition-colors">{pet.name}</h3>
                        <p className="text-[10px] text-[#a8a29e] font-bold uppercase tracking-widest">{pet.species}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white border-2 border-[#e7e5e4] rounded-[3rem] p-10 shadow-sm">
                   <h2 className="text-2xl font-black text-[#44403c] mb-8 border-b-2 border-[#f5f5f4] pb-6">ประวัติการรักษา</h2>
                   <div className="space-y-4">
                     {completedApps.length > 0 ? completedApps.map(app => (
                       <div 
                        key={app.id} 
                        onClick={() => goToRecord(app.id)} 
                        className="flex justify-between items-center p-7 border-2 border-[#f5f5f4] rounded-[2rem] hover:bg-[#fafaf9] hover:border-[#8c7851] cursor-pointer transition-all group"
                       >
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-[#f5f5f4] rounded-2xl flex items-center justify-center text-xl group-hover:bg-[#8c7851]/10">📋</div>
                            <div>
                              <p className="text-lg font-black text-[#44403c]">{app.pet.name}</p>
                              <p className="text-[10px] text-[#a8a29e] font-bold uppercase tracking-widest mt-0.5">{new Date(app.dateTime).toLocaleDateString('th-TH')}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-[#8c7851] bg-[#fafaf9] border border-[#e7e5e4] px-5 py-2 rounded-xl uppercase tracking-widest group-hover:bg-[#8c7851] group-hover:text-white transition-all">View Record</span>
                       </div>
                     )) : (
                       <div className="py-10 text-center border-2 border-dashed border-[#e7e5e4] rounded-[2rem]">
                         <p className="text-sm text-[#d6d3d1] italic">ยังไม่มีประวัติการรักษาในฐานข้อมูล</p>
                       </div>
                     )}
                   </div>
                </section>
              </>
            ) : (
              <>
                <section className="bg-white border-2 border-[#e7e5e4] rounded-[3rem] p-10 shadow-sm">
                  <h2 className="text-3xl font-black text-[#44403c] mb-10 border-b-2 border-[#f5f5f4] pb-6">คิวตรวจวันนี้</h2>
                  <div className="space-y-6">
                    {upcomingApps.map(app => (
                      <div key={app.id} className="flex flex-col md:flex-row justify-between items-center p-8 border-2 border-[#f5f5f4] rounded-[3rem] bg-[#fafaf9]/30 hover:border-[#8c7851] transition-all gap-8">
                        <div className="flex items-center gap-10 flex-1">
                          <div className="text-4xl font-black text-[#8c7851] w-32 border-r-2 border-[#f5f5f4]">
                            {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-[#44403c]">{app.pet?.name}</h3>
                            <p className="text-xs text-[#a8a29e] font-bold uppercase tracking-widest mt-1">Reason: {app.reason || 'ตรวจสุขภาพ'}</p>
                          </div>
                        </div>
                        <button onClick={() => goToRecord(app.id)} className="w-full md:w-auto px-12 py-4 bg-[#44403c] text-white font-black rounded-2xl hover:bg-[#8c7851] transition-all shadow-md active:scale-95 uppercase tracking-widest text-xs">เริ่มบันทึก</button>
                      </div>
                    ))}
                    {upcomingApps.length === 0 && <p className="text-center py-10 text-[#d6d3d1] italic">วันนี้ยังไม่มีคิวนัดหมาย</p>}
                  </div>
                </section>

                <section className="bg-white border-2 border-[#e7e5e4] rounded-[3rem] p-10 shadow-sm">
                  <h2 className="text-2xl font-black text-[#44403c] mb-8">งานที่เสร็จสมบูรณ์</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {completedApps.map(app => (
                      <div key={app.id} onClick={() => goToRecord(app.id)} className="p-7 border-2 border-[#f5f5f4] rounded-[2.5rem] hover:bg-[#fafaf9] hover:border-[#8c7851] cursor-pointer transition-all flex justify-between items-center group">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">✓</div>
                          <div>
                            <p className="text-lg font-black text-[#44403c]">{app.pet?.name}</p>
                            <p className="text-[10px] text-[#a8a29e] font-black uppercase tracking-widest mt-1">Done: {new Date(app.dateTime).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#d6d3d1] font-black group-hover:text-[#8c7851] transition-colors">EDIT →</span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          <div className="lg:col-span-4 space-y-10">
            {user.role === 'OWNER' && upcomingApps.length > 0 && (
              <section className="bg-[#8c7851] text-white rounded-[3rem] p-10 shadow-xl shadow-[#8c7851]/10">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">📅 นัดหมายถัดไป</h2>
                <div className="space-y-6">
                  {upcomingApps.slice(0, 2).map(app => (
                    <div key={app.id} className="bg-white/10 p-6 rounded-3xl border border-white/10">
                      <h3 className="text-lg font-bold">{app.pet.name}</h3>
                      <p className="text-xs opacity-70 mt-1">{new Date(app.dateTime).toLocaleString('th-TH')}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white border-2 border-[#e7e5e4] rounded-[3rem] p-10">
               <h3 className="text-[10px] font-black text-[#8c7851] uppercase tracking-[0.3em] mb-6">Contact Clinic</h3>
               <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-[#fafaf9] border border-[#e7e5e4] flex items-center gap-4">
                    <span className="text-xl">📞</span>
                    <p className="text-xs font-bold text-[#44403c]">02-123-4567</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-[#fafaf9] border border-[#e7e5e4] flex items-center gap-4">
                    <span className="text-xl">🚑</span>
                    <p className="text-xs font-bold text-[#44403c]">ฉุกเฉิน 24 ชั่วโมง</p>
                 </div>
               </div>
            </section>
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
