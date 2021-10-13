const Post = require('../models/post')
const User = require('../models/user')
const Comment = require('../models/comment')
const { body, validationResult } = require('express-validator');
const async = require('async');

// Handle user new post
exports.new_post = [

    body('text', 'Text Must Not Be Empty').trim().isLength({ min: 1 }),

    (req, res, next) => {

        //Errors from req if any
        const errors = validationResult(req);

        User.findById(req.params.id)
            .exec(function (err, user) {
                if (err) { return next(err) }

                const post = new Post({
                    username: user.username,
                    userId: req.params.id,
                    text: req.body.text
                });

                if (!errors.isEmpty()) {
                    //re-render form if any errors
                    res.json({ alerts: errors.array() })
                    return
                } else {
                    //save post to database
                    post.save(function (err) {
                        if (err) { return next(err) }
                        res.json({ alerts: [{ msg: "Post Saved Successfully" }] })
                    });
                };
            })
    }
];

//UPDATE users post
exports.update_post = [

    body('text', 'Text Must Not Be Empty').trim().isLength({ min: 1 }),

    function (req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            //re-render form if any errors
            res.status(400).json({ alerts: errors.array() })
            return
        } else {
            async.parallel({
                user: function (cb) {
                    User.findById(req.params.userid).exec(cb)
                },
                post: function (cb) {
                    Post.findById(req.params.postid).exec(cb)
                },
            }, function (err, results) {
                if (err) {
                    return next(err)
                } else if (!results.user || !results.post) {
                    res.status(404).json({ alerts: [{ msg: "User or Post Not Found" }] })
                } else if (results.post.userId.toString() !== results.user._id.toString()) {
                    res.status(401).json({ alerts: [{ msg: "You Can't Edit This Post!" }] })
                } else {
                    const updatedPost = new Post({
                        _id: results.post._id,
                        userId: results.post.userId,
                        username: results.post.username,
                        text: req.body.text,
                        date: results.post.date,
                        likes: results.post.likes
                    })

                    Post.findByIdAndUpdate(results.post._id, updatedPost, {}, function (err) {
                        if (err) { return next(err) }
                        res.json({
                            alerts: [{ msg: "Post Updated Successfully" }],
                            updatedPost
                        });
                    })
                }
            })
        }

    }
]

//GET single post
exports.get_post = function (req, res, next) {
    Post.findById(req.params.postid)
        .exec(function (err, found_post) {
            if (err) { return next(err) }
            res.json({ found_post })
        })
}

//GET all posts & posts comments
exports.get_all_posts = async function (req, res, next) {
    const user = await User.findById(req.params.id)
    const allPosts = await Post.find({ userId: req.params.id })
        .sort({ date: -1 })

    const postsComments = await Comment.find({ postId: { $in: allPosts.map(post => post._id) } }).sort({ date: -1 })

    if (!user) {
        return res.status(404).json({ msg: "user not found" });
    } else {
        return res.status(200).json({ user, allPosts, postsComments })
    }
}

//GET all users posts and users friends post for cutom home timeline 
exports.get_timeline_posts = async function (req, res, next) {
    const user = await User.findById(req.params.id)

    //Find posts that have a userId which is IN users friends lists or find posts that have users userId
    const posts = await Post.find({
        $or: [
            { userId: { $in: user.friends } },
            { userId: user._id }
        ]
    }).sort({ date: -1 })

    const postsComments = await Comment.find({ postId: { $in: posts.map(post => post._id) } }).sort({ date: -1 })

    if (!user) {
        return res.status(404).json({ msg: "user not found" });
    } else {
        return res.status(200).json({ posts, postsComments })
    }
}

//PUT like/unlike posts
exports.like_post = function (req, res, next) {
    Post.findById(req.params.postid)
        .exec(function (err, foundPost) {
            if (err) { return next(err) }
            if (!foundPost) { res.status(404).json({ alerts: [{ msg: "Post doesn't exist" }] }) }

            // if post is found and already liked by user filter out user and return likes to "unlike"
            if (foundPost.likes.includes(req.params.userid)) {

                const likesArray = [...foundPost.likes];
                const filteredLikesArray = likesArray.filter(
                    (userId) => userId != req.params.userid
                );

                const newPost = new Post({
                    _id: foundPost._id,
                    ...foundPost,
                    likes: filteredLikesArray
                })

                Post.findByIdAndUpdate(req.params.postid, newPost, {}, function (err) {
                    if (err) { return next(err) }
                    res.status(201).json({
                        alerts: [{ msg: "Unliked Post" }],
                        newPost
                    })
                })
            } else {
                const newPost = new Post({
                    _id: foundPost._id,
                    ...foundPost,
                    likes: [...foundPost.likes, req.params.userid]
                })

                Post.findByIdAndUpdate(req.params.postid, newPost, {}, function (err) {
                    if (err) { return next(err) }
                    res.status(201).json({
                        alerts: [{ msg: "Liked Post" }],
                        newPost
                    })
                })
            }
        })
}

//DELETE users post
exports.delete_post = function (req, res, next) {
    async.parallel({
        user: function (cb) {
            User.findById(req.params.userid).exec(cb)
        },
        post: function (cb) {
            Post.findById(req.params.postid).exec(cb)
        },
    }, function (err, results) {
        if (err) {
            return next(err)
        } else if (!results.user || !results.post) {
            res.status(404).json({ alerts: [{ msg: "User or Post Not Found" }] })
        } else if (results.post.userId.toString() !== results.user._id.toString()) {
            res.status(401).json({ alerts: [{ msg: "You Can't Delete This Post!" }] })
        } else {
            Post.findByIdAndRemove(results.post._id, function deletePost(err) {
                if (err) { return next(err) }
                res.json({ alerts: [{ msg: "Deleted Post" }] })
            })
        }
    })
}