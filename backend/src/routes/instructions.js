const router = require('express').Router();
const { auth, requireAdmin } = require('../middleware/auth');
const { getAll, getById, create, update, remove } = require('../controllers/instructionsController');

router.get('/', auth, getAll);
router.get('/:id', auth, getById);
router.post('/', auth, requireAdmin, create);
router.put('/:id', auth, requireAdmin, update);
router.delete('/:id', auth, requireAdmin, remove);

module.exports = router;
