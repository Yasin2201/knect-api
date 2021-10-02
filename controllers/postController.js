const Post = require('../models/post')
const { body, validationResult } = require('express-validator');

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