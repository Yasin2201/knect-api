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

//GET all users posts
router.get('/:id/posts', post_controller.get_all_posts)

//GET single post
router.get('/:userid/posts/:postid', post_controller.get_post)

//UPDATE post PUT
router.put('/:userid/update/:postid', post_controller.update_post)

//PUT like/unlike post
router.put('/:userid/like/:postid', post_controller.like_post)

//DELETE a post
router.delete('/:userid/delete/:postid', post_controller.delete_post)


module.exports = router;