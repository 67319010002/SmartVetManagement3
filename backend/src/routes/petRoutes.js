const express = require('express');
const { registerPet, getMyPets, getPetDetails, updatePetDetails } = require('../controllers/petController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const router = express.Router();

router.post('/', authMiddleware, checkRole(['OWNER']), upload.single('image'), registerPet);
router.put('/:id', authMiddleware, checkRole(['OWNER']), upload.single('image'), updatePetDetails);
router.get('/my', authMiddleware, checkRole(['OWNER']), getMyPets);
router.get('/:id', authMiddleware, getPetDetails);

module.exports = router;
