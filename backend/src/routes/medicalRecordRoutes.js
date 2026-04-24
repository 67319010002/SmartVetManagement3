const express = require('express');
const { createMedicalRecord, getPetMedicalHistory, updateMedicalRecord, getMedicalRecordById } = require('../controllers/medicalRecordController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, checkRole(['VET']), createMedicalRecord);
router.put('/:id', authMiddleware, checkRole(['VET']), updateMedicalRecord);
router.get('/:id', authMiddleware, getMedicalRecordById);
router.get('/pet/:petId', authMiddleware, getPetMedicalHistory);

module.exports = router;
