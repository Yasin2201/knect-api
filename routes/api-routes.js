const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/userController');

//POST user sign-up form 
router.post('/sign-up', user_controller.sign_up_post)

//POST user sign-in 
router.post('/', user_controller.sign_in_post)

//GET user sign-out
router.get('/sign-out', user_controller.sign_out_get)

module.exports = router;