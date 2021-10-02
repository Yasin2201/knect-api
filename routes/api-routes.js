const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');

/*
    USERS ROUTES
*/
//POST user sign-up form 
router.post('/sign-up', user_controller.sign_up_post)

//POST user sign-in 
router.post('/', user_controller.sign_in_post)

//GET user sign-out
router.get('/sign-out', user_controller.sign_out_get)

/*
    POSTS ROUTES
*/
//POST new post
router.post('/:id', post_controller.new_post)

//UPDATE post
router.put('/:userid/update/:postid', post_controller.update_post)

module.exports = router;