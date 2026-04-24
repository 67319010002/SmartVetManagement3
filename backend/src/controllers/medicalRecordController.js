const { z } = require('zod');
const prisma = require('../config/prisma');

const recordSchema = z.object({
  petId: z.number(),
  appointmentId: z.number().optional(), // เพิ่มเพื่อลิงก์กับนัดหมาย
  diagnosis: z.string().min(1, 'ต้องระบุการวินิจฉัย'),
  treatment: z.string().optional(),
  notes: z.string().optional(),
});

const createMedicalRecord = async (req, res) => {
  try {
    const validatedData = recordSchema.parse(req.body);
    const vetId = req.user.id;

    const result = await prisma.$transaction(async (tx) => {
      // 1. สร้างประวัติการรักษา
      const record = await tx.medicalRecord.create({
        data: {
          petId: validatedData.petId,
          diagnosis: validatedData.diagnosis,
          treatment: validatedData.treatment,
          notes: validatedData.notes,
          vetId,
          appointmentId: validatedData.appointmentId,
        },
      });

      // 2. ถ้ามาจากนัดหมาย ให้อัปเดตสถานะนัดหมายเป็น COMPLETED
      if (validatedData.appointmentId) {
        await tx.appointment.update({
          where: { id: validatedData.appointmentId },
          data: { status: 'COMPLETED' }
        });
      }

      return record;
    });

    res.status(201).json({ message: 'บันทึกประวัติการรักษาสำเร็จ', record: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: error.errors });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, treatment, notes } = req.body;

    const record = await prisma.medicalRecord.update({
      where: { id: parseInt(id) },
      data: { diagnosis, treatment, notes }
    });

    res.status(200).json({ message: 'แก้ไขข้อมูลสำเร็จ', record });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
      include: { pet: true }
    });
    if (!record) return res.status(404).json({ message: 'ไม่พบประวัติการรักษา' });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

const getPetMedicalHistory = async (req, res) => {
  try {
    const { petId } = req.params;
    const id = parseInt(petId);

    // 1. ตรวจสอบสิทธิ์การเข้าถึง
    const pet = await prisma.pet.findUnique({ where: { id } });
    if (!pet) return res.status(404).json({ message: 'ไม่พบข้อมูลสัตว์เลี้ยง' });

    if (req.user.role !== 'VET' && pet.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงประวัติการรักษาของสัตว์เลี้ยงตัวนี้' });
    }

    const records = await prisma.medicalRecord.findMany({
      where: { petId: id },
      include: { vet: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงประวัติการรักษา', error: error.message });
  }
};

module.exports = { createMedicalRecord, getPetMedicalHistory, updateMedicalRecord, getMedicalRecordById };
