const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { login, me, changePassword, updateProfile } = require('../controllers/authController');

router.post('/login', login);
router.get('/me', auth, me);
router.put('/change-password', auth, changePassword);
router.put('/profile', auth, updateProfile);

module.exports = router;
