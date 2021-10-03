const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');
const comment_controller = require('../controllers/commentController');

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
router.put('/:userid/update-post/:postid', post_controller.update_post)

//PUT like/unlike post
router.put('/:userid/like-post/:postid', post_controller.like_post)

//DELETE a post
router.delete('/:userid/delete-post/:postid', post_controller.delete_post)

/*
    COMMENTS ROUTES
*/
//POST new comment
router.post('/:userid/post/:postid/comment', comment_controller.new_comment)

//GET all posts comments
router.get('/:id/comments', comment_controller.get_post_comments)

//UPDATE comment
router.put('/:userid/update-comment/:commentid', comment_controller.update_comment)

//PUT like/unlike post
router.put('/:userid/like-comment/:commentid', comment_controller.like_comment)

//DELETE comment
router.delete('/:userid/delete-comment/:commentid', comment_controller.delete_comment)

module.exports = router;