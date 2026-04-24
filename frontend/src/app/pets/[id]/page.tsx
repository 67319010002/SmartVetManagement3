'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function PetDetailPage() {
  const [pet, setPet] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    fetchApi(`/pets/${id}`).then(setPet).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-white">กำลังโหลด...</div>;
  if (!pet) return <div className="p-8 text-white">ไม่พบข้อมูลสัตว์เลี้ยง</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <button onClick={() => router.back()} className="text-slate-400 hover:text-white">← ย้อนกลับ</button>

      <div className="glass rounded-2xl overflow-hidden">
        {pet.imageUrl && (
          <img src={pet.imageUrl} alt={pet.name} className="w-full h-64 object-cover" />
        )}
        <div className="p-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{pet.name}</h1>
            <p className="text-xl text-slate-400">{pet.species} • {pet.breed || 'ไม่ระบุสายพันธุ์'}</p>
            <p className="text-slate-500 mt-2">
              อายุ: {pet.age} ปี {pet.ageMonths} เดือน {pet.ageDays} วัน | เจ้าของ: {pet.owner.name}
            </p>
          </div>
          <div className="flex gap-4">
            {user?.role === 'OWNER' && (
              <>
                <button onClick={() => router.push(`/pets/${id}/edit`)} className="glass px-6 py-2 rounded-xl text-white font-semibold hover:bg-white/10">
                  แก้ไขข้อมูล
                </button>
                <button onClick={() => router.push(`/pets/${id}/book`)} className="btn-primary">
                  จองนัดหมาย
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Timeline ประวัติการรักษา</h2>
        {pet.records?.length > 0 ? (
          <div className="space-y-6 border-l-2 border-slate-700 ml-4 pl-8">
            {pet.records.map((record: any) => (
              <div key={record.id} className="relative glass p-6 rounded-xl">
                <div className="absolute -left-[41px] top-6 w-4 h-4 bg-sky-500 rounded-full border-4 border-slate-900"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-sky-400 font-mono">{new Date(record.createdAt).toLocaleDateString('th-TH')}</span>
                    <span className="text-xs text-slate-500">สัตวแพทย์: {record.vet.name}</span>
                  </div>
                  {user?.role === 'VET' && (
                    <button 
                      onClick={() => router.push(`/appointments/${record.id}/record?edit=true`)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300 transition-colors"
                    >
                      แก้ไข
                    </button>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{record.diagnosis}</h3>
                <p className="text-slate-400 mb-2">การรักษา: {record.treatment || '-'}</p>
                {record.notes && <p className="text-sm text-slate-500 italic">หมายเหตุ: {record.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-12 text-center rounded-xl">
            <p className="text-slate-400">ยังไม่มีประวัติการรักษา</p>
          </div>
        )}
      </div>
    </div>
  );
}
