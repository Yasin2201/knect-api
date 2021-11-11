const express = require('express');
const router = express.Router();
const passport = require("passport");

const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');
const comment_controller = require('../controllers/commentController');
const friendRequest_controller = require('../controllers/friendrequestController');

/*
    USERS ROUTES
*/
//POST user sign-up form 
router.post('/sign-up', user_controller.sign_up_post)

//POST user sign-in 
router.post('/sign-in', user_controller.sign_in_post)

//GET sign-in page
router.get('/', user_controller.sign_in_get)

//GET user sign-out
router.get('/sign-out', user_controller.sign_out_get)

//GET users details for profile page
router.get('/profile/:id', passport.authenticate('jwt', { session: false }), user_controller.user_details_get)

/*
    POSTS ROUTES
*/
//POST new post
router.post('/:id/new-post', passport.authenticate('jwt', { session: false }), post_controller.new_post)

//GET all users posts
router.get('/:id/posts', passport.authenticate('jwt', { session: false }), post_controller.get_all_posts)

//GET all users posts and friends posts
router.get('/:id/timeline', passport.authenticate('jwt', { session: false }), post_controller.get_timeline_posts)

//GET single post
router.get('/:userid/posts/:postid', passport.authenticate('jwt', { session: false }), post_controller.get_post)

//UPDATE post PUT
router.put('/:userid/update-post/:postid', passport.authenticate('jwt', { session: false }), post_controller.update_post)

//PUT like/unlike post
router.put('/:userid/like-post/:postid', passport.authenticate('jwt', { session: false }), post_controller.like_post)

//DELETE a post
router.delete('/:userid/delete-post/:postid', passport.authenticate('jwt', { session: false }), post_controller.delete_post)

/*
    COMMENTS ROUTES
*/
//POST new comment
router.post('/:userid/post/:postid/new-comment', passport.authenticate('jwt', { session: false }), comment_controller.new_comment)

//GET all posts comments
router.get('/:id/comments', passport.authenticate('jwt', { session: false }), comment_controller.get_post_comments)

//UPDATE comment
router.put('/:userid/update-comment/:commentid', passport.authenticate('jwt', { session: false }), comment_controller.update_comment)

//PUT like/unlike post
router.put('/:userid/like-comment/:commentid', passport.authenticate('jwt', { session: false }), comment_controller.like_comment)

//DELETE comment
router.delete('/:userid/delete-comment/:commentid', passport.authenticate('jwt', { session: false }), comment_controller.delete_comment)


/*
    FRIEND REQUEST ROUTES
*/
//GET all recived friend requests for user
router.get('/:id/recieved-requests', passport.authenticate('jwt', { session: false }), friendRequest_controller.get_all_recieved_requests)

//GET all sent friend requests for user
router.get('/:id/sent-requests', passport.authenticate('jwt', { session: false }), friendRequest_controller.get_all_sent_requests)

//GET all users friends
router.get('/:id/friends', passport.authenticate('jwt', { session: false }), friendRequest_controller.get_all_friends)

//GET check if user is already friends with profile
router.get('/:userid/friends/:profid', passport.authenticate('jwt', { session: false }), friendRequest_controller.get_check_friend)

//POST new friend request
router.post('/:userid/request/:recid', passport.authenticate('jwt', { session: false }), friendRequest_controller.new_friend_request)

//DELETE or decline a friend request
router.delete('/:userid/request/:requestid', passport.authenticate('jwt', { session: false }), friendRequest_controller.decline_friend_Request)

//UPDATE friend request status on acceptance
router.put('/:userid/request/:requestid', passport.authenticate('jwt', { session: false }), friendRequest_controller.accept_friend_request)

//DELETE users friendRequest document and remove friends from each users array when user unfriends
router.delete('/:userid/unfriend/:friendid', passport.authenticate('jwt', { session: false }), friendRequest_controller.unfriend_user)

module.exports = router;