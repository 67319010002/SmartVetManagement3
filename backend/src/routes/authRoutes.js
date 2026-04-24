const express = require('express');
const { register, login, getVets } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/vets', getVets);

module.exports = router;
