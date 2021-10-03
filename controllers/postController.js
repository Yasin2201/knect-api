const Post = require('../models/post')
const User = require('../models/user')
const { body, validationResult } = require('express-validator');
const async = require('async');

// Handle user new post
exports.new_post = [

    body('text', 'Text Must Not Be Empty').trim().isLength({ min: 1 }),

    (req, res, next) => {
        //Errors from req if any
        const errors = validationResult(req);

        const { text } = req.body;
        const post = new Post({
            userId: req.params.id,
            text
        });

        if (!errors.isEmpty()) {
            //re-render form if any errors
            res.json({ alerts: errors.array() })
            return
        } else {
            //save post to database
            console.log(req.body)
            post.save(function (err) {
                if (err) { return next(err) }
                res.json({ alerts: [{ msg: "Post Saved Successfully" }] })
            });
        };
    }
];

// Handle user update post
exports.update_post = [

    body('text', 'Text Must Not Be Empty').trim().isLength({ min: 1 }),

    (req, res, next) => {
        //Errors from req if any
        const errors = validationResult(req);

        const { text } = req.body;

        const post = new Post({
            _id: req.params.postid,
            userId: req.params.userId,
            text,
        })

        if (!errors.isEmpty()) {
            //re-render form if any errors
            res.json({ alerts: errors.array() })
            return
        } else {
            Post.findByIdAndUpdate(req.params.postid, post, {}, function (err) {
                if (err) { return next(err) }

                res.json({
                    alerts: [{ msg: "Post Updated Successfully" }],
                    post
                });
            })
        };
    }
];

//GET single post
exports.get_post = function (req, res, next) {
    Post.findById(req.params.postid)
        .exec(function (err, found_post) {
            if (err) { return next(err) }
            res.json({ found_post })
        })
}

//GET all posts
exports.get_all_posts = function (req, res, next) {
    Post.find({ userId: req.params.id })
        .sort({ date: -1 })
        .exec(function (err, all_posts) {
            if (err) { return next(err) }
            res.json({ all_posts })
        })
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

                foundPost.likes = filteredLikesArray;
                foundPost.save();
                return res.status(201).json({ alerts: [{ msg: "Post Unliked" }], post: foundPost });
            } else {
                foundPost.likes.push(req.params.userid);
                foundPost.save();
                return res.status(201).json({ alerts: [{ msg: "Post Unliked" }], post: foundPost });
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