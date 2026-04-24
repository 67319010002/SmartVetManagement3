'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function RecordMedicalPage() {
  const [appointment, setAppointment] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const loadData = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const editMode = searchParams.get('edit') === 'true';
        setIsEdit(editMode);

        if (editMode) {
          // กรณี Edit โดยตรงผ่าน Record ID
          const record = await fetchApi(`/records/${id}`);
          if (record) {
            setDiagnosis(record.diagnosis || '');
            setTreatment(record.treatment || '');
            setNotes(record.notes || '');
            setAppointment({ pet: record.pet, medicalRecord: record });
          }
        } else {
          // กรณีดึงผ่าน Appointment ID (Dashboard)
          const app = await fetchApi(`/appointments/${id}`);
          setAppointment(app);
          
          if (app.medicalRecord) {
            // 1. ถ้ามีการผูก appointmentId ไว้แล้ว (ข้อมูลใหม่)
            setDiagnosis(app.medicalRecord.diagnosis || '');
            setTreatment(app.medicalRecord.treatment || '');
            setNotes(app.medicalRecord.notes || '');
          } else {
            // 2. ถ้าไม่มี (ข้อมูลเก่า) -> ไปดึงจากประวัติล่าสุดของสัตว์เลี้ยงตัวนี้แทน
            const history = await fetchApi(`/records/pet/${app.petId}`);
            if (history && history.length > 0) {
              // ดึงรายการที่ใกล้เคียงที่สุด หรือรายการล่าสุด
              const latestRecord = history[0]; 
              setDiagnosis(latestRecord.diagnosis || '');
              setTreatment(latestRecord.treatment || '');
              setNotes(latestRecord.notes || '');
              // พ่วงข้อมูล record เข้าไปเพื่อให้ระบบรู้ว่ามีข้อมูลเดิมอยู่แล้ว (จะได้ใช้ PUT แทน POST)
              setAppointment({ ...app, medicalRecord: latestRecord });
            }
          }
        }
      } catch (err) {
        console.error("Load Data Error:", err);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'OWNER') return;
    setLoading(true);

    try {
      // เช็คว่ามี record อยู่แล้วหรือไม่ (ดูจาก appointment.medicalRecord ที่เราดึงมา)
      if (appointment?.medicalRecord) {
        await fetchApi(`/records/${appointment.medicalRecord.id}`, {
          method: 'PUT',
          body: JSON.stringify({ diagnosis, treatment, notes }),
        });
      } else {
        await fetchApi('/records', {
          method: 'POST',
          body: JSON.stringify({
            petId: appointment.petId,
            appointmentId: parseInt(id as string),
            diagnosis,
            treatment,
            notes,
          }),
        });
      }
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  if (!isDataLoaded) return <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center text-[#d6d3d1] font-bold tracking-[0.3em] animate-pulse">SYNCING DATA...</div>;

  const isOwner = user?.role === 'OWNER';

  return (
    <main className="min-h-screen bg-[#f5f5f4] p-6 md:p-12 font-sans text-[#44403c]">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-[#a8a29e] hover:text-[#8c7851] font-bold text-sm mb-8 transition-all group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> กลับไปหน้าแดชบอร์ด
        </button>

        <div className="bg-white border-2 border-[#e7e5e4] rounded-[3.5rem] p-10 md:p-16 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#fafaf9] rounded-full -mr-20 -mt-20 border-2 border-[#e7e5e4]" />
          
          <div className="relative z-10">
            <header className="mb-12">
               <div className="inline-block px-4 py-1.5 bg-[#f5f5f4] text-[#8c7851] text-[10px] font-black uppercase tracking-[0.4em] rounded-full mb-6">Verified History</div>
               <h1 className="text-5xl font-black text-[#44403c] tracking-tighter leading-none mb-8">
                 {isOwner ? 'รายละเอียดการรักษา' : (appointment?.medicalRecord ? 'แก้ไขประวัติการรักษา' : 'บันทึกผลการตรวจ')}
               </h1>
               
               {appointment?.pet && (
                 <div className="p-8 bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white border-2 border-[#e7e5e4] rounded-2xl flex items-center justify-center text-3xl shadow-sm">🐾</div>
                      <div>
                        <p className="text-[10px] font-black text-[#a8a29e] uppercase tracking-[0.2em] mb-1">Patient Name</p>
                        <p className="text-2xl font-black text-[#44403c]">{appointment.pet.name}</p>
                      </div>
                    </div>
                    <div className="md:text-right w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 md:border-l-2 border-[#e7e5e4] md:pl-10">
                       <p className="text-[10px] font-black text-[#a8a29e] uppercase tracking-[0.2em] mb-1">Status</p>
                       <p className={`text-lg font-bold ${appointment?.medicalRecord ? 'text-emerald-500' : 'text-[#8c7851]'}`}>
                         {appointment?.medicalRecord ? '✓ ตรวจแล้ว' : '● รอการบันทึก'}
                       </p>
                    </div>
                 </div>
               )}
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-[#8c7851] uppercase tracking-[0.3em] ml-2">การวินิจฉัย (Diagnosis)</label>
                <input
                  type="text"
                  disabled={isOwner}
                  className={`w-full p-6 bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-[1.5rem] focus:border-[#8c7851] focus:bg-white outline-none transition-all font-bold text-lg ${isOwner ? 'opacity-80 cursor-default text-[#78716c]' : 'text-[#44403c]'}`}
                  placeholder="ระบุอาการหรือโรคที่ตรวจพบ..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required={!isOwner}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-[#8c7851] uppercase tracking-[0.3em] ml-2">การรักษาและยา (Treatment)</label>
                <textarea
                  rows={4}
                  disabled={isOwner}
                  className={`w-full p-6 bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-[1.5rem] focus:border-[#8c7851] focus:bg-white outline-none transition-all font-bold text-lg ${isOwner ? 'opacity-80 cursor-default text-[#78716c]' : 'text-[#44403c]'}`}
                  placeholder="ระบุตัวยาหรือวิธีการรักษา..."
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  required={!isOwner}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-[#8c7851] uppercase tracking-[0.3em] ml-2">หมายเหตุจากสัตวแพทย์ (Notes)</label>
                <textarea
                  rows={3}
                  disabled={isOwner}
                  className={`w-full p-6 bg-[#fafaf9] border-2 border-[#e7e5e4] rounded-[1.5rem] focus:border-[#8c7851] focus:bg-white outline-none transition-all font-bold text-lg ${isOwner ? 'opacity-80 cursor-default text-[#78716c]' : 'text-[#44403c]'}`}
                  placeholder="คำแนะนำเพิ่มเติม..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {!isOwner && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-[#44403c] text-white font-black rounded-[1.5rem] hover:bg-[#8c7851] transition-all shadow-xl shadow-stone-200 active:scale-[0.97] disabled:opacity-50 tracking-[0.3em] uppercase text-sm mt-4"
                >
                  {loading ? 'Processing...' : (appointment?.medicalRecord ? 'อัปเดตบันทึกการรักษา' : 'ยืนยันการบันทึกผล')}
                </button>
              )}

              {isOwner && (
                <div className="mt-10 p-8 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] flex items-center gap-6 shadow-sm">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm font-bold text-xl">✓</div>
                  <div className="text-left">
                    <p className="text-emerald-800 font-black text-sm uppercase tracking-widest">Medical History Verified</p>
                    <p className="text-emerald-600/80 font-bold text-xs mt-0.5 italic">ข้อมูลชุดนี้เป็นประวัติการรักษาเดิมที่บันทึกไว้ในระบบ</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
