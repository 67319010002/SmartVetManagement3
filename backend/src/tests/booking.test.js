import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '../config/prisma';

describe('ระบบป้องกันการจองซ้อน (No Double Booking)', () => {
  let petId;
  let vetId;

  beforeAll(async () => {
    // เตรียมข้อมูลสำหรับการทดสอบ
    const user = await prisma.user.findFirst({ where: { role: 'OWNER' } });
    const vet = await prisma.user.findFirst({ where: { role: 'VET' } });
    const pet = await prisma.pet.findFirst({ where: { ownerId: user.id } });

    petId = pet.id;
    vetId = vet.id;
  });

  it('ควรอนุญาตให้จองได้เพียงคนเดียวหากมีการจองเวลาเดียวกันพร้อมกัน', async () => {
    const testDateTime = new Date('2026-12-25T10:00:00Z');

    // ลบข้อมูลเก่าที่อาจค้างอยู่
    await prisma.appointment.deleteMany({
      where: {
        vetId: vetId,
        dateTime: testDateTime,
      }
    });

    // จำลองการจองพร้อมกัน 2 request
    const bookingAttempts = [
      createBooking(petId, vetId, testDateTime),
      createBooking(petId, vetId, testDateTime),
    ];

    const results = await Promise.allSettled(bookingAttempts);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    // ผลลัพธ์ที่คาดหวัง: ต้องสำเร็จ 1 และล้มเหลว 1
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    console.log('✅ ผลการทดสอบ: ระบบยอมรับการจองเพียง 1 รายการ และปฏิเสธรายการที่ซ้ำซ้อน');
  });
});

async function createBooking(petId, vetId, dateTime) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.appointment.findFirst({
      where: { vetId, dateTime, status: 'SCHEDULED' }
    });

    if (existing) throw new Error('Already booked');

    return tx.appointment.create({
      data: { petId, vetId, dateTime, status: 'SCHEDULED' }
    });
  });
}
