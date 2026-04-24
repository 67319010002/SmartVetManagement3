const { z } = require('zod');
const prisma = require('../config/prisma');

const petSchema = z.object({
  name: z.string().min(1, 'ต้องระบุชื่อสัตว์เลี้ยง'),
  species: z.string().min(1, 'ต้องระบุสายพันธุ์ (เช่น สุนัข, แมว)'),
  breed: z.string().optional(),
  age: z.number().optional(),
  ageMonths: z.number().optional(),
  ageDays: z.number().optional(),
  imageUrl: z.string().optional(),
});

const registerPet = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    // แยกส่วนของข้อมูล Text ออกมาตรวจสอบ
    const bodyData = {
      name: req.body.name,
      species: req.body.species,
      breed: req.body.breed,
      age: req.body.age ? parseInt(req.body.age) : 0,
      ageMonths: req.body.ageMonths ? parseInt(req.body.ageMonths) : 0,
      ageDays: req.body.ageDays ? parseInt(req.body.ageDays) : 0,
    };

    const validatedData = petSchema.parse(bodyData);
    
    // จัดการรูปภาพ (ถ้ามี)
    let imageUrl = req.body.imageUrl; // เผื่อกรณีส่ง URL มาตรงๆ
    if (req.file) {
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const pet = await prisma.pet.create({
      data: {
        ...validatedData,
        imageUrl,
        ownerId: userId,
      },
    });

    res.status(201).json({ message: 'ลงทะเบียนสัตว์เลี้ยงสำเร็จ', pet });
  } catch (error) {
    console.error('Register Pet Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: error.errors });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', error: error.message });
  }
};

const getMyPets = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const pets = await prisma.pet.findMany({
      where: { ownerId: userId },
      include: { records: true }
    });
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

const getPetDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(id) },
      include: { 
        owner: { select: { name: true, email: true } },
        records: { include: { vet: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
        appointments: { orderBy: { dateTime: 'desc' } }
      }
    });

    if (!pet) return res.status(404).json({ message: 'ไม่พบข้อมูลสัตว์เลี้ยง' });

    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
  }
};

const updatePetDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const petId = parseInt(id);

    // 1. ตรวจสอบสิทธิ์ (ต้องเป็นเจ้าของหรือสัตวแพทย์)
    const existingPet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!existingPet) return res.status(404).json({ message: 'ไม่พบข้อมูลสัตว์เลี้ยง' });
    
    if (req.user.role !== 'VET' && existingPet.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลสัตว์เลี้ยงตัวนี้' });
    }

    // 2. รวบรวมข้อมูลที่ต้องการอัปเดต
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.species) updateData.species = req.body.species;
    if (req.body.breed !== undefined) updateData.breed = req.body.breed;
    if (req.body.age !== undefined) updateData.age = parseInt(req.body.age);
    if (req.body.ageMonths !== undefined) updateData.ageMonths = parseInt(req.body.ageMonths);
    if (req.body.ageDays !== undefined) updateData.ageDays = parseInt(req.body.ageDays);
    
    if (req.file) {
      updateData.imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      updateData.imageUrl = req.body.imageUrl;
    }

    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: updateData,
    });

    res.status(200).json({ message: 'อัปเดตข้อมูลสัตว์เลี้ยงสำเร็จ', pet: updatedPet });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดต', error: error.message });
  }
};

module.exports = { registerPet, getMyPets, getPetDetails, updatePetDetails };
