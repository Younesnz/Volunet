const router = require('express').Router();
const userController = require('/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
// TODO: these should have authentication for users
router.get('/profile/:id', userController.getUserProfile);
router.put('/profile/:id', userController.updateUserProfile);
// TODO: these should have admin authorization
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
