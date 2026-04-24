const express = require('express');
const { createAppointment, getAppointments, getAppointmentDetails } = require('../controllers/appointmentController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, checkRole(['OWNER']), createAppointment);
router.get('/', authMiddleware, getAppointments);
router.get('/:id', authMiddleware, getAppointmentDetails);

module.exports = router;
