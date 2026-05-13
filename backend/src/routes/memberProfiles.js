const router = require('express').Router();
const { auth, requireAdmin } = require('../middleware/auth');
const { getMemberProfiles } = require('../controllers/memberProfilesController');

router.get('/:userId', auth, requireAdmin, getMemberProfiles);

module.exports = router;
