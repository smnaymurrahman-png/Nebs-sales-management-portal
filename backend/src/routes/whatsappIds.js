const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getAll, getById, create, update, remove } = require('../controllers/whatsappIdsController');

router.get('/', auth, getAll);
router.get('/:id', auth, getById);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
