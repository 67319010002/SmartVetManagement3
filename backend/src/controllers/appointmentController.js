const { z } = require('zod');
const prisma = require('../config/prisma');

// Schema สำหรับตรวจสอบข้อมูลการจอง
const appointmentSchema = z.object({
  petId: z.number(),
  vetId: z.number(),
  dateTime: z.string().transform((val) => new Date(val)),
  reason: z.string().optional(),
});

const createAppointment = async (req, res) => {
  try {
    const validatedData = appointmentSchema.parse(req.body);
    const { petId, vetId, dateTime, reason } = validatedData;

    // เริ่มต้น Transaction เพื่อความปลอดภัยระดับสูงสุด
    const result = await prisma.$transaction(async (tx) => {
      // 1. ตรวจสอบว่าสัตวแพทย์ติดธุระในช่วงเวลานี้หรือไม่
      const existingAppointment = await tx.appointment.findFirst({
        where: {
          vetId: vetId,
          dateTime: dateTime,
          status: 'SCHEDULED',
        },
      });

      if (existingAppointment) {
        throw new Error('สัตวแพทย์ท่านนี้มีการนัดหมายในช่วงเวลาดังกล่าวแล้ว');
      }

      // 2. สร้างการนัดหมายใหม่
      const appointment = await tx.appointment.create({
        data: {
          petId,
          vetId,
          dateTime,
          reason,
          status: 'SCHEDULED',
        },
      });

      return appointment;
    });

    res.status(201).json({ message: 'จองนัดหมายสำเร็จ', appointment: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const { role, id } = req.user;
    const userId = parseInt(id);
    
    // ดึงข้อมูลนัดหมายตามบทบาท
    let appointments;
    if (role === 'VET') {
      appointments = await prisma.appointment.findMany({
        where: { vetId: userId },
        include: { pet: true, medicalRecord: true },
        orderBy: { dateTime: 'asc' }
      });
    } else {
      appointments = await prisma.appointment.findMany({
        where: { pet: { ownerId: userId } },
        include: { pet: true, vet: { select: { name: true } }, medicalRecord: true },
        orderBy: { dateTime: 'asc' }
      });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error('GET_APPOINTMENTS_ERROR:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
};

const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: { 
        pet: { include: { owner: { select: { name: true } } } },
        vet: { select: { name: true } },
        medicalRecord: true
      }
    });

    if (!appointment) return res.status(404).json({ message: 'ไม่พบข้อมูลนัดหมาย' });

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

module.exports = { createAppointment, getAppointments, getAppointmentDetails };
