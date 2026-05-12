const router = require('express').Router();
const { auth, requireAdmin } = require('../middleware/auth');
const { getAll, create, update, resetPassword, remove } = require('../controllers/usersController');

router.get('/', auth, requireAdmin, getAll);
router.post('/', auth, requireAdmin, create);
router.put('/:id', auth, requireAdmin, update);
router.post('/:id/reset-password', auth, requireAdmin, resetPassword);
router.delete('/:id', auth, requireAdmin, remove);

module.exports = router;
