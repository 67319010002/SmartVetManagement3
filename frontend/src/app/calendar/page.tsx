'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    fetchApi('/appointments').then(setAppointments).catch(console.error);
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getAppointmentsForDay = (day: number) => {
    return appointments.filter(app => {
      const d = new Date(app.dateTime);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white">← กลับไปที่ Dashboard</button>
        <div className="text-center">
           <h1 className="text-3xl font-bold text-white">ตารางนัดหมาย</h1>
           <p className="text-slate-400">
             {currentDate.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}
           </p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="glass p-2 rounded-lg">←</button>
           <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="glass p-2 rounded-lg">→</button>
        </div>
      </header>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-800/50 border-b border-slate-700">
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
            <div key={day} className="p-4 text-center text-sm font-bold text-slate-400">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="h-32 border-b border-r border-slate-700/50 bg-slate-900/20"></div>
          ))}
          {days.map(day => {
            const apps = getAppointmentsForDay(day);
            return (
              <div key={day} className="h-32 border-b border-r border-slate-700/50 p-2 hover:bg-slate-800/30 transition-colors">
                <div className="text-sm text-slate-500 mb-1">{day}</div>
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {apps.map(app => (
                    <div key={app.id} className="text-[10px] bg-sky-500/20 text-sky-400 p-1 rounded border border-sky-500/30 truncate">
                      {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {app.pet?.name || 'ไม่ทราบชื่อ'}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
