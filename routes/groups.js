const express = require('express');
const router = express.Router();
const groupsControllers = require('../controllers/groups');
const { protect } = require('../middlewares/auth');

router.post('/', protect, groupsControllers.createGroup);
router.put('/:id', protect, groupsControllers.editGroup);
router.delete('/:id', protect, groupsControllers.deleteGroup);

router.post('/:id/add-card', protect, groupsControllers.addCard);
router.put('/:id/edit-card/:cardId', protect, groupsControllers.editCard);
router.delete('/:id/delete-card/:cardId',  protect, groupsControllers.deleteCard);

module.exports = router;
