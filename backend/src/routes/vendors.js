const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getAll, create, update, remove, getRatings, addRating } = require('../controllers/vendorsController');

router.get('/', auth, getAll);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);
router.get('/:id/ratings', auth, getRatings);
router.post('/:id/ratings', auth, addRating);

module.exports = router;
