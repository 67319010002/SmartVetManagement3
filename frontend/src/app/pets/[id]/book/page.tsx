'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function BookingPage() {
  const [pet, setPet] = useState<any>(null);
  const [vets, setVets] = useState<any[]>([]);
  const [selectedVet, setSelectedVet] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchApi(`/pets/${id}`).then(setPet).catch(console.error);
    fetchApi('/auth/vets').then(setVets).catch(console.error);
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          petId: parseInt(id as string),
          vetId: parseInt(selectedVet),
          dateTime,
          reason,
        }),
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!pet) return <div className="p-8 text-white">กำลังโหลด...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-slate-400 mb-8 hover:text-white flex items-center gap-2">
        ← ย้อนกลับ
      </button>

      <div className="glass p-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-white mb-8">จองนัดหมายรักษา: {pet.name}</h1>

        <form onSubmit={handleBooking} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">เลือกสัตวแพทย์</label>
            <select
              className="input-field"
              value={selectedVet}
              onChange={(e) => setSelectedVet(e.target.value)}
              required
            >
              <option value="">-- กรุณาเลือกหมอ --</option>
              {vets.map(vet => (
                <option key={vet.id} value={vet.id}>{vet.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">วันที่และเวลา</label>
            <input
              type="datetime-local"
              className="input-field"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">อาการเบื้องต้น / เหตุผลที่มา</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="เช่น มีไข้, ซึม, ไม่ทานอาหาร"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการจองนัดหมาย'}
          </button>
        </form>
      </div>
    </div>
  );
}
